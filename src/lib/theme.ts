export const INSIDER_THEMES = {
  supabase: {
    name: "Supabase",
    url: "https://tweakcn.com/r/themes/supabase.json",
  },

  "amber-minimal": {
    name: "Amber Minimal",
    url: "https://tweakcn.com/r/themes/amber-minimal.json",
  },

  twitter: {
    name: "Twitter",
    url: "https://tweakcn.com/r/themes/twitter.json",
  },

  "solar-dusk": {
    name: "Solar Dusk",
    url: "https://tweakcn.com/r/themes/solar-dusk.json",
  },

  "sage-garden": {
    name: "Sage Garden",
    url: "https://tweakcn.com/r/themes/sage-garden.json",
  },

  caffeine: {
    name: "Caffeine",
    url: "https://tweakcn.com/r/themes/caffeine.json",
  },

  claymorphism: {
    name: "Claymorphism",
    url: "https://tweakcn.com/r/themes/claymorphism.json",
  },

  cyberpunk: {
    name: "Cyberpunk",
    url: "https://tweakcn.com/r/themes/cyberpunk.json",
  },

  "elegant-luxury": {
    name: "Elegant Luxury",
    url: "https://tweakcn.com/r/themes/elegant-luxury.json",
  },

  claude: {
    name: "Claude",
    url: "https://tweakcn.com/r/themes/claude.json",
  },
} as const;

export type InsiderThemeName = keyof typeof INSIDER_THEMES;
