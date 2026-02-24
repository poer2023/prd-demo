
export interface Requirement {
  id: string;
  text: string;
  source?: string;
  status: 'ai' | 'edited' | 'user';
}

export interface AttachedFile {
  id: string;
  name: string;
  summary: string;
}

export interface EssayFormData {
  type: string;
  academicLevel: string;
  topic: string;
  instructions: string;
  referenceFiles: AttachedFile[];
  outlineType: 'ai' | 'custom';
  wordCount: string;
  language: string;
  citationStyle: string;
  includeChartsTables: boolean;
  includeFormulas: boolean;
}

export interface AutoFillResponse {
  type?: string;
  academicLevel?: string;
  topic?: string;
  requirements?: { text: string; source: string }[];
  wordCount?: string;
  language?: string;
  citationStyle?: string;
}

export type LoadingState = 'idle' | 'autofilling' | 'generating';

export type Lang = 'en' | 'zh';
export type ViewMode = 'web' | 'mobile';
