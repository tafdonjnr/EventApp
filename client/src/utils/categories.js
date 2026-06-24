/** Canonical category values and display labels */
export const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'festival', label: 'Festival' },
  { value: 'concert', label: 'Concert' },
  { value: 'color-festival', label: 'Color Festival' },
  { value: 'funfair', label: 'Funfair' },
  { value: 'rave', label: 'Rave / Party' },
  { value: 'popup', label: 'Pop-up / Souk' },
  { value: 'sports', label: 'Sports' },
  { value: 'trade-fair', label: 'Trade Fair / Fashion' },
  { value: 'food-festival', label: 'Food Festival' },
  { value: 'outdoor', label: 'Outdoor / Adventure' },
  { value: 'tech', label: 'Tech' },
];

const LEGACY_CATEGORY_MAP = {
  music: 'concert',
  technology: 'tech',
  business: 'trade-fair',
  education: 'general',
  entertainment: 'concert',
  food: 'food-festival',
  'food & drink': 'food-festival',
  health: 'general',
  other: 'general',
};

const VALID_VALUES = new Set(CATEGORY_OPTIONS.map((o) => o.value));

/**
 * Maps legacy/raw category strings to a canonical value for display and theming.
 */
export function normalizeCategory(cat) {
  if (!cat || typeof cat !== 'string') return 'general';

  const trimmed = cat.trim().toLowerCase();
  if (LEGACY_CATEGORY_MAP[trimmed]) return LEGACY_CATEGORY_MAP[trimmed];

  const slug = trimmed
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/&/g, '');

  if (LEGACY_CATEGORY_MAP[slug]) return LEGACY_CATEGORY_MAP[slug];
  if (slug === 'food-drink') return 'food-festival';

  if (VALID_VALUES.has(slug)) return slug;

  return 'general';
}

/** Human-readable label for any raw or legacy category value */
export function getCategoryLabel(cat) {
  const normalized = normalizeCategory(cat);
  const option = CATEGORY_OPTIONS.find((o) => o.value === normalized);
  return option?.label ?? 'General';
}
