import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { AUTH_TOKEN_KEY } from "@/config/api";

let memoryToken: string | null = null;

function getWebSessionStorage(): Storage | null {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const webStorage = getWebSessionStorage();

  if (Platform.OS === "web") {
    try {
      return webStorage?.getItem(AUTH_TOKEN_KEY) ?? memoryToken;
    } catch {
      return memoryToken;
    }
  }

  try {
    memoryToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch {
    return memoryToken;
  }

  return memoryToken;
}

export async function saveAccessToken(token: string): Promise<void> {
  memoryToken = token;
  const webStorage = getWebSessionStorage();

  if (Platform.OS === "web") {
    try {
      webStorage?.setItem(AUTH_TOKEN_KEY, token);
    } catch {
      memoryToken = token;
    }
    return;
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  memoryToken = null;
  const webStorage = getWebSessionStorage();

  if (Platform.OS === "web") {
    try {
      webStorage?.removeItem(AUTH_TOKEN_KEY);
    } catch {
      memoryToken = null;
    }
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}