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

  // Buscar gêneros
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedType) {
          params.append('tipo', selectedType);
        }

        const response = await fetch(`/api/contents/genres?${params}`);
        const data = await response.json();
        setGenres(data.generos || []);
      } catch (error) {
        console.error('Erro ao buscar gêneros:', error);
      } finally {
        setLoadingGenres(false);
      }
    };

    if (user) {
      fetchGenres();
    }
  }, [user, selectedType]);

  // Buscar conteúdos agrupados por gênero (quando nenhum gênero específico está selecionado)
  useEffect(() => {
    const fetchContentsByGenre = async () => {
      if (selectedGenre) return; // Não buscar se um gênero específico está selecionado

      setLoadingContents(true);
      try {
        const contentsMap: Record<string, Content[]> = {};

        // Buscar conteúdos para cada gênero
        await Promise.all(
          genres.slice(0, 10).map(async (genre) => {
            const params = new URLSearchParams({
              genero: genre,
              limit: '10',
              page: '1'
            });

            if (selectedType) {
              params.append('tipo', selectedType);
            }

            const response = await fetch(`/api/contents/discover?${params}`);
            const data = await response.json();

            if (data.contents && data.contents.length > 0) {
              contentsMap[genre] = data.contents;
            }
          })
        );

        setGenreContents(contentsMap);
      } catch (error) {
        console.error('Erro ao buscar conteúdos:', error);
      } finally {
        setLoadingContents(false);
      }
    };

    if (user && genres.length > 0 && !selectedGenre) {
      fetchContentsByGenre();
    }
  }, [user, genres, selectedType, selectedGenre]);

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
