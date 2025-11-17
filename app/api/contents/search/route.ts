import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar conteúdos por nome (otimizado para grandes volumes)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo'); // FILME ou SERIE (opcional)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Se não houver query, retornar vazio
    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        contents: [],
        pagination: {
          page,
          limit,
          total: 0,
          hasMore: false
        }
      });
    }

    // Criar cliente com service role para acesso total
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Buscar usando full-text search (mais performático que LIKE)
    // O índice idx_contents_nome foi criado com GIN para otimizar buscas
    let queryBuilder = supabase
      .from('contents')
      .select('*', { count: 'exact' })
      .or(`nome.ilike.%${query}%,nome_serie.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    // Filtrar por tipo se fornecido
    if (tipo) {
      queryBuilder = queryBuilder.eq('tipo', tipo);
    }

    // Paginação
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Erro ao buscar conteúdos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar conteúdos', details: error.message },
        { status: 500 }
      );
    }

    // Remover duplicatas de séries
    let processedData = data || [];

    if (data && data.length > 0) {
      const uniqueMap = new Map();

      for (const content of processedData) {
        if (content.tipo === 'SERIE') {
          const serieKey = content.nome_serie || content.nome;
          if (!uniqueMap.has(serieKey)) {
            uniqueMap.set(serieKey, content);
          }
        } else {
          uniqueMap.set(content.id, content);
        }
      }

      processedData = Array.from(uniqueMap.values());
    }

    return NextResponse.json({
      contents: processedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: offset + limit < (count || 0)
      }
    });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
