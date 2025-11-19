import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar novidades (ordenado por created_at)
export async function GET() {
  try {
    // Criar cliente com service role para acesso total
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

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

    const response = NextResponse.json({ contents: uniqueContents });
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
