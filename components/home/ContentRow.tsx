'use client';

import { motion } from 'framer-motion';

interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  type: 'movie' | 'series';
}

interface ContentRowProps {
  title: string;
  items: ContentItem[];
}

export default function ContentRow({ title, items }: ContentRowProps) {
  return (
    <div className="mb-6">
      {/* Title */}
      <h2 className="text-lg font-semibold mb-3 px-4">{title}</h2>

      {/* Content scroll */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 scroll-smooth snap-x snap-mandatory">
        {items.map((item, index) => (
          <ContentCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}

function ContentCard({ item, index }: { item: ContentItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex-shrink-0 w-40 snap-start"
    >
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-semibold text-xs line-clamp-2 leading-tight">
            {item.title}
          </h3>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md glass-effect text-[10px] font-semibold">
          {item.type === 'movie' ? 'Filme' : 'Série'}
        </div>
      </div>
    </motion.div>
  );
}
