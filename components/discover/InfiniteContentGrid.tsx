'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Content } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface InfiniteContentGridProps {
  tipo: 'FILME' | 'SERIE' | null;
  genero: string;
}

export default function InfiniteContentGrid({ tipo, genero }: InfiniteContentGridProps) {
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  // Resetar quando filtros mudarem
  useEffect(() => {
    setContents([]);
    setPage(1);
    setHasMore(true);
    fetchContents(1);
  }, [tipo, genero]);

  // Fetch contents
  const fetchContents = async (pageNum: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20'
      });

      if (tipo) params.append('tipo', tipo);
      if (genero) params.append('genero', genero);

      const response = await fetch(`/api/contents/discover?${params}`);
      const data = await response.json();

      if (data.contents) {
        setContents((prev) => {
          const newContents = pageNum === 1 ? data.contents : [...prev, ...data.contents];
          // Remove duplicatas baseado em ID
          const uniqueContents = Array.from(
            new Map(newContents.map((item: Content) => [item.id, item])).values()
          );
          return uniqueContents;
        });
        setHasMore(data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error('Erro ao buscar conteúdos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchContents(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="px-4">
      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 pb-4">
        {contents.map((item, index) => (
          <ContentCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && <div ref={observerRef} className="h-10" />}

      {/* No more results */}
      {!hasMore && contents.length > 0 && (
        <div className="text-center py-8 text-white/50 text-sm">
          Não há mais conteúdos para exibir
        </div>
      )}

      {/* No results */}
      {!loading && contents.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/50 text-sm">Nenhum conteúdo encontrado</p>
        </div>
      )}
    </div>
  );
}

function ContentCard({ item, index }: { item: Content; index: number }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/content/${item.slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: (index % 20) * 0.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
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
