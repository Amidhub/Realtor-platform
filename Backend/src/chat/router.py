# app/chat/router.py
import json
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import jwt

from src.config import setting
from src.database import get_session
from src.auth.dao import UserDAO
from src.user.model import User
from src.chat.dao import ChatDAO
from src.chat.schemas import (
    ConversationResponse,
    MessageResponse,
    WSMessage,
    WSResponse
)
from src.chat.manager import manager
from src.auth.dependencies import get_current_user

from src.listings.models import Listing

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/conversations/by-listing/{listing_id}")
async def get_or_create_conversation(
    listing_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    
    listing = await db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")
    
    
    if user.id == listing.user_id:
        raise HTTPException(400, "You cannot chat with yourself")
    
    conversation = await ChatDAO.get_or_create_conversation(
        db,
        listing_id=listing_id,
        owner_id=listing.user_id,
        buyer_id=user.id
    )
    
    return {
        "conversation_id": conversation.id,
        "ws_url": f"/ws/conversation/{conversation.id}"
    }


@router.get("/conversations", response_model=List[ConversationResponse])
async def get_my_conversations(
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    conversations = await ChatDAO.get_user_conversations(db, user.id, limit, offset)
    
    result = []
    for conv in conversations:
        unread_count = await ChatDAO.get_unread_count_for_conversation(db, conv.id, user.id)
        result.append({
            "id": conv.id,
            "listing_id": conv.listing_id,
            "owner_id": conv.owner_id,
            "buyer_id": conv.buyer_id,
            "latest_message": conv.latest_message,
            "latest_message_time": conv.latest_message_time,
            "created_at": conv.created_at,
            "unread_count": unread_count
        })
    
    return result


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: int,
    limit: int = 50,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Получить историю сообщений"""
    # Проверяем доступ
    has_access = await ChatDAO.check_conversation_access(db, conversation_id, user.id)
    if not has_access:
        raise HTTPException(403, "Access denied")
    
    messages = await ChatDAO.get_conversation_messages(db, conversation_id, limit, offset)
    return messages


@router.get("/unread-count")
async def get_unread_count(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Количество непрочитанных сообщений"""
    count = await ChatDAO.get_unread_count(db, user.id)
    return {"unread_count": count}


@router.websocket("/ws/conversation/{conversation_id}")
async def websocket_chat(
    websocket: WebSocket,
    conversation_id: int,
    db: AsyncSession = Depends(get_session)
):    
    user = await get_current_user()
    if not user:
        await websocket.close(code=1008, reason="Invalid or expired token")
        return
    
    user_id = user.id
    
    has_access = await ChatDAO.check_conversation_access(db, conversation_id, user_id)
    if not has_access:
        await websocket.close(code=1008, reason="Access denied")
        return

    await manager.connect(conversation_id, user_id, websocket)
    
    try:
        while True:
            # Получаем сообщение от клиента
            raw_data = await websocket.receive_text()
            
            # Парсим JSON
            try:
                data = WSMessage.parse_raw(raw_data)
            except Exception as e:
                await websocket.send_text(
                    WSResponse(
                        action="error",
                        conversation_id=conversation_id,
                        data={"msg": f"Invalid JSON: {str(e)}"}
                    ).json()
                )
                continue
            
            if data.action == "ping":
                await websocket.send_text(
                    WSResponse(
                        action="pong",
                        conversation_id=conversation_id,
                        data={}
                    ).json()
                )
            elif data.action == "send":
                # Валидация
                if not data.text or len(data.text) > 10000:
                    await websocket.send_text(
                        WSResponse(
                            action="error",
                            conversation_id=conversation_id,
                            data={"msg": "Message too long or empty"}
                        ).json()
                    )
                    continue

                new_message = await ChatDAO.save_message(
                    db,
                    conversation_id=conversation_id,
                    sender_id=user_id,
                    text=data.text
                )

                response = WSResponse(
                    action="new_message",
                    conversation_id=conversation_id,
                    data={
                        "id": new_message.id,
                        "message": new_message.message,
                        "sender_id": new_message.sender_id,
                        "created_at": new_message.created_at.isoformat(),
                        "is_read": new_message.is_read
                    }
                )
                
                await manager.broadcast_to_conversation(
                    conversation_id,
                    response.json(),
                    exclude_user_id=None
                )
            
            elif data.action == "typing":
                response = WSResponse(
                    action="typing_status",
                    conversation_id=conversation_id,
                    data={"user_id": user_id, "is_typing": True}
                )
                await manager.broadcast_to_conversation(
                    conversation_id,
                    response.json(),
                    exclude_user_id=user_id
                )
            
            elif data.action == "read":
                await ChatDAO.mark_messages_as_read(db, conversation_id, user_id)
                
                response = WSResponse(
                    action="read_receipt",
                    conversation_id=conversation_id,
                    data={"user_id": user_id}
                )
                await manager.broadcast_to_conversation(
                    conversation_id,
                    response.json(),
                    exclude_user_id=None
                )
            
            elif data.action == "get_history":
                messages = await ChatDAO.get_conversation_messages(
                    db,
                    conversation_id,
                    limit=data.limit or 50,
                    offset=data.offset or 0
                )
                
                response = WSResponse(
                    action="history",
                    conversation_id=conversation_id,
                    data={
                        "messages": [
                            {
                                "id": msg.id,
                                "message": msg.message,
                                "sender_id": msg.sender_id,
                                "created_at": msg.created_at.isoformat(),
                                "is_read": msg.is_read
                            }
                            for msg in messages
                        ],
                        "has_more": len(messages) == (data.limit or 50)
                    }
                )
                await websocket.send_text(response.json())
            
            else:
                await websocket.send_text(
                    WSResponse(
                        action="error",
                        conversation_id=conversation_id,
                        data={"msg": f"Unknown action: {data.action}"}
                    ).json()
                )
    
    except WebSocketDisconnect:
        manager.disconnect(conversation_id, user_id)
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(conversation_id, user_id)
        raise
