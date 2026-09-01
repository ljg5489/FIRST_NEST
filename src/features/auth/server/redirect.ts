export function getSafeNextPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback = "/account",
) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://first-nest.local");
    if (parsed.origin !== "https://first-nest.local") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
