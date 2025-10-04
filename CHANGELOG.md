# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **RSS Feed Integration**: Full article content extraction from RSS feeds for prompt testing
- **Batch Processing**: Category-based prompt processing with batch API calls
- **Prompt History**: Save and load prompt history for each category
- **Category-Specific Prompts**: Customizable system prompts per news category

### Changed
- **Prompt Editor UI**: Streamlined 2-column layout with tabbed interface
- **Morning Page Integration**: Connected prompt editor to morning dashboard
- **AI Integration**: Real OpenAI API integration replacing mock implementations

### Fixed
- **Cron Job Security**: Enabled production authentication for `/api/cron/scrape-news`
- **TypeScript Errors**: Resolved type errors across dashboard and API routes
- **Next.js 15 Compatibility**: Fixed async params type signatures
- **Build Configuration**: Added TypeScript error bypass for development
- **Content Extraction**: Fixed nullable property handling in article extractor
- **Hydration Errors**: Resolved React hydration mismatches in prompt editor

### Refactored
- **Debug Logging**: Removed console.log/error statements from production code
- **Error Handling**: Cleaned up unused error variables and improved consistency
- **Code Quality**: Removed unused imports and commented code

### Security
- **DOS Prevention**: Enabled authentication on expensive scraping operations
- **Rate Limiting**: Proper rate limiting for web scraping operations (1-3s delays)
- **Error Information**: Removed error message leakage in API responses

### Removed
- **Visitor Counter**: Removed visitor counter component from profile section
- **Copyright Footer**: Removed "© 2024 · Seoul / NYC" text
- **Unused Components**: Deleted VisitorCounter, wheel-carousel, and utils.ts
- **Unused Dependencies**: Removed 6 unused npm packages (@fontsource/jetbrains-mono, class-variance-authority, clsx, date-fns, reading-time, tailwind-merge)
- Individual post pages (now part of continuous feed)
- Posts list page (integrated into homepage)
- Hardcoded intro content (now in markdown file)
- Obsidian Git plugin files

## [1.2.0] - 2024-12-27

### Changed
- Switched to NanumMyeongjoOldHangeul font for traditional Korean typography
- Previously tested BonmyeongjoSourceHanSerif and BookkMyungjo fonts

## [1.1.0] - 2024-12-27

### Added
- Minimal design improvements across the site
- Increased font weights to maximum (font-black) for all titles

### Removed
- Removed "새 글 작성" (New Post) buttons from home and posts pages
- Removed tags display from post listings and individual posts
- Removed decorative elements (blockquotes, separators) for cleaner design

### Changed
- Simplified home page layout with minimal styling
- Enhanced typography with bolder headings throughout

## [1.0.0] - 2024-12-27

### Added
- Initial blog setup with minimal black and white design
- Markdown support with Obsidian syntax compatibility
- RIDIBatang font integration
- Post listing and individual post pages
- Static site generation with Next.js 15
- Tailwind CSS for styling

### Features
- Clean, text-first design philosophy
- Korean and English content support
- Responsive layout
- Fast page loads with SSG