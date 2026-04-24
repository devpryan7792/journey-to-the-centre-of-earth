import { useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { useScrollStore } from '../store/useScrollStore';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function useNarration() {
  const currentCheckpoint = useScrollStore((state) => state.currentCheckpoint);
  const localProgress = useScrollStore((state) => state.localProgress);
  const isMuted = useScrollStore((state) => state.isMuted);
  
  const lastNarratedId = useRef(-1);
  const audioContextRef = useRef(null);
  const activeSourceRef = useRef(null);

  // Initialize AudioContext lazily
  const getAudioContext = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 24000,
        });
    }
    return audioContextRef.current;
  };

  const stopNarration = () => {
    if (activeSourceRef.current) {
        try {
            activeSourceRef.current.stop();
        } catch(e) {}
        activeSourceRef.current = null;
    }
  };

  const playPCM = async (base64Data) => {
    const ctx = getAudioContext();
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Int16Array(len / 2);
    
    for (let i = 0; i < len; i += 2) {
      bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i);
    }

    // Convert Int16 to Float32 [-1, 1]
    const float32Data = new Float32Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      float32Data[i] = bytes[i] / 32768;
    }

    const buffer = ctx.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    stopNarration();
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
    activeSourceRef.current = source;
  };

  const fetchAndPlayNarration = async (text) => {
    if (isMuted) return;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Speak in a deep, ancient, echoing cave voice (gender: male, age: ancient). Be slow and atmospheric: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' }, // 'Charon' is deep and fitting
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        await playPCM(base64Audio);
      }
    } catch (error) {
      console.error("Narration error:", error);
    }
  };

  useEffect(() => {
    // Only narrate when the card is active and we haven't narrated this checkpoint yet
    const isShowingCard = localProgress >= 0.25 && localProgress <= 0.75;
    const hasCard = currentCheckpoint.card !== null;

    if (isShowingCard && hasCard && lastNarratedId.current !== currentCheckpoint.id) {
      lastNarratedId.current = currentCheckpoint.id;
      const textToSpeak = `${currentCheckpoint.card.title}. ${currentCheckpoint.card.body}`;
      fetchAndPlayNarration(textToSpeak);
    }

    // Stop if we scroll past the card
    if (!isShowingCard && activeSourceRef.current) {
        // We could let it finish, but stopping makes it feel tied to the visual
        // stopNarration(); 
    }

  }, [currentCheckpoint.id, localProgress, isMuted]);

  return { stopNarration };
}
