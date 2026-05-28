import { api } from './client';

export type FontFamily = 'serif' | 'sans' | 'mono';
export type FontSize   = '10pt' | '11pt' | '12pt';
export type LineHeight = 1.5 | 1.75 | 2.0;
export type PageWidth  = 'compact' | 'standard' | 'wide';

export type DocumentSettings = {
  fontFamily: FontFamily;
  fontSize:   FontSize;
  lineHeight: LineHeight;
  pageWidth:  PageWidth;
};

export const DEFAULT_SETTINGS: DocumentSettings = {
  fontFamily: 'serif',
  fontSize:   '11pt',
  lineHeight: 1.75,
  pageWidth:  'standard',
};

export const FONT_OPTIONS: { value: FontFamily; label: string; preview: string }[] = [
  { value: 'serif', label: 'Georgia (Serif)',      preview: 'font-["Georgia",serif]' },
  { value: 'sans',  label: 'Inter (Sans-serif)',   preview: 'font-sans' },
  { value: 'mono',  label: 'Mono',                 preview: 'font-mono' },
];

export const PAGE_WIDTHS: Record<PageWidth, string> = {
  compact:  'max-w-[600px]',
  standard: 'max-w-[816px]',
  wide:     'max-w-[1080px]',
};

export const settingsApi = {
  get:    (docId: string) => api.get<DocumentSettings>(`documents/${docId}/settings`),
  update: (docId: string, patch: Partial<DocumentSettings>) =>
    api.patch<DocumentSettings>(`documents/${docId}/settings`, patch),
};
