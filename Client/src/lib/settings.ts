export type RoleSettings = {
  notificationsEnabled?: boolean;
  email?: string;
  timezone?: string;
  showExamNotifications?: boolean;
  preferredTheme?: 'light' | 'dark' | 'system';
};

const PREFIX = 'cls_settings_v1';

function keyFor(role: string) {
  return `${PREFIX}:${role}`;
}

export function loadSettings(role: string): RoleSettings {
  try {
    const raw = localStorage.getItem(keyFor(role));
    if (!raw) return {};
    return JSON.parse(raw) as RoleSettings;
  } catch (e) {
    console.error('Failed to load settings', e);
    return {};
  }
}

export function saveSettings(role: string, settings: RoleSettings) {
  try {
    localStorage.setItem(keyFor(role), JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save settings', e);
    return false;
  }
}

export function resetSettings(role: string) {
  try {
    localStorage.removeItem(keyFor(role));
    return true;
  } catch (e) {
    console.error('Failed to reset settings', e);
    return false;
  }
}
