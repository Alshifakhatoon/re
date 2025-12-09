import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { MODEL_TEXT, MODEL_IMAGE, MODEL_LIVE } from "../constants";
import { LiveConfig } from "../types";
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from "./audioUtils";

// Initialize the API client
// CRITICAL: We use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Chat & Text ---

export const generateText = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Text generation error:", error);
    throw error;
  }
};

// --- Image Generation ---

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    // Iterate to find the image part
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};

// --- Live API (Real-time) ---

export class LiveClient {
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private cleanupCallbacks: (() => void)[] = [];

  constructor(
    private config: LiveConfig,
    private onStatusChange: (status: 'connected' | 'disconnected' | 'error') => void,
    private onAudioActivity: (active: boolean) => void
  ) {}

  async connect() {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Resume contexts if suspended (browser policy)
    await this.inputAudioContext.resume();
    await this.outputAudioContext.resume();

    const outputNode = this.outputAudioContext.createGain();
    outputNode.connect(this.outputAudioContext.destination);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.sessionPromise = ai.live.connect({
        model: MODEL_LIVE,
        callbacks: {
          onopen: () => {
            this.onStatusChange('connected');
            this.setupAudioInput(stream);
          },
          onmessage: async (message: LiveServerMessage) => {
             this.handleMessage(message, outputNode);
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            this.onStatusChange('error');
          },
          onclose: () => {
            this.onStatusChange('disconnected');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: this.config.voiceName } },
          },
          systemInstruction: this.config.systemInstruction || "You are a helpful AI assistant.",
        },
      });

    } catch (err) {
      console.error("Failed to connect live client:", err);
      this.onStatusChange('error');
      this.disconnect();
    }
  }

  private setupAudioInput(stream: MediaStream) {
    if (!this.inputAudioContext || !this.sessionPromise) return;

    const source = this.inputAudioContext.createMediaStreamSource(stream);
    // Use ScriptProcessor for raw PCM access (standard for this API usage pattern)
    const scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      
      // CRITICAL: Prevent race condition by using the promise
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
      
      // Simple activity detection visualizer mock
      const sum = inputData.reduce((a, b) => a + Math.abs(b), 0);
      if (sum > 10) this.onAudioActivity(true);
      else this.onAudioActivity(false);
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(this.inputAudioContext.destination);
    
    this.cleanupCallbacks.push(() => {
      source.disconnect();
      scriptProcessor.disconnect();
      stream.getTracks().forEach(track => track.stop());
    });
  }

  private async handleMessage(message: LiveServerMessage, outputNode: GainNode) {
    if (!this.outputAudioContext) return;

    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      try {
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        
        const audioBuffer = await decodeAudioData(
            base64ToUint8Array(base64Audio),
            this.outputAudioContext,
            24000,
            1
        );
        
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNode);
        
        source.addEventListener('ended', () => {
          this.sources.delete(source);
        });

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
      } catch (e) {
        console.error("Audio decode error:", e);
      }
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(s => s.stop());
      this.sources.clear();
      this.nextStartTime = 0;
    }
  }

  async disconnect() {
    this.cleanupCallbacks.forEach(cb => cb());
    this.cleanupCallbacks = [];

    if (this.sessionPromise) {
      const session = await this.sessionPromise;
      session.close();
      this.sessionPromise = null;
    }

    if (this.inputAudioContext) {
      await this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      await this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
    
    this.onStatusChange('disconnected');
  }
}
