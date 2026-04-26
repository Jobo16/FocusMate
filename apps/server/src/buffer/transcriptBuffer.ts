import type { TranscriptSegment } from "@focusmate/shared";

const MAX_BUFFER_MS = 5 * 60 * 1000;

export class TranscriptBuffer {
  private finalSegments: TranscriptSegment[] = [];
  private partialSegment: TranscriptSegment | null = null;

  addPartial(text: string, source: TranscriptSegment["source"] = "dashscope") {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = Date.now();
    this.partialSegment = {
      id: "partial-current",
      text: trimmed,
      isFinal: false,
      startAt: this.partialSegment?.startAt ?? now,
      endAt: now,
      source
    };
  }

  addFinal(text: string, source: TranscriptSegment["source"] = "dashscope") {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = Date.now();
    const segment: TranscriptSegment = {
      id: `${source}-${now}-${this.finalSegments.length}`,
      text: trimmed,
      isFinal: true,
      startAt: this.partialSegment?.startAt ?? now,
      endAt: now,
      source
    };

    this.finalSegments.push(segment);
    this.partialSegment = null;
    this.prune(now);
  }

  getRecent(seconds: number): TranscriptSegment[] {
    const now = Date.now();
    const cutoff = now - seconds * 1000;
    const segments = this.finalSegments.filter((segment) => segment.endAt >= cutoff);
    if (this.partialSegment && this.partialSegment.endAt >= cutoff) {
      segments.push(this.partialSegment);
    }
    return segments.sort((a, b) => a.startAt - b.startAt);
  }

  getStats() {
    const segments = this.getRecent(MAX_BUFFER_MS / 1000);
    const first = segments[0];
    const last = segments[segments.length - 1];
    return {
      segmentCount: segments.length,
      secondsAvailable: first && last ? Math.max(0, Math.round((last.endAt - first.startAt) / 1000)) : 0
    };
  }

  private prune(now = Date.now()) {
    const cutoff = now - MAX_BUFFER_MS;
    this.finalSegments = this.finalSegments.filter((segment) => segment.endAt >= cutoff);
  }
}
