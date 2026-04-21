from src.dao.base import BaseRepository
from src.listings.models import Listing

class ListingDAO(BaseRepository):
    model=Listing