export type AudioClient = {
  sampleRate: number;
  stop: () => Promise<void>;
};

export const startAudioClient = async (onChunk: (chunk: ArrayBuffer) => void): Promise<AudioClient> => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });

  const audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule("/pcm-worklet.js");

  const source = audioContext.createMediaStreamSource(stream);
  const workletNode = new AudioWorkletNode(audioContext, "pcm-worklet");
  const silentGain = audioContext.createGain();
  silentGain.gain.value = 0;

  workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
    const floatChunk = event.data;
    if (!floatChunk || floatChunk.length === 0) return;

    const int16 = new Int16Array(floatChunk.length);
    for (let i = 0; i < floatChunk.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, floatChunk[i] ?? 0));
      int16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    onChunk(int16.buffer.slice(0));
  };

  source.connect(workletNode);
  workletNode.connect(silentGain);
  silentGain.connect(audioContext.destination);

  return {
    sampleRate: audioContext.sampleRate,
    stop: async () => {
      workletNode.disconnect();
      source.disconnect();
      silentGain.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      await audioContext.close();
    }
  };
};
