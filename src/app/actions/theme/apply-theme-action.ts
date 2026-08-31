"use server";

import { promises as fs } from "node:fs";
import path from "node:path";

import { INSIDER_THEMES, type InsiderThemeName } from "@/lib/theme";

type ApplyThemeResult =
  | {
      success: true;
      mode: "local" | "production";
      theme: InsiderThemeName;
      name: string;
      url: string;
      message: string;
      output?: string;
    }
  | {
      success: false;
      error: string;
    };

function isVercelProduction(): boolean {
  return process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
}

// ============================================================
// Helpers – locate globals.css
// ============================================================

async function findGlobalsCssPath(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), "app", "globals.css"),
    path.join(process.cwd(), "src", "app", "globals.css"),
    path.join(process.cwd(), "styles", "globals.css"),
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }

  throw new Error(
    "Could not find globals.css. Expected one of: app/globals.css, src/app/globals.css or styles/globals.css",
  );
}

// ============================================================
// Build CSS variable blocks from tweakcn JSON
// ============================================================

function buildCssVarsBlock(vars: Record<string, string>, selector: string): string {
  const lines = Object.entries(vars).map(([key, value]) => {
    // tweakcn sometimes returns keys without the leading --
    const cssKey = key.startsWith("--") ? key : `--${key}`;
    return `  ${cssKey}: ${value};`;
  });

  return `${selector} {\n${lines.join("\n")}\n}`;
}

function generateThemeCss(cssVars: {
  theme?: Record<string, string>;
  light?: Record<string, string>;
  dark?: Record<string, string>;
}): string {
  const parts: string[] = [];

  // Shared theme tokens (font, radius, etc.)
  if (cssVars.theme && Object.keys(cssVars.theme).length > 0) {
    parts.push(buildCssVarsBlock(cssVars.theme, ":root"));
  }

  // Light mode
  if (cssVars.light && Object.keys(cssVars.light).length > 0) {
    // If we already have a :root from theme, merge light into it
    // otherwise create a clean :root
    parts.push(buildCssVarsBlock(cssVars.light, ":root"));
  }

  // Dark mode
  if (cssVars.dark && Object.keys(cssVars.dark).length > 0) {
    parts.push(buildCssVarsBlock(cssVars.dark, ".dark"));
  }

  return parts.join("\n\n");
}

// ============================================================
// Replace existing theme variables in globals.css
// ============================================================

function replaceThemeBlocks(cssContent: string, newThemeCss: string): string {
  // Remove existing :root { ... } and .dark { ... } blocks that contain CSS variables
  // We keep everything else (imports, @theme, base styles, etc.)

  // This regex finds :root { ... } and .dark { ... } blocks
  const cleaned = cssContent
    // remove existing :root blocks
    .replace(/:root\s*\{[\s\S]*?\n\}/g, "")
    // remove existing .dark blocks
    .replace(/\.dark\s*\{[\s\S]*?\n\}/g, "")
    // clean up extra blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Put the new theme blocks near the top (after any @import)
  const importMatch = cleaned.match(/^(@import[\s\S]*?;)\s*/);

  if (importMatch) {
    const imports = importMatch[1];
    const rest = cleaned.slice(importMatch[0].length).trim();
    return `${imports}\n\n${newThemeCss}\n\n${rest}\n`;
  }

  return `${newThemeCss}\n\n${cleaned}\n`;
}

// ============================================================
// Local fast apply (fetch JSON → write CSS)
// ============================================================

