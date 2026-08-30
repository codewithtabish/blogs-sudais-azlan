const SITE_URL = "https://insider.sudaisazlan.com";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY;

export async function pingIndexNow(path: string) {
  if (!INDEXNOW_KEY) {
    return;
  }

  try {
    const url = `${SITE_URL}${path}`;

    await fetch(
      `https://api.indexnow.org/indexnow?url=${encodeURIComponent(
        url,
      )}&key=${encodeURIComponent(INDEXNOW_KEY)}`,
      {
        method: "GET",
      },
    );
  } catch {
    // Ignore IndexNow errors so publishing is not affected.
  }
}
