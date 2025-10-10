# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2025-10-10] - GitHub Integration & Terminal UI

### Added
- **GitHub Profile Integration**: `/github` command displays comprehensive developer stats
  - Real commit counts via Contributors API (not just event estimates)
  - Productivity metrics: weekly average, active days, current/longest streaks
  - Top contributions breakdown (personal & organization repositories)
  - Tech stack visualization with percentage bars
  - Impact summary: code additions, files changed, average PR size
  - Collaboration stats: PR merge rates, issues closed
  - 5-minute caching to reduce API calls and avoid rate limits
- **Matrix Rain Effect**: `/matrix` command toggles animated background
  - Blog-related keywords and tech terms in falling characters
  - Transparent canvas overlay with fade trails
  - Integrates with terminal theme
- **Terminal Profile**: Updated welcome message
  - Current project: Lerp (editor for engaging journalism)
  - Past work: DISQUIET (Korea's largest startup community)
  - Removed excessive ASCII art for cleaner interface

### Changed
- Parallelized GitHub API calls for 10x faster data fetching
  - Sequential loops replaced with Promise.all()
  - Personal and organization repos fetched concurrently
- Improved TypeScript type safety
  - Replaced all `any` types with proper interfaces
  - Added GitHubStats, GitHubOrganization, GitHubItem interfaces
- Removed debug console logs from production
- Simplified terminal greeting and command structure

### Fixed
- Hydration warnings with suppressHydrationWarning on time display
- Type safety issues in GitHub API route
- Unused variable warnings (checkDate, error handlers)

### Performance
- **API Optimization**: Parallel fetch reduces GitHub data load time by ~90%
- **Caching**: In-memory cache prevents redundant API calls for 5 minutes
- **Rate Limiting**: Stays well within GitHub's 5000 req/hour limit

### Security
- Removed sensitive token logging from production
- Added proper error handling for failed API requests
- Environment variables properly validated

## [2025-10-09] - Cost Optimization

### Changed
- **Cost Optimization**: Replaced Anthropic Claude with OpenAI GPT-4o-mini for contextual retrieval
  - 82% cost reduction (\$0.152 → \$0.027 per 100 calls)
  - Faster processing (200ms → 100ms rate limiting)
  - Maintained quality with more affordable model

### Removed
- @anthropic-ai/sdk dependency
- ANTHROPIC_API_KEY requirement

## [2025-10-09] - Streaming & Markdown

### Added
- **Streaming Response**: Real-time message streaming from OpenAI
  - First response appears in 1-2 seconds (vs 20-30 seconds before)
  - Typing cursor animation during streaming
  - Smooth user experience similar to ChatGPT
- **Markdown Rendering**: Full markdown support in chat messages
  - Syntax highlighting for code blocks (VS Code Dark+ theme)
  - Code copy button functionality
  - Support for headers, lists, links, tables, quotes
  - Inline code highlighting
- **Enhanced UI**: Improved chat interface with better visual feedback

### Changed
- Chat API now returns Server-Sent Events (SSE) instead of JSON
- Frontend reads streaming data in real-time
- Messages update incrementally as they arrive

## [2025-10-09] - Chat History

### Added
- **localStorage Persistence**: Chat history persists across page refreshes
  - Automatic save on message changes
  - Automatic load on page mount
  - Error handling for corrupted data
- **Clear History Button**: Added UI button to reset conversation
  - Confirmation dialog before deletion
  - Removes all messages from both state and localStorage

## [2025-10-09] - Initial RAG Chat

### Added
- **RAG-based Chat System**: Intelligent chat powered by vector search
  - Question embedding with OpenAI text-embedding-3-small
  - Vector search in Supabase with cosine similarity
  - Context-aware responses using GPT-4o-mini
  - Source attribution in responses
- **Contextual Retrieval**: Enhanced search with document context
  - Each chunk includes generated context about the document
  - Improved search relevance
  - Better answer quality

### Technical Details
- Next.js 15.4.6 API routes
- Supabase for vector storage
- OpenAI for embeddings and completions
- React with TypeScript for frontend
- Lucide React icons

---

## Notes

### Performance Improvements in This Release
- **Stream Response**: 10x faster perceived speed (1-2s vs 20-30s)
- **Cost Reduction**: 82% savings on contextual retrieval
- **Search Quality**: 50% match threshold improves relevance
- **localStorage**: Debounced saves reduce write frequency

### Security Improvements
- Environment validation prevents crashes
- Input validation prevents abuse
- Development-only logging protects user data
- Type safety prevents runtime errors

### Breaking Changes
- Match threshold increased from 0.2 to 0.5
  - May return fewer but more relevant documents
  - Update threshold in constants if needed

---

Generated: 2025-10-09
