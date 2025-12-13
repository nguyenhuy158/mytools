import { type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

interface RetroContainerProps {
  children: ReactNode;
  title: string;
}

export function RetroContainer({ children, title }: RetroContainerProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      {/* Phone Body */}
      <div className="bg-gray-800 p-8 rounded-[3rem] shadow-2xl max-w-md w-full border-4 border-gray-700 relative">
        
        {/* Screen Bezel */}
        <div className="bg-gray-400 p-8 rounded-2xl rounded-bl-[3rem] shadow-inner mb-8 relative">
          
          {/* Nokia Logo Placeholer */}
          <div className="absolute top-2 left-0 right-0 text-center font-bold text-gray-600 tracking-widest text-xs opacity-50">
            MYTOOLS
          </div>

          {/* LCD Screen */}
          <div className="bg-[#c7f0d8] text-[#43523d] p-4 rounded shadow-inner min-h-[400px] flex flex-col font-mono relative overflow-hidden border-2 border-[#99bfa8]">
             {/* Scanlines effect overlay */}
             <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%]"></div>

            <div className="flex justify-between items-center mb-4 border-b-2 border-[#43523d] pb-2 z-20 relative">
              <Link 
                to="/games" 
                className="hover:bg-[#43523d] hover:text-[#c7f0d8] transition-colors rounded px-1"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold uppercase tracking-widest">{title}</h1>
              <div className="w-5" /> {/* Spacer */}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center relative z-20">
              {children}
            </div>
          </div>
        </div>

        {/* Keypad Area (Visual only for now) */}
        <div className="grid grid-cols-3 gap-4 px-4 pb-8">
           <div className="h-2 bg-gray-600 rounded-full col-span-3 mb-4 opacity-50"></div>
           {/* We could add clickable controls here later if needed for mobile */}
        </div>
      </div>
    </div>
  );
}
