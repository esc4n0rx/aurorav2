'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { Bookmark, Film, Tv } from 'lucide-react';
import { motion } from 'framer-motion';
import { Content } from '@/lib/supabase';

interface WatchlistItem {
  id: string;
  user_id: string;
  content_id: string;
  added_at: string;
  contents: Content;
}

export default function WatchlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Buscar watchlist
  useEffect(() => {
    if (!user) return;

    const userId = (user as any).firebase_uid || (user as any).uid;
    if (!userId) {
      console.error('User não tem firebase_uid nem uid');
      setLoadingWatchlist(false);
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const response = await fetch(`/api/watchlist?userId=${userId}`);
        const data = await response.json();
        setWatchlist(data.watchlist || []);
      } catch (error) {
        console.error('Erro ao buscar watchlist:', error);
      } finally {
        setLoadingWatchlist(false);
      }
    };

    fetchWatchlist();
  }, [user]);

  if (loading || !user) {
    return null;
  }

  // Separar filmes e séries
  const movies = watchlist.filter((item) => item.contents.tipo === 'FILME');
  const series = watchlist.filter((item) => item.contents.tipo === 'SERIE');

  const handleContentClick = (slug: string) => {
    router.push(`/content/${slug}`);
  };

  if (loadingWatchlist) {
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

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="h-7 w-7" />
          <h1 className="text-2xl font-bold">Minha Lista</h1>
        </div>
        <p className="text-sm text-gray-400">
          {watchlist.length} {watchlist.length === 1 ? 'item' : 'itens'} salvos
        </p>
      </div>

      {/* Conteúdo vazio */}
      {watchlist.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <Bookmark className="h-20 w-20 text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sua lista está vazia</h2>
          <p className="text-gray-400 text-center text-sm">
            Adicione filmes e séries clicando no botão + para assistir depois
          </p>
        </div>
      )}

      {/* Seção de Filmes */}
      {movies.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 px-4 mb-4">
            <Film className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Filmes</h2>
            <span className="text-sm text-gray-400">({movies.length})</span>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4">
            {movies.map((item, index) => (
              <ContentCard
                key={item.id}
                content={item.contents}
                index={index}
                onClick={() => handleContentClick(item.contents.slug)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Seção de Séries */}
      {series.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 px-4 mb-4">
            <Tv className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Séries</h2>
            <span className="text-sm text-gray-400">({series.length})</span>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4">
            {series.map((item, index) => (
              <ContentCard
                key={item.id}
                content={item.contents}
                index={index}
                onClick={() => handleContentClick(item.contents.slug)}
              />
            ))}
          </div>
        </section>
      )}

      <BottomNav />
    </div>
  );
}

// Componente de Card
function ContentCard({
  content,
  index,
  onClick,
}: {
  content: Content;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
        <img
          src={
            content.poster_url ||
            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'
          }
          alt={content.nome}
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-semibold text-xs line-clamp-2 leading-tight">
            {content.nome}
          </h3>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md glass-effect text-[10px] font-semibold">
          {content.tipo === 'FILME' ? 'Filme' : 'Série'}
        </div>
      </div>
    </motion.div>
  );
}
