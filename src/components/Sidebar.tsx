import { createPortal } from "react-dom";
import type { Dispatch, SetStateAction, FormEvent } from "react";
import { useState, useEffect } from "react";
import { Undo2, X, MapPin } from "lucide-react";
import type { LatLngTuple } from "leaflet";
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

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

  const stepClasses = (stepNumber: number) => {
    if (step === stepNumber) return "text-gray-900";
    if (step > stepNumber) return "text-gray-400";
    return "text-gray-300";
  };

  const stepNumberClasses = (stepNumber: number) => {
    if (step === stepNumber) return "bg-gray-900 text-white";
    if (step > stepNumber) return "bg-gray-200 text-gray-500";
    return "bg-gray-100 text-gray-300";
  };

  return (
    <div className="w-full h-[45dvh] md:h-[100dvh] md:w-[24rem] bg-white shrink-0 overflow-y-auto border-t md:border-t-0 md:border-r border-gray-200 flex flex-col font-sans relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-sm">
      <div className="flex-1 flex flex-col pt-6 md:pt-8 pb-8 md:pb-32 px-5 md:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-5 md:mb-6 leading-tight pb-4 md:pb-6 border-b border-gray-200 tracking-tight">
          Toronto Neighbourhoods
        </h1>

        <div className="flex flex-col space-y-8">
          
          {isAppSubmitted ? (
            <div className="bg-green-50 border text-center border-green-200 rounded-xl p-6 shadow-sm mt-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-xl mb-2">Submission Received</h4>
              <p className="text-gray-600 text-sm font-medium mb-4">You have already submitted a neighbourhood map. Thank you!</p>
              <button 
                onClick={() => setIsAppSubmitted(false)}
                className="text-sm font-semibold tracking-wide text-green-700 bg-green-100 hover:bg-green-200 py-2.5 px-4 rounded-md transition-colors w-full border border-green-200"
              >
                Edit my submission
              </button>
            </div>
          ) : (
            <>
              {/* Step 1 */}
              <div className="flex items-start space-x-4">
            <span className={`mt-1 flex-shrink-0 flex items-center justify-center w-[1.375rem] h-[1.375rem] rounded-full text-[10px] font-bold ${stepNumberClasses(1)}`}>1</span>
            <div className="flex-1">
              <h3 className={`font-bold text-base leading-snug ${stepClasses(1)}`}>Find your area</h3>
              <div className={`text-[15px] mt-1 leading-relaxed space-y-2 ${stepClasses(1)}`}>
                <p>Pan and zoom the map to find where you live. Click the map to drop a pin.</p>
                <p className="text-sm opacity-80">You don't need to pin your exact home &mdash; a nearby intersection or general area is completely fine.</p>
              </div>
              
              {step > 1 && homeLocation && !isAppSubmitted && (
                <div className="mt-3">
                  <button 
                    onClick={() => {
                      setStep(1);
                      setHomeLocation(null);
                      setPolygonPoints([]);
                      setIsFinished(false);
                    }}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Redrop pin
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          {(step >= 2 || neighborhoodName) && (
            <div className="flex items-start space-x-4 animate-in fade-in">
              <span className={`mt-1 flex-shrink-0 flex items-center justify-center w-[1.375rem] h-[1.375rem] rounded-full text-[10px] font-bold  ${stepNumberClasses(2)}`}>2</span>
              <div className="flex-1 w-full">
                <h3 className={`font-bold text-base leading-snug  ${stepClasses(2)}`}>What is this neighbourhood called?</h3>
                
                {step === 2 && (
                  <form className="mt-3 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); if (neighborhoodName.trim()) setStep(3); }}>
                    <input 
                      type="text" 
                      required
                      name="neighborhood_name_input"
                      value={neighborhoodName}
                      onChange={(e) => setNeighborhoodName(e.target.value)}
                      maxLength={150}
                      placeholder="e.g. The Annex, Leslieville..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 w-full"
                      autoComplete="off"
                      data-1p-ignore="true"
                    />
                    <button 
                      type="submit"
                      disabled={!neighborhoodName.trim()}
                      className="bg-gray-900 text-white text-[13px] font-bold tracking-wide py-2.5 px-4 rounded-md hover:bg-black transition-colors w-max disabled:opacity-50"
                    >
                      Next
                    </button>
                  </form>
                )}

                {step > 2 && (
                   <div className="mt-2 flex flex-colitems-start gap-2">
                     <p className="font-bold text-gray-900 text-base">{neighborhoodName}</p>
                     {!isAppSubmitted && (
                       <button
                         onClick={() => setStep(2)}
                         className="text-xs text-gray-500 hover:text-gray-900 hover:underline mt-2 inline-block w-fit"
                       >
                         Edit name
                       </button>
                     )}
                   </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {(step >= 3) && (
            <div className="flex items-start space-x-4 animate-in fade-in">
              <span className={`mt-1 flex-shrink-0 flex items-center justify-center w-[1.375rem] h-[1.375rem] rounded-full text-[10px] font-bold ${stepNumberClasses(3)}`}>3</span>
              <div className="flex-1">
                <h3 className={`font-bold text-base leading-snug ${stepClasses(3)}`}>Draw the boundary</h3>
                <p className={`text-[15px] mt-1 leading-relaxed ${stepClasses(3)}`}>
                  Click around the edges of what you consider your neighbourhood. Connect to the start point to finish.
                </p>
                
                {step === 3 && polygonPoints.length > 0 && (
                  <div className="flex space-x-3 mt-4">
                    <button 
                      onClick={handleUndo}
                      className="flex items-center text-xs font-semibold text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 bg-white shadow-sm hover:bg-gray-50"
                    >
                      <Undo2 className="w-3.5 h-3.5 mr-1.5" /> Undo
                    </button>
                  </div>
                )}

                {step > 3 && (
                   <div className="mt-3">
                    {!isAppSubmitted && (
                      <button 
                        onClick={() => {
                          setStep(3);
                          setPolygonPoints([]);
                          setIsFinished(false);
                        }}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Redraw shape
                      </button>
                    )}
                   </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4 (Submit Form) */}
          {step === 4 && (
            <div className="flex items-start space-x-4 animate-in fade-in slide-in-from-top-4 pt-4 border-t border-gray-200">
               <div className="w-full">
                  <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    
                    <div className="flex flex-col gap-2">
                       <h3 className="font-bold text-[16px] leading-snug text-gray-900">
                          How would you say these boundaries changed over the years? <span className="text-gray-500 font-normal">(optional)</span>
                        </h3>
                        <p className="text-gray-600 text-[14px] mb-1">
                          For example, has the neighbourhood stretched or grown in one direction?
                        </p>
                        <textarea
                          name="changes_text"
                          rows={3}
                          maxLength={5000}
                          className="border border-gray-300 rounded-md p-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-y"
                          value={changesText}
                          onChange={(e) => setChangesText(e.target.value)}
                          autoComplete="off"
                          data-1p-ignore="true"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                       <h3 className="font-bold text-[16px] leading-snug text-gray-900">
                          Does this neighbourhood go by any other names, or has it gone by other names in the past? <span className="text-gray-500 font-normal">(optional)</span>
                        </h3>
                        <p className="text-gray-600 text-[14px] mb-1">
                          For example, sections of The Danforth could also be called Greektown.
                        </p>
                        <textarea
                          name="other_names_text"
                          rows={3}
                          maxLength={1000}
                          className="border border-gray-300 rounded-md p-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-y"
                          value={otherNamesText}
                          onChange={(e) => setOtherNamesText(e.target.value)}
                          autoComplete="off"
                          data-1p-ignore="true"
                        />
                    </div>

                    <div className="pt-2">
                      {submitError && <div className="text-red-500 text-sm mb-3">{submitError}</div>}
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gray-900 text-white text-[15px] font-bold py-3 px-8 hover:bg-black transition-colors disabled:opacity-50 rounded-md shadow-sm w-full md:w-auto"
                      >
                        {isSubmitting ? "Submitting..." : "Submit"}
                      </button>
                    </div>

                  </form>
              </div>
            </div>
          )}

            </>
          )}

        </div>
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
