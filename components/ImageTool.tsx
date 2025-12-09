import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download, RefreshCw } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import { GeneratedImage } from '../types';
import { IMAGE_PROMPTS } from '../constants';

const ImageTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage({
        url: imageUrl,
        prompt: prompt,
        timestamp: new Date(),
      });
    } catch (err) {
      setError("Failed to generate image. Please try a different prompt or check your API limit.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 rounded-lg overflow-hidden shadow-xl border border-gray-800">
       <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          Image Studio
        </h2>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-start overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Input Section */}
          <div className="bg-gray-800/40 p-1 rounded-xl border border-gray-700 flex flex-col sm:flex-row gap-2">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-3 placeholder-gray-500"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center m-1"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate
            </button>
          </div>

          {/* Suggestions */}
          {!generatedImage && !isLoading && !error && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 font-medium ml-1">Try these prompts:</p>
              <div className="flex flex-wrap gap-2">
                {IMAGE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
             <div className="p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-200 text-center text-sm">
                {error}
             </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="aspect-square w-full bg-gray-800 rounded-xl flex flex-col items-center justify-center animate-pulse border border-gray-700">
               <ImageIcon className="w-12 h-12 text-gray-600 mb-4" />
               <p className="text-gray-400">Dreaming up your image...</p>
            </div>
          )}

          {/* Result */}
          {generatedImage && (
            <div className="space-y-4 animate-fade-in">
              <div className="relative group rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl">
                <img 
                  src={generatedImage.url} 
                  alt={generatedImage.prompt}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a 
                    href={generatedImage.url} 
                    download={`gemini-image-${Date.now()}.png`}
                    className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <p className="text-sm text-gray-400 uppercase font-bold tracking-wider text-xs mb-1">Prompt</p>
                <p className="text-gray-200">{generatedImage.prompt}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageTool;
