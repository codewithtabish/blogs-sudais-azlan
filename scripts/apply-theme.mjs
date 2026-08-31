import { promises as fs } from "node:fs";
import path from "node:path";

const THEMES = {
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
};

const themeKey = process.argv[2];

if (!themeKey || !THEMES[themeKey]) {
  console.error(`Invalid theme: "${themeKey}"`);
  console.error("Available themes:", Object.keys(THEMES).join(", "));
  process.exit(1);
}

const selected = THEMES[themeKey];

async function findGlobalsCss() {
  const candidates = ["app/globals.css", "src/app/globals.css", "styles/globals.css"];

  for (const file of candidates) {
    try {
      await fs.access(file);
      return file;
    } catch {
      // continue
    }
  }

  throw new Error(
    "globals.css not found. Expected one of: app/globals.css, src/app/globals.css, styles/globals.css",
  );
}

function buildBlock(vars, selector) {
  const lines = Object.entries(vars).map(([key, value]) => {
    const cssKey = key.startsWith("--") ? key : `--${key}`;
    return `  ${cssKey}: ${value};`;
  });

  return `${selector} {\n${lines.join("\n")}\n}`;
}

function generateCss(cssVars) {
  const parts = [];

  if (cssVars.theme && Object.keys(cssVars.theme).length > 0) {
    parts.push(buildBlock(cssVars.theme, ":root"));
  }

  if (cssVars.light && Object.keys(cssVars.light).length > 0) {
    parts.push(buildBlock(cssVars.light, ":root"));
  }

  if (cssVars.dark && Object.keys(cssVars.dark).length > 0) {
    parts.push(buildBlock(cssVars.dark, ".dark"));
  }

  return parts.join("\n\n");
}

function replaceBlocks(css, newTheme) {
  let cleaned = css
    .replace(/:root\s*\{[\s\S]*?\n\}/g, "")
    .replace(/\.dark\s*\{[\s\S]*?\n\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const importMatch = cleaned.match(/^(@import[\s\S]*?;)\s*/);

  if (importMatch) {
    const imports = importMatch[1];
    const rest = cleaned.slice(importMatch[0].length).trim();
    return `${imports}\n\n${newTheme}\n\n${rest}\n`;
  }

  return `${newTheme}\n\n${cleaned}\n`;
}

async function main() {
  console.log(`Applying theme: ${selected.name} (${themeKey})`);

  const response = await fetch(selected.url);

  if (!response.ok) {
    throw new Error(`Failed to fetch theme (${response.status}): ${selected.url}`);
  }

  const json = await response.json();

  if (!json.cssVars) {
    throw new Error("Theme JSON does not contain cssVars");
  }

  const newCss = generateCss(json.cssVars);
  const globalsPath = await findGlobalsCss();
  const current = await fs.readFile(globalsPath, "utf8");
  const updated = replaceBlocks(current, newCss);

  await fs.writeFile(globalsPath, updated, "utf8");

  console.log(`Successfully updated ${globalsPath}`);
}

main().catch((error) => {
  console.error("Theme application failed:", error);
  process.exit(1);
});
