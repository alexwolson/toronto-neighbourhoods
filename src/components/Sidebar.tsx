import type { Dispatch, SetStateAction, FormEvent } from "react";
import { useState } from "react";
import { Undo2, X, MapPin } from "lucide-react";
import type { LatLngTuple } from "leaflet";

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
}: SidebarProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [changesText, setChangesText] = useState("");
  const [otherNamesText, setOtherNamesText] = useState("");
  
  const handleUndo = () => {
    setPolygonPoints((prev) => prev.slice(0, -1));
    setIsFinished(false);
  };

  const handleClear = () => {
    setPolygonPoints([]);
    setIsFinished(false);
    setIsSubmitted(false);
    setNeighborhoodName("");
    setStep(1);
    setHomeLocation(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const stepClasses = (stepNumber: number) => {
    if (step === stepNumber) return "text-gray-900";
    if (step > stepNumber) return "text-gray-400";
    return "text-gray-300";
  };

  const stepNumberClasses = (stepNumber: number) => {
    if (step === stepNumber) return "bg-blue-600 text-white";
    if (step > stepNumber) return "bg-gray-200 text-gray-500";
    return "bg-gray-100 text-gray-300";
  };

  return (
    <div className="w-full h-[45dvh] md:h-[100dvh] md:w-[24rem] bg-white shrink-0 overflow-y-auto border-t md:border-t-0 md:border-r border-gray-200 flex flex-col font-sans relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-sm">
      <div className="flex-1 flex flex-col pt-6 md:pt-8 pb-8 md:pb-32 px-5 md:px-6 lg:px-8">
        <h1 className="text-2xl md:text-[2rem] font-extrabold text-gray-900 mb-5 md:mb-6 leading-tight pb-4 md:pb-6 border-b border-gray-200 tracking-tight">
          Toronto Neighborhoods
        </h1>

        <div className="flex flex-col space-y-8">
          
          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <span className={`mt-1 flex-shrink-0 flex items-center justify-center w-[1.375rem] h-[1.375rem] rounded-full text-[10px] font-bold ${stepNumberClasses(1)}`}>1</span>
            <div className="flex-1">
              <h3 className={`font-bold text-base leading-snug ${stepClasses(1)}`}>Find your area</h3>
              <p className={`text-[15px] mt-1 leading-relaxed ${stepClasses(1)}`}>Pan and zoom the map to find where you live. Click the map to drop a pin.</p>
              
              {step > 1 && homeLocation && (
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
                <h3 className={`font-bold text-base leading-snug  ${stepClasses(2)}`}>What is this neighborhood called?</h3>
                
                {step === 2 && (
                  <form className="mt-3 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); if (neighborhoodName.trim()) setStep(3); }}>
                    <input 
                      type="text" 
                      required
                      name="neighborhood_name_input"
                      value={neighborhoodName}
                      onChange={(e) => setNeighborhoodName(e.target.value)}
                      placeholder="e.g. The Annex, Leslieville..."
                      className="border border-gray-300 rounded-md px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                      autoComplete="off"
                      data-1p-ignore="true"
                    />
                    <button 
                      type="submit"
                      disabled={!neighborhoodName.trim()}
                      className="bg-blue-600 text-white text-[13px] font-bold tracking-wide py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors w-max disabled:opacity-50"
                    >
                      Next
                    </button>
                  </form>
                )}

                {step > 2 && (
                   <div className="mt-2 flex flex-colitems-start gap-2">
                     <p className="font-bold text-gray-900 text-base">{neighborhoodName}</p>
                     <button
                        onClick={() => setStep(2)}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-2"
                      >
                        Edit name
                      </button>
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
                  Click around the edges of what you consider your neighborhood. Connect to the start point to finish.
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
                   </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4 (Submit Form) */}
          {step === 4 && (
            <div className="flex items-start space-x-4 animate-in fade-in slide-in-from-top-4 pt-4 border-t border-gray-200">
              <div className="w-full">
                {isSubmitted ? (
                   <div className="bg-green-50 border text-center border-green-200 rounded-xl p-6 shadow-sm">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-xl mb-2">{neighborhoodName}</h4>
                      <p className="text-gray-600 text-sm mb-6">Thank you for submitting your neighborhood!</p>
                      
                      <button 
                        onClick={handleClear}
                         className="text-sm font-semibold tracking-wide text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 py-2 px-4 rounded-md transition-colors"
                      >
                        Start over
                      </button>
                    </div>
                ) : (
                  <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    
                    <div className="flex flex-col gap-2">
                       <h3 className="font-bold text-[16px] leading-snug text-gray-900">
                          How would you say these boundaries changed over the years? <span className="text-gray-500 font-normal">(optional)</span>
                        </h3>
                        <p className="text-gray-600 text-[14px] mb-1">
                          For example, has the neighborhood stretched or grown in one direction?
                        </p>
                        <textarea
                          name="changes_text"
                          rows={3}
                          className="border border-gray-300 rounded-md p-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                          value={changesText}
                          onChange={(e) => setChangesText(e.target.value)}
                          autoComplete="off"
                          data-1p-ignore="true"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                       <h3 className="font-bold text-[16px] leading-snug text-gray-900">
                          Does this neighborhood go by any other names, or has it gone by other names in the past? <span className="text-gray-500 font-normal">(optional)</span>
                        </h3>
                        <p className="text-gray-600 text-[14px] mb-1">
                          For example, sections of The Danforth could also be called Greektown.
                        </p>
                        <textarea
                          name="other_names_text"
                          rows={3}
                          className="border border-gray-300 rounded-md p-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                          value={otherNamesText}
                          onChange={(e) => setOtherNamesText(e.target.value)}
                          autoComplete="off"
                          data-1p-ignore="true"
                        />
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        className="bg-blue-600 text-white text-[15px] font-bold py-3 px-8 hover:bg-blue-700 transition-colors disabled:opacity-50 rounded-md shadow-sm"
                      >
                        Submit
                      </button>
                    </div>

                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      <div className="p-6 text-xs text-gray-500 border-t border-gray-200 bg-gray-50 mt-auto leading-relaxed">
        Inspired by The New York Times' <a href="https://www.nytimes.com/interactive/2022/12/02/upshot/draw-your-nyc-neighborhood.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">"Draw Your NYC Neighborhood"</a> interactive project.
      </div>
    </div>
  );
}
