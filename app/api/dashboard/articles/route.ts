import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: articles, error } = await supabaseAdmin
      .from('articles')
      .select(`
        id,
        title,
        description,
        url,
        source,
        category,
        created_at,
        thumbnail,
        keywords,
        sentiment,
        relevance_score,
        summary,
        status,
        instagram_post_id
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      articles: articles || [],
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}