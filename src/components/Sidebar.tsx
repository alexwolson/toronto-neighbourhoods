import { createPortal } from "react-dom";
import type { Dispatch, SetStateAction, FormEvent } from "react";
import { useState, useEffect } from "react";
import { Undo2, X, MapPin } from "lucide-react";
import type { LatLngTuple } from "leaflet";
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import logoUofT          from '../assets/logos/logo-uoft.svg?url';
import logoSchoolCities  from '../assets/logos/logo-school-of-cities.svg?url';
import logoCarte         from '../assets/logos/logo-carte.svg?url';

interface SidebarProps {
  step: 1 | 2 | 3 | 4;
  setStep: Dispatch<SetStateAction<1 | 2 | 3 | 4>>;
  homeLocation: LatLngTuple | null;
  setHomeLocation: Dispatch<SetStateAction<LatLngTuple | null>>;
  neighborhoodName: string;
  setNeighborhoodName: Dispatch<SetStateAction<string>>;
  polygonPoints: LatLngTuple[];
  setPolygonPoints: Dispatch<SetStateAction<LatLngTuple[]>>;
  isFinished: boolean;
  setIsFinished: Dispatch<SetStateAction<boolean>>;
  isAppSubmitted: boolean;
  setIsAppSubmitted: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({
  step,
  setStep,
  homeLocation,
  setHomeLocation,
  neighborhoodName,
  setNeighborhoodName,
  polygonPoints,
  setPolygonPoints,
  isFinished,
  setIsFinished,
  isAppSubmitted,
  setIsAppSubmitted,
}: SidebarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [changesText, setChangesText] = useState("");
  const [otherNamesText, setOtherNamesText] = useState("");
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hasSeenWelcomeModal") !== "true";
    }
    return true;
  });

  const handleCloseWelcomeModal = () => {
    setIsWelcomeModalOpen(false);
    localStorage.setItem("hasSeenWelcomeModal", "true");
  };
  
  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (localStorage.getItem("hasSubmittedNeighborhood") === "true") {
        setIsAppSubmitted(true);
        setStep(4);
        
        const docId = localStorage.getItem("submittedNeighborhoodId");
        if (docId) {
          try {
            const snap = await getDoc(doc(db, "neighborhoods", docId));
            if (snap.exists()) {
              const data = snap.data();
              setNeighborhoodName(data.neighborhoodName || "");
              setHomeLocation(data.homeLocation as LatLngTuple || null);
              if (data.polygonPoints && Array.isArray(data.polygonPoints)) {
                setPolygonPoints(data.polygonPoints.map((p: any) => [p.lat, p.lng] as LatLngTuple));
                setIsFinished(true);
              }
              setChangesText(data.changesText || "");
              setOtherNamesText(data.otherNamesText || "");
            }
          } catch (e) {
            console.error("Failed to load existing submission", e);
          }
        }
      }
    };
    checkExistingSubmission();
  }, [setIsAppSubmitted, setStep, setNeighborhoodName, setHomeLocation, setPolygonPoints, setIsFinished]);

  const handleUndo = () => {
    setPolygonPoints((prev) => prev.slice(0, -1));
    setIsFinished(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!homeLocation) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const pathForWrite = 'neighborhoods';
      let docRefId = localStorage.getItem("submittedNeighborhoodId");
      
      const payload: any = {
        neighborhoodName: neighborhoodName.trim(),
        homeLocation,
        polygonPoints: polygonPoints.slice(0, 50).map(p => ({ lat: p[0], lng: p[1] })),
        changesText: changesText.trim(),
        otherNamesText: otherNamesText.trim()
      };

      try {
        if (docRefId) {
          await updateDoc(doc(db, pathForWrite, docRefId), payload);
        } else {
          payload.createdAt = serverTimestamp();
          const newDoc = await addDoc(collection(db, pathForWrite), payload);
          docRefId = newDoc.id;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, pathForWrite);
      }
      setIsAppSubmitted(true);
      localStorage.setItem("hasSubmittedNeighborhood", "true");
      if (docRefId) localStorage.setItem("submittedNeighborhoodId", docRefId);
    } catch (err) {
      console.error(err);
      setSubmitError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-[45dvh] md:h-[100dvh] md:w-[24rem] bg-white shrink-0 overflow-y-auto border-t md:border-t-0 md:border-r border-uoft-border flex flex-col font-sans relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-[0_8px_32px_rgba(30,55,101,0.18)]">

    {/* Dark UofT Blue header */}
    <div className="bg-uoft-blue relative overflow-hidden shrink-0">
      {/* Subtle teal gradient overlay for depth */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(0,120,148,0.25) 0%, transparent 60%)' }} />
      <div className="relative z-10 px-5 pt-5 pb-4 md:px-6 md:pt-6 md:pb-5">
        <h1 className="text-2xl md:text-[1.65rem] font-black text-white leading-tight tracking-tight">
          Toronto<br />Neighbourhoods
        </h1>
      </div>
      {/* Teal gradient rule */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, #007894 0%, #6FC7EA 100%)' }} />
    </div>

    {/* Progress tabs */}
    <div className="flex bg-uoft-tint-bg border-b border-uoft-border shrink-0">
      {([
        { n: 1, label: 'Pin' },
        { n: 2, label: 'Name' },
        { n: 3, label: 'Draw' },
        { n: 4, label: 'Submit' },
      ] as const).map(({ n, label }) => {
        const isDone   = step > n || (isAppSubmitted && n <= 4);
        const isActive = step === n && !isAppSubmitted;
        return (
          <div
            key={n}
            className={[
              'flex-1 text-center py-2 text-[11px] font-bold border-r border-uoft-border last:border-r-0',
              isDone   ? 'text-uoft-teal bg-uoft-tint-light' : '',
              isActive ? 'text-uoft-blue bg-white border-b-2 border-b-uoft-blue -mb-px' : '',
              !isDone && !isActive ? 'text-uoft-label' : '',
            ].join(' ')}
          >
            <span className="block text-sm font-black leading-none mb-0.5">
              {isDone ? '✓' : n}
            </span>
            {label}
          </div>
        );
      })}
    </div>

    <div className="flex-1 flex flex-col overflow-y-auto">

      {/* ── Non-submitted flow ── */}
      {!isAppSubmitted && (
        <>
          {/* Step 1 — done (collapsed) */}
          {step > 1 && homeLocation && (
            <div className="bg-uoft-tint-step border-b border-uoft-border px-5 py-3 flex items-center gap-3 border-l-4 border-l-uoft-sky">
              <div className="w-5 h-5 bg-uoft-teal rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">✓</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-uoft-teal">Step 1 · Location pinned</div>
                <div className="text-sm font-bold text-uoft-blue truncate">Pin dropped</div>
              </div>
              <button
                onClick={() => { setStep(1); setHomeLocation(null); setPolygonPoints([]); setIsFinished(false); }}
                className="text-[11px] font-bold text-uoft-teal underline shrink-0"
              >
                Edit
              </button>
            </div>
          )}

          {/* Step 1 — active */}
          {step === 1 && (
            <div className="border-l-4 border-l-uoft-blue px-5 py-5 md:px-6">
              <div className="text-[12px] font-bold text-uoft-teal mb-1.5">Step 1 of 4</div>
              <h2 className="text-[17px] font-black text-uoft-blue leading-snug mb-2">Find your area</h2>
              <p className="text-[14px] text-uoft-body leading-relaxed">Pan and zoom the map to find where you live. Click the map to drop a pin.</p>
              <p className="text-[12px] text-uoft-muted mt-1.5 leading-relaxed">You don't need to pin your exact home — a nearby intersection or general area is fine.</p>
            </div>
          )}

          {/* Step 2 — done (collapsed) */}
          {step > 2 && neighborhoodName && (
            <div className="bg-uoft-tint-step border-b border-uoft-border px-5 py-3 flex items-center gap-3 border-l-4 border-l-uoft-sky">
              <div className="w-5 h-5 bg-uoft-teal rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">✓</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-uoft-teal">Step 2 · Neighbourhood name</div>
                <div className="text-sm font-bold text-uoft-blue truncate">{neighborhoodName}</div>
              </div>
              <button onClick={() => setStep(2)} className="text-[11px] font-bold text-uoft-teal underline shrink-0">Edit</button>
            </div>
          )}

          {/* Step 2 — active */}
          {step === 2 && (
            <div className="border-l-4 border-l-uoft-blue px-5 py-5 md:px-6">
              <div className="text-[12px] font-bold text-uoft-teal mb-1.5">Step 2 of 4</div>
              <h2 className="text-[17px] font-black text-uoft-blue leading-snug mb-3">What is this neighbourhood called?</h2>
              <form onSubmit={(e) => { e.preventDefault(); if (neighborhoodName.trim()) setStep(3); }} className="flex flex-col gap-3">
                <input
                  type="text"
                  required
                  name="neighborhood_name_input"
                  value={neighborhoodName}
                  onChange={(e) => setNeighborhoodName(e.target.value)}
                  maxLength={150}
                  placeholder="e.g. The Annex, Leslieville…"
                  className="border-2 border-uoft-border px-3 py-2.5 text-[15px] text-uoft-blue bg-[#fafdff] focus:outline-none focus:border-uoft-blue w-full"
                  autoComplete="off"
                  data-1p-ignore="true"
                />
                <button
                  type="submit"
                  disabled={!neighborhoodName.trim()}
                  className="bg-uoft-blue text-white text-[13px] font-bold py-2.5 px-5 hover:bg-[#162d55] transition-colors w-max disabled:opacity-50"
                >
                  Next
                </button>
              </form>
            </div>
          )}

          {/* Step 3 — done (collapsed) */}
          {step > 3 && isFinished && (
            <div className="bg-uoft-tint-step border-b border-uoft-border px-5 py-3 flex items-center gap-3 border-l-4 border-l-uoft-sky">
              <div className="w-5 h-5 bg-uoft-teal rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">✓</div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-uoft-teal">Step 3 · Boundary drawn</div>
                <div className="text-sm font-bold text-uoft-blue">{polygonPoints.length} points</div>
              </div>
              <button
                onClick={() => { setStep(3); setPolygonPoints([]); setIsFinished(false); }}
                className="text-[11px] font-bold text-uoft-teal underline shrink-0"
              >
                Redraw
              </button>
            </div>
          )}

          {/* Step 3 — active */}
          {step === 3 && (
            <div className="border-l-4 border-l-uoft-blue px-5 py-5 md:px-6">
              <div className="text-[12px] font-bold text-uoft-teal mb-1.5">Step 3 of 4</div>
              <h2 className="text-[17px] font-black text-uoft-blue leading-snug mb-2">Draw the boundary</h2>
              <p className="text-[14px] text-uoft-body leading-relaxed">Click around the edges of what you consider your neighbourhood. Connect back to the start point to close the shape.</p>
              {polygonPoints.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="flex items-center gap-1.5 text-[13px] font-bold text-uoft-teal border-b-2 border-uoft-teal mt-4 pb-0.5 hover:text-uoft-blue hover:border-uoft-blue transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" /> Undo last point
                </button>
              )}
            </div>
          )}

          {/* Step 4 — upcoming placeholder */}
          {step < 4 && (
            <div className="border-l-4 border-l-[#e0e8f4] px-5 py-3 flex items-center gap-3 opacity-40 border-b border-uoft-border">
              <div className="w-5 h-5 bg-[#e0e8f4] rounded-full flex items-center justify-center text-uoft-label text-[10px] font-black shrink-0">4</div>
              <div className="text-[13px] font-bold text-uoft-label">Tell us more (optional)</div>
            </div>
          )}

          {/* Step 4 — active (form) */}
          {step === 4 && (
            <div className="border-l-4 border-l-uoft-blue px-5 py-5 md:px-6 flex flex-col gap-5">
              <div>
                <div className="text-[12px] font-bold text-uoft-teal mb-1.5">Step 4 of 4</div>
                <h2 className="text-[17px] font-black text-uoft-blue leading-snug">Tell us more</h2>
              </div>
              <form id="submit-form" className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-bold text-uoft-blue leading-snug">
                    How would you say these boundaries changed over the years?{' '}
                    <span className="font-normal text-uoft-muted">(optional)</span>
                  </label>
                  <p className="text-[12px] text-uoft-muted">For example, has the neighbourhood stretched in one direction?</p>
                  <textarea
                    name="changes_text"
                    rows={3}
                    maxLength={5000}
                    className="border-2 border-uoft-border p-3 text-[14px] text-uoft-blue focus:outline-none focus:border-uoft-blue resize-y bg-white"
                    value={changesText}
                    onChange={(e) => setChangesText(e.target.value)}
                    autoComplete="off"
                    data-1p-ignore="true"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-bold text-uoft-blue leading-snug">
                    Does this neighbourhood go by any other names?{' '}
                    <span className="font-normal text-uoft-muted">(optional)</span>
                  </label>
                  <p className="text-[12px] text-uoft-muted">For example, parts of The Danforth are also called Greektown.</p>
                  <textarea
                    name="other_names_text"
                    rows={3}
                    maxLength={1000}
                    className="border-2 border-uoft-border p-3 text-[14px] text-uoft-blue focus:outline-none focus:border-uoft-blue resize-y bg-white"
                    value={otherNamesText}
                    onChange={(e) => setOtherNamesText(e.target.value)}
                    autoComplete="off"
                    data-1p-ignore="true"
                  />
                </div>
                {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
              </form>
            </div>
          )}

        </>
      )}

      {/* ── Already-submitted state ── */}
      {isAppSubmitted && (
        <div className="bg-uoft-tint-light border border-uoft-border text-center p-6 m-4">
          <div className="w-12 h-12 bg-uoft-tint-light border-2 border-uoft-teal text-uoft-teal flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h4 className="font-black text-uoft-blue text-lg mb-2">Submission Received</h4>
          <p className="text-uoft-body text-sm mb-4">You have already submitted a neighbourhood map. Thank you!</p>
          <button
            onClick={() => setIsAppSubmitted(false)}
            className="text-sm font-bold text-uoft-teal border-2 border-uoft-teal py-2.5 px-4 hover:bg-uoft-tint-light transition-colors w-full"
          >
            Edit my submission
          </button>
        </div>
      )}

    </div>
      <div className="p-6 text-xs text-gray-500 border-t border-gray-200 bg-gray-50 mt-auto leading-relaxed flex flex-col gap-2">
        <p>Inspired by The New York Times' <a href="https://www.nytimes.com/interactive/2022/12/02/upshot/draw-your-nyc-neighborhood.html" target="_blank" rel="noopener noreferrer" className="text-gray-900 underline hover:text-black">"Draw Your NYC Neighborhood"</a> interactive project.</p>
        <button 
          onClick={() => setIsDataModalOpen(true)}
          className="text-left text-gray-900 underline hover:text-black inline-block font-semibold w-fit"
        >
          What data are we storing?
        </button>
      </div>

      {isDataModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsDataModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">What data we store</h3>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>When you submit your map, we store the following data in our database securely:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-gray-800">Your neighbourhood's name</strong> (including alternate names you might suggest).</li>
                <li><strong className="text-gray-800">The pinned location</strong> (a single latitude/longitude coordinate representing the area you selected, not necessarily your home).</li>
                <li><strong className="text-gray-800">The boundary polygon</strong> (the shape of the neighbourhood you drew).</li>
                <li><strong className="text-gray-800">Optional feedback</strong> on how the neighbourhood is changing.</li>
                <li><strong className="text-gray-800">A timestamp</strong> of when the submission was made.</li>
              </ul>
              <p>We <strong>do not</strong> collect your name, email address, IP address, or any personally identifiable information (PII). No authentication is required to participate.</p>
              <div className="pt-2 border-t border-gray-100">
                <p>This is a project created by members of the <a href="https://civictech.ca" target="_blank" rel="noopener noreferrer" className="text-gray-900 underline hover:text-black">Civic Tech Toronto</a> community.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setIsDataModalOpen(false)}
                className="px-4 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isWelcomeModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={handleCloseWelcomeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 pr-6 leading-tight">Welcome to Draw Your Toronto Neighbourhood</h3>
            <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed">
              <p>Official city boundaries don't always match how we actually define our neighbourhoods. This community project aims to map Toronto's neighbourhoods based on how the people who live here define them.</p>
              <p>Help us crowdsource a new map of the city by drawing where you think your neighbourhood begins and ends.</p>
              <div className="pt-2 border-t border-gray-100 text-sm">
                <p>This is a volunteer project created by members of the <a href="https://civictech.ca" target="_blank" rel="noopener noreferrer" className="text-gray-900 underline hover:text-black">Civic Tech Toronto</a> community.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleCloseWelcomeModal}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-md hover:bg-black transition-colors shadow-sm"
              >
                Let's go
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
