/**
 * Text Normalization for TTS (Text-to-Speech)
 *
 * Purpose: Clean and optimize text before sending to TTS engine
 * - Remove citations and markdown (visual elements)
 * - Add natural fillers for conversational tone
 * - Normalize Korean text patterns
 * - Fix punctuation for natural prosody
 */

export interface NormalizationOptions {
  removeCitations?: boolean;      // Remove [출처 N] patterns
  removeMarkdown?: boolean;       // Remove *, _, `, etc.
  fixPunctuation?: boolean;       // Fix spacing around punctuation
  addFillers?: boolean;           // Add strategic fillers (음, 아, etc.)
  normalizeKorean?: boolean;      // Korean-specific normalization
  maxSentenceLength?: number;     // Split long sentences (future)
}

export interface NormalizationResult {
  original: string;
  normalized: string;
  changes: {
    citationsRemoved: number;
    markdownRemoved: number;
    fillersAdded: number;
    sentencesSplit: number;
  };
}

const DEFAULT_OPTIONS: NormalizationOptions = {
  removeCitations: true,
  removeMarkdown: true,
  fixPunctuation: true,
  addFillers: true,
  normalizeKorean: true,
  maxSentenceLength: 150,
};

/**
 * Main normalization function
 */
export function normalizeForTTS(
  text: string,
  options?: NormalizationOptions
): NormalizationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let normalized = text;

  const changes = {
    citationsRemoved: 0,
    markdownRemoved: 0,
    fillersAdded: 0,
    sentencesSplit: 0,
  };

  // Step 1: Remove citations
  if (opts.removeCitations) {
    const result = removeCitations(normalized);
    normalized = result.text;
    changes.citationsRemoved = result.count;
  }

  // Step 2: Remove markdown
  if (opts.removeMarkdown) {
    const result = removeMarkdown(normalized);
    normalized = result.text;
    changes.markdownRemoved = result.count;
  }

  // Step 3: Fix punctuation
  if (opts.fixPunctuation) {
    normalized = fixPunctuation(normalized);
  }

  // Step 4: Normalize Korean patterns
  if (opts.normalizeKorean) {
    normalized = normalizeKoreanText(normalized);
  }

  // Step 5: Add strategic fillers (last step to avoid breaking other patterns)
  if (opts.addFillers) {
    const result = addStrategicFillers(normalized);
    normalized = result.text;
    changes.fillersAdded = result.count;
  }

  // Final cleanup
  normalized = cleanupWhitespace(normalized);

  return {
    original: text,
    normalized,
    changes,
  };
}

/**
 * Remove citation patterns like [출처 1], [source 2], [1], etc.
 */
export function removeCitations(text: string): { text: string; count: number } {
  let count = 0;

  const patterns = [
    /\[출처\s*\d+\]/g,       // [출처 1], [출처 2]
    /\[source\s*\d+\]/gi,    // [source 1], [Source 2]
    /\[\d+\]/g,              // [1], [2]
  ];

  let result = text;

  patterns.forEach(pattern => {
    const matches = result.match(pattern);
    if (matches) {
      count += matches.length;
      result = result.replace(pattern, '');
    }
  });

  return { text: result, count };
}

/**
 * Remove markdown formatting
 * Order matters: code blocks → inline code → bold → italic
 */
