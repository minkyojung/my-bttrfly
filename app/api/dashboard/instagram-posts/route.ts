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
          url,
          thumbnail,
          source
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching posts:', error);
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          posts: [],
        });
      }
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: post, error } = await supabaseAdmin
      .from('instagram_posts')
      .insert({
        title: body.title,
        caption: body.caption,
        hashtags: body.hashtags,
        format: body.format || 'post',
        article_id: body.originalArticle?.id || body.articleId,
        status: body.status || 'review',
        scheduled_for: body.scheduledFor,
        thumbnail: body.originalArticle?.thumbnail || body.thumbnail,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      // If table doesn't exist, return mock response
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          post: {
            id: `mock-${Date.now()}`,
            ...body,
            created_at: new Date().toISOString(),
          },
        });
      }
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    // Update article to mark it has an instagram post
    if (body.originalArticle?.id) {
      await supabaseAdmin
        .from('articles')
        .update({ instagram_post_id: post.id })
        .eq('id', body.originalArticle.id);
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}