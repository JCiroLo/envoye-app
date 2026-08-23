import * as React from "react";
import Button from "@/components/ui/button";
import { Camera, Video, Upload, RotateCcw, StopCircle, CheckCircle, VideoOff } from "lucide-react";

type MediaCaptureProps = {
  onCaptureComplete: (mediaUrl: string, mediaType: "image" | "video") => void;
  onCancel: () => void;
};

const MediaCapture = ({ onCaptureComplete, onCancel }: MediaCaptureProps) => {
  const [mode, setMode] = React.useState<"idle" | "photo" | "video">("idle");
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [recording, setRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [capturedUrl, setCapturedUrl] = React.useState<string | null>(null);
  const [capturedType, setCapturedType] = React.useState<"image" | "video" | null>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startCamera = async (captureMode: "photo" | "video") => {
    setCameraError(null);
    setCapturedUrl(null);
    setCapturedType(null);
    setMode(captureMode);

    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: captureMode === "video",
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) => console.error("Video play interrupted:", err));
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("No pudimos acceder a tu cámara. Puedes subir una foto o video desde tu galería.");
      setMode("idle");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the current video frame onto the canvas
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); // Mirror effect for user facing camera
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedUrl(dataUrl);
        setCapturedType("image");
        stopCamera();
      }
    }
  };

  const startRecording = () => {
    if (stream) {
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedUrl(videoUrl);
        setCapturedType("video");
      };

      recorder.start();
      setRecording(true);
      startTimer();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopTimer();
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith("video/") ? "video" : "image";
      const url = URL.createObjectURL(file);
      setCapturedUrl(url);
      setCapturedType(type);
      stopCamera();
    }
  };

  const handleConfirm = () => {
    if (capturedUrl && capturedType) {
      onCaptureComplete(capturedUrl, capturedType);
    }
  };

  const handleReset = () => {
    setCapturedUrl(null);
    setCapturedType(null);
    setMode("idle");
    stopCamera();
    stopTimer();
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
      stopTimer();
    };
  }, [stream]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* File Upload Trigger (Hidden) */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />

      {mode === "idle" && !capturedUrl && (
        <div className="flex flex-col items-center gap-6 py-6 w-full text-center">
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            <Button
              type="button"
              variant="default"
              onClick={() => startCamera("photo")}
              className="flex flex-col gap-2 h-28 rounded-2xl bg-primary text-primary-foreground border-2 border-primary/20 hover:scale-[1.03] transition-transform"
            >
              <Camera className="w-8 h-8" />
              <span>Tomar Foto</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => startCamera("video")}
              className="flex flex-col gap-2 h-28 rounded-2xl bg-secondary text-secondary-foreground border-2 border-secondary/20 hover:scale-[1.03] transition-transform"
            >
              <Video className="w-8 h-8" />
              <span>Grabar Video</span>
            </Button>
          </div>

          <div className="text-gray-400 font-medium">o también puedes</div>

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex gap-2 items-center w-full max-w-sm h-12 rounded-xl text-gray-700 border-dashed border-2 hover:bg-gray-50"
          >
            <Upload className="w-5 h-5 text-gray-500" />
            <span>Subir archivo (Foto / Video)</span>
          </Button>

          {cameraError && (
            <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-sm flex gap-3 items-start max-w-sm mt-4">
              <VideoOff className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <span className="text-left leading-relaxed">{cameraError}</span>
            </div>
          )}

          <Button type="button" variant="ghost" onClick={onCancel} className="mt-4 text-gray-500">
            Cancelar
          </Button>
        </div>
      )}

      {/* Camera Live Feed Viewport */}
      {mode !== "idle" && !capturedUrl && (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="relative w-full aspect-4/3 bg-black rounded-2xl overflow-hidden shadow-md border-4 border-white mb-6">
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]" // mirror webcam feed
            />

            {/* Timer Overlay */}
            {recording && (
              <div className="absolute top-4 left-4 bg-red-500/90 text-white font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 animate-pulse">
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}
          </div>

          {/* Action buttons during camera live feed */}
          <div className="flex gap-4 w-full">
            {mode === "photo" && (
              <Button type="button" variant="default" onClick={capturePhoto} className="flex-1 h-12">
                Capturar Foto
              </Button>
            )}

            {mode === "video" && (
              <>
                {!recording ? (
                  <Button
                    type="button"
                    variant="default"
                    onClick={startRecording}
                    className="flex-1 h-12 bg-red-500 text-white hover:bg-red-600"
                  >
                    Iniciar Grabación
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={stopRecording}
                    className="flex-1 h-12 flex items-center justify-center gap-2"
                  >
                    <StopCircle className="w-5 h-5 animate-pulse" />
                    Detener Grabación
                  </Button>
                )}
              </>
            )}

            <Button
              type="button"
              variant="outline"
              disabled={recording}
              onClick={handleReset}
              className="px-4 shrink-0"
            >
              Atrás
            </Button>
          </div>
        </div>
      )}

      {/* Captured Media Preview */}
      {capturedUrl && capturedType && (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="relative w-full aspect-4/3 bg-slate-900 rounded-2xl overflow-hidden shadow-md border-4 border-white mb-6">
            {capturedType === "image" ? (
              <img src={capturedUrl} className="w-full h-full object-cover" alt="Captured photo" />
            ) : (
              <video src={capturedUrl} controls className="w-full h-full object-cover" />
            )}

            {/* Confirmation badge overlay */}
            <div className="absolute bottom-4 right-4 bg-emerald-500 text-white rounded-full p-1.5 shadow-md">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="pastel"
              onClick={handleConfirm}
              className="flex-1 h-12 border border-teal-200/50"
            >
              Usar esta {capturedType === "image" ? "Foto" : "Video"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="px-4 shrink-0 flex gap-2 items-center"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Volver a intentar</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaCapture;
