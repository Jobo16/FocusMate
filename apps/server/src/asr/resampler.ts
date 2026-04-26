export class LinearResampler {
  private ratio: number;
  private pos = 0;
  private lastSample = 0;
  private hasLast = false;

  constructor(inputRate: number, outputRate: number) {
    this.ratio = inputRate / outputRate;
  }

  process(input: Int16Array): Int16Array {
    if (input.length === 0) return new Int16Array(0);
    const totalSamples = this.hasLast ? input.length + 1 : input.length;

    const readSample = (idx: number) => {
      if (this.hasLast) {
        if (idx === 0) return this.lastSample;
        return input[idx - 1] ?? this.lastSample;
      }
      return input[idx] ?? 0;
    };

    const output: number[] = [];
    let pos = this.pos;
    while (pos + 1 < totalSamples) {
      const i = Math.floor(pos);
      const frac = pos - i;
      const s0 = readSample(i);
      const s1 = readSample(i + 1);
      output.push(s0 + (s1 - s0) * frac);
      pos += this.ratio;
    }

    this.lastSample = input[input.length - 1] ?? 0;
    this.hasLast = true;
    this.pos = pos - (totalSamples - 1);

    const out = new Int16Array(output.length);
    for (let i = 0; i < output.length; i += 1) {
      out[i] = Math.max(-32768, Math.min(32767, Math.round(output[i] ?? 0)));
    }
    return out;
  }
}
