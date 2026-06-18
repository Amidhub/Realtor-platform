from pydantic import BaseModel, EmailStr

class UserAuth_S(BaseModel):
    email: EmailStr
    password: str
    
class UserReg_S(UserAuth_S):
    agreement: bool