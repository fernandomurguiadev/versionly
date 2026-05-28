import DiffMatchPatch from 'diff-match-patch';

export type DiffOp = -1 | 0 | 1;
export type DiffChunk = [DiffOp, string];

export type DiffRow = {
  type: 'equal' | 'delete' | 'insert' | 'modify';
  leftNum:  number | null;
  rightNum: number | null;
  left:  string | null;
  right: string | null;
  leftChunks?:  DiffChunk[];
  rightChunks?: DiffChunk[];
};

const dmp = new DiffMatchPatch();

// ─── Character-level diff (inline view) ──────────────────────────────────────

export function computeDiff(oldText: string, newText: string): DiffChunk[] {
  const diffs = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diffs);
  return diffs as DiffChunk[];
}

export function diffStats(chunks: DiffChunk[]) {
  let added = 0, removed = 0;
  for (const [op, text] of chunks) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (op ===  1) added   += words;
    if (op === -1) removed += words;
  }
  return { added, removed };
}

// ─── Line-level aligned diff (split view) ────────────────────────────────────

export function computeAlignedLineDiff(oldText: string, newText: string): DiffRow[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  // Encode each unique line as a single Unicode codepoint (Private Use Area)
  const lineToChar = new Map<string, string>();
  const charToLine = new Map<string, string>();
  let code = 0xE000; // Unicode Private Use Area

  function encode(line: string): string {
    if (!lineToChar.has(line)) {
      const c = String.fromCodePoint(code++);
      lineToChar.set(line, c);
      charToLine.set(c, line);
    }
    return lineToChar.get(line)!;
  }

  const encodedOld = oldLines.map(encode).join('');
  const encodedNew = newLines.map(encode).join('');

  const rawDiffs = dmp.diff_main(encodedOld, encodedNew, false);

  // Decode back to line arrays
  const lineDiffs: [DiffOp, string[]][] = rawDiffs.map(([op, chars]) => [
    op as DiffOp,
    [...chars].map(c => charToLine.get(c) ?? ''),
  ]);

  const rows: DiffRow[] = [];
  let leftNum  = 1;
  let rightNum = 1;
  let i = 0;

  while (i < lineDiffs.length) {
    const [op, lines] = lineDiffs[i];

    if (op === 0) {
      // Equal — same line both sides
      for (const line of lines) {
        rows.push({ type: 'equal', leftNum, rightNum, left: line, right: line });
        leftNum++;
        rightNum++;
      }
      i++;
      continue;
    }

    if (op === -1) {
      // Check if immediately followed by an INSERT (= modification block)
      const nextIsInsert = i + 1 < lineDiffs.length && lineDiffs[i + 1][0] === 1;

      if (nextIsInsert) {
        const insertLines = lineDiffs[i + 1][1];
        const maxLen = Math.max(lines.length, insertLines.length);

        for (let j = 0; j < maxLen; j++) {
          const left  = j < lines.length       ? lines[j]       : null;
          const right = j < insertLines.length ? insertLines[j] : null;

          if (left !== null && right !== null) {
            // Modified line → char-level diff
            const charDiff = computeDiff(left, right);
            rows.push({
              type: 'modify',
              leftNum, rightNum,
              left, right,
              leftChunks:  charDiff.filter(([o]) => o !== 1)  as DiffChunk[],
              rightChunks: charDiff.filter(([o]) => o !== -1) as DiffChunk[],
            });
            leftNum++;
            rightNum++;
          } else if (left !== null) {
            // Extra deleted line — empty placeholder on right
            rows.push({ type: 'delete', leftNum, rightNum: null, left, right: null });
            leftNum++;
          } else {
            // Extra inserted line — empty placeholder on left
            rows.push({ type: 'insert', leftNum: null, rightNum, left: null, right: right! });
            rightNum++;
          }
        }
        i += 2;
        continue;
      }

      // Pure deletions
      for (const line of lines) {
        rows.push({ type: 'delete', leftNum, rightNum: null, left: line, right: null });
        leftNum++;
      }
      i++;
      continue;
    }

    // Pure insertions
    for (const line of lines) {
      rows.push({ type: 'insert', leftNum: null, rightNum, left: null, right: line });
      rightNum++;
    }
    i++;
  }

  return rows;
}

// ─── Segment grouping (collapse equal blocks) ────────────────────────────────

export type DiffSegment =
  | { type: 'changes';   rows: DiffRow[] }
  | { type: 'context';   rows: DiffRow[] }
  | { type: 'collapsed'; rows: DiffRow[]; count: number };

/**
 * Groups DiffRow[] into segments for the split view.
 * Equal blocks larger than 2×contextLines get collapsed into a single segment.
 * Small equal blocks (≤ 2×contextLines) are shown as context — no point collapsing.
 */
export function segmentRows(rows: DiffRow[], contextLines = 5): DiffSegment[] {
  if (rows.length === 0) return [];

  // Step 1 — group consecutive rows by equal vs changed
  type Block = { equal: boolean; rows: DiffRow[] };
  const blocks: Block[] = [];
  for (const row of rows) {
    const isEqual = row.type === 'equal';
    const last = blocks[blocks.length - 1];
    if (last && last.equal === isEqual) {
      last.rows.push(row);
    } else {
      blocks.push({ equal: isEqual, rows: [row] });
    }
  }

  // Step 2 — convert blocks to segments
  const segments: DiffSegment[] = [];
  for (const block of blocks) {
    if (!block.equal) {
      segments.push({ type: 'changes', rows: block.rows });
      continue;
    }

    const n = block.rows.length;
    const minToCollapse = contextLines * 2 + 1;

    if (n <= minToCollapse) {
      // Too small to collapse — show as context
      segments.push({ type: 'context', rows: block.rows });
      continue;
    }

    // Large equal block: show first N as context, collapse middle, show last N as context
    const head = block.rows.slice(0, contextLines);
    const mid  = block.rows.slice(contextLines, n - contextLines);
    const tail = block.rows.slice(n - contextLines);

    if (head.length) segments.push({ type: 'context',   rows: head });
    if (mid.length)  segments.push({ type: 'collapsed', rows: mid, count: mid.length });
    if (tail.length) segments.push({ type: 'context',   rows: tail });
  }

  return segments;
}
