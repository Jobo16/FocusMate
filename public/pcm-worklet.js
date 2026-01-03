class PCMWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = new Float32Array(0);
    this._chunkSize = Math.round(sampleRate * 0.1);
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channel = input[0];
    if (channel.length === 0) return true;

    const combined = new Float32Array(this._buffer.length + channel.length);
    combined.set(this._buffer, 0);
    combined.set(channel, this._buffer.length);
    this._buffer = combined;

    while (this._buffer.length >= this._chunkSize) {
      const chunk = this._buffer.slice(0, this._chunkSize);
      this._buffer = this._buffer.slice(this._chunkSize);
      this.port.postMessage(chunk);
    }

    return true;
  }
}

registerProcessor("pcm-worklet", PCMWorklet);
