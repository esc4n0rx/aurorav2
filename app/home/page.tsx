'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MobileHeader from '@/components/home/MobileHeader';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryCards from '@/components/home/CategoryCards';
import ContentRow from '@/components/home/ContentRow';
import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';

// Mock data - em produção viria do Supabase
const trendingContent = [
  {
    id: '1',
    title: 'Aventura nas Estrelas',
    thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400',
    type: 'movie' as const,
  },
  {
    id: '2',
    title: 'O Último Horizonte',
    thumbnail: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400',
    type: 'movie' as const,
  },
  {
    id: '3',
    title: 'Cidade Submersa',
    thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400',
    type: 'movie' as const,
  },
  {
    id: '4',
    title: 'Horizontes Perdidos',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    type: 'movie' as const,
  },
  {
    id: '5',
    title: 'Noite Eterna',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    type: 'movie' as const,
  },
];

const newReleases = [
  {
    id: '6',
    title: 'Crônicas do Futuro',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    type: 'series' as const,
  },
  {
    id: '7',
    title: 'Mistérios da Floresta',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    type: 'series' as const,
  },
  {
    id: '8',
    title: 'Código Zero',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400',
    type: 'series' as const,
  },
  {
    id: '9',
    title: 'A Era Digital',
    thumbnail: 'https://images.unsplash.com/photo-1446776899648-aa78eefe8ed0?w=400',
    type: 'series' as const,
  },
  {
    id: '10',
    title: 'Além do Tempo',
    thumbnail: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=400',
    type: 'series' as const,
  },
];

const popularMovies = [
  {
    id: '11',
    title: 'Força Máxima',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
    type: 'movie' as const,
  },
  {
    id: '12',
    title: 'Operação Resgate',
    thumbnail: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
    type: 'movie' as const,
  },
  {
    id: '13',
    title: 'Zona de Perigo',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    type: 'movie' as const,
  },
  {
    id: '14',
    title: 'Velocidade Terminal',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
    type: 'movie' as const,
  },
  {
    id: '15',
    title: 'Missão Impossível',
    thumbnail: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
    type: 'movie' as const,
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl"
        >
          Carregando...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Mobile Header */}
      <MobileHeader />

      <main className="page-transition">
        {/* Hero Banner */}
        <HeroBanner />

        {/* Category Cards */}
        <CategoryCards />

        {/* Content rows */}
        <div className="space-y-6 pb-4">
          <ContentRow title="Em Alta" items={trendingContent} />
          <ContentRow title="Novidades" items={newReleases} />
          <ContentRow title="Filmes Populares" items={popularMovies} />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