async function applyThemeLocally(
  theme: InsiderThemeName,
  name: string,
  url: string,
): Promise<ApplyThemeResult> {
  try {
    console.log("[INSIDER AI] Applying theme (fast method):", {
      theme,
      name,
      url,
    });

    // 1. Fetch theme JSON
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to download theme (${response.status}): ${url}`,
      };
    }

    const themeJson = (await response.json()) as {
      name?: string;
      cssVars?: {
        theme?: Record<string, string>;
        light?: Record<string, string>;
        dark?: Record<string, string>;
      };
    };

    if (!themeJson.cssVars) {
      return {
        success: false,
        error: "Theme JSON does not contain cssVars.",
      };
    }

    // 2. Generate CSS
    const newThemeCss = generateThemeCss(themeJson.cssVars);

    // 3. Locate and update globals.css
    const globalsPath = await findGlobalsCssPath();
    const currentCss = await fs.readFile(globalsPath, "utf8");
    const updatedCss = replaceThemeBlocks(currentCss, newThemeCss);

    await fs.writeFile(globalsPath, updatedCss, "utf8");

    console.log("[INSIDER AI] Theme applied successfully (fast):", {
      theme,
      name,
      globalsPath,
    });

    return {
      success: true,
      mode: "local",
      theme,
      name,
      url,
      message: `The **${name}** theme was applied successfully.\n\nCSS variables have been updated in \`${path.relative(process.cwd(), globalsPath)}\`.\n\nRefresh the page to see the changes.`,
    };
  } catch (error) {
    console.error("[INSIDER AI] Fast theme application failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to apply the ${name} theme.`,
    };
  }
}

// ============================================================
// Production (GitHub Actions workflow)
// ============================================================

async function applyThemeInProduction(
  theme: InsiderThemeName,
  name: string,
): Promise<ApplyThemeResult> {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepository = process.env.GITHUB_REPOSITORY;

  if (!githubToken) {
    return {
      success: false,
      error: "GITHUB_TOKEN is not configured. Production theme changes cannot be started.",
    };
  }

  if (!githubRepository) {
    return {
      success: false,
      error: "GITHUB_REPOSITORY is not configured. Production theme changes cannot be started.",
    };
  }

  const repositoryParts = githubRepository.split("/");

  if (repositoryParts.length !== 2) {
    return {
      success: false,
      error: 'GITHUB_REPOSITORY must use the "owner/repository" format.',
    };
  }

  const [owner, repo] = repositoryParts;
  const workflowFile = process.env.THEME_WORKFLOW_FILE ?? "apply-theme.yml";
  const branch = process.env.GITHUB_BRANCH ?? "main";

  const githubUrl =
    `https://api.github.com/repos/${owner}/${repo}` +
    `/actions/workflows/${encodeURIComponent(workflowFile)}/dispatches`;

  try {
    console.log("[INSIDER AI] Starting production theme workflow:", {
      theme,
      name,
      repository: githubRepository,
      workflow: workflowFile,
      branch,
    });

    const response = await fetch(githubUrl, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: branch,
        inputs: {
          theme,
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const responseText = await response.text();

      console.error("[INSIDER AI] GitHub workflow failed:", {
        status: response.status,
        response: responseText,
      });

      return {
        success: false,
        error:
          `GitHub could not start the production theme workflow ` +
          `(${response.status}). ${responseText || "Unknown GitHub error."}`,
      };
    }

    console.log("[INSIDER AI] Production theme workflow started:", {
      theme,
      name,
    });

    return {
      success: true,
      mode: "production",
      theme,
      name,
      url: INSIDER_THEMES[theme].url,
      message:
        `The **${name}** theme deployment workflow was started successfully.\n\n` +
        `GitHub will apply the theme, commit the changes, and Vercel will deploy the new commit.`,
    };
  } catch (error) {
    console.error("[INSIDER AI] Failed to start production theme workflow:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : `Failed to start the production ${name} theme workflow.`,
    };
  }
}

// ============================================================
// Main action
// ============================================================

export async function applyThemeAction(theme: InsiderThemeName): Promise<ApplyThemeResult> {
  const selectedTheme = INSIDER_THEMES[theme];

  if (!selectedTheme) {
    return {
      success: false,
      error: `Theme "${theme}" is not available.`,
    };
  }

  console.log("[INSIDER AI] Theme request received:", {
    theme,
    name: selectedTheme.name,
    url: selectedTheme.url,
    vercel: process.env.VERCEL,
    vercelEnvironment: process.env.VERCEL_ENV,
  });

  if (isVercelProduction()) {
    return applyThemeInProduction(theme, selectedTheme.name);
  }

  return applyThemeLocally(theme, selectedTheme.name, selectedTheme.url);
}
