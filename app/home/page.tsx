'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MobileHeader from '@/components/home/MobileHeader';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryCards from '@/components/home/CategoryCards';
import ContentRow from '@/components/home/ContentRow';
import ContinueWatching from '@/components/home/ContinueWatching';
import BottomNav from '@/components/BottomNav';
import { motion } from 'framer-motion';
import { Content, WatchHistoryWithContent } from '@/lib/supabase';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [featuredContents, setFeaturedContents] = useState<Content[]>([]);
  const [newReleases, setNewReleases] = useState<Content[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchHistoryWithContent[]>([]);
  const [loadingContents, setLoadingContents] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Buscar conteúdos das APIs
  useEffect(() => {
    const fetchContents = async () => {
      try {
        // Buscar em paralelo para melhor performance
        const [featuredResponse, newReleasesResponse] = await Promise.all([
          fetch('/api/contents/featured'),
          fetch('/api/contents/new-releases'),
        ]);

        const [featuredData, newReleasesData] = await Promise.all([
          featuredResponse.json(),
          newReleasesResponse.json(),
        ]);

        setFeaturedContents(featuredData.contents || []);
        setNewReleases(newReleasesData.contents || []);

        // Buscar histórico de forma não-bloqueante (pode falhar se tabela não existir)
        if (user?.uid) {
          try {
            const watchHistoryResponse = await fetch(
              `/api/watch-history?user_id=${user.uid}&limit=10`
            );
            if (watchHistoryResponse.ok) {
              const watchHistoryData = await watchHistoryResponse.json();
              setContinueWatching(watchHistoryData.history || []);
            }
          } catch (error) {
            console.warn('Erro ao buscar histórico (ignorado):', error);
            // Ignora erro - funcionalidade opcional
          }
        }
      } catch (error) {
        console.error('Erro ao buscar conteúdos:', error);
      } finally {
        setLoadingContents(false);
      }
    };

    if (user) {
      fetchContents();
    } else if (!loading) {
      // Se não há usuário e não está carregando auth, para de carregar conteúdos
      setLoadingContents(false);
    }
  }, [user, loading]);

  // Rotacionar banner a cada 5 segundos
  useEffect(() => {
    if (featuredContents.length > 0) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % featuredContents.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [featuredContents]);

  if (loading || loadingContents) {
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
        <HeroBanner content={featuredContents[currentBannerIndex] || null} />

        {/* Category Cards */}
        <CategoryCards />

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <ContinueWatching items={continueWatching} />
        )}

        {/* Content rows */}
        <div className="space-y-6 pb-4">
          {featuredContents.length > 0 && (
            <ContentRow title="Em Alta" items={featuredContents} />
          )}
          {newReleases.length > 0 && (
            <ContentRow title="Novidades" items={newReleases} />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
