import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST - Adicionar/Atualizar progresso de visualização
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, content_id, current_t, duration } = body;

    if (!user_id || !content_id) {
      return NextResponse.json(
        { error: 'user_id e content_id são obrigatórios' },
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

    // Calcular progresso percentual
    const progress_percent = duration > 0
      ? Math.min(100, Math.round((current_t / duration) * 100))
      : 0;

    const completed = progress_percent >= 90;

    // Verificar se já existe registro
    const { data: existing, error: checkError } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user_id)
      .eq('content_id', content_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar histórico:', checkError);
      return NextResponse.json(
        { error: 'Erro ao verificar histórico' },
        { status: 500 }
      );
    }

    let result;

    if (existing) {
      // Atualizar registro existente
      const { data, error } = await supabase
        .from('watch_history')
        .update({
          current_t,
          duration,
          progress_percent,
          completed,
          watch_count: existing.watch_count + 1,
          last_watched_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar histórico:', error);
        return NextResponse.json(
          { error: 'Erro ao atualizar histórico' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Criar novo registro
      const { data, error } = await supabase
        .from('watch_history')
        .insert({
          user_id,
          content_id,
          current_t,
          duration,
          progress_percent,
          completed,
          watch_count: 1,
          first_watched_at: new Date().toISOString(),
          last_watched_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar histórico:', error);
        return NextResponse.json(
          { error: 'Erro ao criar histórico' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({ history: result });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Buscar histórico do usuário (Continue Assistindo)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id é obrigatório' },
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

    // Buscar histórico com dados do conteúdo (JOIN)
    // Filtrar apenas conteúdos não completados e com progresso > 0.5%
    const { data, error } = await supabase
      .from('watch_history')
      .select(`
        *,
        content:contents(*)
      `)
      .eq('user_id', user_id)
      .eq('completed', false)
      .gt('progress_percent', 0.5)
      .order('last_watched_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar histórico' },
        { status: 500 }
      );
    }

    return NextResponse.json({ history: data || [] });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
