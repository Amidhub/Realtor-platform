import httpx
from typing import Tuple, Optional
from src.config import setting

class GeocodingService:
    def __init__(self):
        self.user_agent = f"{setting.PROJECT_NAME}({setting.EMAIL})"
        self.base_url = "https://nominatim.openstreetmap.org/search"

    async def geocode(self, address: str) -> Optional[Tuple[float, float]]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.base_url,
                params={
                    "q": address,
                    "format": "json",
                    "limit": 1,
                },
                headers={"User-Agent":self.user_agent}
            )

            if response.status_code != 200:
                return None
            
            data = response.json()

            if not data:
                return None
            
            lat = float(data[0]["lat"])
            lon = float(data[0]["lon"])

            return (lat, lon)
        
    async def reverse_geocode(self, lat: float, lon: float) -> Optional[str]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={
                    "lat": lat,
                    "lon": lon,
                    "format": "json",
                },
                headers={"User-Agent": self.user_agent}
            )

            if response.status_code != 200:
                return None
            
            data = response.json()

            return data.get("display_name")