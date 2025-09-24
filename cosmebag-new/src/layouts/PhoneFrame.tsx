import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] h-[844px] bg-black rounded-[3rem] shadow-2xl p-3 relative">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20"></div>

        {/* Screen */}
        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
          <div className="w-full h-full overflow-auto">
            {children}
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full"></div>
      </div>
    </div>
  );
};