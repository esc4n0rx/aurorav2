'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Content } from '@/lib/supabase';

interface GenreSectionProps {
  genre: string;
  contents: Content[];
}

export default function GenreSection({ genre, contents }: GenreSectionProps) {
  const router = useRouter();

  if (contents.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Genre Title */}
      <h2 className="text-xl font-bold mb-4 px-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        {genre}
      </h2>

      {/* Content Scroll */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 scroll-smooth snap-x snap-mandatory">
        {contents.map((item, index) => (
          <ContentCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function ContentCard({ item, index }: { item: Content; index: number }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/content/${item.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="relative flex-shrink-0 w-40 snap-start cursor-pointer"
    >
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
        <img
          src={item.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
          alt={item.tipo === 'SERIE' ? (item.nome_serie || item.nome) : item.nome}
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-semibold text-xs line-clamp-2 leading-tight">
            {item.tipo === 'SERIE' ? (item.nome_serie || item.nome) : item.nome}
          </h3>
          {item.ano && (
            <p className="text-white/60 text-[10px] mt-1">{item.ano}</p>
          )}
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md glass-effect text-[10px] font-semibold">
          {item.tipo === 'FILME' ? 'Filme' : 'Série'}
        </div>

        {/* Rating badge */}
        {item.avaliacao && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-yellow-500/90 text-black text-[10px] font-bold">
            ⭐ {item.avaliacao.toFixed(1)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
