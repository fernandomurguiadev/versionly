import { computeAlignedLineDiff, computeDiff, diffStats } from './compute';
import type { DiffRow, DiffChunk } from './compute';

export type WorkerInput  = { oldText: string; newText: string };
export type WorkerOutput = { rows: DiffRow[]; chunks: DiffChunk[]; stats: { added: number; removed: number } };

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { oldText, newText } = e.data;
  const rows   = computeAlignedLineDiff(oldText, newText);
  const chunks = computeDiff(oldText, newText);
  const stats  = diffStats(chunks);
  self.postMessage({ rows, chunks, stats } satisfies WorkerOutput);
};
