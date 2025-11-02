-- Tabela de categorias/gêneros
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca por slug
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO categories (name, slug, description) VALUES
  ('Ação', 'acao', 'Filmes e séries de ação'),
  ('Comédia', 'comedia', 'Conteúdo de humor'),
  ('Drama', 'drama', 'Histórias dramáticas'),
  ('Ficção Científica', 'ficcao-cientifica', 'Sci-Fi e futurismo'),
  ('Terror', 'terror', 'Conteúdo de horror'),
  ('Romance', 'romance', 'Histórias românticas'),
  ('Documentário', 'documentario', 'Documentários e não-ficção'),
  ('Animação', 'animacao', 'Animações e desenhos')
ON CONFLICT (slug) DO NOTHING;
