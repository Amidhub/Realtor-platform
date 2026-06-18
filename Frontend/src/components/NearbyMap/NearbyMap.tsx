import {
    AttributionControl,
    Circle,
    CircleMarker,
    MapContainer,
    Popup,
    TileLayer,
    useMapEvents,
  } from 'react-leaflet'
  import type { LeafletMouseEvent } from 'leaflet'
  
  export type NearbyMapPoint = {
    lat: number
    lon: number
  }
  
  type NearbyMapProps = {
    selectedPoint: NearbyMapPoint | null
    radiusKm: number
    onSelectPoint: (point: NearbyMapPoint) => void
  }
  
  const defaultCenter: [number, number] = [51.5074, -0.1278]
  
  function MapClickHandler({
    onSelectPoint,
  }: {
    onSelectPoint: (point: NearbyMapPoint) => void
  }) {
    useMapEvents({
      click(event: LeafletMouseEvent) {
        onSelectPoint({
          lat: Number(event.latlng.lat.toFixed(6)),
          lon: Number(event.latlng.lng.toFixed(6)),
        })
      },
    })
  
    return null
  }
  
  export function NearbyMap({
    selectedPoint,
    radiusKm,
    onSelectPoint,
  }: NearbyMapProps) {
    const center: [number, number] = selectedPoint
      ? [selectedPoint.lat, selectedPoint.lon]
      : defaultCenter
  
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer
          center={center}
          zoom={11}
          scrollWheelZoom
          attributionControl={false}
          className="h-80 w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
  
          <AttributionControl position="bottomright" prefix={false} />
  
          <MapClickHandler onSelectPoint={onSelectPoint} />
  
          {selectedPoint && (
            <>
              <Circle
                center={[selectedPoint.lat, selectedPoint.lon]}
                radius={radiusKm * 1000}
              />
  
              <CircleMarker
                center={[selectedPoint.lat, selectedPoint.lon]}
                radius={8}
              >
                <Popup>
                  Выбранная точка
                  <br />
                  {selectedPoint.lat}, {selectedPoint.lon}
                </Popup>
              </CircleMarker>
            </>
          )}
        </MapContainer>
      </div>
    )
  }