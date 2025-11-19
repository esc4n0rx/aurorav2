'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MobileHeader from '@/components/home/MobileHeader';
import BottomNav from '@/components/BottomNav';
import DiscoverFilters from '@/components/discover/DiscoverFilters';
import GenreSection from '@/components/discover/GenreSection';
import InfiniteContentGrid from '@/components/discover/InfiniteContentGrid';
import { motion } from 'framer-motion';
import { Content } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function DiscoverPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<'FILME' | 'SERIE' | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genreContents, setGenreContents] = useState<Record<string, Content[]>>({});
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingContents, setLoadingContents] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Buscar conteúdos agrupados por gênero (otimizado - uma única chamada)
  useEffect(() => {
    const fetchContents = async () => {
      if (selectedGenre) {
        // Se um gênero específico está selecionado, não carrega os agrupados
        setLoadingGenres(false);
        setLoadingContents(false);
        return;
      }

      setLoadingGenres(true);
      setLoadingContents(true);

      try {
        const params = new URLSearchParams({ limit: '10' });
        if (selectedType) {
          params.append('tipo', selectedType);
        }

        // Usar API otimizada que retorna tudo agrupado de uma vez
        const response = await fetch(`/api/contents/discover/grouped?${params}`);
        const data = await response.json();

        setGenres(data.genres || []);
        setGenreContents(data.genreContents || {});
      } catch (error) {
        console.error('Erro ao buscar conteúdos:', error);
      } finally {
        setLoadingGenres(false);
        setLoadingContents(false);
      }
    };

    if (user) {
      fetchContents();
    } else if (!loading) {
      setLoadingGenres(false);
      setLoadingContents(false);
    }
  }, [user, loading, selectedType, selectedGenre]);

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
        {/* Filters */}
        <DiscoverFilters
          selectedType={selectedType}
          selectedGenre={selectedGenre}
          genres={genres}
          onTypeChange={setSelectedType}
          onGenreChange={setSelectedGenre}
        />

        {/* Content */}
        <div className="mt-6">
          {selectedGenre ? (
            // Infinite scroll grid quando um gênero específico está selecionado
            <InfiniteContentGrid tipo={selectedType} genero={selectedGenre} />
          ) : (
            // Seções por gênero quando nenhum gênero específico está selecionado
            <>
              {loadingContents || loadingGenres ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(genreContents).map(([genre, contents]) => (
                    <GenreSection key={genre} genre={genre} contents={contents} />
                  ))}

                  {Object.keys(genreContents).length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-white/50 text-sm">
                        Nenhum conteúdo encontrado
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
