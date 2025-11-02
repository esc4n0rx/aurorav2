# Aurora - SQL Database Schema

Scripts SQL para configuração do banco de dados Supabase do Aurora Streaming.

## ⚠️ IMPORTANTE: Ordem de Execução

Execute os scripts **EXATAMENTE** nesta ordem no SQL Editor do Supabase:

1. **`00_disable_rls.sql`** - ⚡ EXECUTE PRIMEIRO! Desabilita RLS e configura permissões
2. `01_users.sql` - Tabela de usuários e autenticação
3. `02_categories.sql` - Categorias e gêneros
4. `03_movies.sql` - Filmes e relacionamentos
5. `04_series.sql` - Séries, temporadas e episódios
6. `05_user_interactions.sql` - Watchlist, histórico e preferências

## Estrutura do Banco

### Tabelas Principais

- **users** - Perfis de usuário sincronizados com Firebase Auth
- **movies** - Catálogo de filmes
- **series** - Catálogo de séries
- **seasons** - Temporadas das séries
- **episodes** - Episódios de cada temporada
- **categories** - Categorias/gêneros de conteúdo

### Tabelas de Relacionamento

- **movie_categories** - Relaciona filmes com categorias
- **series_categories** - Relaciona séries com categorias
- **watchlist** - Lista de favoritos dos usuários
- **watch_history** - Histórico de visualização e progresso
- **user_preferences** - Preferências personalizadas

## Políticas de Segurança (RLS)

Por padrão, o RLS (Row Level Security) não está habilitado pois vamos gerenciar permissões via API do Next.js.
Se desejar habilitar RLS no futuro, adicione as políticas apropriadas.

## Como Executar

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute cada arquivo na ordem indicada
4. Verifique se não há erros

## Notas

- Todos os IDs usam UUID v4
- Timestamps incluem timezone
- Índices criados para queries frequentes
- Triggers automáticos para updated_at
