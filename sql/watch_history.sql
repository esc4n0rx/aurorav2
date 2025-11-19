-- Tabela de histórico de visualização (Continue Assistindo)
CREATE TABLE watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL, -- Firebase UID
    content_id UUID NOT NULL,

    -- Progresso do vídeo
    current_time INTEGER DEFAULT 0, -- Tempo atual em segundos
    duration INTEGER DEFAULT 0, -- Duração total em segundos
    progress_percent DECIMAL(5,2) DEFAULT 0, -- Percentual de progresso (0-100)
    completed BOOLEAN DEFAULT FALSE, -- Se assistiu mais de 90%

    -- Metadados
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    watch_count INTEGER DEFAULT 1, -- Número de vezes que assistiu

    -- Constraints
    CONSTRAINT fk_content FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_content UNIQUE(user_id, content_id)
);

-- Índices para otimização
CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_content_id ON watch_history(content_id);
CREATE INDEX idx_watch_history_last_watched ON watch_history(last_watched_at DESC);
CREATE INDEX idx_watch_history_user_last_watched ON watch_history(user_id, last_watched_at DESC);
CREATE INDEX idx_watch_history_completed ON watch_history(completed);

-- Índice para buscar conteúdos não completados (Continue Assistindo)
CREATE INDEX idx_watch_history_continue_watching
    ON watch_history(user_id, last_watched_at DESC)
    WHERE completed = FALSE AND progress_percent > 5;

-- Trigger para atualizar last_watched_at
CREATE OR REPLACE FUNCTION update_last_watched_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_watched_at = NOW();
    -- Atualizar completed se progresso > 90%
    IF NEW.progress_percent >= 90 THEN
        NEW.completed = TRUE;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_watch_history_last_watched
    BEFORE UPDATE ON watch_history
    FOR EACH ROW
    EXECUTE FUNCTION update_last_watched_at();

-- Permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON watch_history TO authenticated;
GRANT ALL ON watch_history TO service_role;
