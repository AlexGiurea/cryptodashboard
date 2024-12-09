export const COLORS = {
  'ETH': '#3C92FA',
  'BTC': '#F7931A',
  'NEAR': '#00C1DE',
  'DOT': '#E6007A',
  'ADA': '#FF8B1E',
  'LINK': '#2A5ADA',
  'RENDER': '#00A3FF',
  'SOL': '#14F195',
  'GRASS': '#4CAF50',
  'TAI': '#FFD700'
};

export const getDefaultColor = (index: number) => {
  const defaultColors = [
    '#FF1F8F', '#8B5CF6', '#F97316', '#0EA5E9', '#10B981',
    '#6366F1', '#D946EF', '#F59E0B', '#14B8A6', '#8B5CF6'
  ];
  return defaultColors[index % defaultColors.length];
};