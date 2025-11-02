'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UnderConstruction from '@/components/UnderConstruction';
import BottomNav from '@/components/BottomNav';
import { Compass } from 'lucide-react';

export default function DiscoverPage() {
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
        title="Descobrir"
        description="Explore novos conteúdos e descubra suas próximas séries e filmes favoritos. Esta funcionalidade estará disponível em breve!"
        icon={Compass}
      />
      <BottomNav />
    </>
  );
}
