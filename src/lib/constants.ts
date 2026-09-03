import type { WoodStatus, ProductSuggestion, ProductCategory, ProductStatus } from './types';

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

export const WOOD_STATUSES: {
  value: WoodStatus;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
  borderColor: string;
}[] = [
  {
    value: 'available',
    label: 'Available',
    color: 'green',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-200',
  },
  {
    value: 'reserved',
    label: 'Reserved',
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
    borderColor: 'border-amber-200',
  },
  {
    value: 'reused',
    label: 'Reused',
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
  },
  {
    value: 'discarded',
    label: 'Discarded',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    dotColor: 'bg-gray-400',
    borderColor: 'border-gray-200',
  },
];

export function getStatusConfig(status: WoodStatus) {
  return WOOD_STATUSES.find((s) => s.value === status) ?? WOOD_STATUSES[0];
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  seating: 'Seating',
  tables: 'Tables',
  storage: 'Storage & Shelving',
  decor: 'Decorative Items',
  kitchen: 'Kitchenware',
  panels: 'Paneling & Boards',
  frames: 'Frames & Mirrors',
  hardware: 'Hardware & Fixtures',
};

export const PRODUCT_CATALOG: ProductSuggestion[] = [
  {
    name: 'Decorative Vase',
    category: 'decor',
    description:
      'A turned wooden vase turned from a solid block. Requires compact dimensions with adequate thickness for lathe work.',
    min_length: 10,
    min_width: 8,
    min_thickness: 8,
    estimated_value: 450,
    estimated_profit: 320,
    icon: 'Flower',
    searchQuery: 'wooden vase decorative',
    images: [
      'https://images.pexels.com/photos/20130559/pexels-photo-20130559.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/31553230/pexels-photo-31553230.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/8400597/pexels-photo-8400597.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Compact block suitable for lathe turning into a decorative vase.',
  },
  {
    name: 'Chair Component',
    category: 'seating',
    description:
      'Legs, backrests, or seat panels for chairs. Requires longer pieces with moderate thickness for structural integrity.',
    min_length: 45,
    min_width: 5,
    min_thickness: 3,
    estimated_value: 800,
    estimated_profit: 580,
    icon: 'Armchair',
    searchQuery: 'wooden chair furniture',
    images: [
      'https://images.pexels.com/photos/10892990/pexels-photo-10892990.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/29917912/pexels-photo-29917912.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/37498637/pexels-photo-37498637.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Length and thickness meet structural requirements for chair components.',
  },
  {
    name: 'Sofa Leg',
    category: 'hardware',
    description:
      'Replacement or custom sofa legs. Shorter pieces with sufficient thickness for turning and load-bearing.',
    min_length: 15,
    min_width: 6,
    min_thickness: 6,
    estimated_value: 350,
    estimated_profit: 250,
    icon: 'Sofa',
    searchQuery: 'wooden sofa leg furniture',
    images: [
      'https://images.pexels.com/photos/13066136/pexels-photo-13066136.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/6707159/pexels-photo-6707159.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/12277201/pexels-photo-12277201.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Dimensions support turning into load-bearing sofa legs.',
  },
  {
    name: 'Bed Component',
    category: 'seating',
    description:
      'Bed frame slats, headboard panels, or support beams. Requires longer, wider pieces for frame construction.',
    min_length: 80,
    min_width: 10,
    min_thickness: 2,
    estimated_value: 1200,
    estimated_profit: 850,
    icon: 'BedDouble',
    searchQuery: 'wooden bed headboard frame',
    images: [
      'https://images.pexels.com/photos/1591047/pexels-photo-1591047.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/15792555/pexels-photo-15792555.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/31173588/pexels-photo-31173588.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Length and width exceed minimum requirements for bed frame components.',
  },
  {
    name: 'Decorative Wall Panel',
    category: 'panels',
    description:
      'Wall art, sculptures, or ornamental panels. Flexible dimensions — any reasonably sized piece works.',
    min_length: 12,
    min_width: 5,
    min_thickness: 2,
    estimated_value: 300,
    estimated_profit: 210,
    icon: 'Sparkles',
    searchQuery: 'decorative wooden wall panel interior',
    images: [
      'https://images.pexels.com/photos/207909/pexels-photo-207909.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/172301/pexels-photo-172301.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/35883537/pexels-photo-35883537.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Dimensions allow carving or assembly into decorative wall panels.',
  },
  {
    name: 'Wall Shelf',
    category: 'storage',
    description:
      'Shelves, brackets, trim, or joinery components for furniture assembly and storage solutions.',
    min_length: 30,
    min_width: 8,
    min_thickness: 2,
    estimated_value: 550,
    estimated_profit: 390,
    icon: 'Boxes',
    searchQuery: 'wooden wall shelf furniture',
    images: [
      'https://images.pexels.com/photos/18620041/pexels-photo-18620041.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/18698759/pexels-photo-18698759.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/19109111/pexels-photo-19109111.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Length and width provide sufficient surface area for shelving.',
  },
  {
    name: 'Combined Panel',
    category: 'panels',
    description:
      'Edge-glued panels made by joining multiple pieces side by side. Great for utilizing narrow offcuts.',
    min_length: 20,
    min_width: 4,
    min_thickness: 1.5,
    estimated_value: 700,
    estimated_profit: 500,
    icon: 'Columns3',
    searchQuery: 'wooden panel edge glued board',
    images: [
      'https://images.pexels.com/photos/172301/pexels-photo-172301.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/9181283/pexels-photo-9181283.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/35883537/pexels-photo-35883537.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Narrow offcuts can be edge-glued into wider panels for tabletops or work surfaces.',
  },
  {
    name: 'Tabletop Component',
    category: 'tables',
    description:
      'Tabletops or table surfaces cut from wide, flat pieces. Requires adequate width and thickness.',
    min_length: 40,
    min_width: 30,
    min_thickness: 2,
    estimated_value: 950,
    estimated_profit: 680,
    icon: 'Table',
    searchQuery: 'wooden table top surface',
    images: [
      'https://images.pexels.com/photos/13425273/pexels-photo-13425273.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/7255296/pexels-photo-7255296.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/6962747/pexels-photo-6962747.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Width and length meet the surface area requirements for tabletops.',
  },
  {
    name: 'Bench',
    category: 'seating',
    description:
      'Wooden bench seating for indoor or outdoor use. Requires long, sturdy pieces.',
    min_length: 60,
    min_width: 20,
    min_thickness: 3,
    estimated_value: 650,
    estimated_profit: 460,
    icon: 'Armchair',
    searchQuery: 'wooden bench furniture indoor',
    images: [
      'https://images.pexels.com/photos/12233290/pexels-photo-12233290.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/36249963/pexels-photo-36249963.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/276175/pexels-photo-276175.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Length and thickness provide structural support for bench seating.',
  },
  {
    name: 'Cutting Board',
    category: 'kitchen',
    description:
      'Kitchen cutting boards from flat, dense wood pieces. Requires moderate thickness and width.',
    min_length: 25,
    min_width: 15,
    min_thickness: 1.5,
    estimated_value: 180,
    estimated_profit: 130,
    icon: 'Utensils',
    searchQuery: 'wooden cutting board kitchen',
    images: [
      'https://images.pexels.com/photos/28080322/pexels-photo-28080322.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/4397788/pexels-photo-4397788.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/7129393/pexels-photo-7129393.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Flat surface area and thickness suitable for kitchen cutting boards.',
  },
  {
    name: 'Picture Frame',
    category: 'frames',
    description:
      'Wooden picture frames for photos or artwork. Requires narrow strips with moderate thickness.',
    min_length: 20,
    min_width: 3,
    min_thickness: 1,
    estimated_value: 220,
    estimated_profit: 160,
    icon: 'Image',
    searchQuery: 'wooden picture frame photo',
    images: [
      'https://images.pexels.com/photos/8861589/pexels-photo-8861589.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/383568/pexels-photo-383568.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/2422255/pexels-photo-2422255.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Narrow dimensions ideal for cutting into frame molding strips.',
  },
  {
    name: 'Decorative Bowl',
    category: 'kitchen',
    description:
      'Handcrafted wooden bowls for decor or serving. Requires compact blocks with adequate thickness.',
    min_length: 12,
    min_width: 12,
    min_thickness: 5,
    estimated_value: 280,
    estimated_profit: 200,
    icon: 'Circle',
    searchQuery: 'wooden bowl decorative handcrafted',
    images: [
      'https://images.pexels.com/photos/31703678/pexels-photo-31703678.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/33367176/pexels-photo-33367176.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/13140781/pexels-photo-13140781.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Compact block with sufficient thickness for bowl turning on a lathe.',
  },
  {
    name: 'Stool',
    category: 'seating',
    description:
      'Wooden stools for seating or step use. Requires moderate length and thickness for legs and seat.',
    min_length: 30,
    min_width: 25,
    min_thickness: 2,
    estimated_value: 400,
    estimated_profit: 280,
    icon: 'Armchair',
    searchQuery: 'wooden stool furniture',
    images: [
      'https://images.pexels.com/photos/38777661/pexels-photo-38777661.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/35657826/pexels-photo-35657826.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/39247420/pexels-photo-39247420.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Dimensions support construction of stool seat and leg components.',
  },
  {
    name: 'Bookshelf',
    category: 'storage',
    description:
      'Bookcase or shelving unit components. Requires longer pieces for verticals and horizontals.',
    min_length: 50,
    min_width: 20,
    min_thickness: 2,
    estimated_value: 750,
    estimated_profit: 530,
    icon: 'BookOpen',
    searchQuery: 'wooden bookshelf bookcase furniture',
    images: [
      'https://images.pexels.com/photos/7587290/pexels-photo-7587290.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/7195289/pexels-photo-7195289.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/7167083/pexels-photo-7167083.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Length and width meet requirements for shelving unit components.',
  },
  {
    name: 'Coffee Table',
    category: 'tables',
    description:
      'Coffee table or side table construction. Requires wide, flat pieces with adequate thickness.',
    min_length: 50,
    min_width: 40,
    min_thickness: 2.5,
    estimated_value: 880,
    estimated_profit: 620,
    icon: 'Table',
    searchQuery: 'wooden coffee table living room',
    images: [
      'https://images.pexels.com/photos/7607461/pexels-photo-7607461.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/12277201/pexels-photo-12277201.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/12420730/pexels-photo-12420730.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Surface area and thickness meet coffee table construction requirements.',
  },
  {
    name: 'Wood Sculpture',
    category: 'decor',
    description:
      'Artistic sculptures or carved decorative pieces. Flexible dimensions for creative work.',
    min_length: 15,
    min_width: 8,
    min_thickness: 8,
    estimated_value: 520,
    estimated_profit: 370,
    icon: 'Sparkles',
    searchQuery: 'wooden sculpture art decor piece',
    images: [
      'https://images.pexels.com/photos/5873/wood-wooden-design-sculpture.jpg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/36590104/pexels-photo-36590104.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/36590038/pexels-photo-36590038.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Block dimensions allow carving into artistic sculptures.',
  },
  {
    name: 'Candle Holder',
    category: 'decor',
    description:
      'Decorative candle holders or tea light stands. Compact pieces with moderate thickness.',
    min_length: 8,
    min_width: 8,
    min_thickness: 3,
    estimated_value: 150,
    estimated_profit: 110,
    icon: 'Flame',
    searchQuery: 'wooden candle holder decor',
    images: [
      'https://images.pexels.com/photos/10219039/pexels-photo-10219039.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/6633402/pexels-photo-6633402.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/11410245/pexels-photo-11410245.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Compact dimensions suitable for turning candle holders.',
  },
  {
    name: 'Floating Shelf',
    category: 'storage',
    description:
      'Wall-mounted floating shelves. Requires flat pieces with adequate width and minimal thickness.',
    min_length: 30,
    min_width: 15,
    min_thickness: 2,
    estimated_value: 320,
    estimated_profit: 230,
    icon: 'Boxes',
    searchQuery: 'wooden wall shelf floating',
    images: [
      'https://images.pexels.com/photos/19109111/pexels-photo-19109111.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/18698759/pexels-photo-18698759.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/6489097/pexels-photo-6489097.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Flat profile and width ideal for floating shelf construction.',
  },
  {
    name: 'Serving Tray',
    category: 'kitchen',
    description:
      'Decorative serving trays for food or display. Requires flat, wide pieces with moderate thickness.',
    min_length: 35,
    min_width: 20,
    min_thickness: 1.5,
    estimated_value: 260,
    estimated_profit: 185,
    icon: 'RectangleHorizontal',
    searchQuery: 'wooden tray serving decorative',
    images: [
      'https://images.pexels.com/photos/10545937/pexels-photo-10545937.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/10545939/pexels-photo-10545939.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/6962405/pexels-photo-6962405.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Flat surface and dimensions suitable for tray construction.',
  },
  {
    name: 'Planter Box',
    category: 'decor',
    description:
      'Wooden planter boxes for indoor or outdoor plants. Requires moderate length and width.',
    min_length: 20,
    min_width: 15,
    min_thickness: 1.5,
    estimated_value: 190,
    estimated_profit: 135,
    icon: 'Flower',
    searchQuery: 'wooden planter box garden',
    images: [
      'https://images.pexels.com/photos/14205026/pexels-photo-14205026.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/11652722/pexels-photo-11652722.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/1371635/pexels-photo-1371635.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Dimensions allow assembly into planter box panels.',
  },
  {
    name: 'Coat Rack',
    category: 'hardware',
    description:
      'Wall-mounted coat racks with hooks. Requires longer, narrow pieces with moderate thickness.',
    min_length: 30,
    min_width: 8,
    min_thickness: 2,
    estimated_value: 240,
    estimated_profit: 170,
    icon: 'Anchor',
    searchQuery: 'wooden coat rack wall mounted',
    images: [
      'https://images.pexels.com/photos/33686611/pexels-photo-33686611.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/1309095/pexels-photo-1309095.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/6654123/pexels-photo-6654123.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Length and width support coat rack board construction.',
  },
  {
    name: 'Mirror Frame',
    category: 'frames',
    description:
      'Decorative mirror frames from wood molding. Requires narrow strips with moderate thickness.',
    min_length: 40,
    min_width: 4,
    min_thickness: 1.5,
    estimated_value: 380,
    estimated_profit: 270,
    icon: 'Image',
    searchQuery: 'wooden mirror frame decorative',
    images: [
      'https://images.pexels.com/photos/6842185/pexels-photo-6842185.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/33377275/pexels-photo-33377275.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/17203214/pexels-photo-17203214.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Length and profile suitable for cutting mirror frame molding.',
  },
  {
    name: 'Jewelry Box',
    category: 'storage',
    description:
      'Handcrafted jewelry or keepsake boxes. Requires compact pieces with adequate thickness.',
    min_length: 15,
    min_width: 10,
    min_thickness: 1.5,
    estimated_value: 340,
    estimated_profit: 240,
    icon: 'Box',
    searchQuery: 'wooden jewelry box handcrafted',
    images: [
      'https://images.pexels.com/photos/31517343/pexels-photo-31517343.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/10474312/pexels-photo-10474312.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/38371830/pexels-photo-38371830.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Compact dimensions allow construction of jewelry box panels.',
  },
  {
    name: 'Decorative Ladder',
    category: 'decor',
    description:
      'Decorative wooden ladders for indoor display. Requires longer, narrow pieces.',
    min_length: 50,
    min_width: 4,
    min_thickness: 2,
    estimated_value: 290,
    estimated_profit: 205,
    icon: 'MoveVertical',
    searchQuery: 'wooden ladder decorative indoor',
    images: [
      'https://images.pexels.com/photos/6627710/pexels-photo-6627710.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/5490777/pexels-photo-5490777.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
      'https://images.pexels.com/photos/5094573/pexels-photo-5094573.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    ],
    reason: 'Length and profile suitable for decorative ladder rails.',
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

export function formatDimensions(
  length: number,
  width: number,
  thickness: number
): string {
  const fmt = (n: number) => (Number.isInteger(n) ? n.toString() : n.toFixed(1));
  return `${fmt(length)} × ${fmt(width)} × ${fmt(thickness)} cm`;
}

export function calculateWoodVolume(
  lengthCm: number,
  widthCm: number,
  thicknessCm: number
): number {
  return (lengthCm * widthCm * thicknessCm) / 1000;
}

export function calculateFeasibilityScore(
  wood: { length_cm: number; width_cm: number; thickness_cm: number },
  product: ProductSuggestion
): number {
  const lengthRatio = wood.length_cm / product.min_length;
  const widthRatio = wood.width_cm / product.min_width;
  const thicknessRatio = wood.thickness_cm / product.min_thickness;
  const minRatio = Math.min(lengthRatio, widthRatio, thicknessRatio);
  if (minRatio < 1) return 0;
  const avgRatio = (lengthRatio + widthRatio + thicknessRatio) / 3;
  const score = Math.min(100, Math.round(60 + (avgRatio - 1) * 20));
  return Math.max(0, Math.min(100, score));
}

export function calculateMaterialUtilization(
  wood: { length_cm: number; width_cm: number; thickness_cm: number },
  product: ProductSuggestion
): number {
  const woodVolume = calculateWoodVolume(wood.length_cm, wood.width_cm, wood.thickness_cm);
  const productVolume = calculateWoodVolume(product.min_length, product.min_width, product.min_thickness);
  if (productVolume <= 0) return 0;
  return Math.min(100, Math.round((productVolume / woodVolume) * 100));
}

export function calculateEstimatedCost(estimatedValue: number): number {
  return Math.round(estimatedValue * 0.28);
}

export function calculateProfitMargin(estimatedValue: number, estimatedCost: number): number {
  if (estimatedValue <= 0) return 0;
  return Math.round(((estimatedValue - estimatedCost) / estimatedValue) * 100);
}

export function calculateEstimatedProfit(estimatedValue: number): number {
  return estimatedValue - calculateEstimatedCost(estimatedValue);
}

export function buildScoredSuggestion(
  wood: { length_cm: number; width_cm: number; thickness_cm: number },
  product: ProductSuggestion
) {
  const matched =
    wood.length_cm >= product.min_length &&
    wood.width_cm >= product.min_width &&
    wood.thickness_cm >= product.min_thickness;
  const score = calculateFeasibilityScore(wood, product);
  const woodVolume = calculateWoodVolume(wood.length_cm, wood.width_cm, wood.thickness_cm);
  const materialUtilization = calculateMaterialUtilization(wood, product);
  const estimatedCost = calculateEstimatedCost(product.estimated_value);
  const profitMargin = calculateProfitMargin(product.estimated_value, estimatedCost);
  const productVolume = calculateWoodVolume(product.min_length, product.min_width, product.min_thickness);
  const remainingVolume = Math.max(0, woodVolume - productVolume);
  const materialRequired = `${product.min_length} × ${product.min_width} × ${product.min_thickness} cm`;
  const remainingMaterial = remainingVolume > 0 ? `${remainingVolume.toFixed(0)} cm³ remaining` : 'No significant remainder';

  let explanation: string;
  if (!matched) {
    const deficits: string[] = [];
    if (wood.length_cm < product.min_length) deficits.push(`length (${wood.length_cm} < ${product.min_length} cm)`);
    if (wood.width_cm < product.min_width) deficits.push(`width (${wood.width_cm} < ${product.min_width} cm)`);
    if (wood.thickness_cm < product.min_thickness) deficits.push(`thickness (${wood.thickness_cm} < ${product.min_thickness} cm)`);
    explanation = `Not feasible: insufficient ${deficits.join(', ')}.`;
  } else {
    explanation = `Recommended because the available wood dimensions meet the minimum requirements with ${materialUtilization}% material utilization and ${profitMargin}% profit margin.`;
  }

  return {
    ...product,
    matched,
    score,
    woodVolume,
    materialUtilization,
    estimatedCost,
    profitMargin,
    materialRequired,
    remainingMaterial,
    explanation,
  };
}

export const PRODUCT_STATUSES: {
  value: ProductStatus;
  label: string;
  color: 'green' | 'amber' | 'blue' | 'gray' | 'stone' | 'orange';
  bgColor: string;
  textColor: string;
  dotColor: string;
}[] = [
  { value: 'planned', label: 'Planned', color: 'gray', bgColor: 'bg-slate-100', textColor: 'text-slate-600', dotColor: 'bg-slate-400' },
  { value: 'in_production', label: 'In Production', color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-700', dotColor: 'bg-amber-500' },
  { value: 'completed', label: 'Completed', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', dotColor: 'bg-blue-500' },
  { value: 'sold', label: 'Sold', color: 'green', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', dotColor: 'bg-emerald-500' },
];

export function getProductStatusConfig(status: ProductStatus) {
  return PRODUCT_STATUSES.find((s) => s.value === status) ?? PRODUCT_STATUSES[0];
}
