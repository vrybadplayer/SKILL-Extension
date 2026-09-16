import type { Skill, SkillIndex, STORAGE_KEYS } from '../shared/types';
import { validateSkillIndex, deriveSkillPath, DEFAULT_CDN_ORIGIN, DEFAULT_CACHE_TTL } from '../shared/types';

// Firefox WebExtension types
declare const browser: {
  storage: {
    local: {
      get(keys: string | string[]): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    };
  };
  alarms: {
    create(name: string, alarmInfo: { periodInMinutes?: number; when?: number }): Promise<void>;
    onAlarm: { addListener(listener: (alarm: { name: string }) => void): void };
  };
  runtime: {
    onStartup: { addListener(listener: () => void): void };
    onInstalled: { addListener(listener: () => void): void };
    onMessage: { addListener(listener: (message: unknown, sender: unknown, sendResponse: (response: unknown) => void) => boolean | void): void };
    sendMessage(message: unknown): Promise<unknown>;
  };
  commands: {
    onCommand: { addListener(listener: (command: string) => void): void };
  };
  tabs: {
    query(queryInfo: { url?: string | string[] }): Promise<Array<{ id?: number }>>;
    sendMessage(tabId: number, message: unknown): Promise<unknown>;
  };
};

const STORAGE_KEYS_LOCAL = {
  SKILL_INDEX: 'skillIndex',
  CDN_ORIGIN: 'cdnOrigin',
  CACHE_TTL: 'cacheTtl',
} as const;

async function getCdnOrigin(): Promise<string> {
  const result = await browser.storage.local.get(STORAGE_KEYS_LOCAL.CDN_ORIGIN);
  return result[STORAGE_KEYS_LOCAL.CDN_ORIGIN] || DEFAULT_CDN_ORIGIN;
}

async function getCacheTtl(): Promise<number> {
  const result = await browser.storage.local.get(STORAGE_KEYS_LOCAL.CACHE_TTL);
  return result[STORAGE_KEYS_LOCAL.CACHE_TTL] || DEFAULT_CACHE_TTL;
}

async function fetchIndexJson(): Promise<SkillIndex | null> {
  const origin = await getCdnOrigin();
  const url = `${origin.replace(/\/$/, '')}/skills/index.json`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!validateSkillIndex(data)) {
      throw new Error('Invalid index.json schema');
    }
    
    return {
      skills: data.skills,
      fetchedAt: Date.now(),
      etag: response.headers.get('etag') || undefined,
    };
  } catch (error) {
    console.error('[Agentic Skills] Failed to fetch index.json:', error);
    return null;
  }
}

async function refreshSkillIndex(): Promise<void> {
  console.log('[Agentic Skills] Refreshing skill index...');
  const index = await fetchIndexJson();
  
  if (index) {
    await browser.storage.local.set({ [STORAGE_KEYS_LOCAL.SKILL_INDEX]: index });
    console.log('[Agentic Skills] Skill index refreshed:', index.skills.length, 'skills');
  } else {
    console.warn('[Agentic Skills] Failed to refresh skill index, keeping cached version');
  }
}

async function onAlarm(alarm: browser.alarms.Alarm): Promise<void> {
  if (alarm.name === 'refresh-skill-index') {
    await refreshSkillIndex();
  }
}

async function onStartup(): Promise<void> {
  console.log('[Agentic Skills] Background event page started');
  
  // Create alarm for periodic refresh
  const ttl = await getCacheTtl();
  browser.alarms.create('refresh-skill-index', {
    periodInMinutes: Math.max(1, Math.round(ttl / 60000)),
  });
  
  // Initial fetch if cache is empty or stale
  const cached = await browser.storage.local.get(STORAGE_KEYS_LOCAL.SKILL_INDEX);
  const index = cached[STORAGE_KEYS_LOCAL.SKILL_INDEX] as SkillIndex | undefined;
  
  if (!index || Date.now() - index.fetchedAt > ttl) {
    await refreshSkillIndex();
  }
}

async function handleCommand(command: string): Promise<void> {
  if (command === 'toggle-palette') {
    // Send message to all tabs to toggle palette
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await browser.tabs.sendMessage(tab.id, { type: 'TOGGLE_PALETTE' });
        } catch (e) {
          // Content script might not be loaded on this tab
        }
      }
    }
  }
}

// Event listeners
browser.runtime.onStartup.addListener(onStartup);
browser.runtime.onInstalled.addListener(onStartup);
browser.alarms.onAlarm.addListener(onAlarm);
browser.commands.onCommand.addListener(handleCommand);

// Handle messages from content script
browser.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === 'FETCH_SKILL_MD') {
    const { skillName } = message;
    const origin = await getCdnOrigin();
    const path = deriveSkillPath(skillName);
    const url = `${origin.replace(/\/$/, '')}/${path}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'NOT_FOUND', message: 'This skill is unavailable.' };
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      return { success: true, content: text };
    } catch (error) {
      console.error('[Agentic Skills] Failed to fetch SKILL.md:', error);
      return { success: false, error: 'NETWORK_ERROR', message: 'Could not load skill. Check your connection.' };
    }
  }
  
  if (message.type === 'GET_CACHED_INDEX') {
    const cached = await browser.storage.local.get(STORAGE_KEYS_LOCAL.SKILL_INDEX);
    return cached[STORAGE_KEYS_LOCAL.SKILL_INDEX] || { skills: [], fetchedAt: 0 };
  }
  
  return undefined;
});

console.log('[Agentic Skills] Background script loaded');