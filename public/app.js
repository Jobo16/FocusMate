const recordBtn = document.getElementById("recordBtn");
const statusEl = document.getElementById("status");
const transcriptEl = document.getElementById("transcript");
const meterBar = document.getElementById("meterBar");

let ws = null;
let recording = false;
let partialEl = null;
let meterTimer = null;
let audioContext = null;
let workletNode = null;
let mediaStream = null;

const updateStatus = (text) => {
  statusEl.textContent = text;
};

const connectWS = () => {
  if (ws && ws.readyState === WebSocket.OPEN) return;
  ws = new WebSocket(`${location.origin.replace("http", "ws")}/ws`);
  ws.binaryType = "arraybuffer";

  ws.addEventListener("open", () => {
    updateStatus("已连接");
    if (audioContext) {
      ws.send(JSON.stringify({ type: "config", sampleRate: audioContext.sampleRate }));
    }
  });

  ws.addEventListener("message", (event) => {
    let payload = null;
    try {
      payload = JSON.parse(event.data);
    } catch {
      return;
    }

    if (payload.type === "status") {
      updateStatus(payload.message);
    }

    if (payload.type === "transcript") {
      renderTranscript(payload.text, payload.isFinal);
    }
  });

  ws.addEventListener("close", () => {
    updateStatus("连接已断开");
  });
};

const renderTranscript = (text, isFinal) => {
  if (!text) return;

  if (!isFinal) {
    if (!partialEl) {
      partialEl = document.createElement("div");
      partialEl.className = "line partial";
      transcriptEl.appendChild(partialEl);
    }
    partialEl.textContent = text;
    scrollTranscript();
    return;
  }

  if (partialEl) {
    partialEl.remove();
    partialEl = null;
  }

  const line = document.createElement("div");
  line.className = "line";
  line.textContent = text;
  removePlaceholder();
  transcriptEl.appendChild(line);
  scrollTranscript();
};

const removePlaceholder = () => {
  const placeholder = transcriptEl.querySelector(".placeholder");
  if (placeholder) placeholder.remove();
};

const scrollTranscript = () => {
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
};

const startMeter = () => {
  stopMeter();
  meterTimer = setInterval(() => {
    const value = 20 + Math.random() * 70;
    meterBar.style.width = `${value}%`;
  }, 240);
};

const stopMeter = () => {
  if (meterTimer) {
    clearInterval(meterTimer);
    meterTimer = null;
  }
  meterBar.style.width = "12%";
};

const requestMic = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return stream;
};

const setupAudioPipeline = async () => {
  if (audioContext) return;
  audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule("/pcm-worklet.js");
  mediaStream = await requestMic();
  const source = audioContext.createMediaStreamSource(mediaStream);
  workletNode = new AudioWorkletNode(audioContext, "pcm-worklet");
  const silentGain = audioContext.createGain();
  silentGain.gain.value = 0;

  workletNode.port.onmessage = (event) => {
    const floatChunk = event.data;
    if (!floatChunk || !ws || ws.readyState !== WebSocket.OPEN) return;

    const int16 = new Int16Array(floatChunk.length);
    for (let i = 0; i < floatChunk.length; i += 1) {
      const s = Math.max(-1, Math.min(1, floatChunk[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    ws.send(int16.buffer);
  };

  source.connect(workletNode);
  workletNode.connect(silentGain);
  silentGain.connect(audioContext.destination);
};

const startRecording = async () => {
  connectWS();
  try {
    await setupAudioPipeline();
  } catch {
    updateStatus("麦克风权限未授予（仍可查看演示）");
  }

  recording = true;
  recordBtn.classList.add("is-live");
  recordBtn.querySelector(".label").textContent = "停止转录";
  updateStatus("转录中…");
  startMeter();
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "config", sampleRate: audioContext?.sampleRate || 48000 }));
    ws.send(JSON.stringify({ type: "start" }));
  }
};

const stopRecording = () => {
  recording = false;
  recordBtn.classList.remove("is-live");
  recordBtn.querySelector(".label").textContent = "开始转录";
  updateStatus("已停止");
  stopMeter();

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "stop" }));
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  workletNode = null;
};

recordBtn.addEventListener("click", () => {
  if (recording) {
    stopRecording();
  } else {
    startRecording();
  }
});
