import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar watchlist do usuário
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

    // Criar cliente com service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Buscar watchlist com join dos conteúdos
    const { data, error } = await supabase
      .from('watchlist')
      .select(`
        id,
        user_id,
        content_id,
        added_at,
        contents (*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar watchlist:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar watchlist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ watchlist: data || [] });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Adicionar conteúdo à watchlist
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📥 POST /api/watchlist - Body recebido:', body);

    const { userId, contentId } = body;

    console.log('Valores extraídos:', { userId, contentId });

    if (!userId || !contentId) {
      console.error('❌ Campos faltando:', { userId, contentId });
      return NextResponse.json(
        { error: 'userId e contentId são obrigatórios', received: { userId, contentId } },
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

    // Inserir na watchlist
    console.log('Inserindo na watchlist:', { user_id: userId, content_id: contentId });

    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        user_id: userId,
        content_id: contentId
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro do Supabase:', error);

      // Se já existe, retornar erro específico
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Conteúdo já está na lista' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Erro ao adicionar à watchlist', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    console.log('✅ Adicionado com sucesso:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover conteúdo da watchlist
export async function DELETE(request: Request) {
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

    // Remover da watchlist
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) {
      console.error('Erro ao remover da watchlist:', error);
      return NextResponse.json(
        { error: 'Erro ao remover da watchlist', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
