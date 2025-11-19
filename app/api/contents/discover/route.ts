import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar conteúdos para discover com filtros e paginação
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); // FILME ou SERIE (opcional)
    const genero = searchParams.get('genero'); // Gênero específico (opcional)
    const page = parseInt(searchParams.get('page') || '1');
    // Limite otimizado para paginação infinita
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Criar cliente com service role para acesso total
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    let query = supabase
      .from('contents')
      .select('*', { count: 'exact' });

    // Filtrar por tipo se fornecido
    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    // Filtrar por gênero se fornecido
    if (genero) {
      // Usar contains para buscar em array JSONB
      query = query.contains('generos', [genero]);
    }

    // Ordenar por data de criação (mais recentes primeiro)
    query = query.order('created_at', { ascending: false });

    // Paginação
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar conteúdos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar conteúdos', details: error.message },
        { status: 500 }
      );
    }

    // Para séries, agrupar por nome_serie para evitar duplicatas
    let processedData = data || [];

    // Processamento mais eficiente
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

    const response = NextResponse.json({
      contents: processedData,
      pagination: {
        page,
        limit,
        total: count || processedData.length,
        totalItems: processedData.length,
        hasMore: (data?.length || 0) === limit
      }
    });

    // Cache por 60 segundos
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
