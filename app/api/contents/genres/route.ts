import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar gêneros únicos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo'); // FILME ou SERIE (opcional)

    // Criar cliente com service role para acesso total
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Buscar todos os conteúdos com generos
    let query = supabase
      .from('contents')
      .select('generos');

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar gêneros:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar gêneros', details: error.message },
        { status: 500 }
      );
    }

    // Extrair e consolidar gêneros únicos
    const generosSet = new Set<string>();

    data?.forEach((content) => {
      if (content.generos && Array.isArray(content.generos)) {
        content.generos.forEach((genero: string) => {
          if (genero) {
            generosSet.add(genero);
          }
        });
      }
    });

    const generos = Array.from(generosSet).sort();

    return NextResponse.json({ generos });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
