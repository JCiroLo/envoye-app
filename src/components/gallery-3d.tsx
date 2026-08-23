import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image, Stars, Text } from "@react-three/drei";
import * as THREE from "three";
import useLetterStore, { type Letter } from "@/stores/use-letter-store";
import Button from "@/components/ui/button";
import { Play, Pause, ChevronLeft, ChevronRight, X, Sparkles, LogOut } from "lucide-react";
import { themeStyle, themeValues, type EventTheme } from "@/lib/event-theme";

type Gallery3DProps = {
  eventId: string;
  onBack: () => void;
  lettersOverride?: Letter[];
  theme?: EventTheme;
};

type Card3DProps = {
  letter: Letter;
  position: [number, number, number];
  lookAtTarget: [number, number, number];
  isActive: boolean;
  onClick: () => void;
  primaryColor: string;
};

type CameraControllerProps = {
  activeLetter: Letter | null;
};

type OrbitGroupProps = {
  children: React.ReactNode;
  isPaused: boolean;
};

const VideoMaterial = ({ url }: { url: string }) => {
  const [video] = React.useState(() => {
    const vid = document.createElement("video");
    vid.src = url;
    vid.crossOrigin = "anonymous";
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.play().catch((err) => console.log("Video autoplay error:", err));
    return vid;
  });

  React.useEffect(() => {
    return () => {
      video.pause();
      video.src = "";
      video.load();
    };
  }, [video]);

  return (
    <meshBasicMaterial toneMapped={false} side={THREE.DoubleSide}>
      <videoTexture attach="map" args={[video]} />
    </meshBasicMaterial>
  );
};

const Card3D = ({ letter, position, lookAtTarget, isActive, onClick, primaryColor }: Card3DProps) => {
  const groupRef = React.useRef<THREE.Group | null>(null);

  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(new THREE.Vector3(...lookAtTarget));
    }
  }, [lookAtTarget]);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle float animation
      const floatOffset = Math.sin(state.clock.getElapsedTime() * 1.2 + letter.createdAt * 0.001) * 0.04;
      groupRef.current.position.y = position[1] + floatOffset;

      // Smooth scaling transition when active
      const targetScale = isActive ? 1.25 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 1. Media Layer (slightly forward at z = 0.02) */}
      <group
        name={`card-${letter.id}`}
        position={[0, 0, 0.02]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {letter.mediaType === "image" ? (
          <React.Suspense
            fallback={
              <mesh>
                <planeGeometry args={[2, 1.5]} />
                <meshBasicMaterial color="#e9d5ff" />
              </mesh>
            }
          >
            <Image url={letter.mediaUrl} transparent toneMapped={false} side={THREE.DoubleSide} scale={[2, 1.5]} />
          </React.Suspense>
        ) : letter.mediaType === "video" ? (
          <mesh>
            <planeGeometry args={[2, 1.5]} />
            <VideoMaterial url={letter.mediaUrl} />
          </mesh>
        ) : (
          <>
            <mesh>
              <planeGeometry args={[2, 1.5]} />
              <meshBasicMaterial color={letter.mediaType === "audio" ? "#5b21b6" : "#fce7f3"} side={THREE.DoubleSide} />
            </mesh>
            {letter.mediaType === "audio" ? (
              <Text position={[0, 0, 0.04]} fontSize={0.16} maxWidth={1.6} color="white" textAlign="center">
                ♪ Mensaje de voz
              </Text>
            ) : (
              letter.message && (
                <Text position={[0, 0, 0.04]} fontSize={0.16} maxWidth={1.6} color="#701a75" textAlign="center">
                  {letter.message}
                </Text>
              )
            )}
          </>
        )}
      </group>

      {/* 2. Framing border (at z = 0) */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.06, 1.56]} />
        <meshBasicMaterial color={primaryColor} side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>

      {/* 3. Outer border layer (at z = -0.015) */}
      <mesh position={[0, 0, -0.015]}>
        <planeGeometry args={[2.14, 1.64]} />
        <meshBasicMaterial
          color={isActive ? "#fdf4ff" : "#f5f3ff"}
          side={THREE.DoubleSide}
          transparent
          opacity={isActive ? 1.0 : 0.6}
        />
      </mesh>
    </group>
  );
};

const CameraController = ({ activeLetter }: CameraControllerProps) => {
  const { camera } = useThree();
  const lookAtTarget = React.useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const destPos = new THREE.Vector3();
    const destLook = new THREE.Vector3();

    if (activeLetter) {
      const card = state.scene.getObjectByName(`card-${activeLetter.id}`);
      if (card) {
        const worldPos = new THREE.Vector3();
        card.getWorldPosition(worldPos);

        destLook.copy(worldPos);

        // Position camera pointing directly at the card's front side
        const dir = worldPos.clone().normalize();
        destPos.copy(dir.multiplyScalar(worldPos.length() + 3.0));

        // Elevate camera slightly to give a warm perspective
        destPos.y += 0.35;
      } else {
        // Fallback overview
        destPos.set(0, 1, 10);
        destLook.set(0, 0, 0);
      }
    } else {
      // Normal overview mode: slow horizontal rotation sweep
      const slowSweep = state.clock.getElapsedTime() * 0.12;
      destPos.set(Math.sin(slowSweep) * 11, 2, Math.cos(slowSweep) * 11);
      destLook.set(0, 0, 0);
    }

    // Buttery smooth lerping dampener (behaves exactly like a spring)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, destPos.x, 2.4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, destPos.y, 2.4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, destPos.z, 2.4, delta);

    lookAtTarget.current.x = THREE.MathUtils.damp(lookAtTarget.current.x, destLook.x, 3.4, delta);
    lookAtTarget.current.y = THREE.MathUtils.damp(lookAtTarget.current.y, destLook.y, 3.4, delta);
    lookAtTarget.current.z = THREE.MathUtils.damp(lookAtTarget.current.z, destLook.z, 3.4, delta);

    camera.lookAt(lookAtTarget.current);
  });

  return null;
};

