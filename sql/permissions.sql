-- Dar permissões de leitura para a role anon (usuários autenticados e não autenticados)
GRANT SELECT ON contents TO anon;
GRANT SELECT ON contents TO authenticated;

-- Dar todas as permissões para a role service_role (para APIs server-side)
GRANT ALL ON contents TO service_role;

-- Se você quiser permitir que usuários autenticados também possam inserir/atualizar
-- GRANT INSERT, UPDATE ON contents TO authenticated;

-- Permissões para a tabela categorias também
GRANT SELECT ON categorias TO anon;
GRANT SELECT ON categorias TO authenticated;
GRANT ALL ON categorias TO service_role;
