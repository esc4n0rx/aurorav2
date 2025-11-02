-- Desabilitar RLS (Row Level Security) em todas as tabelas
-- Execute este script ANTES dos outros scripts

-- Garantir permissões no schema public
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Alterar owner de todas as tabelas para postgres
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, service_role;

-- Desabilitar RLS em todas as tabelas existentes
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS movies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS movie_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS series DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seasons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS episodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS series_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS watchlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS watch_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_preferences DISABLE ROW LEVEL SECURITY;

-- Garantir permissões em tabelas específicas
GRANT ALL ON TABLE users TO postgres, service_role, authenticated;
GRANT ALL ON TABLE categories TO postgres, service_role, authenticated;
GRANT ALL ON TABLE movies TO postgres, service_role, authenticated;
GRANT ALL ON TABLE movie_categories TO postgres, service_role, authenticated;
GRANT ALL ON TABLE series TO postgres, service_role, authenticated;
GRANT ALL ON TABLE seasons TO postgres, service_role, authenticated;
GRANT ALL ON TABLE episodes TO postgres, service_role, authenticated;
GRANT ALL ON TABLE series_categories TO postgres, service_role, authenticated;
GRANT ALL ON TABLE watchlist TO postgres, service_role, authenticated;
GRANT ALL ON TABLE watch_history TO postgres, service_role, authenticated;
GRANT ALL ON TABLE user_preferences TO postgres, service_role, authenticated;
