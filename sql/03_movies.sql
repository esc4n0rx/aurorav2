-- Tabela de filmes
CREATE TABLE IF NOT EXISTS movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  synopsis TEXT,
  duration_minutes INTEGER,
  release_date DATE,
  rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
  age_rating TEXT, -- 'L', '10', '12', '14', '16', '18'
  thumbnail_url TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  video_url TEXT,
  director TEXT,
  cast TEXT[], -- Array de atores
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento filme-categoria
CREATE TABLE IF NOT EXISTS movie_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_id, category_id)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_movies_slug ON movies(slug);
CREATE INDEX IF NOT EXISTS idx_movies_is_featured ON movies(is_featured);
CREATE INDEX IF NOT EXISTS idx_movies_is_trending ON movies(is_trending);
CREATE INDEX IF NOT EXISTS idx_movies_release_date ON movies(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_movie_categories_movie_id ON movie_categories(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_categories_category_id ON movie_categories(category_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_movies_updated_at
BEFORE UPDATE ON movies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
