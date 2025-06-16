/**
 * Advanced search utilities for multi-field, fuzzy, and intelligent searching
 */

export interface SearchableField {
  key: string;
  weight: number; // Higher weight = more important for ranking
  transform?: (value: any) => string; // Optional transformation function
}

export interface SearchResult<T> {
  item: T;
  score: number; // Higher score = better match
  matchedFields: string[];
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a score between 0 and 1 (1 = exact match)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Normalize text for searching (lowercase, trim, remove special chars)
 */
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
}

/**
 * Tokenize search query into individual terms
 */
function tokenizeQuery(query: string): string[] {
  return normalizeText(query).split(' ').filter(term => term.length > 0);
}

/**
 * Check if a field value matches a search term with various matching strategies
 */
function matchField(fieldValue: string, searchTerm: string): { matches: boolean; score: number } {
  const normalizedField = normalizeText(fieldValue);
  const normalizedTerm = normalizeText(searchTerm);
  
  // Exact match (highest score)
  if (normalizedField === normalizedTerm) {
    return { matches: true, score: 1.0 };
  }
  
  // Contains match
  if (normalizedField.includes(normalizedTerm)) {
    const ratio = normalizedTerm.length / normalizedField.length;
    return { matches: true, score: 0.8 + (ratio * 0.2) }; // 0.8-1.0 based on term coverage
  }
  
  // Starts with match
  if (normalizedField.startsWith(normalizedTerm)) {
    return { matches: true, score: 0.7 };
  }
  
  // Fuzzy match (for typos)
  const similarity = calculateSimilarity(normalizedField, normalizedTerm);
  if (similarity >= 0.7) { // 70% similarity threshold
    return { matches: true, score: similarity * 0.6 }; // Max 0.6 for fuzzy matches
  }
  
  // Word boundary matches (e.g., "JS" matches "John Smith")
  const fieldWords = normalizedField.split(' ');
  const termChars = normalizedTerm.split('');
  
  if (termChars.length >= 2) {
    let wordIndex = 0;
    let charIndex = 0;
    
    for (const char of termChars) {
      let found = false;
      
      // Look for this character at the start of remaining words
      for (let i = wordIndex; i < fieldWords.length; i++) {
        if (fieldWords[i][0] === char) {
          wordIndex = i + 1;
          found = true;
          break;
        }
      }
      
      if (!found) break;
      charIndex++;
    }
    
    if (charIndex === termChars.length) {
      return { matches: true, score: 0.5 }; // Moderate score for acronym matches
    }
  }
  
  return { matches: false, score: 0 };
}

/**
 * Advanced search function that supports multi-field, fuzzy, and intelligent searching
 */
export function advancedSearch<T>(
  items: T[],
  query: string,
  searchableFields: SearchableField[],
  options: {
    minScore?: number; // Minimum score to include in results (default: 0.3)
    maxResults?: number; // Maximum number of results to return
    requireAllTerms?: boolean; // Whether all search terms must match (default: false)
  } = {}
): SearchResult<T>[] {
  const { minScore = 0.3, maxResults, requireAllTerms = false } = options;
  
  if (!query.trim()) return items.map(item => ({ item, score: 1, matchedFields: [] }));
  
  const searchTerms = tokenizeQuery(query);
  if (searchTerms.length === 0) return items.map(item => ({ item, score: 1, matchedFields: [] }));
  
  const results: SearchResult<T>[] = [];
  
  for (const item of items) {
    let totalScore = 0;
    let matchedTerms = 0;
    const matchedFields: string[] = [];
    
    // For each search term, find the best matching field
    for (const term of searchTerms) {
      let bestFieldScore = 0;
      let bestFieldKey = '';
      
      // Check each searchable field
      for (const field of searchableFields) {
        const fieldValue = field.transform 
          ? field.transform(item)
          : String((item as any)[field.key] || '');
        
        const { matches, score } = matchField(fieldValue, term);
        
        if (matches) {
          const weightedScore = score * field.weight;
          if (weightedScore > bestFieldScore) {
            bestFieldScore = weightedScore;
            bestFieldKey = field.key;
          }
        }
      }
      
      if (bestFieldScore > 0) {
        totalScore += bestFieldScore;
        matchedTerms++;
        if (!matchedFields.includes(bestFieldKey)) {
          matchedFields.push(bestFieldKey);
        }
      }
    }
    
    // Calculate final score
    let finalScore = 0;
    if (requireAllTerms) {
      // All terms must match
      if (matchedTerms === searchTerms.length) {
        finalScore = totalScore / searchTerms.length;
      }
    } else {
      // At least one term must match
      if (matchedTerms > 0) {
        // Bonus for matching more terms
        const termCoverage = matchedTerms / searchTerms.length;
        finalScore = (totalScore / searchTerms.length) * (0.7 + 0.3 * termCoverage);
      }
    }
    
    if (finalScore >= minScore) {
      results.push({
        item,
        score: finalScore,
        matchedFields
      });
    }
  }
  
  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score);
  
  // Limit results if specified
  if (maxResults && results.length > maxResults) {
    return results.slice(0, maxResults);
  }
  
  return results;
}

/**
 * Simple wrapper for basic multi-field search (most common use case)
 */
export function multiFieldSearch<T>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  const searchableFields: SearchableField[] = fields.map(field => ({
    key: String(field),
    weight: 1
  }));
  
  const results = advancedSearch(items, query, searchableFields);
  return results.map(result => result.item);
} 