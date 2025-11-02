-- Tabela de séries
CREATE TABLE IF NOT EXISTS series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  synopsis TEXT,
  release_date DATE,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  age_rating TEXT,
  thumbnail_url TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  creator TEXT,
  cast TEXT[],
  total_seasons INTEGER DEFAULT 1,
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de temporadas
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  release_date DATE,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, season_number)
);

-- Tabela de episódios
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  release_date DATE,
  thumbnail_url TEXT,
  video_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(season_id, episode_number)
);

-- Tabela de relacionamento série-categoria
CREATE TABLE IF NOT EXISTS series_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, category_id)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_series_slug ON series(slug);
CREATE INDEX IF NOT EXISTS idx_series_is_featured ON series(is_featured);
CREATE INDEX IF NOT EXISTS idx_series_is_trending ON series(is_trending);
CREATE INDEX IF NOT EXISTS idx_seasons_series_id ON seasons(series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_id ON episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_episodes_series_id ON episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_series_categories_series_id ON series_categories(series_id);
CREATE INDEX IF NOT EXISTS idx_series_categories_category_id ON series_categories(category_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_series_updated_at
BEFORE UPDATE ON series
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasons_updated_at
BEFORE UPDATE ON seasons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
BEFORE UPDATE ON episodes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
