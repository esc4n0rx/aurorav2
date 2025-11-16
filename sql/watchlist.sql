-- Tabela de watchlist (Minha Lista)
CREATE TABLE watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL, -- Firebase UID
    content_id UUID NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT fk_content FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_content UNIQUE(user_id, content_id)
);

-- Índices para otimização
CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX idx_watchlist_content_id ON watchlist(content_id);
CREATE INDEX idx_watchlist_added_at ON watchlist(added_at DESC);

-- Permissões
GRANT SELECT, INSERT, DELETE ON watchlist TO authenticated;
GRANT ALL ON watchlist TO service_role;
