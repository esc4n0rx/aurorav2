'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Content } from '@/lib/supabase';
import WatchlistButton from '@/components/WatchlistButton';

interface HeroBannerProps {
  content: Content | null;
}

export default function HeroBanner({ content }: HeroBannerProps) {
  const router = useRouter();

  if (!content) {
    return null;
  }

  // Debug: Verificar content.id
  console.log('HeroBanner - content:', content);
  console.log('HeroBanner - content.id:', content.id);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const handlePlay = () => {
    router.push(`/content/${content.slug}`);
  };

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('${content.banner_url || content.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925'}')`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-end pb-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-effect border border-white/20 mb-3"
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Em Destaque</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-3xl font-bold mb-2 leading-tight"
          >
            {content.nome}
          </motion.h1>

          {/* Meta info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-2 mb-4 text-xs text-gray-300"
          >
            {content.avaliacao && (
              <>
                <span className="text-green-500 font-semibold">
                  {Math.round(content.avaliacao * 10)}%
                </span>
                <span>•</span>
              </>
            )}
            {content.ano && (
              <>
                <span>{content.ano}</span>
                <span>•</span>
              </>
            )}
            {content.duracao && content.tipo === 'FILME' && (
              <>
                <span>{formatDuration(content.duracao)}</span>
                <span>•</span>
              </>
            )}
            {content.tipo === 'SERIE' && (
              <>
                <span>Série</span>
                <span>•</span>
              </>
            )}
            <span className="px-1.5 py-0.5 border border-gray-500 rounded text-[10px]">16+</span>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-3"
          >
            <Button
              onClick={handlePlay}
              className="bg-white text-black hover:bg-gray-200 font-semibold flex-1 h-11"
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              Assistir
            </Button>
            <WatchlistButton contentId={content.id} className="h-11 px-4" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
