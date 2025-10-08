import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { enhancedClassifyArticle } from '@/lib/ai/enhanced-classifier';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    // Fetch article
    const { data: article, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Enhanced classification
    const classification = await enhancedClassifyArticle(
      article.title,
      article.content || article.excerpt || ''
    );

    // Update article with enhanced data
    const { error: updateError } = await supabaseAdmin
      .from('articles')
      .update({
        category: classification.category,
        subcategory: classification.subcategory,
        sentiment: classification.sentiment,
        keywords: classification.keywords,
        relevance_score: classification.relevance_score,
        status: 'classified',
        // Store additional data in a JSON field if needed
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      classification,
    });
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}