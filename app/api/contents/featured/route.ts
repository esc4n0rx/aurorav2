import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET - Buscar conteúdos em destaque
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
      .eq('destaque', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar conteúdos em destaque:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar conteúdos em destaque', details: error.message },
        { status: 500 }
      );
    }

    // Debug: Verificar se os IDs estão presentes
    if (data && data.length > 0) {
      console.log('Primeiro conteúdo em destaque:', {
        id: data[0].id,
        nome: data[0].nome,
        hasId: !!data[0].id
      });
    }

    return NextResponse.json({ contents: data || [] });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
