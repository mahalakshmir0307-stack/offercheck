import type { ProductSuggestion, ProductCategory } from './types';

const REJECT_KEYWORDS = [
  'tree', 'forest', 'leaves', 'nature', 'landscape', 'bark',
  'texture', 'paper', 'document', 'blueprint', 'diagram', 'logo',
  'icon', 'lumber', 'log', 'timber', 'sawmill', 'plank background',
  'wood texture', 'grain background',
];

const STOP_WORDS = [
  'component', 'custom', 'small', 'large', 'the', 'a', 'an',
  'piece', 'part', 'oak', 'pine', 'teak', 'maple', 'walnut',
  'cherry', 'birch', 'cedar', 'mahogany', 'ash', 'beech', 'poplar',
  'wooden', 'wood',
];

export function normalizeProductName(name: string): string {
  let result = name.toLowerCase();
  STOP_WORDS.forEach((word) => {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), '');
  });
  result = result.replace(/\s+/g, ' ').trim();
  return result;
}

export function detectCategory(name: string): ProductCategory {
  const lower = name.toLowerCase();
  if (/chair|sofa|stool|bench|seat/.test(lower)) return 'seating';
  if (/table|desk|countertop/.test(lower)) return 'tables';
  if (/shelf|bookcase|cabinet|box|storage/.test(lower)) return 'storage';
  if (/vase|sculpture|candle|decor|planter|ladder|art/.test(lower)) return 'decor';
  if (/board|bowl|tray|kitchen|utensil/.test(lower)) return 'kitchen';
  if (/panel|board|slat/.test(lower)) return 'panels';
  if (/frame|mirror/.test(lower)) return 'frames';
  return 'hardware';
}

export function buildSearchQuery(name: string): string {
  const normalized = normalizeProductName(name);
  const category = detectCategory(name);
  const categoryTerms: Record<ProductCategory, string> = {
    seating: 'furniture',
    tables: 'furniture',
    storage: 'furniture',
    decor: 'decor interior',
    kitchen: 'kitchenware',
    panels: 'interior paneling',
    frames: 'home decor',
    hardware: 'hardware fixture',
  };
  return `${normalized} ${categoryTerms[category]}`;
}

export function validateImageUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return !REJECT_KEYWORDS.some((kw) => lower.includes(kw));
}

export function getBestImage(suggestion: ProductSuggestion): string {
  const valid = suggestion.images.filter((url) => validateImageUrl(url));
  if (valid.length > 0) return valid[0];
  if (suggestion.images.length > 0) return suggestion.images[0];
  return '';
}

const imageCache = new Map<string, boolean>();

export function checkImageCached(url: string): boolean | undefined {
  return imageCache.get(url);
}

export function markImageLoaded(url: string, success: boolean): void {
  imageCache.set(url, success);
}
