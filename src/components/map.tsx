import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";

const MapComponent = ({
  data,
  showAnomalies,
  searchQuery,
  onShipSelect,
  center,
}: {
  data: {
    mmsi: string;
    aggregated_data: {
      LastLAT: number;
      LastLON: number;
      isAnomalous: number;
      ShipName: string;
    } | null;
  }[];
  showAnomalies: boolean;
  searchQuery: string;
  onShipSelect?: (mmsi: string) => void;
  center: [number, number];
}) => {
  // const center: [number, number] = [24.85898853164005, -90.78569202255129];

  const greenDotIcon = useMemo(
    () =>
      L.divIcon({
        html: `<div style="width: 8px; height: 8px; background-color: green; border-radius: 50%;"></div>`,
        className: "",
        iconSize: [15, 15],
        iconAnchor: [7, 7],
      }),
    [],
  );

  const redDotIcon = useMemo(
    () =>
      L.divIcon({
        html: `<div style="width: 8px; height: 8px; background-color: red; border-radius: 50%;"></div>`,
        className: "",
        iconSize: [15, 15],
        iconAnchor: [7, 7],
      }),
    [],
  );

  const ZoomToSearchedShip = ({ searchQuery }: { searchQuery: string }) => {
    const map = useMap();

    useEffect(() => {
      // Only zoom if search query is not empty and at least 3 characters long
      if (searchQuery && searchQuery.length >= 3) {
        const matchedShip = data.find((ship) =>
          ship.aggregated_data?.ShipName.toLowerCase().includes(
            searchQuery.toLowerCase(),
          ),
        );

        if (matchedShip && matchedShip.aggregated_data) {
          const { LastLAT, LastLON } = matchedShip.aggregated_data;
          map.setView([LastLAT, LastLON], 10, { animate: true });
        }
      }
    }, [searchQuery, data, map]);

    return null;
  };

  // Filter and memoize filtered ships to prevent unnecessary re-renders
  const filteredShips = useMemo(
    () =>
      data.filter(
        (ship) =>
          ship.aggregated_data &&
          ship.aggregated_data.LastLAT !== undefined &&
          ship.aggregated_data.LastLON !== undefined &&
          // Optional: filter by search query if needed
          (!searchQuery ||
            ship.aggregated_data.ShipName.toLowerCase().includes(
              searchQuery.toLowerCase(),
            )),
      ),
    [data, searchQuery],
  );

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "max(70vh, 300px)", width: "max(80vw, 300px)" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ZoomToSearchedShip searchQuery={searchQuery} />
      {filteredShips.map((ship) => {
        const icon = showAnomalies
          ? ship.aggregated_data!.isAnomalous === 1
            ? redDotIcon
            : greenDotIcon
          : greenDotIcon;

        return (
          <Marker
            key={ship.mmsi}
            position={[
              ship.aggregated_data!.LastLAT,
              ship.aggregated_data!.LastLON,
            ]}
            icon={icon}
            eventHandlers={{
              click: () => onShipSelect && onShipSelect(ship.mmsi),
            }}
          >
            <Popup>
              <div>
                <strong>MMSI:</strong> {ship.mmsi}
                <br />
                <strong>Vessel Name:</strong> {ship.aggregated_data!.ShipName}
                <br />
                <strong>Last LAT:</strong> {ship.aggregated_data!.LastLAT}
                <br />
                <strong>Last LON:</strong> {ship.aggregated_data!.LastLON}
                <br />
                <strong>Is Anomalous:</strong>{" "}
                {ship.aggregated_data!.isAnomalous === 1 ? "Yes" : "No"}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;
