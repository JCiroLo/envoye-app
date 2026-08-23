import * as React from "react";
import { createPortal } from "react-dom";
import { Camera, SwitchCamera, Mic, Upload, Video } from "lucide-react";
import { sileo } from "sileo";
import { motion } from "framer-motion";
import Button from "@/components/ui/button";
import type { GuestMediaType } from "@/stores/use-guest-submission-store";

type CaptureSettings = {
  allowImages?: boolean;
  allowVideos?: boolean;
  allowAudio?: boolean;
};

type Props = {
  onCapture: (file: File, type: GuestMediaType) => void;
  settings?: CaptureSettings;
};
const maxVideoSeconds = Number(import.meta.env.VITE_MAX_VIDEO_DURATION_SECONDS ?? 30);

const getType = (mime: string): GuestMediaType | null =>
  mime.startsWith("image/")
    ? "image"
    : mime.startsWith("video/")
      ? "video"
      : mime.startsWith("audio/")
        ? "audio"
        : null;

const GuestCapture = ({ onCapture, settings }: Props) => {
  const allowImage = settings?.allowImages !== false;
  const allowVideo = settings?.allowVideos !== false;
  const allowAudio = settings?.allowAudio !== false;
  const allowedMedia = [allowImage && "image/*", allowVideo && "video/*", allowAudio && "audio/*"]
    .filter(Boolean)
    .join(",");
  const [mode, setMode] = React.useState<GuestMediaType | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [recording, setRecording] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<"user" | "environment">("user");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunks = React.useRef<Blob[]>([]);
  const timer = React.useRef<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const countdownAudio = React.useRef(new Audio("/sfx/countdown.mp3"));
  const shutterAudio = React.useRef(new Audio("/sfx/camera-shutter.mp3"));
  const startRecordAudio = React.useRef(new Audio("/sfx/camera-start-record.mp3"));
  const stopRecordAudio = React.useRef(new Audio("/sfx/camera-stop-record.mp3"));

  React.useEffect(() => {
    [countdownAudio, shutterAudio, startRecordAudio, stopRecordAudio].forEach(({ current }) => {
      current.preload = "auto";
      current.load();
    });
  }, []);

  const stop = React.useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setRecording(false);
    setCountdown(null);
    setMode(null);
  }, []);

  React.useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );
  React.useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play().catch(() => undefined);
    }
  }, [stream]);

  const start = async (nextMode: GuestMediaType, nextFacingMode = facingMode) => {
    const isAllowed = nextMode === "image" ? allowImage : nextMode === "video" ? allowVideo : allowAudio;
    if (!isAllowed) return;
    try {
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
      setMode(nextMode);
      setStream(nextStream);
    } catch {
      setMode(null);
      sileo.error({
        title: "No pudimos acceder a tu cámara o micrófono",
        description: "Revisa los permisos del navegador o usa tu galería.",
      });
    }
  };

  const playSound = (audio: React.MutableRefObject<HTMLAudioElement>) => {
    audio.current.currentTime = 0;
    void audio.current.play().catch(() => undefined);
  };

  const begin = () => {
    setCountdown(3);
    playSound(countdownAudio);
    window.setTimeout(() => setCountdown(2), 1_000);
    window.setTimeout(() => setCountdown(1), 2_000);
    timer.current = window.setTimeout(() => {
      setCountdown(null);
      if (mode === "image" && videoRef.current) {
        playSound(shutterAudio);
        const canvas = document.createElement("canvas");
        const video = videoRef.current!;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) onCapture(new File([blob], "envoye-photo.jpg", { type: "image/jpeg" }), "image");
            stop();
          },
          "image/jpeg",
          0.9,
        );
        return;
      }
      const recorder = new MediaRecorder(stream!, {
        mimeType: MediaRecorder.isTypeSupported("video/webm") && mode === "video" ? "video/webm" : undefined,
      });
      chunks.current = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      recorder.onstop = () => {
        if (mode === "video") playSound(stopRecordAudio);
        const mime = mode === "video" ? "video/webm" : "audio/webm";
        onCapture(new File(chunks.current, `envoye-${mode}.webm`, { type: mime }), mode!);
        stop();
      };
      recorder.start();
      if (mode === "video") playSound(startRecordAudio);
      setRecording(true);
      if (mode === "video") timer.current = window.setTimeout(() => recorder.stop(), maxVideoSeconds * 1000);
    }, 3_000);
  };

  const switchCamera = () => {
    if (!mode || mode === "audio") return;
    const next = facingMode === "user" ? "environment" : "user";
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    void start(mode, next);
  };

  const upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const type = file && getType(file.type);
    const isAllowed =
      type === "image" ? allowImage : type === "video" ? allowVideo : type === "audio" ? allowAudio : false;
    if (file && type && isAllowed) onCapture(file, type);
    else if (file && type) sileo.error({ title: "Este tipo de archivo no está disponible para este evento" });
    else if (file) sileo.error({ title: "Ese formato no es compatible" });
  };

  if (!mode)
    return (
      <>
        <input ref={inputRef} onChange={upload} type="file" accept={allowedMedia} className="hidden" />
        <div className="flex flex-col gap-2 sm:flex-row">
          {allowImage && (
            <Button className="flex-1 w-full h-28 flex-col gap-2 sm:w-0" type="button" onClick={() => start("image")}>
              <Camera />
              Foto
            </Button>
          )}
          {allowVideo && (
            <Button className="flex-1 w-full h-28 flex-col gap-2 sm:w-0" type="button" onClick={() => start("video")}>
              <Video />
              Video
            </Button>
          )}
          {allowAudio && (
            <Button className="flex-1 w-full h-28 flex-col gap-2 sm:w-0" type="button" onClick={() => start("audio")}>
              <Mic />
              Audio
            </Button>
          )}
          {allowedMedia && (
            <Button
              className="flex-1 w-full h-28 flex-col gap-2 sm:w-0"
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
          <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-contain" />
        )}
        {mode === "audio" && (
          <div className="flex h-full items-center justify-center text-white">
            <Mic className="h-20 w-20" />
          </div>
        )}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-8xl font-bold text-white">
            {countdown}
          </div>
        )}
        {recording && (
          <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
            ● Grabando
          </div>
        )}
        {mode !== "audio" && !recording && countdown === null && (
          <button
            type="button"
            onClick={switchCamera}
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-black/50"
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
            <Button type="button" onClick={begin} className="flex-1">
              {mode === "image" ? "Tomar foto" : "Comenzar"}
            </Button>
          )}
          <Button type="button" disabled={recording || countdown !== null} onClick={stop}>
            Cancelar
          </Button>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
};

export default GuestCapture;
