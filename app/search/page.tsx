'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MobileHeader from '@/components/home/MobileHeader';
import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';
import { Content } from '@/lib/supabase';
import { Search, Loader2, Film, Tv, X } from 'lucide-react';

export default function SearchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [contents, setContents] = useState<Content[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedType, setSelectedType] = useState<'FILME' | 'SERIE' | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Debounce da busca
  const performSearch = useCallback(
    async (query: string, tipo: 'FILME' | 'SERIE' | null) => {
      if (query.trim().length < 2) {
        setContents([]);
        setHasSearched(false);
        return;
      }

      setSearching(true);
      setHasSearched(true);

      try {
        const params = new URLSearchParams({
          q: query,
          limit: '50'
        });

        if (tipo) {
          params.append('tipo', tipo);
        }

        const response = await fetch(`/api/contents/search?${params}`);
        const data = await response.json();

        setContents(data.contents || []);
      } catch (error) {
        console.error('Erro ao buscar conteúdos:', error);
      } finally {
        setSearching(false);
      }
    },
    []
  );

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery, selectedType);
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchQuery, selectedType, performSearch]);

  const handleContentClick = (slug: string) => {
    router.push(`/content/${slug}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setContents([]);
    setHasSearched(false);
  };

  if (loading || !user) {
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
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Mobile Header */}
      <MobileHeader />

      <main className="page-transition pt-4">
        {/* Search Field */}
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar filmes e séries..."
              className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/15 transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-3 px-4 mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType(selectedType === 'FILME' ? null : 'FILME')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              selectedType === 'FILME'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Film size={16} />
            Filmes
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedType(selectedType === 'SERIE' ? null : 'SERIE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              selectedType === 'SERIE'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Tv size={16} />
            Séries
          </motion.button>
        </div>

        {/* Results */}
        <div className="px-4">
          {searching && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          )}

          {!searching && hasSearched && contents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/50 text-center">
                Nenhum resultado encontrado para "{searchQuery}"
              </p>
              <p className="text-white/30 text-sm text-center mt-2">
                Tente buscar por outro título
              </p>
            </div>
          )}

          {!searching && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="w-16 h-16 text-white/20 mb-4" />
              <p className="text-white/50 text-center">
                Digite o nome de um filme ou série para buscar
              </p>
            </div>
          )}

          {!searching && contents.length > 0 && (
            <>
              <p className="text-sm text-white/50 mb-4">
                {contents.length} resultado{contents.length !== 1 ? 's' : ''} encontrado{contents.length !== 1 ? 's' : ''}
              </p>

              <div className="grid grid-cols-3 gap-3">
                {contents.map((item, index) => (
                  <ContentCard key={item.id} item={item} index={index} onClick={() => handleContentClick(item.slug)} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

function ContentCard({ item, index, onClick }: { item: Content; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
        <img
          src={item.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
          alt={item.tipo === 'SERIE' ? (item.nome_serie || item.nome) : item.nome}
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h3 className="text-white font-semibold text-[10px] line-clamp-2 leading-tight">
            {item.tipo === 'SERIE' ? (item.nome_serie || item.nome) : item.nome}
          </h3>
        </div>

        {/* Type badge */}
        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded glass-effect text-[8px] font-semibold">
          {item.tipo === 'FILME' ? 'Filme' : 'Série'}
        </div>

        {/* Rating badge */}
        {item.avaliacao && (
          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-yellow-500/90 text-black text-[8px] font-bold">
            ⭐ {item.avaliacao.toFixed(1)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
