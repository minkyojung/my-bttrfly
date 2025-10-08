import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

const USER_ID = 'default'; // 추후 인증 시스템 추가시 변경

// GET: 특정 카테고리 프롬프트 가져오기
export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_prompts')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('category', params.category)
      .single();

    if (error) {
      // 프롬프트가 없으면 null 반환
      if (error.code === 'PGRST116') {
        return NextResponse.json({ prompt: null });
      }
      throw error;
    }

    return NextResponse.json({ prompt: data });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

// DELETE: 프롬프트 삭제 (기본값으로 리셋)
export async function DELETE(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('user_prompts')
      .delete()
      .eq('user_id', USER_ID)
      .eq('category', params.category);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
