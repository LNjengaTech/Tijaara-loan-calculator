'use client';

import React, { useState } from 'react';

export default function Navbar() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  // const [isOnline, setIsOnline] = useState(true);

  // useEffect(() => {
  //   setIsOnline(navigator.onLine);
  //   const handleOnline = () => setIsOnline(true);
  //   const handleOffline = () => setIsOnline(false);

  //   window.addEventListener('online', handleOnline);
  //   window.addEventListener('offline', handleOffline);

  //   const handleBeforeInstallPrompt = (e: Event) => {
  //     e.preventDefault();
  //     setDeferredPrompt(e);
  //     setIsInstallable(true);
  //   };

  //   window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  //   return () => {
  //     window.removeEventListener('online', handleOnline);
  //     window.removeEventListener('offline', handleOffline);
  //     window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  //   };
  // }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="bg-emerald-800 text-white shadow-md print:hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-xl tracking-wider shadow-inner text-white">
            T
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              TIJAARA MICROFINANCE
            </h1>
            <p className="text-xs text-emerald-200">Loan Qualification & Schedule Calculator</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Online/Offline status pill */}
          {/* <span
            className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium ${
              isOnline
                ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700'
                : 'bg-amber-900/80 text-amber-200 border border-amber-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            {isOnline ? 'Offline Ready' : 'Offline Mode'}
          </span> */}

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold text-xs sm:text-sm px-3 py-1.5 rounded-md transition shadow-sm flex items-center gap-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Install App
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
