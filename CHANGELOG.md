# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- Fixed XSS vulnerability by enabling HTML sanitization in markdown rendering
- Added proper input validation for dynamic routes

### Changed
- Removed console.error statements in production code
- Fixed ESLint violations (proper Link usage, escaped quotes)
- Cleaned up commented code and improved code quality
- Added useCallback hook for better performance in photo viewer

### Fixed
- Fixed Next.js Link component usage for internal navigation
- Fixed React hooks dependency warnings
- Fixed unescaped entities in JSX

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