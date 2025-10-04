import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('instagram_posts')
      .select(`
        *,
        articles:article_id (
          title,
          category,
          url
        )
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
      posts: posts || [],
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}