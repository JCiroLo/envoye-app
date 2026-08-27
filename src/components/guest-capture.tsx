import * as React from "react";
import { createPortal } from "react-dom";
import { Camera, Mic, SwitchCamera, Upload, Video } from "lucide-react";
import { motion } from "framer-motion";
import { sileo } from "sileo";
import Button from "@/components/ui/button";
import type { GuestMediaType } from "@/stores/use-guest-submission-store";

type CaptureSettings = { allowImages?: boolean; allowVideos?: boolean; allowAudio?: boolean };
type Props = { onCapture: (file: File, type: GuestMediaType) => void; settings?: CaptureSettings };
type FacingMode = "user" | "environment";
type SoundName = "countdown" | "shutter" | "recordStart" | "recordStop";

const maxRecordingSeconds = Number(
  import.meta.env.VITE_MAX_RECORDING_DURATION_SECONDS ?? import.meta.env.VITE_MAX_VIDEO_DURATION_SECONDS ?? 30,
);
const recordingDurationToleranceSeconds = 1;
const soundSources: Record<SoundName, string> = {
  countdown: "/sfx/countdown.mp3",
  shutter: "/sfx/camera-shutter.mp3",
  recordStart: "/sfx/camera-start-record.mp3",
  recordStop: "/sfx/camera-stop-record.mp3",
};

const typeFromFile = (file: File): GuestMediaType | null => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";

  // iOS Safari can expose gallery files with an empty or generic MIME type.
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(extension ?? "")) return "image";
  if (["mp4", "mov", "m4v", "webm", "3gp"].includes(extension ?? "")) return "video";
  if (["m4a", "mp3", "wav", "aac", "ogg", "webm"].includes(extension ?? "")) return "audio";
  return null;
};

const extensionFor = (mime: string, type: GuestMediaType) =>
  mime.includes("mp4") ? (type === "audio" ? "m4a" : "mp4") : mime.includes("ogg") ? "ogg" : "webm";

const supportedRecorderMime = (type: GuestMediaType) => {
  const candidates =
    type === "video"
      ? ["video/webm;codecs=vp8,opus", "video/mp4", "video/webm"]
      : ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
};

const mediaDuration = (file: File) =>
  new Promise<number>((resolve, reject) => {
    const element = document.createElement(typeFromFile(file) === "video" ? "video" : "audio");
    const url = URL.createObjectURL(file);
    element.preload = "metadata";
    element.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(element.duration);
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read media duration"));
    };
    element.src = url;
  });

const useCaptureSounds = () => {
  const sounds = React.useRef<Record<SoundName, HTMLAudioElement> | null>(null);
  const audioContext = React.useRef<AudioContext | null>(null);
  const soundBuffers = React.useRef<Partial<Record<SoundName, AudioBuffer>>>({});

  React.useEffect(() => {
    const context = new AudioContext();
    audioContext.current = context;
    sounds.current = Object.fromEntries(
      Object.entries(soundSources).map(([name, source]) => {
        const audio = new Audio(source);
        audio.preload = "auto";
        return [name, audio];
      }),
    ) as Record<SoundName, HTMLAudioElement>;

    Object.values(sounds.current).forEach((audio) => audio.load());
    void Promise.all(
      Object.entries(soundSources).map(async ([name, source]) => {
        try {
          const response = await fetch(source);
          const data = await response.arrayBuffer();
          soundBuffers.current[name as SoundName] = await context.decodeAudioData(data);
        } catch {
          // The HTML audio fallback remains available when decoding is unavailable.
        }
      }),
    );

    return () => {
      Object.values(sounds.current ?? {}).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      void context.close();
      audioContext.current = null;
    };
  }, []);

  const play = React.useCallback((name: SoundName) => {
    const context = audioContext.current;
    const buffer = soundBuffers.current[name];
    if (context?.state === "running" && buffer) {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start();
      return;
    }

    const audio = sounds.current?.[name];
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const unlock = React.useCallback(() => {
    void audioContext.current?.resume();
    (["shutter", "recordStart", "recordStop"] as SoundName[]).forEach((name) => {
      const audio = sounds.current?.[name];
      if (!audio) return;
      audio.muted = true;
      audio.currentTime = 0;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        })
        .catch(() => {
          audio.muted = false;
        });
    });
  }, []);

  return { play, unlock };
};

