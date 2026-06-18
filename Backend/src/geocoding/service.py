import httpx
from typing import Optional, Tuple

from src.config import setting


class GeocodingService:
    def __init__(self):
        project_name = getattr(setting, "PROJECT_NAME", "Realtor Platform")
        email = getattr(setting, "EMAIL", "test@example.com")

        self.headers = {
            "User-Agent": f"{project_name}/1.0 ({email})",
            "Accept-Language": "en",
        }

        self.nominatim_url = "https://nominatim.openstreetmap.org/search"
        self.photon_url = "https://photon.komoot.io/api/"
        self.reverse_url = "https://nominatim.openstreetmap.org/reverse"

    async def geocode(self, address: str) -> Optional[Tuple[float, float]]:
        if not address:
            return None

        address = address.strip()

        result = await self._geocode_nominatim(address)

        if result:
            return result

        return await self._geocode_photon(address)

    async def _geocode_nominatim(
        self,
        address: str,
    ) -> Optional[Tuple[float, float]]:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                self.nominatim_url,
                params={
                    "q": address,
                    "format": "json",
                    "limit": 1,
                },
                headers=self.headers,
            )

        if response.status_code != 200:
            return None

        data = response.json()

        if not data:
            return None

        return float(data[0]["lat"]), float(data[0]["lon"])

    async def _geocode_photon(
        self,
        address: str,
    ) -> Optional[Tuple[float, float]]:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                self.photon_url,
                params={
                    "q": address,
                    "limit": 1,
                },
                headers=self.headers,
            )

        if response.status_code != 200:
            return None

        data = response.json()
        features = data.get("features", [])

        if not features:
            return None

        coordinates = features[0].get("geometry", {}).get("coordinates")

        if not coordinates or len(coordinates) < 2:
            return None

        lon = float(coordinates[0])
        lat = float(coordinates[1])

        return lat, lon

    async def reverse_geocode(self, lat: float, lon: float) -> Optional[str]:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                self.reverse_url,
                params={
                    "lat": lat,
                    "lon": lon,
                    "format": "json",
                },
                headers=self.headers,
            )

        if response.status_code != 200:
            return None

        data = response.json()

        return data.get("display_name")