export function removeMarkdown(text: string): { text: string; count: number } {
  let count = 0;
  let result = text;

  const patterns = [
    // Code blocks: ```code```
    { pattern: /```[\s\S]*?```/g, replacement: (match: string) => {
      count++;
      return match.replace(/```/g, '');
    }},

    // Inline code: `code`
    { pattern: /`([^`]+)`/g, replacement: (match: string, p1: string) => {
      count++;
      return p1;
    }},

    // Bold: **text** or __text__
    { pattern: /\*\*([^*]+)\*\*/g, replacement: (match: string, p1: string) => {
      count++;
      return p1;
    }},
    { pattern: /__([^_]+)__/g, replacement: (match: string, p1: string) => {
      count++;
      return p1;
    }},

    // Italic: *text* or _text_ (only if not part of bold)
    { pattern: /(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, replacement: (match: string, p1: string) => {
      count++;
      return p1;
    }},
    { pattern: /(?<!_)_(?!_)([^_]+)_(?!_)/g, replacement: (match: string, p1: string) => {
      count++;
      return p1;
    }},

    // Links: [text](url)
    { pattern: /\[([^\]]+)\]\([^)]+\)/g, replacement: (match: string, p1: string) => {
      count++;
      return p1;
    }},

    // Headings: ## Title
    { pattern: /^#{1,6}\s+/gm, replacement: () => {
      count++;
      return '';
    }},
  ];

  patterns.forEach(({ pattern, replacement }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result = result.replace(pattern, replacement as any);
  });

  return { text: result, count };
}

/**
 * Fix punctuation spacing for natural prosody
 */
export function fixPunctuation(text: string): string {
  let result = text;

  // Ensure space after sentence-ending punctuation
  result = result.replace(/([.!?])\s*/g, '$1 ');

  // Ensure space after commas and semicolons
  result = result.replace(/([,;])\s*/g, '$1 ');

  // Remove space before punctuation
  result = result.replace(/\s+([.!?,;])/g, '$1');

  // Korean full-stop punctuation
  result = result.replace(/([。!?])\s*/g, '$1 ');

  return result;
}

/**
 * Add strategic fillers for natural conversational tone
 * Rules:
 * - Max 1-2 fillers per response
 * - Strategic placement (sentence start, after conjunctions)
 * - Probabilistic (not every pattern gets filler)
 */
export function addStrategicFillers(text: string): { text: string; count: number } {
  let result = text;
  let count = 0;
  const MAX_FILLERS = 2;

  // Filler rules with probabilities
  const rules = [
    // Sentence start with demonstratives (20% probability)
    {
      pattern: /^(그거|그게|이거|저거|이게)\s/,
      filler: '음, ',
      probability: 0.2,
    },

    // After "근데" or "그런데" (30% probability)
    {
      pattern: /(근데|그런데)\s+/,
      filler: '$1 어... ',
      probability: 0.3,
    },

    // Question ending (50% probability)
    {
      pattern: /\?$/,
      filler: '? 응?',
      probability: 0.5,
    },
  ];

  rules.forEach(rule => {
    if (count >= MAX_FILLERS) return;

    const match = result.match(rule.pattern);
    if (match && Math.random() < rule.probability) {
      result = result.replace(rule.pattern, rule.filler);
      count++;
    }
  });

  return { text: result, count };
}

/**
 * Normalize Korean text patterns
 */
export function normalizeKoreanText(text: string): string {
  let result = text;

  // Remove space before Korean particles (조사)
  const particles = ['은', '는', '이', '가', '을', '를', '와', '과', '도', '만', '에', '에서', '한테', '께', '로', '으로'];
  particles.forEach(particle => {
    const pattern = new RegExp(`\\s+(${particle})(?!\\p{L})`, 'gu');
    result = result.replace(pattern, particle);
  });

  // Add space between number and counter
  result = result.replace(/(\d+)(개|명|번|살|원|시|분|초|층|권|병|잔|대)/g, '$1 $2');

  // Normalize Korean quotation marks
  result = result.replace(/[""]([^""]+)[""]/g, '"$1"');

  return result;
}

/**
 * Split long sentences (future enhancement)
 */
export function splitLongSentences(text: string, _maxLength: number): { text: string; count: number } {
  // TODO: Implement smart sentence splitting
  // For now, just return as-is
  return { text, count: 0 };
}

/**
 * Cleanup excessive whitespace
 */
function cleanupWhitespace(text: string): string {
  let result = text;

  // Replace multiple spaces with single space
  result = result.replace(/\s{2,}/g, ' ');

  // Remove space at start of line
  result = result.replace(/^\s+/gm, '');

  // Remove space at end of line
  result = result.replace(/\s+$/gm, '');

  // Trim
  result = result.trim();

  return result;
}

