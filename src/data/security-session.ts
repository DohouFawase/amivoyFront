export type SecurityPreferences = { twoFactorEnabled: boolean; otherSessionsClosed: boolean };
let preferences: SecurityPreferences = { twoFactorEnabled: false, otherSessionsClosed: false };

export function getSecurityPreferences(): SecurityPreferences {
  return { ...preferences };
}

export function updateSecurityPreferences(update: Partial<SecurityPreferences>): SecurityPreferences {
  preferences = { ...preferences, ...update };
  return getSecurityPreferences();
}
