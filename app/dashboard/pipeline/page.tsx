'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentItem {
  id: string;
  title: string;
  caption?: string;
  hashtags?: string[];
  format?: 'post' | 'reel' | 'story';
  status: 'news_pool' | 'ai_processing' | 'review' | 'ready' | 'scheduled' | 'posted';
  articleId: string;
  createdAt: string;
  scheduledFor?: string;
  thumbnail?: string;
  source?: string;
}

const PIPELINE_STAGES = [
  { id: 'news_pool', title: 'News Pool', color: 'bg-zinc-800' },
  { id: 'ai_processing', title: 'AI Processing', color: 'bg-zinc-700' },
  { id: 'review', title: 'Review & Edit', color: 'bg-zinc-700' },
  { id: 'ready', title: 'Ready to Post', color: 'bg-zinc-700' },
  { id: 'scheduled', title: 'Scheduled', color: 'bg-zinc-700' },
  { id: 'posted', title: 'Posted', color: 'bg-zinc-800' }
];

export default function ContentPipeline() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [editedContent, setEditedContent] = useState<ContentItem | null>(null);

  useEffect(() => {
    fetchPipelineItems();
  }, []);

  const fetchPipelineItems = async () => {
    try {
      // Fetch articles and instagram posts
      const [articlesRes, postsRes] = await Promise.all([
        fetch('/api/dashboard/articles'),
        fetch('/api/dashboard/instagram-posts')
      ]);

      const articlesData = await articlesRes.json();
      const postsData = await postsRes.json();

      // Convert articles to pipeline items
      const newsPoolItems: ContentItem[] = articlesData.articles?.filter((a: { instagram_post_id?: string }) => !a.instagram_post_id).map((article: { id: string; title: string; created_at: string; thumbnail?: string; source?: string }) => ({
        id: `article-${article.id}`,
        title: article.title,
        status: 'news_pool',
        articleId: article.id,
        createdAt: article.created_at,
        thumbnail: article.thumbnail,
        source: article.source
      })) || [];

      // Convert posts to pipeline items
      const postItems: ContentItem[] = postsData.posts?.map((post: { id: string; title: string; caption?: string; hashtags?: string; format?: string; status?: string; scheduled_for?: string; image_url?: string; alt_text?: string; article_id?: string; created_at?: string; thumbnail?: string }) => ({
        id: `post-${post.id}`,
        title: post.title,
        caption: post.caption,
        hashtags: post.hashtags,
        format: post.format,
        status: post.status || 'review',
        articleId: post.article_id,
        createdAt: post.created_at,
        scheduledFor: post.scheduled_for,
        thumbnail: post.thumbnail
      })) || [];

      setItems([...newsPoolItems, ...postItems]);
    } catch (error) {
      console.error('Failed to fetch pipeline items:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveItem = async (itemId: string, newStatus: string) => {
    // Update local state
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, status: newStatus as ContentItem['status'] } : item
    ));

    // Update in database
    if (itemId.startsWith('post-')) {
      const postId = itemId.replace('post-', '');
      await fetch(`/api/dashboard/instagram-posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    }
  };

  const getItemsByStatus = (status: string) => {
    return items.filter(item => item.status === status);
  };

  const handleSaveChanges = async () => {
    if (!editedContent || !selectedItem) return;

    try {
      if (selectedItem.id.startsWith('post-')) {
        const postId = selectedItem.id.replace('post-', '');
        await fetch(`/api/dashboard/instagram-posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editedContent.title,
            caption: editedContent.caption,
            hashtags: editedContent.hashtags,
            format: editedContent.format
          })
        });
      }

      // Update local state
      setItems(prev => prev.map(item =>
        item.id === selectedItem.id ? editedContent : item
      ));

      setSelectedItem(null);
      setEditedContent(null);
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-sm text-zinc-400">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Kanban Board */}
      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <div className={`${stage.color} rounded-t-md px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-white">{stage.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-zinc-900 text-zinc-300 rounded">
                    {getItemsByStatus(stage.id).length}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-b-md min-h-[600px] p-3 space-y-3 border-x border-b border-zinc-800">
                {getItemsByStatus(stage.id).map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-950 rounded-md p-3 cursor-pointer border border-zinc-900 hover:border-zinc-700 transition-all group"
                    onClick={() => {
                      setSelectedItem(item);
                      setEditedContent(item);
                    }}
                  >
                    {/* Thumbnail */}
                    {item.thumbnail && (
                      <div className="mb-2 rounded overflow-hidden bg-zinc-800">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    <h4 className="text-xs font-medium text-white mb-2 line-clamp-2">
                      {item.title}
                    </h4>

                    {item.caption && (
                      <p className="text-xs text-zinc-400 mb-2 line-clamp-2">
                        {item.caption}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        {item.source || item.format || 'article'}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.scheduledFor && (
                      <div className="mt-2 text-xs text-zinc-400">
                        📅 {new Date(item.scheduledFor).toLocaleString()}
                      </div>
                    )}

                    {/* Move Actions */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {PIPELINE_STAGES.filter(s => s.id !== stage.id).slice(0, 2).map((targetStage) => (
                        <button
                          key={targetStage.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveItem(item.id, targetStage.id);
                          }}
                          className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
                        >
                          → {targetStage.title.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Dock - Fixed Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-zinc-900/90 backdrop-blur-lg border border-zinc-800 rounded-lg shadow-xl p-2">
          <div className="flex items-center gap-4">
            {/* Navigation */}
            <nav className="flex items-center gap-1">
              <a href="/dashboard/morning" className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all">
                Feed
              </a>
              <a href="/dashboard/pipeline" className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-100 bg-zinc-800">
                Pipeline
              </a>
              <a href="/dashboard/news" className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all">
                Articles
              </a>
            </nav>

            {/* Divider */}
            <div className="w-px h-4 bg-zinc-700"></div>

            {/* Pipeline Stats */}
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span>{items.length} items</span>
              <span>•</span>
              <span>{getItemsByStatus('ready').length} ready</span>
              <span>•</span>
              <span>{getItemsByStatus('scheduled').length} scheduled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={() => {
          setSelectedItem(null);
          setEditedContent(null);
        }}
      >
        <DialogContent className="max-w-2xl p-0 gap-0 bg-zinc-900 border-zinc-800">
          <DialogTitle className="sr-only">Edit Content</DialogTitle>
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-white mb-1">
                Edit Content
              </h3>
              <p className="text-xs text-zinc-400">
                Review and edit your content before posting
              </p>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Title</label>
                  <input
                    type="text"
                    value={editedContent?.title || ''}
                    onChange={(e) => setEditedContent(prev => prev ? {...prev, title: e.target.value} : null)}
                    className="w-full px-3 py-2 text-sm border border-zinc-700 rounded bg-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                {/* Caption */}
                {editedContent?.caption !== undefined && (
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Caption</label>
                    <textarea
                      value={editedContent?.caption || ''}
                      onChange={(e) => setEditedContent(prev => prev ? {...prev, caption: e.target.value} : null)}
                      className="w-full px-3 py-2 text-sm border border-zinc-700 rounded bg-zinc-800 text-white focus:outline-none focus:border-zinc-500 resize-none"
                      rows={6}
                    />
                  </div>
                )}

                {/* Hashtags */}
                {editedContent?.hashtags && (
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Hashtags</label>
                    <input
                      type="text"
                      value={editedContent?.hashtags.join(', ') || ''}
                      onChange={(e) => setEditedContent(prev =>
                        prev ? {...prev, hashtags: e.target.value.split(',').map(h => h.trim())} : null
                      )}
                      className="w-full px-3 py-2 text-sm border border-zinc-700 rounded bg-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                )}

                {/* Format */}
                {editedContent?.format && (
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Format</label>
                    <div className="flex space-x-2">
                      {['post', 'reel', 'story'].map((format) => (
                        <button
                          key={format}
                          onClick={() => {
                            setEditedContent(prev => prev ? {...prev, format: format as 'post' | 'reel' | 'story'} : null);
                          }}
                          className={`text-xs px-3 py-1.5 rounded border transition-all ${
                            editedContent?.format === format
                              ? 'bg-white text-black border-white'
                              : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          {format.charAt(0).toUpperCase() + format.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scheduled Time */}
                {editedContent?.scheduledFor && (
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Scheduled For</label>
                    <input
                      type="datetime-local"
                      value={editedContent.scheduledFor}
                      onChange={(e) => setEditedContent(prev => prev ? {...prev, scheduledFor: e.target.value} : null)}
                      className="w-full px-3 py-2 text-sm border border-zinc-700 rounded bg-zinc-800 text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Move to Stage</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PIPELINE_STAGES.map((stage) => (
                      <button
                        key={stage.id}
                        onClick={() => {
                          setEditedContent(prev => prev ? {...prev, status: stage.id as ContentItem['status']} : null);
                        }}
                        className={`text-xs px-3 py-1.5 rounded border transition-all ${
                          editedContent?.status === stage.id
                            ? 'bg-white text-black border-white'
                            : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {stage.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setEditedContent(null);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveChanges}
                  className="text-xs py-1.5 px-4 bg-white text-black rounded hover:bg-zinc-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}