import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

const USER_ID = 'default'; // 추후 인증 시스템 추가시 변경

// GET: 모든 사용자 프롬프트 가져오기
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_prompts')
      .select('*')
      .eq('user_id', USER_ID);

    if (error) throw error;

    return NextResponse.json({ prompts: data || [] });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST: 프롬프트 저장/업데이트 (upsert)
export async function POST(request: Request) {
  try {
    const { category, systemPrompt } = await request.json();

    if (!category || !systemPrompt) {
      return NextResponse.json(
        { error: 'Category and systemPrompt are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('user_prompts')
      .upsert(
        {
          user_id: USER_ID,
          category,
          system_prompt: systemPrompt,
        },
        {
          onConflict: 'user_id,category',
        }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, prompt: data });
  } catch (error) {
    console.error('Error saving prompt:', error);
    return NextResponse.json(
      { error: 'Failed to save prompt' },
      { status: 500 }
    );
  }
}
