import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar estatísticas do usuário
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Buscar histórico de visualização com dados do conteúdo
    const { data: watchHistory, error: historyError } = await supabase
      .from('watch_history')
      .select(`
        *,
        content:contents(tipo, duracao)
      `)
      .eq('user_id', userId);

    if (historyError) {
      console.error('Erro ao buscar histórico:', historyError);
      return NextResponse.json(
        { error: 'Erro ao buscar estatísticas', details: historyError.message },
        { status: 500 }
      );
    }

    // Buscar watchlist
    const { data: watchlist, error: watchlistError } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', userId);

    if (watchlistError) {
      console.error('Erro ao buscar watchlist:', watchlistError);
    }

    // Calcular estatísticas
    let moviesWatched = 0;
    let seriesWatched = 0;
    let totalMinutes = 0;

    const uniqueContent = new Map();

    watchHistory?.forEach((item: any) => {
      if (!item.content) return;

      // Contar conteúdos únicos assistidos (com progresso > 10%)
      if (item.progress_percent > 10 && !uniqueContent.has(item.content_id)) {
        uniqueContent.set(item.content_id, true);

        if (item.content.tipo === 'FILME') {
          moviesWatched++;
        } else if (item.content.tipo === 'SERIE') {
          seriesWatched++;
        }
      }

      // Calcular tempo total assistido
      // duration está em segundos, converter para minutos
      const watchedSeconds = (item.duration || 0) * (item.progress_percent / 100);
      totalMinutes += watchedSeconds / 60;
    });

    // Converter minutos para horas
    const totalHours = Math.round(totalMinutes / 60);

    const stats = {
      movies_watched: moviesWatched,
      series_watched: seriesWatched,
      total_hours: totalHours,
      saved_content: watchlist?.length || 0
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
