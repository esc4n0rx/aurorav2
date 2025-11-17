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

    // Buscar conteúdos limitados (para performance)
    // Como vamos exibir 10 gêneros com 10 itens cada, buscar no máximo 150 conteúdos
    let query = supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(150);

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar conteúdos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar conteúdos', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        genreContents: {},
        genres: []
      });
    }

    // Processar dados: remover duplicatas de séries e agrupar por gênero
    const uniqueContents = new Map();
    const genreContentsMap: Record<string, any[]> = {};
    const genresSet = new Set<string>();

    // Primeiro passo: remover duplicatas de séries
    data.forEach((content) => {
      if (content.tipo === 'SERIE') {
        const serieKey = content.nome_serie || content.nome;
        if (!uniqueContents.has(serieKey)) {
          uniqueContents.set(serieKey, content);
        }
      } else {
        uniqueContents.set(content.id, content);
      }
    });

    // Segundo passo: agrupar por gênero
    Array.from(uniqueContents.values()).forEach((content) => {
      if (content.generos && Array.isArray(content.generos)) {
        content.generos.forEach((genero: string) => {
          if (genero) {
            genresSet.add(genero);

            if (!genreContentsMap[genero]) {
              genreContentsMap[genero] = [];
            }

            // Limitar a N conteúdos por gênero
            if (genreContentsMap[genero].length < limit) {
              genreContentsMap[genero].push(content);
            }
          }
        });
      }
    });

    // Ordenar gêneros alfabeticamente
    const sortedGenres = Array.from(genresSet).sort();

    // Pegar apenas os primeiros 10 gêneros
    const topGenres = sortedGenres.slice(0, 10);
    const filteredGenreContents: Record<string, any[]> = {};

    topGenres.forEach((genre) => {
      if (genreContentsMap[genre]) {
        filteredGenreContents[genre] = genreContentsMap[genre];
      }
    });

    return NextResponse.json({
      genreContents: filteredGenreContents,
      genres: sortedGenres
    });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
