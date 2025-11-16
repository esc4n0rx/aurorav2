'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface WatchlistButtonProps {
  contentId: string;
  variant?: 'default' | 'apple';
  className?: string;
}

export default function WatchlistButton({
  contentId,
  variant = 'apple',
  className = '',
}: WatchlistButtonProps) {
  const { user } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar se está na watchlist
  useEffect(() => {
    if (!user || !contentId) return;

    const userId = (user as any).firebase_uid || (user as any).uid;
    if (!userId) {
      console.error('User não tem firebase_uid nem uid:', user);
      return;
    }

    const checkWatchlist = async () => {
      try {
        const response = await fetch(
          `/api/watchlist/check?userId=${userId}&contentId=${contentId}`
        );
        const data = await response.json();
        setInWatchlist(data.inWatchlist);
      } catch (error) {
        console.error('Erro ao verificar watchlist:', error);
      }
    };

    checkWatchlist();
  }, [user, contentId]);

  const toggleWatchlist = async () => {
    if (!user || loading) return;

    // Pegar userId do objeto user (suporta firebase_uid ou uid)
    const userId = (user as any).firebase_uid || (user as any).uid;

    console.log('=== TOGGLE WATCHLIST ===');
    console.log('user:', user);
    console.log('userId:', userId);
    console.log('contentId:', contentId);
    console.log('contentId type:', typeof contentId);

    // Validar antes de enviar
    if (!userId) {
      console.error('❌ userId está undefined!');
      toast.error('Erro: Usuário não identificado');
      return;
    }

    if (!contentId) {
      console.error('❌ contentId está undefined!');
      toast.error('Erro: Conteúdo não identificado');
      return;
    }

    console.log('✓ Validação OK, prosseguindo...');

    setLoading(true);

    try {
      if (inWatchlist) {
        // Remover da watchlist
        console.log('Removendo da watchlist...');
        const response = await fetch(
          `/api/watchlist?userId=${userId}&contentId=${contentId}`,
          {
            method: 'DELETE',
          }
        );

        const data = await response.json();
        console.log('Resposta DELETE:', response.status, data);

        if (response.ok) {
          setInWatchlist(false);
          toast.success('Removido da sua lista!', {
            icon: '🗑️',
          });
          console.log('✓ Removido da lista');
        } else {
          console.error('Erro ao remover:', data);
          toast.error(data.error || 'Erro ao remover da lista');
        }
      } else {
        // Adicionar à watchlist
        console.log('Adicionando à watchlist...');
        const body = {
          userId: userId,
          contentId,
        };
        console.log('Body enviado:', body);

        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log('Resposta POST:', response.status, data);

        if (response.ok) {
          setInWatchlist(true);
          toast.success('Adicionado à sua lista!', {
            icon: '✨',
          });
          console.log('✓ Adicionado à lista');
        } else {
          console.error('Erro ao adicionar:', data);
          toast.error(data.error || 'Erro ao adicionar à lista');
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar watchlist:', error);
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Button
      variant={variant}
      onClick={toggleWatchlist}
      disabled={loading}
      className={className}
    >
      {inWatchlist ? (
        <Check className="h-5 w-5" />
      ) : (
        <Plus className="h-5 w-5" />
      )}
    </Button>
  );
}
