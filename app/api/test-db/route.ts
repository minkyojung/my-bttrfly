import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    // 1. Supabase 연결 테스트
    const { data: tables, error: tableError } = await supabaseAdmin
      .from('articles')
      .select('*')
      .limit(1);

    if (tableError) {
      return NextResponse.json({
        success: false,
        step: 'Database connection',
        error: tableError.message,
        details: tableError,
      });
    }

    // 2. 테이블에 테스트 데이터 삽입
    const testArticle = {
      url: `https://test.com/article-${Date.now()}`,
      title: `테스트 기사 ${new Date().toLocaleTimeString()}`,
      content: '이것은 테스트 기사입니다.',
      excerpt: '테스트 발췌문',
      source: 'Test Source',
      status: 'pending',
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('articles')
      .insert(testArticle)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({
        success: false,
        step: 'Insert test data',
        error: insertError.message,
        details: insertError,
      });
    }

    // 3. 전체 기사 개수 확인
    const { count, error: countError } = await supabaseAdmin
      .from('articles')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      testInserted: inserted,
      totalArticles: count,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}