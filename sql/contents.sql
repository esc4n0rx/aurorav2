-- Tabela principal de conteúdos
CREATE TABLE contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'FILME' ou 'SERIE'
    categoria_principal VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    poster_url TEXT,
    video_url TEXT NOT NULL,
    banner_url TEXT,
    sinopse TEXT,
    ano INTEGER,
    duracao INTEGER, -- em minutos
    avaliacao DECIMAL(3,1),
    elenco JSONB, -- array de atores
    diretor VARCHAR(255),
    generos JSONB, -- array de gêneros
    destaque BOOLEAN DEFAULT FALSE,
    
    -- Campos específicos para séries
    temporada VARCHAR(10),
    episodio VARCHAR(10),
    nome_serie VARCHAR(500),
    
    -- Metadados TMDB
    tmdb_id INTEGER,
    tmdb_data JSONB,
    
    -- Controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_with_tmdb BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT unique_video_url UNIQUE(video_url)
);

-- Índices para otimização de busca
CREATE INDEX idx_contents_slug ON contents(slug);
CREATE INDEX idx_contents_tipo ON contents(tipo);
CREATE INDEX idx_contents_categoria ON contents(categoria_principal);
CREATE INDEX idx_contents_subcategoria ON contents(subcategoria);
CREATE INDEX idx_contents_nome ON contents USING gin(to_tsvector('portuguese', nome));
CREATE INDEX idx_contents_tmdb_id ON contents(tmdb_id);
CREATE INDEX idx_contents_temporada_episodio ON contents(temporada, episodio) WHERE tipo = 'SERIE';
CREATE INDEX idx_contents_nome_serie ON contents(nome_serie) WHERE tipo = 'SERIE';
CREATE INDEX idx_contents_synced ON contents(synced_with_tmdb);

-- Índice composto para consultas frequentes
CREATE INDEX idx_contents_tipo_categoria ON contents(tipo, categoria_principal, subcategoria);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contents_updated_at 
    BEFORE UPDATE ON contents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tabela para categorias (opcional, para controle)
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    categoria_principal VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    total_items INTEGER DEFAULT 0,
    CONSTRAINT unique_categoria UNIQUE(tipo, categoria_principal, subcategoria)
);

CREATE INDEX idx_categorias_tipo ON categorias(tipo);
