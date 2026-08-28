import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Heart, LogOut, Play, Sparkles } from "lucide-react";
import { useShallow } from "zustand/shallow";
import Button from "@/components/ui/button";
import useLetterStore, { type Letter } from "@/stores/use-letter-store";
import cn from "@/utils/cn-helper";

type Gallery3DProps = { eventId: string; onBack: () => void };
type SequencePhase = "idle" | "preparing" | "opening" | "playing" | "cooldown" | "completed";

const MEDIA_DISPLAY_SECONDS = 5;
const COOLDOWN_SECONDS = 5;
const OPENING_DURATION_MS = 2000;

type EnvelopeProps = { active: boolean; children?: React.ReactNode };

// const Envelope = ({ active, unpacking, revealed, children }: EnvelopeProps) => (
//   <div className="relative h-48 w-75 perspective-[1000px] sm:h-52 sm:w-80">
//     <div className="absolute inset-0 overflow-visible rounded-b-[8px] bg-[#005f8e] shadow-[0_14px_45px_rgba(0,0,0,0.3)]">
//       <div
//         className={`pointer-events-none absolute top-0 left-0 z-30 h-0 w-0 origin-top border-x-[150px] border-t-[105px] border-x-transparent border-t-[#005f8e] transition-transform duration-600 ease-[cubic-bezier(.22,1,.36,1)] [backface-visibility:hidden] sm:border-x-[160px] ${active ? "rotate-x-180" : "rotate-x-0"}`}
//       />
//       <div className="pointer-events-none absolute top-0 left-0 z-20 h-0 w-0 rounded-b-[8px] border-x-[150px] border-t-[96px] border-b-[96px] border-x-[#0077b2] border-t-transparent border-b-[#0073ad] sm:border-x-[160px] sm:border-t-[104px] sm:border-b-[104px]" />
//       <div
//         className={`absolute top-[5%] left-1/2 h-[90%] w-[90%] -translate-x-1/2 overflow-hidden rounded-[7px] bg-white shadow-[0_2px_26px_rgba(0,0,0,0.14)] transition-[transform,opacity] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${active ? (revealed ? "z-50 translate-y-0 opacity-100" : unpacking ? "z-40 -translate-y-[115%] opacity-100" : "z-10 translate-y-0 opacity-100") : "z-0 translate-y-0 opacity-0"}`}
//       >
//         {children}
//       </div>
//       <div
//         className={`pointer-events-none absolute inset-0 z-40 rounded-b-[8px] bg-[#0073ad] transition-opacity duration-400 ${active && revealed ? "opacity-0" : "opacity-100"}`}
//       />
//     </div>
//   </div>
// );

