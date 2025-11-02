-- Tabela de lista de favoritos/assistir depois
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE NULL,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id),
  UNIQUE(user_id, series_id),
  CHECK (
    (movie_id IS NOT NULL AND series_id IS NULL) OR
    (movie_id IS NULL AND series_id IS NOT NULL)
  )
);

-- Tabela de histórico de visualização
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE NULL,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NULL,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (movie_id IS NOT NULL AND episode_id IS NULL) OR
    (movie_id IS NULL AND episode_id IS NOT NULL)
  )
);

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  preferred_categories UUID[] DEFAULT '{}',
  autoplay_next BOOLEAN DEFAULT true,
  subtitle_language TEXT DEFAULT 'pt-BR',
  audio_language TEXT DEFAULT 'pt-BR',
  video_quality TEXT DEFAULT 'auto' CHECK (video_quality IN ('auto', '720p', '1080p', '4k')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_movie_id ON watchlist(movie_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_series_id ON watchlist(series_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_movie_id ON watch_history(movie_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_episode_id ON watch_history(episode_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_last_watched ON watch_history(last_watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar last_watched_at no watch_history
CREATE OR REPLACE FUNCTION update_last_watched_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_watched_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_watch_history_last_watched
BEFORE UPDATE ON watch_history
FOR EACH ROW
EXECUTE FUNCTION update_last_watched_at();
