import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Verificar se conteúdo está na watchlist
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const contentId = searchParams.get('contentId');

    if (!userId || !contentId) {
      return NextResponse.json(
        { error: 'userId e contentId são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar cliente com service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verificar se existe
    const { data, error } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar watchlist:', error);
      return NextResponse.json(
        { error: 'Erro ao verificar watchlist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ inWatchlist: !!data });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
