class PCMWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(0);
    this.chunkSize = Math.round(sampleRate * 0.1);
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channel = input[0];
    if (channel.length === 0) return true;

    const combined = new Float32Array(this.buffer.length + channel.length);
    combined.set(this.buffer, 0);
    combined.set(channel, this.buffer.length);
    this.buffer = combined;

    while (this.buffer.length >= this.chunkSize) {
      const chunk = this.buffer.slice(0, this.chunkSize);
      this.buffer = this.buffer.slice(this.chunkSize);
      this.port.postMessage(chunk);
    }

    return true;
  }
}

registerProcessor("pcm-worklet", PCMWorklet);
