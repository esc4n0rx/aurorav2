import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar novidades (ordenado por created_at)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Limite máximo de conteúdos únicos a retornar
    const maxResults = parseInt(searchParams.get('limit') || '500');

    // Criar cliente com service role para acesso total
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Buscar mais registros para compensar agrupamento de séries
    // Se temos muitos episódios, precisamos buscar mais para ter 500 únicos
    const { data, error, count } = await supabase
      .from('contents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(1000); // Buscar 1000 para garantir 500 únicos após agrupamento

    if (error) {
      console.error('Erro ao buscar novidades:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar novidades', details: error.message },
        { status: 500 }
      );
    }

    // Para séries, agrupar por nome_serie para mostrar apenas 1 card
    const uniqueContents = [];
    const seenSeries = new Set();

    for (const content of data || []) {
      // Parar se já temos o máximo de resultados
      if (uniqueContents.length >= maxResults) break;

      if (content.tipo === 'SERIE') {
        const seriesKey = content.nome_serie || content.nome;
        if (!seenSeries.has(seriesKey)) {
          seenSeries.add(seriesKey);
          uniqueContents.push(content);
        }
      } else {
        uniqueContents.push(content);
      }
    }

    const response = NextResponse.json({
      contents: uniqueContents,
      total: uniqueContents.length,
      totalInDb: count || 0
    });
    // Cache por 30 segundos
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
