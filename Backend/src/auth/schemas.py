from pydantic import BaseModel, EmailStr

class UserAuth_S(BaseModel):
    email: EmailStr
    password: str