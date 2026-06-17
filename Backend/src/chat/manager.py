# app/chat/manager.py
from typing import Dict, Optional
from fastapi import WebSocket


class ConnectionManager:
    
    def __init__(self):
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}
    
    async def connect(self, conversation_id: int, user_id: int, websocket: WebSocket):
        await websocket.accept()
        
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = {}
        
        self.active_connections[conversation_id][user_id] = websocket
    
    def disconnect(self, conversation_id: int, user_id: int):
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].pop(user_id, None)
            
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]
    
    async def broadcast_to_conversation(
        self,
        conversation_id: int,
        message: str,
        exclude_user_id: Optional[int] = None
    ):
        if conversation_id not in self.active_connections:
            return
        
        for user_id, websocket in self.active_connections[conversation_id].items():
            if user_id == exclude_user_id:
                continue
            
            try:
                await websocket.send_text(message)
            except:
                self.disconnect(conversation_id, user_id)
    
    async def send_to_user(
        self,
        conversation_id: int,
        user_id: int,
        message: str
    ) -> bool:
        if conversation_id in self.active_connections:
            if user_id in self.active_connections[conversation_id]:
                try:
                    await self.active_connections[conversation_id][user_id].send_text(message)
                    return True
                except:
                    self.disconnect(conversation_id, user_id)
        return False
    
manager = ConnectionManager()
