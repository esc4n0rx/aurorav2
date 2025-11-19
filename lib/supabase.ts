import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para uso server-side com service role key
export const supabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Database types
export type User = {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: boolean;
  subscription_tier: 'free' | 'basic' | 'premium';
  subscription_expires_at: string | null;
};

export type Movie = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  synopsis: string | null;
  duration_minutes: number | null;
  release_date: string | null;
  rating: number | null;
  age_rating: string | null;
  thumbnail_url: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  video_url: string | null;
  director: string | null;
  cast: string[] | null;
  is_featured: boolean;
  is_trending: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type Series = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  synopsis: string | null;
  release_date: string | null;
  rating: number | null;
  age_rating: string | null;
  thumbnail_url: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  creator: string | null;
  cast: string[] | null;
  total_seasons: number;
  status: 'ongoing' | 'completed' | 'cancelled';
  is_featured: boolean;
  is_trending: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
};

// Tipo para a tabela contents
export type Content = {
  id: string;
  nome: string;
  slug: string;
  tipo: 'FILME' | 'SERIE';
  categoria_principal: string;
  subcategoria: string | null;
  poster_url: string | null;
  video_url: string;
  banner_url: string | null;
  sinopse: string | null;
  ano: number | null;
  duracao: number | null; // em minutos
  avaliacao: number | null;
  elenco: string[] | null; // JSONB array
  diretor: string | null;
  generos: string[] | null; // JSONB array
  destaque: boolean;
  // Campos específicos para séries
  temporada: string | null;
  episodio: string | null;
  nome_serie: string | null;
  // Metadados TMDB
  tmdb_id: number | null;
  tmdb_data: any | null; // JSONB
  // Controle
  created_at: string;
  updated_at: string;
  synced_with_tmdb: boolean;
};

// Tipo para a tabela watchlist
export type Watchlist = {
  id: string;
  user_id: string;
  content_id: string;
  added_at: string;
};

// Tipo para a tabela watch_history
export type WatchHistory = {
  id: string;
  user_id: string;
  content_id: string;
  current_t: number; // segundos
  duration: number; // segundos
  progress_percent: number; // 0-100
  completed: boolean;
  last_watched_at: string;
  first_watched_at: string;
  watch_count: number;
};

// Tipo para watch_history com dados do conteúdo (JOIN)
export type WatchHistoryWithContent = WatchHistory & {
  content: Content;
};
