'use client';

import { motion } from 'framer-motion';
import { Flame, Sparkles, Heart, Laugh, Zap, Ghost, Film, Tv } from 'lucide-react';

const categories = [
  { id: 1, name: 'Em Alta', icon: Flame, color: 'from-orange-500 to-red-500' },
  { id: 2, name: 'Novidades', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
  { id: 3, name: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 4, name: 'Comédia', icon: Laugh, color: 'from-yellow-500 to-orange-500' },
  { id: 5, name: 'Ação', icon: Zap, color: 'from-blue-500 to-cyan-500' },
  { id: 6, name: 'Terror', icon: Ghost, color: 'from-gray-700 to-gray-900' },
  { id: 7, name: 'Filmes', icon: Film, color: 'from-indigo-500 to-purple-500' },
  { id: 8, name: 'Séries', icon: Tv, color: 'from-green-500 to-emerald-500' },
];

export default function CategoryCards() {
  return (
    <div className="px-4 py-6">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl font-semibold mb-4"
      >
        Categorias
      </motion.h2>

      <div className="grid grid-cols-4 gap-3">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-active:shadow-xl transition-shadow`}
              >
                <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-medium text-gray-300 text-center line-clamp-1">
                {category.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
