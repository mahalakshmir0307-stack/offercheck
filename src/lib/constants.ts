import type { WoodStatus, ProductSuggestion } from './types';

export const WOOD_TYPES = [
  'Oak',
  'Pine',
  'Teak',
  'Maple',
  'Walnut',
  'Cherry',
  'Birch',
  'Cedar',
  'Mahogany',
  'Ash',
  'Beech',
  'Poplar',
  'Other',
] as const;

export const WOOD_STATUSES: { value: WoodStatus; label: string; color: string; bgColor: string; textColor: string; dotColor: string }[] = [
  { value: 'available', label: 'Available', color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-700', dotColor: 'bg-green-500' },
  { value: 'reserved', label: 'Reserved', color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-700', dotColor: 'bg-amber-500' },
  { value: 'reused', label: 'Reused', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', dotColor: 'bg-blue-500' },
  { value: 'discarded', label: 'Discarded', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-600', dotColor: 'bg-gray-400' },
];

export function getStatusConfig(status: WoodStatus) {
  return WOOD_STATUSES.find((s) => s.value === status) ?? WOOD_STATUSES[0];
}

/**
 * Product suggestion catalog — each product has minimum dimension requirements.
 * The suggestion engine matches wood pieces against these thresholds.
 * This is sample data; the real recommendation logic will be added later.
 */
export const PRODUCT_CATALOG: ProductSuggestion[] = [
  {
    name: 'Vase',
    description: 'A decorative wooden vase turned from a solid piece. Requires a compact block with adequate thickness.',
    min_length: 10,
    min_width: 8,
    min_thickness: 8,
    estimated_value: 450,
    icon: 'Flower',
  },
  {
    name: 'Chair Component',
    description: 'Legs, backrests, or seat panels for chairs. Requires longer pieces with moderate thickness.',
    min_length: 45,
    min_width: 5,
    min_thickness: 3,
    estimated_value: 800,
    icon: 'Armchair',
  },
  {
    name: 'Sofa Leg',
    description: 'Replacement or custom sofa legs. Shorter pieces with sufficient thickness for turning.',
    min_length: 15,
    min_width: 6,
    min_thickness: 6,
    estimated_value: 350,
    icon: 'Sofa',
  },
  {
    name: 'Bed Component',
    description: 'Bed frame slats, headboard panels, or support beams. Requires longer, wider pieces.',
    min_length: 80,
    min_width: 10,
    min_thickness: 2,
    estimated_value: 1200,
    icon: 'BedDouble',
  },
  {
    name: 'Decorative Item',
    description: 'Wall art, sculptures, or ornamental pieces. Flexible dimensions — any reasonably sized piece works.',
    min_length: 12,
    min_width: 5,
    min_thickness: 2,
    estimated_value: 300,
    icon: 'Sparkles',
  },
  {
    name: 'Furniture Component',
    description: 'Shelves, brackets, trim, or joinery components for furniture assembly.',
    min_length: 30,
    min_width: 8,
    min_thickness: 2,
    estimated_value: 550,
    icon: 'Boxes',
  },
  {
    name: 'Combined Panel',
    description: 'Edge-glued panels made by joining multiple pieces side by side. Great for utilizing narrow offcuts.',
    min_length: 20,
    min_width: 4,
    min_thickness: 1.5,
    estimated_value: 700,
    icon: 'Columns3',
  },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function formatDimensions(length: number, width: number, thickness: number): string {
  const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(1);
  return `${fmt(length)} × ${fmt(width)} × ${fmt(thickness)} cm`;
}
