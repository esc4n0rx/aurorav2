'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Loader2,
} from 'lucide-react';
import { Content } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function PlayerPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const introRef = useRef<HTMLVideoElement>(null);
  const saveProgressTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [introEnded, setIntroEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [slug, setSlug] = useState<string>('');
  const [buffering, setBuffering] = useState(false);

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Resolver params
    const resolveParams = async () => {
      const resolvedSlug = Array.isArray(params.slug)
        ? params.slug[0]
        : params.slug;
      if (resolvedSlug) {
        setSlug(resolvedSlug);
      }
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/contents/${slug}`);
        const data = await response.json();

        if (data.content) {
          setContent(data.content);
        }
      } catch (error) {
        console.error('Erro ao buscar conteúdo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug]);

  // Auto-play intro quando carregar
  useEffect(() => {
    if (!loading && showIntro && introRef.current) {
      const video = introRef.current;

      // Aguardar o vídeo estar pronto
      const attemptPlay = () => {
        if (video.readyState >= 2 && !video.paused) {
          // Vídeo já está tocando
          return;
        }

        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('Erro ao reproduzir intro:', error);
            // Se falhar, pula a intro
            setShowIntro(false);
            setIntroEnded(true);
          });
        }
      };

      // Tentar dar play após um pequeno delay
      const timer = setTimeout(attemptPlay, 100);

      // Ou quando o vídeo carregar metadados
      video.addEventListener('loadedmetadata', attemptPlay);

      return () => {
        clearTimeout(timer);
        video.removeEventListener('loadedmetadata', attemptPlay);
      };
    }
  }, [loading, showIntro]);

  // Auto-play conteúdo após intro
  useEffect(() => {
    if (introEnded && !showIntro && videoRef.current) {
      const video = videoRef.current;

      const attemptPlay = () => {
        if (!video || video.paused === false) {
          // Já está tocando
          return;
        }

        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.warn('Erro ao reproduzir vídeo:', error);
            });
        }
      };

      // Tentar dar play após delay para garantir renderização
      const timer = setTimeout(attemptPlay, 150);

      return () => clearTimeout(timer);
    }
  }, [introEnded, showIntro]);

  // Função para salvar progresso (otimizada)
  const saveWatchProgress = async (useBeacon = false) => {
    if (!user || !content || !videoRef.current || showIntro) return;

    const currentVideoTime = Math.floor(videoRef.current.currentTime);
    const videoDuration = Math.floor(videoRef.current.duration);

    // Não salvar se o tempo for muito pequeno (< 5 segundos)
    if (currentVideoTime < 5 || videoDuration === 0) return;

    const payload = JSON.stringify({
      user_id: user.id,
      content_id: content.id,
      current_t: currentVideoTime,
      duration: videoDuration,
    });

    try {
      if (useBeacon && navigator.sendBeacon) {
        // Usar sendBeacon para envio assíncrono ao sair da página
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/watch-history', blob);
      } else {
        // Chamada normal fetch
        await fetch('/api/watch-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
        });
      }
    } catch (error) {
      console.warn('Erro ao salvar progresso (ignorado):', error);
    }
  };

  // Salvar progresso periodicamente (a cada 15 segundos)
  useEffect(() => {
    if (!showIntro && isPlaying && content && user) {
      const interval = setInterval(() => {
        saveWatchProgress(false);
      }, 15000); // 15 segundos

      return () => clearInterval(interval);
    }
  }, [showIntro, isPlaying, content?.id, user?.id]);

  // Salvar progresso quando o usuário sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!showIntro && user && content && videoRef.current) {
        saveWatchProgress(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveWatchProgress(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, content?.id, showIntro]);

  // Auto-esconder controles
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleIntroEnded = () => {
    setShowIntro(false);
    setIntroEnded(true);
  };

  const skipIntro = () => {
    if (introRef.current) {
      introRef.current.pause();
    }
    handleIntroEnded();
  };

  const togglePlay = () => {
    if (showIntro && introRef.current) {
      if (isPlaying) {
        introRef.current.pause();
      } else {
        introRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const currentRef = showIntro ? introRef.current : videoRef.current;
    if (currentRef) {
      currentRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    const currentRef = showIntro ? introRef.current : videoRef.current;
    if (currentRef) {
      currentRef.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const skip = (seconds: number) => {
    if (!showIntro && videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.currentTime + seconds, duration)
      );
    }
  };

  const handleWaiting = () => {
    setBuffering(true);
  };

  const handleCanPlay = () => {
    setBuffering(false);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl"
        >
          Carregando player...
        </motion.div>
      </div>
    );
  }

  if (!content || !content.video_url) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-4">
        <div className="text-white text-xl">Vídeo não disponível</div>
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:text-blue-400"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Intro Video */}
      {showIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20"
        >
          <video
            ref={introRef}
            src="/intro.mp4"
            className="w-full h-full object-contain"
            onEnded={handleIntroEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={(e) => {
              console.warn('Erro ao carregar intro:', e);
              handleIntroEnded();
            }}
            preload="auto"
            playsInline
            muted={isMuted}
          />

          {/* Skip Intro Button */}
          <AnimatePresence>
            {showControls && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={skipIntro}
                className="absolute bottom-24 right-8 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white font-medium transition-all duration-200 pointer-events-auto"
              >
                Pular Intro
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Main Video */}
      {!showIntro && (
        <video
          ref={videoRef}
          src={content.video_url}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          onWaiting={handleWaiting}
          onCanPlay={handleCanPlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
          muted={isMuted}
        />
      )}

      {/* Buffering Indicator */}
      <AnimatePresence>
        {buffering && !showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <div className="bg-black/60 backdrop-blur-md rounded-full p-6">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay e controles */}
      <AnimatePresence>
        {showControls && !showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/80 pointer-events-none z-10"
          >
            {/* Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute top-0 left-0 right-0 p-6 pointer-events-auto"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/10 text-white transition-all duration-200"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="flex-1">
                  <h1 className="text-white text-xl font-semibold drop-shadow-lg">
                    {content.nome}
                  </h1>
                  {content.tipo === 'SERIE' && content.temporada && content.episodio && (
                    <p className="text-sm text-gray-300 drop-shadow-lg">
                      Temporada {content.temporada} • Episódio {content.episodio}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Play/Pause center overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
              onClick={togglePlay}
            >
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/20 hover:border-white/50 transition-all duration-200"
                  >
                    <Play className="h-12 w-12 text-white fill-current ml-2" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom controls */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-6 space-y-4 pointer-events-auto"
            >
              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <span className="text-white text-sm font-mono min-w-[60px] drop-shadow-lg">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 group">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, rgba(255,255,255,0.9) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100}%)`,
                    }}
                  />
                </div>
                <span className="text-white text-sm font-mono min-w-[60px] text-right drop-shadow-lg">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all duration-200"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 fill-current" />
                    ) : (
                      <Play className="h-6 w-6 fill-current" />
                    )}
                  </button>

                  <button
                    onClick={() => skip(-10)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 backdrop-blur-sm border border-white/10 text-white transition-all duration-200 flex items-center gap-2"
                  >
                    <SkipBack className="h-5 w-5" />
                    <span className="text-xs font-medium">10s</span>
                  </button>

                  <button
                    onClick={() => skip(10)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 backdrop-blur-sm border border-white/10 text-white transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="text-xs font-medium">10s</span>
                    <SkipForward className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-3 ml-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/15 backdrop-blur-sm border border-white/10 text-white transition-all duration-200"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>
                    <div className="group relative">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-2 bg-transparent rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, rgba(255,255,255,0.9) ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/15 backdrop-blur-sm border border-white/10 text-white transition-all duration-200">
                    <Settings className="h-5 w-5" />
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 backdrop-blur-sm border border-white/10 text-white transition-all duration-200"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-5 w-5" />
                    ) : (
                      <Maximize className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
