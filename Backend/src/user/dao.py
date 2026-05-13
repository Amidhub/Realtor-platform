from src.dao.base import BaseRepository
from src.user.model import User

class UserDAO(BaseRepository):
    model=User
    