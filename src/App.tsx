/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import type { LatLngTuple } from "leaflet";
import MapEditor from "./components/MapEditor";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [homeLocation, setHomeLocation] = useState<LatLngTuple | null>(null);
  const [neighborhoodName, setNeighborhoodName] = useState("");
  const [polygonPoints, setPolygonPoints] = useState<LatLngTuple[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isAppSubmitted, setIsAppSubmitted] = useState(false);

  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] w-full bg-white overflow-hidden">
      <Sidebar 
        step={step}
        setStep={setStep}
        homeLocation={homeLocation}
        setHomeLocation={setHomeLocation}
        neighborhoodName={neighborhoodName}
        setNeighborhoodName={setNeighborhoodName}
        polygonPoints={polygonPoints}
        setPolygonPoints={setPolygonPoints}
        isFinished={isFinished}
        setIsFinished={setIsFinished}
        isAppSubmitted={isAppSubmitted}
        setIsAppSubmitted={setIsAppSubmitted}
      />
      <div className="flex-1 w-full relative z-0">
        <MapEditor 
          step={step}
          setStep={setStep}
          homeLocation={homeLocation}
          setHomeLocation={setHomeLocation}
          polygonPoints={polygonPoints}
          setPolygonPoints={setPolygonPoints}
          isFinished={isFinished}
          setIsFinished={setIsFinished}
          isAppSubmitted={isAppSubmitted}
        />
      </div>
    </div>
  );
}