const OrbitGroup = ({ children, isPaused }: OrbitGroupProps) => {
  const groupRef = React.useRef<THREE.Group | null>(null);

  useFrame((state, delta) => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += delta * 0.035;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.06) * 0.02;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

const Gallery3D = ({ eventId, onBack, lettersOverride, theme }: Gallery3DProps) => {
  const allLetters = useLetterStore((state) => state.letters);
  const letters = React.useMemo(
    () => lettersOverride ?? allLetters.filter((l) => l.eventId === eventId),
    [allLetters, eventId, lettersOverride],
  );

  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const palette = themeValues(theme);

  // Spherical Coordinates generator for cards layout
  const sphereRadius = 5.2;
  const cards = React.useMemo(() => {
    return letters.map((letter, index) => {
      const totalCount = letters.length;
      // Fibonacci sphere spiral distribution
      const phi = Math.acos(1 - (2 * (index + 0.5)) / totalCount);
      const theta = Math.sqrt(totalCount * Math.PI) * phi;

      const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
      const y = sphereRadius * Math.cos(phi);
      const z = sphereRadius * Math.sin(phi) * Math.sin(theta);

      return {
        letter,
        position: [x, y, z] as [number, number, number],
        lookAtTarget: [x * 2, y * 2, z * 2] as [number, number, number],
      };
    });
  }, [letters]);

  // Periodic random transitions if play mode is enabled
  React.useEffect(() => {
    if (!isPlaying || letters.length === 0) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => {
        if (letters.length <= 1) return 0;
        let nextIdx = Math.floor(Math.random() * letters.length);
        while (nextIdx === prev) {
          nextIdx = Math.floor(Math.random() * letters.length);
        }
        return nextIdx;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, letters]);

  const handleNext = () => {
    if (letters.length === 0) return;
    setIsPlaying(false);
    setActiveIdx((prev) => (prev === null || prev === letters.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (letters.length === 0) return;
    setIsPlaying(false);
    setActiveIdx((prev) => (prev === null || prev === 0 ? letters.length - 1 : prev - 1));
  };

  const activeLetter = activeIdx !== null && letters[activeIdx] ? letters[activeIdx] : null;

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden"
      style={{
        ...themeStyle(theme),
        background: `radial-gradient(circle at top, ${palette.primary}55 0%, ${palette.mural} 52%, #07070b 100%)`,
      }}
    >
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 1, 10], fov: 60 }} className="w-full h-full">
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Stars radius={90} depth={40} count={1500} factor={5} saturation={0.5} fade speed={1.2} />

        <OrbitGroup isPaused={isPlaying && activeIdx !== null}>
          {cards.map(({ letter, position, lookAtTarget }, idx) => (
            <Card3D
              key={letter.id}
              letter={letter}
              position={position}
              lookAtTarget={lookAtTarget}
              isActive={activeIdx === idx}
              primaryColor={palette.primary}
              onClick={() => {
                setIsPlaying(false);
                setActiveIdx(idx);
              }}
            />
          ))}
        </OrbitGroup>

        <CameraController activeLetter={activeLetter} />
      </Canvas>

      {/* Floating 2D Controls & UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        {/* Header */}
        <div className="flex justify-between items-center w-full pointer-events-auto">
          <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white shadow-lg">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <div>
              <h1 className="text-sm font-bold tracking-wide uppercase leading-none">Mural de Deseos</h1>
              <p className="text-xs text-slate-400 font-medium">{letters.length} felicitaciones enviadas</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl border-white/20 bg-slate-900/60 hover:bg-slate-800 text-white"
          >
            <LogOut className="w-4 h-4" />
            <span>Volver</span>
          </Button>
        </div>

        {/* Bottom Panel: Focused Letter & Nav Controls */}
        <div className="flex flex-col items-center gap-4 w-full mt-auto">
          {/* Active Letter overlay card */}
          {activeLetter && (
            <div className="w-full max-w-xl bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white shadow-2xl pointer-events-auto transform translate-y-0 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-5">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Mensaje Recibido</span>
                  <h2 className="text-2xl font-black mt-0.5 tracking-tight text-white">{activeLetter.userName}</h2>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setActiveIdx(null);
                    setIsPlaying(true);
                  }}
                  className="w-8 h-8 rounded-full p-0 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              {activeLetter.message && (
                <p className="text-base text-slate-200 leading-relaxed font-medium bg-black/15 p-4 rounded-2xl border border-white/5">
                  "{activeLetter.message}"
                </p>
              )}
            </div>
          )}

          {/* Nav Controls Bar */}
          <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white shadow-2xl pointer-events-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrev}
              className="w-10 h-10 rounded-full p-0 text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-5 py-2.5 h-11 rounded-full text-sm font-bold bg-white text-slate-900 hover:bg-white/90"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-slate-900 text-slate-900" />
                  <span>Pausar Auto-Enfoque</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-900 text-slate-900" />
                  <span>Auto-Enfoque</span>
                </>
              )}
            </Button>

            {activeIdx !== null && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setActiveIdx(null);
                  setIsPlaying(true);
                }}
                className="text-xs text-primary font-semibold hover:text-white px-2"
              >
                Vista General
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={handleNext}
              className="w-10 h-10 rounded-full p-0 text-white hover:bg-white/10"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery3D;
