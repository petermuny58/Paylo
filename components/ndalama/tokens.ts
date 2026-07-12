// Sapphire as the single accent; graphite (dark) / cream (light) as the
// switchable base. Signature element: a clipped top-right corner on hero
// surfaces only — a literal nod to a cut gem.
export const palette = {
  dark: {
    bg: '#1C1C21',
    surface: '#26262C',
    surfaceRaised: '#2E2E35',
    text: '#F4F2ED',
    muted: '#9B99A3',
    accent: '#3B6FD9',
    accentText: '#FFFFFF',
    success: '#3FAE7A',
    danger: '#E2685F',
    border: '#37373F',
  },
  light: {
    bg: '#F6F2E9',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    text: '#211F1B',
    muted: '#78756C',
    accent: '#0F52BA',
    accentText: '#FFFFFF',
    success: '#2E8F63',
    danger: '#C94A42',
    border: '#E6E0D2',
  },
} as const;

export type ThemeMode = keyof typeof palette;
export type Colors = (typeof palette)[ThemeMode];

export const display = { fontFamily: "'Space Grotesk', sans-serif" };
export const body = { fontFamily: "'Inter', sans-serif" };

export const facet = {
  clipPath: 'polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%)',
};

export const formatK = (ngwee: number) =>
  (ngwee / 100).toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
