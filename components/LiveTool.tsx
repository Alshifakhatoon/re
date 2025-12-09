import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Radio, Volume2, Activity, Settings2 } from 'lucide-react';
import { LiveClient } from '../services/geminiService';
import { VOICE_OPTIONS } from '../constants';

const LiveTool: React.FC = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const clientRef = useRef<LiveClient | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  const toggleConnection = async () => {
    if (status === 'connected') {
      await clientRef.current?.disconnect();
      clientRef.current = null;
    } else {
      setStatus('connected'); // Optimistic update for UI
      clientRef.current = new LiveClient(
        { voiceName: selectedVoice },
        (newStatus) => setStatus(newStatus),
        (active) => setIsAudioActive(active)
      );
      await clientRef.current.connect();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 rounded-lg overflow-hidden shadow-xl border border-gray-800 relative">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Radio className={`w-5 h-5 ${status === 'connected' ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
          Live Voice Chat
        </h2>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
          status === 'connected' ? 'bg-red-900/50 text-red-400 border border-red-800' : 
          status === 'error' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-800' :
          'bg-gray-800 text-gray-400 border border-gray-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-red-500' : 'bg-gray-500'}`} />
          {status}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background Visualizer Effect */}
        {status === 'connected' && (
           <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <div className={`w-64 h-64 rounded-full border-4 border-red-500 ${isAudioActive ? 'scale-150' : 'scale-100'} transition-transform duration-100`} />
              <div className={`absolute w-48 h-48 rounded-full border-4 border-red-500 ${isAudioActive ? 'scale-125' : 'scale-100'} transition-transform duration-200 delay-75`} />
              <div className={`absolute w-32 h-32 rounded-full border-4 border-red-500 ${isAudioActive ? 'scale-110' : 'scale-100'} transition-transform duration-300 delay-100`} />
           </div>
        )}

        {/* Main Controls */}
        <div className="z-10 flex flex-col items-center space-y-8 w-full max-w-md">
          
          <div className="text-center space-y-2">
             <h3 className="text-2xl font-bold text-white">
                {status === 'connected' ? "Listening..." : "Start a Conversation"}
             </h3>
             <p className="text-gray-400">
               {status === 'connected' 
                 ? "Speak naturally. Gemini is listening." 
                 : "Connect to have a real-time voice chat with Gemini."}
             </p>
          </div>

          <button
            onClick={toggleConnection}
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              status === 'connected'
                ? 'bg-red-600 hover:bg-red-700 scale-100 ring-4 ring-red-900/50'
                : 'bg-blue-600 hover:bg-blue-500 hover:scale-105'
            }`}
          >
            {status === 'connected' ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>

          {/* Voice Selection (Only when disconnected) */}
          <div className={`w-full transition-all duration-500 ${status === 'connected' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Voice Settings
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VOICE_OPTIONS.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  className={`p-3 rounded-lg text-sm font-medium text-left border transition-all ${
                    selectedVoice === voice.id
                      ? 'bg-blue-900/30 border-blue-500 text-blue-200'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                     <Volume2 className="w-4 h-4" />
                     {voice.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {status === 'connected' && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
               <Activity className="w-4 h-4 text-green-500" />
               <span>Low Latency Audio Stream Active</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LiveTool;
