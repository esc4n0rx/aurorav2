import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar conteúdos agrupados por gênero (otimizado)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); // FILME ou SERIE (opcional)
    const limit = parseInt(searchParams.get('limit') || '10');

    // Criar cliente com service role para acesso total
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Primeiro buscar todos os gêneros únicos do banco
    const { data: genreData, error: genreError } = await supabase
      .from('contents')
      .select('generos')
      .not('generos', 'is', null);

    if (genreError) {
      console.error('Erro ao buscar gêneros:', genreError);
    }

    // Extrair gêneros únicos
    const allGenres = new Set<string>();
    genreData?.forEach((item: any) => {
      if (item.generos && Array.isArray(item.generos)) {
        item.generos.forEach((g: string) => {
          if (g) allGenres.add(g);
        });
      }
    });

    const sortedGenres = Array.from(allGenres).sort();

    // Buscar conteúdos para cada gênero
    const genreContentsMap: Record<string, any[]> = {};

    // Buscar conteúdos em lotes por gênero para ter variedade
    for (const genre of sortedGenres.slice(0, 15)) { // Top 15 gêneros
      let genreQuery = supabase
        .from('contents')
        .select('*')
        .contains('generos', [genre])
        .order('created_at', { ascending: false })
        .limit(50); // 50 por gênero para ter margem após deduplicação

      if (tipo) {
        genreQuery = genreQuery.eq('tipo', tipo);
      }

      const { data: genreContents, error: gError } = await genreQuery;

      if (!gError && genreContents && genreContents.length > 0) {
        // Remover duplicatas de séries
        const uniqueMap = new Map();
        genreContents.forEach((content) => {
          if (content.tipo === 'SERIE') {
            const serieKey = content.nome_serie || content.nome;
            if (!uniqueMap.has(serieKey)) {
              uniqueMap.set(serieKey, content);
            }
          } else {
            uniqueMap.set(content.id, content);
          }
        });

        const uniqueContents = Array.from(uniqueMap.values()).slice(0, limit);
        if (uniqueContents.length > 0) {
          genreContentsMap[genre] = uniqueContents;
        }
      }
    }

    // Retornar resultado
    const response = NextResponse.json({
      genreContents: genreContentsMap,
      genres: sortedGenres
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
