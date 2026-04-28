import type { Dispatch, SetStateAction } from "react";
import { useState, useRef, useMemo, useEffect } from "react";
import { 
  MapContainer, 
  TileLayer, 
  Polygon, 
  Polyline, 
  CircleMarker, 
  useMapEvents, 
  Tooltip 
} from "react-leaflet";
import { LatLngBounds } from "leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import pointInPolygon from "point-in-polygon";

// Load the GeoJSON we fetched for Toronto limits
import torontoGeoJson from "../toronto.json";

// The outer boundary ring of Toronto
const TORONTO_POLYGON_LNG_LAT = torontoGeoJson.coordinates[0];
const TORONTO_POLYGON_LAT_LNG: LatLngTuple[] = TORONTO_POLYGON_LNG_LAT.map(
  (pt: number[]) => [pt[1], pt[0]] as LatLngTuple
);

const TORONTO_BOUNDS = new LatLngBounds(
  [43.58, -79.64], // Southwest
  [43.86, -79.11]  // Northeast
);

const TORONTO_BOUNDS_TUPLE: [LatLngTuple, LatLngTuple] = [
  [43.58, -79.64],
  [43.86, -79.11]
];

const WORLD_BOUNDS: LatLngTuple[] = [
  [90, -360],
  [90, 360],
  [-90, 360],
  [-90, -360]
];

function isPointInToronto(lat: number, lng: number): boolean {
  // pointInPolygon expects [x, y], ie [lng, lat]
  return pointInPolygon([lng, lat], TORONTO_POLYGON_LNG_LAT);
}

interface MapEditorProps {
  step: 1 | 2 | 3 | 4;
  setStep: Dispatch<SetStateAction<1 | 2 | 3 | 4>>;
  homeLocation: LatLngTuple | null;
  setHomeLocation: Dispatch<SetStateAction<LatLngTuple | null>>;
  polygonPoints: LatLngTuple[];
  setPolygonPoints: Dispatch<SetStateAction<LatLngTuple[]>>;
  isFinished: boolean;
  setIsFinished: Dispatch<SetStateAction<boolean>>;
  isAppSubmitted: boolean;
}

const DrawingEvents = ({
  step,
  setStep,
  setHomeLocation,
  points,
  setPoints,
  isFinished,
  setIsFinished,
  mousePos,
  setMousePos,
  isAppSubmitted,
}: {
  step: 1 | 2 | 3 | 4;
  setStep: Dispatch<SetStateAction<1 | 2 | 3 | 4>>;
  setHomeLocation: Dispatch<SetStateAction<LatLngTuple | null>>;
  points: LatLngTuple[];
  setPoints: Dispatch<SetStateAction<LatLngTuple[]>>;
  isFinished: boolean;
  setIsFinished: Dispatch<SetStateAction<boolean>>;
  mousePos: LatLngTuple | null;
  setMousePos: Dispatch<SetStateAction<LatLngTuple | null>>;
  isAppSubmitted: boolean;
}) => {
  const map = useMapEvents({
    mousemove(e) {
      if (isAppSubmitted) return;
      if (step === 3 && !isFinished && points.length > 0) {
        if (isPointInToronto(e.latlng.lat, e.latlng.lng)) {
          setMousePos([e.latlng.lat, e.latlng.lng]);
        }
      }
    },
    click(e) {
      if (isAppSubmitted) return;
      if (!isPointInToronto(e.latlng.lat, e.latlng.lng)) {
        return; // Ignore clicks outside Toronto limits
      }

      if (step === 1) {
        setHomeLocation([e.latlng.lat, e.latlng.lng]);
        setStep(2);
        return;
      }
      
      // We only draw polygons in step 3
      if (step !== 3 || isFinished) return;
      
      const newPoint: LatLngTuple = [e.latlng.lat, e.latlng.lng];
      
      if (points.length > 2) {
        const firstPoint = map.latLngToContainerPoint(points[0]);
        const clickedPoint = map.latLngToContainerPoint(e.latlng);
        const distance = firstPoint.distanceTo(clickedPoint);
        
        if (distance < 20) {
          setIsFinished(true);
          setMousePos(null);
          setStep(4);
          return;
        }
      }

      if (points.length >= 49) {
        alert("Maximum points reached for polygon.");
        setIsFinished(true);
        setMousePos(null);
        setStep(4);
        return;
      }
      setPoints((prev) => [...prev, newPoint]);
    },
  });

  return null;
};

