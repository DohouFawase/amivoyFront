const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_BASE_URL = (
  configuredApiUrl || "http://192.168.1.197:8000/api/v1"
).replace(/\/+$/, "");

export const AUTH_TOKEN_KEY = "amivoy.access-token";