import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { fetchRSSFeed } from '@/lib/scraping/rss-fetcher';
import { extractArticleContent } from '@/lib/extraction/content-extractor';
import { getEnabledSources } from '@/lib/config/rss-sources';

interface ProcessResult {
  source: string;
  title: string;
  status: 'saved' | 'skipped' | 'failed' | 'error';
  id?: string;
  contentLength?: number;
  extractionStatus?: string;
  error?: string;
  reason?: string;
}

/**
 * Multi-source RSS scraper with parallel processing
 */
export async function GET(request: NextRequest) {
  console.log('🚀 Starting multi-source RSS scraping...');

  try {
    const sources = getEnabledSources();
    console.log(`📡 Fetching from ${sources.length} sources...`);

    // Parallel fetch from all sources
    const sourceResults = await Promise.allSettled(
      sources.map(async (source) => {
        try {
          console.log(`📰 Fetching ${source.name}...`);
          const articles = await fetchRSSFeed(source.url);

          // Process limited number of articles per source
          const articlesToProcess = articles.slice(0, source.limit);

          const results: ProcessResult[] = [];

          for (const article of articlesToProcess) {
            try {
              // Check for duplicates
              const { data: existing } = await supabaseAdmin
                .from('articles')
                .select('id')
                .eq('url', article.link)
                .single();

              if (existing) {
                results.push({
                  source: source.name,
                  title: article.title,
                  status: 'skipped',
                  reason: 'Already exists',
                });
                continue;
              }

              // Extract full content
              let fullContent = article.content || article.title;
              let htmlContent = '';
              let thumbnail = article.thumbnail;
              let extractionStatus = 'rss';

              // Extract full content if RSS summary is short
              if (fullContent.length < 500) {
                try {
                  const extracted = await extractArticleContent(article.link);

                  if (extracted && extracted.content) {
                    fullContent = extracted.content;
                    htmlContent = extracted.html; // Save HTML with images
                    thumbnail = extracted.thumbnail || thumbnail;
                    extractionStatus = 'extracted';
                    console.log(`✅ [${source.name}] ${extracted.content.length} chars`);
                  }
                } catch (extractError) {
                  console.log(`⚠️ [${source.name}] Extraction failed, using RSS`);
                }
              }

              // Save to DB
              const { data: saved, error } = await supabaseAdmin
                .from('articles')
                .insert({
                  url: article.link,
                  title: article.title,
                  content: fullContent,
                  html_content: htmlContent,
                  excerpt: fullContent.substring(0, 300),
                  thumbnail_url: thumbnail,
                  source: source.name,
                  category: source.category,
                  published_at: article.pubDate,
                  status: 'pending',
                })
                .select()
                .single();

              if (error) {
                console.error(`❌ [${source.name}] Insert error:`, error);
                results.push({
                  source: source.name,
                  title: article.title,
                  status: 'failed',
                  error: error.message,
                });
              } else {
                results.push({
                  source: source.name,
                  title: article.title,
                  status: 'saved',
                  id: saved.id,
                  contentLength: fullContent.length,
                  extractionStatus,
                });
              }
            } catch (err) {
              console.error(`❌ [${source.name}] Article error:`, err);
              results.push({
                source: source.name,
                title: article.title,
                status: 'error',
                error: err instanceof Error ? err.message : 'Unknown error',
              });
            }
          }

          return {
            source: source.name,
            totalFound: articles.length,
            processed: results.length,
            results,
          };
        } catch (sourceError) {
          console.error(`❌ [${source.name}] Source failed:`, sourceError);
          return {
            source: source.name,
            error: sourceError instanceof Error ? sourceError.message : 'Unknown error',
            results: [],
          };
        }
      })
    );

    // Aggregate results
    const allResults = sourceResults
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);

    const totalProcessed = allResults.reduce((sum, r) => sum + r.processed, 0);
    const totalSaved = allResults.reduce(
      (sum, r) => sum + r.results.filter((a) => a.status === 'saved').length,
      0
    );

    console.log(`✅ Scraping complete: ${totalSaved}/${totalProcessed} saved from ${sources.length} sources`);

    return NextResponse.json({
      success: true,
      summary: {
        totalSources: sources.length,
        totalProcessed,
        totalSaved,
        totalSkipped: allResults.reduce(
          (sum, r) => sum + r.results.filter((a) => a.status === 'skipped').length,
          0
        ),
        totalFailed: allResults.reduce(
          (sum, r) => sum + r.results.filter((a) => a.status === 'failed').length,
          0
        ),
      },
      sources: allResults,
    });
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}