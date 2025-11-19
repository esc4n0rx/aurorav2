import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar solicitações do usuário
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

    const { data, error } = await supabase
      .from('content_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar solicitações:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar solicitações', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ requests: data || [] });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova solicitação de conteúdo
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, contentName, contentType, sourceInfo } = body;

    if (!userId || !contentName || !contentType) {
      return NextResponse.json(
        { error: 'userId, contentName e contentType são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de conteúdo
    if (!['filme', 'serie'].includes(contentType)) {
      return NextResponse.json(
        { error: 'contentType deve ser "filme" ou "serie"' },
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

    // Verificar se já existe uma solicitação pendente para o mesmo conteúdo
    const { data: existing } = await supabase
      .from('content_requests')
      .select('id')
      .eq('user_id', userId)
      .ilike('content_name', contentName)
      .eq('status', 'pendente')
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Você já tem uma solicitação pendente para este conteúdo' },
        { status: 409 }
      );
    }

    // Criar solicitação
    const { data, error } = await supabase
      .from('content_requests')
      .insert({
        user_id: userId,
        content_name: contentName,
        content_type: contentType,
        source_info: sourceInfo || null,
        status: 'pendente'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar solicitação:', error);
      return NextResponse.json(
        { error: 'Erro ao criar solicitação', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, request: data });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
