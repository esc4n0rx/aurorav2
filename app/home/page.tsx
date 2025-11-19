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

  useEffect(() => {
    const fetchContents = async () => {
      try {
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

        if (user?.id) {
          try {
            const watchHistoryResponse = await fetch(
              `/api/watch-history?user_id=${user.id}&limit=10`
            );
            if (watchHistoryResponse.ok) {
              const watchHistoryData = await watchHistoryResponse.json();
              setContinueWatching(watchHistoryData.history || []);
            }
          } catch (error) {
            console.warn('Erro ao buscar histórico (ignorado):', error);
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
      setLoadingContents(false);
    }
  }, [user, loading]);

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

      <MobileHeader />

      <main className="page-transition">

        <HeroBanner content={featuredContents[currentBannerIndex] || null} />


        <CategoryCards />

        {continueWatching.length > 0 && (
          <ContinueWatching items={continueWatching} />
        )}

        <div className="space-y-6 pb-4">
          {featuredContents.length > 0 && (
            <ContentRow title="Em Alta" items={featuredContents} />
          )}
          {newReleases.length > 0 && (
            <ContentRow title="Novidades" items={newReleases} />
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
