import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('instagram_posts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Instagram post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Instagram post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('instagram_posts')
      .update({
        title: body.title,
        caption: body.caption,
        hashtags: body.hashtags,
        content_type: body.content_type,
        scheduled_for: body.scheduled_for,
        status: body.scheduled_for ? 'scheduled' : 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    // Update article status if scheduled
    if (body.scheduled_for && body.article_id) {
      await supabaseAdmin
        .from('articles')
        .update({
          status: 'generated',
          updated_at: new Date().toISOString()
        })
        .eq('id', body.article_id);
    }

    return NextResponse.json({
      success: true,
      post: data
    });

  } catch (error) {
    console.error('Error updating Instagram post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update Instagram post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('instagram_posts')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Instagram post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete Instagram post' },
      { status: 500 }
    );
  }
}