export default function MapEditor({
  step,
  setStep,
  homeLocation,
  setHomeLocation,
  polygonPoints,
  setPolygonPoints,
  isFinished,
  setIsFinished,
  isAppSubmitted,
}: MapEditorProps) {
  const [mousePos, setMousePos] = useState<LatLngTuple | null>(null);

  const ghostLineParams = useMemo(() => {
    if (isAppSubmitted || step !== 3 || isFinished || polygonPoints.length === 0 || !mousePos) return null;
    const lastPoint = polygonPoints[polygonPoints.length - 1];
    return [lastPoint, mousePos];
  }, [step, isFinished, polygonPoints, mousePos, isAppSubmitted]);

  return (
    <div className={`w-full h-full relative ${!isAppSubmitted && step === 3 && !isFinished ? "cursor-crosshair" : (!isAppSubmitted && step === 1 ? "cursor-crosshair" : "cursor-default")}`}>
      <MapContainer
        center={[43.6532, -79.3832]}
        zoom={12}
        minZoom={10}
        maxBounds={TORONTO_BOUNDS_TUPLE}
        maxBoundsViscosity={1.0}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Subtle visualization of Toronto limits */}
        <Polygon
          positions={[WORLD_BOUNDS, TORONTO_POLYGON_LAT_LNG]}
          pathOptions={{
            color: "#007894",
            fillColor: "#e8f4f8",
            fillOpacity: 0.4,
            weight: 1.5,
            dashArray: "4, 8",
            interactive: false
          }}
        />

        <DrawingEvents
          step={step}
          setStep={setStep}
          setHomeLocation={setHomeLocation}
          points={polygonPoints}
          setPoints={setPolygonPoints}
          isFinished={isFinished}
          setIsFinished={setIsFinished}
          mousePos={mousePos}
          setMousePos={setMousePos}
          isAppSubmitted={isAppSubmitted}
        />

        {homeLocation && (
          <CircleMarker
            center={homeLocation}
            radius={7}
            pathOptions={{ color: "#1E3765", fillColor: "#1E3765", fillOpacity: 1 }}
          />
        )}

        {step >= 3 && !isFinished && polygonPoints.length > 0 && (
          <Polyline positions={polygonPoints} color="#1E3765" weight={3} dashArray="5, 10" />
        )}

        {ghostLineParams && (
          <Polyline positions={ghostLineParams} color="#1E3765" weight={3} dashArray="5, 10" opacity={0.5} />
        )}

        {step >= 3 && isFinished && polygonPoints.length > 2 && (
          <Polygon
            positions={polygonPoints}
            pathOptions={{ color: "#1E3765", fillColor: "#1E3765", fillOpacity: 0.15, weight: 3 }}
          />
        )}

        {step === 3 && polygonPoints.map((point, index) => {
          const isFirstPoint = index === 0;
          return (
            <CircleMarker
              key={index}
              center={point}
              radius={isFirstPoint && !isFinished ? 8 : 4}
              pathOptions={{
                color: "#1E3765",
                fillColor: "white",
                fillOpacity: 1,
                weight: 2,
              }}
              eventHandlers={{
                click: () => {
                  if (isFirstPoint && polygonPoints.length > 2 && !isFinished) {
                    setIsFinished(true);
                    setMousePos(null);
                    setStep(4);
                  }
                }
              }}
            >
              {isFirstPoint && !isFinished && polygonPoints.length > 2 && (
                <Tooltip permanent direction="right" className="bg-transparent border-none text-uoft-blue font-semibold shadow-none text-sm">
                  Click to close shape
                </Tooltip>
              )}
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
