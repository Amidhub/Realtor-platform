from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class ConversationCreate(BaseModel):
    listing_id: int


class ConversationResponse(BaseModel):
    id: int
    listing_id: int
    owner_id: int
    buyer_id: int
    latest_message: Optional[str] = None
    latest_message_time: datetime
    created_at: datetime
    unread_count: int = 0
    
    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True



class WSMessage(BaseModel):
    action: Literal["send", "typing", "read", "get_history", "ping"]
    conversation_id: int
    text: Optional[str] = None
    limit: Optional[int] = 50
    offset: Optional[int] = 0


class WSResponse(BaseModel):
    action: Literal[
        "new_message",
        "typing_status",
        "read_receipt",
        "history",
        "error",
        "pong"
    ]
    conversation_id: int
    data: dict
