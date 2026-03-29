const TARGET_SAMPLE_RATE = 16000;

export async function blobToFloat32Array(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();

  // Decode with a 16kHz AudioContext so the browser handles resampling
  const audioContext = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  await audioContext.close();

  // Take first channel (mono) — already at 16kHz
  return audioBuffer.getChannelData(0);
}

export function startRecording(stream: MediaStream): {
  mediaRecorder: MediaRecorder;
  getBlob: () => Promise<Blob>;
} {
  const chunks: BlobEvent["data"][] = [];
  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const getBlob = () =>
    new Promise<Blob>((resolve) => {
      mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: "audio/webm" }));
      if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
    });

  mediaRecorder.start();
  return { mediaRecorder, getBlob };
}
