import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseUid, email, displayName, photoUrl } = body;

    if (!firebaseUid || !email) {
      return NextResponse.json(
        { error: 'Firebase UID e email são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // Verificar se o usuário já existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erro ao buscar usuário:', fetchError);
      return NextResponse.json(
        { error: 'Erro ao buscar usuário' },
        { status: 500 }
      );
    }

    let user;

    if (existingUser) {
      // Atualizar informações do usuário existente
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          email,
          display_name: displayName,
          photo_url: photoUrl,
          last_login: new Date().toISOString(),
        })
        .eq('firebase_uid', firebaseUid)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar usuário:', updateError);
        return NextResponse.json(
          { error: 'Erro ao atualizar usuário' },
          { status: 500 }
        );
      }

      user = updatedUser;
    } else {
      // Criar novo usuário
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          firebase_uid: firebaseUid,
          email,
          display_name: displayName,
          photo_url: photoUrl,
          last_login: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar usuário:', createError);
        return NextResponse.json(
          { error: 'Erro ao criar usuário' },
          { status: 500 }
        );
      }

      user = newUser;

      // Criar preferências padrão para o novo usuário
      await supabase.from('user_preferences').insert({
        user_id: newUser.id,
      });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Erro na API sync-user:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