const GuestCapture = ({ onCapture, settings }: Props) => {
  const allowImage = settings?.allowImages !== false;
  const allowVideo = settings?.allowVideos !== false;
  const allowAudio = settings?.allowAudio !== false;
  const acceptedTypes = [allowImage && "image/*", allowVideo && "video/*", allowAudio && "audio/*"]
    .filter(Boolean)
    .join(",");
  const { play, unlock } = useCaptureSounds();
  const [mode, setMode] = React.useState<GuestMediaType | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [recording, setRecording] = React.useState(false);
  const [secondsRemaining, setSecondsRemaining] = React.useState<number | null>(null);
  const [facingMode, setFacingMode] = React.useState<FacingMode>("user");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timeoutsRef = React.useRef<number[]>([]);
  const recordingIntervalRef = React.useRef<number | null>(null);
  const recordingPipelineCleanupRef = React.useRef<(() => void) | null>(null);

  const clearTimers = React.useCallback(() => {
    timeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
    timeoutsRef.current = [];
    if (recordingIntervalRef.current !== null) window.clearInterval(recordingIntervalRef.current);
    recordingIntervalRef.current = null;
  }, []);

  const schedule = React.useCallback((callback: () => void, delay: number) => {
    const timeout = window.setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  }, []);

  const stopTracks = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }, []);
  
  const closeCapture = React.useCallback(() => {
    clearTimers();
    recordingPipelineCleanupRef.current?.();
    recordingPipelineCleanupRef.current = null;
    stopTracks();
    recorderRef.current = null;
    setCountdown(null);
    setSecondsRemaining(null);
    setRecording(false);
    setMode(null);
  }, [clearTimers, stopTracks]);

  React.useEffect(
    () => () => {
      clearTimers();
      stopTracks();
    },
    [clearTimers, stopTracks],
  );
  React.useEffect(() => {
    if (!stream || !videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play().catch(() => undefined);
  }, [stream]);

  const requestStream = async (nextMode: GuestMediaType, nextFacingMode = facingMode) => {
    const nextStream = await navigator.mediaDevices.getUserMedia({
      video:
        nextMode === "audio"
          ? false
          : {
              facingMode: { ideal: nextFacingMode },
            },
      audio: nextMode !== "image",
    });
    streamRef.current = nextStream;
    setFacingMode(nextFacingMode);
    setStream(nextStream);
  };
  const openCapture = async (nextMode: GuestMediaType) => {
    const enabled = nextMode === "image" ? allowImage : nextMode === "video" ? allowVideo : allowAudio;
    if (!enabled) return;
    try {
      await requestStream(nextMode);
      setMode(nextMode);
    } catch {
      sileo.error({
        title: "No pudimos acceder a tu cámara o micrófono",
        description: "Revisa los permisos del navegador o usa tu galería.",
      });
    }
  };
  const takePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context?.translate(canvas.width, 0);
    context?.scale(-1, 1);
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(new File([blob], "envoye-photo.jpg", { type: "image/jpeg" }), "image");
        closeCapture();
      },
      "image/jpeg",
      0.9,
    );
  };
  const createUnmirroredVideoStream = (source: MediaStream) => {
    const preview = videoRef.current;
    if (!preview?.videoWidth || !preview.videoHeight) return source;

    const canvas = document.createElement("canvas");
    canvas.width = preview.videoWidth;
    canvas.height = preview.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return source;

    const drawFrame = () => {
      context.setTransform(-1, 0, 0, 1, canvas.width, 0);
      context.drawImage(preview, 0, 0, canvas.width, canvas.height);
      animationFrame = window.requestAnimationFrame(drawFrame);
    };
    let animationFrame = window.requestAnimationFrame(drawFrame);
    const transformed = canvas.captureStream(30);
    source.getAudioTracks().forEach((track) => transformed.addTrack(track));

    recordingPipelineCleanupRef.current = () => {
      window.cancelAnimationFrame(animationFrame);
      transformed.getVideoTracks().forEach((track) => track.stop());
    };

    return transformed;
  };
  const startRecorder = (captureMode: "video" | "audio") => {
    const activeStream = streamRef.current;
    if (!activeStream) return;
    const recordingStream = captureMode === "video" ? createUnmirroredVideoStream(activeStream) : activeStream;
    const mimeType = supportedRecorderMime(captureMode);
    const recorder = mimeType ? new MediaRecorder(recordingStream, { mimeType }) : new MediaRecorder(recordingStream);
    chunksRef.current = [];
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      recordingPipelineCleanupRef.current?.();
      recordingPipelineCleanupRef.current = null;
      const mime =
        recorder.mimeType || chunksRef.current[0]?.type || (captureMode === "video" ? "video/webm" : "audio/webm");
      const blob = new Blob(chunksRef.current, { type: mime });
      onCapture(
        new File([blob], `envoye-${captureMode}.${extensionFor(mime, captureMode)}`, { type: mime }),
        captureMode,
      );
      play("recordStop");
      closeCapture();
    };
    recorder.start();
    setRecording(true);
    setSecondsRemaining(maxRecordingSeconds);
    play("recordStart");
    const startedAt = performance.now();
    const stopRecording = () => {
      if (recorder.state === "recording") recorder.stop();
    };
    recordingIntervalRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAt;
      setSecondsRemaining(Math.max(0, Math.ceil((maxRecordingSeconds * 1_000 - elapsed) / 1_000)));
    }, 250);
    schedule(stopRecording, maxRecordingSeconds * 1_000);
  };
  const begin = async () => {
    if (!mode) return;

    clearTimers();
    unlock();
    setCountdown(3);
    play("countdown");

    schedule(() => setCountdown(2), 1_000);
    schedule(() => setCountdown(1), 2_000);
    schedule(() => {
      setCountdown(null);
      if (mode === "image") {
        play("shutter");
        takePhoto();
      } else startRecorder(mode);
    }, 3_000);
  };
  const switchCamera = async () => {
    if (!mode || mode === "audio" || recording) return;
    const nextFacingMode: FacingMode = facingMode === "user" ? "environment" : "user";
    try {
      stopTracks();
      await requestStream(mode, nextFacingMode);
    } catch {
      sileo.error({ title: "No pudimos cambiar de cámara" });
    }
  };
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const type = file ? typeFromFile(file) : null;
    const enabled =
      type === "image" ? allowImage : type === "video" ? allowVideo : type === "audio" ? allowAudio : false;
    if (file && type && enabled) {
      if (type === "video" || type === "audio") {
        try {
          if ((await mediaDuration(file)) > maxRecordingSeconds + recordingDurationToleranceSeconds) {
            sileo.error({
              title: "El archivo es muy largo",
              description: `El límite para videos y notas de voz es de ${maxRecordingSeconds} segundos.`,
            });
            event.target.value = "";
            return;
          }
        } catch {
          sileo.error({ title: "No pudimos leer el archivo", description: "Prueba con otro video o audio." });
          event.target.value = "";
          return;
        }
      }
      onCapture(file, type);
    } else if (file && type) sileo.error({ title: "Este tipo de archivo no está disponible para este evento" });
    else if (file) sileo.error({ title: "Ese formato no es compatible" });
    event.target.value = "";
  };

  if (!mode)
    return (
      <>
        <input ref={inputRef} onChange={upload} type="file" accept={acceptedTypes} className="hidden" />
        <div className="flex justify-center gap-2">
          {allowImage && (
            <Button
              className="h-18 w-18 rounded-xl p-2 flex-col gap-0.5"
              type="button"
              onClick={() => openCapture("image")}
            >
              <Camera />
              Foto
            </Button>
          )}
          {allowVideo && (
            <Button
              className="h-18 w-18 rounded-xl p-2 flex-col gap-0.5"
              type="button"
              onClick={() => openCapture("video")}
            >
              <Video />
              Video
            </Button>
          )}
          {allowAudio && (
            <Button
              className="h-18 w-18 rounded-xl p-2 flex-col gap-0.5"
              type="button"
              onClick={() => openCapture("audio")}
            >
              <Mic />
              Audio
            </Button>
          )}
          {acceptedTypes && (
            <Button
              className="h-18 w-18 rounded-xl p-2 flex-col gap-0.5"
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              <Upload />
              Galería
            </Button>
          )}
        </div>
      </>
    );

  return createPortal(
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black text-white">
      <div className="relative mx-auto h-dvh max-w-md overflow-hidden bg-black sm:max-w-xl">
        {mode !== "audio" && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full -scale-x-100 object-contain"
          />
        )}
        {mode === "audio" && (
          <div className="flex h-full items-center justify-center">
            <Mic className="h-20 w-20" />
          </div>
        )}
        {countdown && (
          <div className="absolute inset-0 grid place-items-center bg-black/45 text-8xl font-bold">{countdown}</div>
        )}
        {recording && (
          <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-bold">
            ● Grabando · {String(secondsRemaining ?? maxRecordingSeconds).padStart(2, "0")}s
          </div>
        )}
        {mode !== "audio" && (
          <button
            type="button"
            disabled={recording || countdown !== null}
            onClick={() => switchCamera()}
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-black/50 disabled:opacity-40"
            aria-label="Cambiar cámara"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        )}
        <div className="absolute inset-x-0 bottom-0 flex gap-3 bg-linear-to-t from-black/85 to-transparent px-5 pb-8 pt-20">
          {recording ? (
            <Button type="button" variant="destructive" onClick={() => recorderRef.current?.stop()} className="flex-1">
              Detener
            </Button>
          ) : (
            <Button type="button" onClick={() => begin()} className="flex-1">
              {mode === "image" ? "Tomar foto" : "Comenzar"}
            </Button>
          )}
          <Button type="button" disabled={recording || countdown !== null} onClick={closeCapture}>
            Cancelar
          </Button>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
};

export default GuestCapture;
