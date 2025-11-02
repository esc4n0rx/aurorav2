'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UnderConstruction from '@/components/UnderConstruction';
import BottomNav from '@/components/BottomNav';
import { Bookmark } from 'lucide-react';

export default function WatchlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <>
      <UnderConstruction
        title="Minha Lista"
        description="Gerencie seus filmes e séries favoritos em um só lugar. Salve conteúdos para assistir depois. Funcionalidade em desenvolvimento!"
        icon={Bookmark}
      />
      <BottomNav />
    </>
  );
}
