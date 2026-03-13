type AppEnvironment = "development" | "staging" | "production";

function resolveEnvironment(): AppEnvironment {
  const raw = (process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || "development").toLowerCase();

  if (raw === "production" || raw === "prod") return "production";
  if (raw === "staging" || raw === "stage") return "staging";
  return "development";
}

function resolveApiBaseUrl(environment: AppEnvironment): string {
  const configuredApiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.VITE_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (environment === "development") {
    return "http://localhost:3000/api";
  }

  if (environment === "staging") {
    return configuredApiUrl || "https://staging-api.northstar.com/api";
  }

  return configuredApiUrl || "https://api.northstar.com/api";
}

const environment = resolveEnvironment();

export const env = {
  apiBaseUrl: resolveApiBaseUrl(environment),
  environment,
  isDev: environment === "development",
  isStaging: environment === "staging",
  isProd: environment === "production"
};
