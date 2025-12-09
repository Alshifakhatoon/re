export enum ToolType {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  IMAGE = 'IMAGE',
  LIVE = 'LIVE',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}

// Live API Types
export interface Blob {
  data: string;
  mimeType: string;
}

export interface LiveConfig {
  voiceName: string;
  systemInstruction?: string;
}
