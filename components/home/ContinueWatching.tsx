'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { WatchHistoryWithContent } from '@/lib/supabase';
import { Play } from 'lucide-react';

interface ContinueWatchingProps {
  items: WatchHistoryWithContent[];
}

export default function ContinueWatching({ items }: ContinueWatchingProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Title */}
      <h2 className="text-lg font-semibold mb-3 px-4">Continue Assistindo</h2>

      {/* Content scroll */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 scroll-smooth snap-x snap-mandatory">
        {items.map((item, index) => (
          <ContinueWatchingCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function ContinueWatchingCard({
  item,
  index,
}: {
  item: WatchHistoryWithContent;
  index: number;
}) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/content/${item.content.slug}`);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m restantes`;
    }
    return `${minutes}m restantes`;
  };

  const remainingSeconds = item.duration - item.current_time;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="relative flex-shrink-0 w-40 snap-start cursor-pointer group"
    >
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
        <img
          src={
            item.content.poster_url ||
            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'
          }
          alt={item.content.nome}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {/* Play button overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-current ml-0.5" />
          </div>
        </div>

        {/* Content info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
          {/* Progress bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-1 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${item.progress_percent}%` }}
            />
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold text-xs line-clamp-2 leading-tight">
            {item.content.nome}
          </h3>

          {/* Time remaining */}
          <p className="text-gray-300 text-[10px] font-medium">
            {formatTime(remainingSeconds)}
          </p>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md glass-effect text-[10px] font-semibold">
          {item.content.tipo === 'FILME' ? 'Filme' : 'Série'}
        </div>

        {/* Progress percentage badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-[10px] font-semibold text-white">
          {Math.round(item.progress_percent)}%
        </div>
      </div>
    </motion.div>
  );
}
