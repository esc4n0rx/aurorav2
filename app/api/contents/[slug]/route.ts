import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar conteúdo por slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await params (Next.js 15+)
    const { slug } = await params;

    // Criar cliente com service role para acesso total
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Buscar todos os conteúdos com esse slug (pode ter vários para séries)
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('slug', slug)
      .order('temporada', { ascending: true })
      .order('episodio', { ascending: true });

    if (error) {
      console.error('Erro ao buscar conteúdo:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar conteúdo', details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      );
    }

    // Pegar o primeiro resultado como conteúdo principal
    const content = data[0];

    // Debug: Verificar se o ID está presente
    console.log('Conteúdo encontrado:', {
      id: content.id,
      nome: content.nome,
      hasId: !!content.id
    });

    // Se for uma série, retornar todos os episódios
    let episodes = null;
    if (content.tipo === 'SERIE') {
      episodes = data;
    }

    return NextResponse.json({ content, episodes });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
