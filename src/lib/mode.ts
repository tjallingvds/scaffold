// Demo mode: no database, no auth. Active when DATABASE_URL is not set,
// or when DEMO_MODE is explicitly truthy. Meant for quick local runs and
// presentations. Railway deploys set DATABASE_URL and auth activates.
export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "true") return true;
  return !process.env.DATABASE_URL;
}
