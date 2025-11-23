'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Laugh,
  Zap,
  Ghost,
  Sparkles,
  Coffee,
  Baby,
  Brain,
} from 'lucide-react';

// Categorias por sentimento/humor que mapeiam para gêneros
const moodCategories = [
  {
    id: 1,
    name: 'Para Relaxar',
    icon: Coffee,
    color: 'from-blue-400 to-cyan-400',
    genres: ['Romance', 'Drama'],
  },
  {
    id: 2,
    name: 'Para Rir',
    icon: Laugh,
    color: 'from-yellow-400 to-orange-400',
    genres: ['Comédia', 'Animação'],
  },
  {
    id: 3,
    name: 'Adrenalina',
    icon: Zap,
    color: 'from-red-500 to-orange-500',
    genres: ['Ação', 'Aventura', 'Thriller'],
  },
  {
    id: 4,
    name: 'Emoção',
    icon: Heart,
    color: 'from-pink-400 to-rose-400',
    genres: ['Romance', 'Drama'],
  },
  {
    id: 5,
    name: 'Família',
    icon: Baby,
    color: 'from-green-400 to-emerald-400',
    genres: ['Animação', 'Família', 'Aventura'],
  },
  {
    id: 6,
    name: 'Suspense',
    icon: Ghost,
    color: 'from-purple-500 to-indigo-600',
    genres: ['Terror', 'Suspense', 'Thriller'],
  },
  {
    id: 7,
    name: 'Pensar',
    icon: Brain,
    color: 'from-indigo-500 to-purple-500',
    genres: ['Ficção Científica', 'Drama', 'Documentário'],
  },
  {
    id: 8,
    name: 'Descobrir',
    icon: Sparkles,
    color: 'from-violet-500 to-fuchsia-500',
    genres: ['Fantasia', 'Ficção Científica', 'Aventura'],
  },
];

export default function CategoryCards() {
  const router = useRouter();

  const handleCategoryClick = (category: typeof moodCategories[0]) => {
    // Navegar para discover com múltiplos gêneros
    const genresString = category.genres.join(',');
    router.push(`/discover?generos=${encodeURIComponent(genresString)}`);
  };

  return (
    <div className="px-4 py-6">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-xl font-semibold mb-4"
      >
        O que você quer sentir?
      </motion.h2>

      <div className="grid grid-cols-4 gap-3">
        {moodCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(category)}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-active:shadow-xl transition-all duration-200 hover:scale-105`}
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
