'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UnderConstruction from '@/components/UnderConstruction';
import BottomNav from '@/components/BottomNav';
import { Grid3x3 } from 'lucide-react';

export default function CategoriesPage() {
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
        title="Categorias"
        description="Navegue por todas as categorias disponíveis e encontre exatamente o tipo de conteúdo que você procura. Em breve!"
        icon={Grid3x3}
      />
      <BottomNav />
    </>
  );
}