const Envelope = ({ active, children }: EnvelopeProps) => (
  <div className="relative h-96 w-96 aspect-square [perspective:1200px]">
    <div
      className="relative h-full w-full rounded-3xl shadow-[0_18px_50px_rgba(0,0,0,0.32)] transition-transform duration-2000 ease-in [transform-style:preserve-3d]"
      style={{ transform: active ? "rotateY(0deg)" : "rotateY(180deg)" }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl bg-slate-950 backface-hidden">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-[radial-gradient(circle_at_top,#ff9fba_0%,#e84b7a_42%,#6b1231_100%)] p-8 text-center text-white backface-hidden transform-[rotateY(180deg)]">
        <div className="absolute inset-3 rounded-[1.15rem" />
        <Heart
          className={cn(
            "relative h-20 w-20 fill-white/20 text-white drop-shadow-lg transition-opacity duration-1000 ease-in",
            {
              "opacity-0": active,
            },
          )}
        />
      </div>
    </div>
  </div>
);

type GalleryMediaProps = { letter: Letter; shouldPlay: boolean; onFinished: () => void };

const GalleryMedia = ({ letter, shouldPlay, onFinished }: GalleryMediaProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  React.useEffect(() => {
    if (!shouldPlay) return;
    const media =
      letter.mediaType === "video" ? videoRef.current : letter.mediaType === "audio" ? audioRef.current : null;
    if (media) void media.play().catch(() => undefined);
  }, [letter.mediaType, shouldPlay]);

  const wrapperClass = "relative h-full w-full overflow-hidden";
  if (letter.mediaType === "video")
    return (
      <div className={`${wrapperClass} bg-slate-950`}>
        <video
          ref={videoRef}
          src={letter.mediaUrl}
          preload="auto"
          playsInline
          onEnded={onFinished}
          className="h-full w-full object-contain"
        />
      </div>
    );
  if (letter.mediaType === "audio")
    return (
      <div
        className={`${wrapperClass} flex flex-col items-center justify-center gap-3 bg-linear-to-br from-slate-950 to-slate-800 px-5 text-center text-white`}
      >
        <Sparkles className="h-8 w-8 text-amber-300" />
        <p className="text-sm font-bold">Mensaje de voz</p>
        <audio ref={audioRef} src={letter.mediaUrl} preload="auto" onEnded={onFinished} />
      </div>
    );
  if (letter.mediaType === "image")
    return (
      <div className={`${wrapperClass} bg-slate-100`}>
        <img src={letter.mediaUrl} alt="Recuerdo compartido" className="h-full w-full object-contain" />
      </div>
    );
  return (
    <p
      className={`${wrapperClass} flex items-center justify-center p-5 text-center text-base leading-relaxed text-slate-800`}
    >
      {letter.message}
    </p>
  );
};

type MediaPreloaderProps = { letter?: Letter; onReady: (id: string) => void };

const MediaPreloader = ({ letter, onReady }: MediaPreloaderProps) => {
  React.useEffect(() => {
    if (letter?.mediaType === "text") onReady(letter.id);
  }, [letter, onReady]);
  if (!letter || letter.mediaType === "text") return null;
  if (letter.mediaType === "image")
    return (
      <img
        className="hidden"
        src={letter.mediaUrl}
        alt=""
        onLoad={() => onReady(letter.id)}
        onError={() => onReady(letter.id)}
      />
    );
  if (letter.mediaType === "audio")
    return (
      <audio
        className="hidden"
        src={letter.mediaUrl}
        preload="auto"
        onCanPlay={() => onReady(letter.id)}
        onError={() => onReady(letter.id)}
      />
    );
  return (
    <video
      className="hidden"
      src={letter.mediaUrl}
      preload="auto"
      onCanPlay={() => onReady(letter.id)}
      onError={() => onReady(letter.id)}
    />
  );
};

const Gallery3D = ({ onBack }: Gallery3DProps) => {
  const letters = useLetterStore(useShallow((state) => state.letters));
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [preloadIndex, setPreloadIndex] = React.useState(0);
  const [readyIds, setReadyIds] = React.useState<Set<string>>(() => new Set());
  const [phase, setPhase] = React.useState<SequencePhase>("idle");
  const [cooldown, setCooldown] = React.useState(COOLDOWN_SECONDS);
  const idle = phase === "idle" || phase === "completed";
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    duration: 28,
    watchDrag: idle,
  });
  const activeLetter = activeIndex === null ? null : letters[activeIndex];
  const activeReady = activeLetter ? readyIds.has(activeLetter.id) : false;

  const markReady = React.useCallback(
    (id: string) => setReadyIds((current) => (current.has(id) ? current : new Set(current).add(id))),
    [],
  );

  const updateSlideTweens = React.useCallback(() => {
    if (!emblaApi) return;
    const progress = emblaApi.scrollProgress();
    const snaps = emblaApi.scrollSnapList();
    emblaApi.slideNodes().forEach((slide, index) => {
      const distance = Math.min(1, Math.abs((snaps[index] ?? 0) - progress) * 1.15);
      slide.style.opacity = `${1 - distance * 0.58}`;
      slide.style.transform = `scale(${1 - distance * 0.14})`;
    });
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    updateSlideTweens();
    emblaApi.on("scroll", updateSlideTweens).on("reInit", updateSlideTweens);
    return () => {
      emblaApi.off("scroll", updateSlideTweens).off("reInit", updateSlideTweens);
    };
  }, [emblaApi, updateSlideTweens]);

  const open = React.useCallback(
    (index: number) => {
      setActiveIndex(index);
      setPreloadIndex(Math.min(index + 1, letters.length - 1));
      setPhase("opening");
    },
    [letters.length],
  );

  const start = React.useCallback(() => {
    if (!letters.length) return;
    emblaApi?.scrollTo(0);
    setCooldown(COOLDOWN_SECONDS);
    setActiveIndex(0);
    if (readyIds.has(letters[0].id)) {
      setPreloadIndex(Math.min(1, letters.length - 1));
      setPhase("opening");
      return;
    }
    setPreloadIndex(0);
    setPhase("preparing");
  }, [emblaApi, letters, readyIds]);

  const finishActive = React.useCallback(() => {
    if (phase !== "playing" || activeIndex === null) return;
    if (activeIndex >= letters.length - 1) {
      setActiveIndex(null);
      setPhase("completed");
      return;
    }
    setCooldown(COOLDOWN_SECONDS);
    setPhase("cooldown");
  }, [activeIndex, letters.length, phase]);

  React.useEffect(() => {
    if (phase === "preparing" && activeIndex !== null && activeReady) open(activeIndex);
  }, [activeIndex, activeReady, open, phase]);

  React.useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(() => setPhase("playing"), OPENING_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  React.useEffect(() => {
    if (phase !== "playing" || !activeLetter || ["video", "audio"].includes(activeLetter.mediaType)) return;
    const timer = window.setTimeout(finishActive, MEDIA_DISPLAY_SECONDS * 1000);
    return () => window.clearTimeout(timer);
  }, [activeLetter, finishActive, phase]);

  React.useEffect(() => {
    if (phase !== "cooldown" || activeIndex === null) return;
    const startedAt = performance.now();
    const interval = window.setInterval(
      () => setCooldown(Math.max(0, Math.ceil((COOLDOWN_SECONDS * 1000 - (performance.now() - startedAt)) / 1000))),
      200,
    );
    const timer = window.setTimeout(() => {
      const nextIndex = activeIndex + 1;
      emblaApi?.scrollTo(nextIndex);
      if (readyIds.has(letters[nextIndex].id)) {
        open(nextIndex);
        return;
      }
      setActiveIndex(nextIndex);
      setPreloadIndex(nextIndex);
      setPhase("preparing");
    }, COOLDOWN_SECONDS * 1000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [activeIndex, emblaApi, letters, open, phase, readyIds]);

  const currentPreload = letters[preloadIndex];
  return (
    <div
      className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#07070b]"
      style={{ background: "radial-gradient(circle at top, #6d4aff55 0%, #211b42 52%, #07070b 100%)" }}
    >
      <MediaPreloader letter={currentPreload} onReady={markReady} />
      {!idle && (
        <motion.div
          ref={emblaRef}
          className="my-auto w-full overflow-hidden"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
        >
          <div className="flex touch-pan-y">
            {letters.map((letter, index) => {
              const current = activeIndex === index && !idle;
              const showMedia = current;
              return (
                <article
                  key={letter.id}
                  className="flex min-w-0 shrink-0 grow-0 basis-[82%] items-end justify-center sm:basis-[28rem]"
                >
                  <Envelope active={current}>
                    {showMedia && (
                      <GalleryMedia letter={letter} shouldPlay={phase === "playing"} onFinished={finishActive} />
                    )}
                  </Envelope>
                </article>
              );
            })}
            {!letters.length && (
              <div className="flex h-80 min-w-0 shrink-0 grow-0 basis-full items-center justify-center px-8 text-center text-sm text-white/65">
                Aún no hay recuerdos para mostrar.
              </div>
            )}
          </div>
        </motion.div>
      )}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
        {idle && (
          <motion.div
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            className="pointer-events-auto flex items-center justify-between gap-4"
          >
            <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-2.5 text-white backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-extrabold uppercase tracking-[.16em]">Mural de deseos</span>
              </div>
              <p className="mt-1 text-xs text-white/60">{letters.length} recuerdos por descubrir</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="h-10 rounded-xl bg-black/45 px-3 text-white hover:bg-black/65 hover:text-white"
            >
              <LogOut className="mr-1.5 h-4 w-4" /> Volver
            </Button>
          </motion.div>
        )}
        {idle && (
          <div className="pointer-events-auto mx-auto my-auto text-center text-white">
            <p className="mb-5 text-sm text-white/70">
              {phase === "completed" ? "El recorrido ha terminado" : "Todo está listo para comenzar"}
            </p>
            <Button
              type="button"
              size="lg"
              onClick={start}
              className="rounded-full px-9 shadow-2xl"
              disabled={!letters.length}
            >
              <Play className="mr-2 h-5 w-5 fill-current" /> {phase === "completed" ? "Reproducir de nuevo" : "Iniciar"}
            </Button>
          </div>
        )}
        {phase === "preparing" && (
          <div className="mx-auto mb-2 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs font-bold text-white/80 backdrop-blur-md">
            Preparando el recuerdo…
          </div>
        )}
        {activeLetter && ["opening", "playing"].includes(phase) && (
          <div className="mx-auto mb-2 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs font-bold text-white/80 backdrop-blur-md">
            Recuerdo {activeIndex! + 1} de {letters.length}
          </div>
        )}
        {phase === "cooldown" && (
          <div className="mx-auto mb-2 w-full max-w-md rounded-3xl border border-white/15 bg-black/60 p-4 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Próximo recuerdo</span>
              <span>{cooldown}s</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-primary transition-all duration-200"
                style={{ width: `${(cooldown / COOLDOWN_SECONDS) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery3D;
