'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Content } from '@/lib/supabase';
import WatchlistButton from '@/components/WatchlistButton';
import CastButton from '@/components/CastButton';
import { useCast } from '@/hooks/useCast';
import { getProxiedVideoUrl } from '@/lib/proxy';

export default function ContentDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [content, setContent] = useState<Content | null>(null);
  const [episodes, setEpisodes] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('1');

  const { castMedia, isConnected } = useCast();

  useEffect(() => {
    // Resolver params
    const resolveParams = async () => {
      const resolvedSlug = params.slug as string;
      setSlug(resolvedSlug);
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/contents/${slug}`);
        const data = await response.json();

        if (data.content) {
          setContent(data.content);

          // Se for série, armazenar os episódios
          if (data.episodes && data.episodes.length > 0) {
            setEpisodes(data.episodes);
            // Definir primeira temporada disponível
            const firstSeason = data.episodes[0]?.temporada || '1';
            setSelectedSeason(firstSeason);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar conteúdo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug]);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const handlePlay = () => {
    // Se for série, ir para o primeiro episódio
    if (content?.tipo === 'SERIE' && episodes.length > 0) {
      const firstEpisode = episodes[0];
      router.push(`/player/${firstEpisode.slug}`);
    } else {
      router.push(`/player/${slug}`);
    }
  };

  const handlePlayEpisode = (episodeSlug: string) => {
    router.push(`/player/${episodeSlug}`);
  };

  const handleCast = () => {
    if (!content) return;

    let videoUrlToCast = '';
    let title = content.nome;
    let subtitle = '';
    let imageUrl = content.poster_url || content.banner_url || '';

    // Lógica para determinar qual vídeo castar (filme ou episódio)
    if (content.tipo === 'SERIE' && episodes.length > 0) {
      // Se for série, tenta pegar o primeiro episódio da temporada selecionada ou o primeiro geral
      // Idealmente, deveria ser o episódio que o usuário clicou, mas o botão de cast está no header geral
      // Então vamos assumir o primeiro episódio da lista atual (ou lógica de "continuar assistindo" se tivesse)
      const episodeToCast = episodes.find(ep => ep.temporada === selectedSeason) || episodes[0];
      if (episodeToCast) {
        videoUrlToCast = episodeToCast.video_url;
        title = episodeToCast.nome;
        subtitle = `${content.nome} - S${episodeToCast.temporada}E${episodeToCast.episodio}`;
        imageUrl = episodeToCast.poster_url || imageUrl;
      }
    } else {
      videoUrlToCast = content.video_url;
    }

    if (videoUrlToCast) {
      // Usar URL direta se possível, ou proxy se necessário (mas o user pediu direta se possível)
      // O user disse: "acho que nao é necessario o proxy mais se for use , se nao passe a url direta"
      // Vamos tentar passar a direta. Se o player nativo usa proxy, talvez o cast precise também se for m3u8 com CORS restrito.
      // Mas vamos respeitar o pedido de "url direta".

      // Se a URL não for HTTPS, o Cast pode rejeitar. O proxy garante HTTPS.
      // Vamos verificar se é HTTPS.
      let finalUrl = videoUrlToCast;
      if (!finalUrl.startsWith('https://')) {
        finalUrl = getProxiedVideoUrl(videoUrlToCast);
      }

      castMedia(finalUrl, {
        title,
        subtitle,
        imageUrl,
        contentType: 'video/mp4' // Ou application/x-mpegurl para HLS
      });
    }
  };

  // Pegar temporadas únicas
  const getAvailableSeasons = () => {
    if (!episodes || episodes.length === 0) return [];
    const seasons = [...new Set(episodes.map(ep => ep.temporada).filter(Boolean))];
    return seasons.sort((a, b) => parseInt(a!) - parseInt(b!));
  };

  // Filtrar episódios da temporada selecionada
  const getEpisodesOfSeason = () => {
    return episodes.filter(ep => ep.temporada === selectedSeason);
  };

  const availableSeasons = getAvailableSeasons();
  const seasonEpisodes = getEpisodesOfSeason();

  if (loading) {
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

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Conteúdo não encontrado</div>
      </div>
    );
  }

  // Debug: Verificar content.id
  console.log('ContentDetail - content:', content);
  console.log('ContentDetail - content.id:', content.id);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header fixo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1" />
        <CastButton onCast={handleCast} />
      </div>

      {/* Banner */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <img
          src={content.banner_url || content.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920'}
          alt={content.nome}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Conteúdo */}
      <div className="relative z-20 -mt-32 px-4">
        <div className="flex gap-4 mb-6">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0 w-32"
          >
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              <img
                src={content.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
                alt={content.nome}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Info básica */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1"
          >
            <h1 className="text-2xl font-bold mb-2">{content.nome}</h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300 mb-4">
              {content.avaliacao && (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{content.avaliacao.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                </>
              )}
              {content.ano && (
                <>
                  <span>{content.ano}</span>
                  <span>•</span>
                </>
              )}
              {content.duracao && content.tipo === 'FILME' && (
                <>
                  <span>{formatDuration(content.duracao)}</span>
                  <span>•</span>
                </>
              )}
              <span className="px-2 py-0.5 border border-gray-500 rounded text-[10px]">
                {content.tipo === 'FILME' ? 'Filme' : 'Série'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Botões de ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-3 mb-6"
        >
          <Button
            onClick={handlePlay}
            className="bg-white text-black hover:bg-gray-200 font-semibold flex-1 h-12"
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            Assistir Agora
          </Button>
          <WatchlistButton contentId={content.id} className="h-12 px-4" />
        </motion.div>

        {/* Sinopse */}
        {content.sinopse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-lg font-semibold mb-2">Sinopse</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{content.sinopse}</p>
          </motion.div>
        )}

        {/* Detalhes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-3 mb-6"
        >
          {/* Gêneros */}
          {content.generos && content.generos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 w-20">Gêneros:</span>
              <div className="flex-1 flex flex-wrap gap-2">
                {content.generos.map((genero, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-800 rounded-full text-xs"
                  >
                    {genero}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Diretor */}
          {content.diretor && (
            <div className="flex">
              <span className="text-sm text-gray-400 w-20">Diretor:</span>
              <span className="text-sm flex-1">{content.diretor}</span>
            </div>
          )}

          {/* Elenco */}
          {content.elenco && content.elenco.length > 0 && (
            <div className="flex">
              <span className="text-sm text-gray-400 w-20">Elenco:</span>
              <span className="text-sm flex-1">
                {Array.isArray(content.elenco)
                  ? content.elenco
                    .map((cast: any) =>
                      typeof cast === 'object' && cast.name
                        ? cast.name
                        : typeof cast === 'string'
                          ? cast
                          : ''
                    )
                    .filter(Boolean)
                    .slice(0, 5)
                    .join(', ')
                  : typeof content.elenco === 'string'
                    ? content.elenco
                    : ''}
              </span>
            </div>
          )}
        </motion.div>

        {/* Seção de Elenco com fotos */}
        {content.elenco && content.elenco.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mb-6"
          >
            <h2 className="text-lg font-semibold mb-3">Elenco</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {content.elenco.slice(0, 10).map((cast: any, index: number) => {
                // Suportar tanto objetos quanto strings
                const castName = typeof cast === 'object' && cast.name ? cast.name : cast;
                const castCharacter = typeof cast === 'object' && cast.character ? cast.character : null;
                const castPhoto = typeof cast === 'object' && cast.profile_path ? cast.profile_path : null;

                return (
                  <div key={index} className="flex-shrink-0 w-24">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-800 mb-2">
                      {castPhoto ? (
                        <img
                          src={castPhoto}
                          alt={castName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                          {castName?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-center line-clamp-2 leading-tight mb-1">
                      {castName}
                    </p>
                    {castCharacter && (
                      <p className="text-[10px] text-gray-400 text-center line-clamp-1">
                        {castCharacter}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Seção de Episódios (apenas para séries) */}
        {content.tipo === 'SERIE' && availableSeasons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-6"
          >
            {/* Seletor de Temporadas */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-3">Episódios</h2>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {availableSeasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => setSelectedSeason(season!)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${selectedSeason === season
                        ? 'bg-white text-black'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                  >
                    Temporada {season}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards dos Episódios */}
            <div className="grid grid-cols-1 gap-3">
              {seasonEpisodes.map((episode, index) => (
                <motion.div
                  key={episode.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handlePlayEpisode(episode.slug)}
                  className="flex gap-3 bg-gray-900/50 rounded-lg overflow-hidden hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  {/* Thumbnail do episódio */}
                  <div className="relative w-32 flex-shrink-0 aspect-video">
                    <img
                      src={episode.poster_url || episode.banner_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'}
                      alt={episode.nome}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 text-white fill-current" />
                    </div>
                  </div>

                  {/* Info do episódio */}
                  <div className="flex-1 py-3 pr-3">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {episode.episodio}. {episode.nome}
                      </h3>
                      {episode.duracao && (
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {episode.duracao} min
                        </span>
                      )}
                    </div>
                    {episode.sinopse && (
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {episode.sinopse}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Espaçamento final */}
        <div className="h-20" />
      </div>
    </div>
  );
}
