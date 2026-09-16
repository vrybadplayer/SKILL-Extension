const STORAGE_KEYS = {
  CDN_ORIGIN: 'cdnOrigin',
  CACHE_TTL: 'cacheTtl',
} as const;

const DEFAULT_CDN_ORIGIN = 'https://<github-user>.github.io/<repo>';
const DEFAULT_CACHE_TTL = 5;

// Firefox WebExtension types
declare const browser: {
  storage: {
    local: {
      get(keys: string | string[]): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
    };
  };
  runtime: {
    sendMessage(message: unknown): Promise<unknown>;
  };
};

const cdnOriginInput = document.getElementById('cdnOrigin') as HTMLInputElement;
const cacheTtlInput = document.getElementById('cacheTtl') as HTMLInputElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const refreshBtn = document.getElementById('refreshBtn') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const privacyLink = document.getElementById('privacyLink') as HTMLAnchorElement;

async function loadSettings(): Promise<void> {
  const result = await browser.storage.local.get([STORAGE_KEYS.CDN_ORIGIN, STORAGE_KEYS.CACHE_TTL]);
  cdnOriginInput.value = result[STORAGE_KEYS.CDN_ORIGIN] || DEFAULT_CDN_ORIGIN;
  cacheTtlInput.value = String(result[STORAGE_KEYS.CACHE_TTL] || DEFAULT_CACHE_TTL);
}

function showStatus(message: string, type: 'success' | 'error'): void {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  setTimeout(() => {
    statusEl.className = 'status';
    statusEl.textContent = '';
  }, 3000);
}

async function saveSettings(): Promise<void> {
  const cdnOrigin = cdnOriginInput.value.trim();
  const cacheTtl = parseInt(cacheTtlInput.value, 10);
  
  if (!cdnOrigin) {
    showStatus('CDN origin is required', 'error');
    return;
  }
  
  if (isNaN(cacheTtl) || cacheTtl < 1 || cacheTtl > 1440) {
    showStatus('Cache TTL must be between 1 and 1440 minutes', 'error');
    return;
  }
  
  try {
    await browser.storage.local.set({
      [STORAGE_KEYS.CDN_ORIGIN]: cdnOrigin,
      [STORAGE_KEYS.CACHE_TTL]: cacheTtl,
    });
    
    // Notify background to update alarm
    browser.runtime.sendMessage({ type: 'UPDATE_CACHE_TTL', cacheTtl: cacheTtl * 60 * 1000 });
    
    showStatus('Settings saved', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('Failed to save settings', 'error');
  }
}

async function refreshNow(): Promise<void> {
  try {
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Refreshing...';
    
    await browser.runtime.sendMessage({ type: 'REFRESH_INDEX' });
    
    showStatus('Skill index refreshed', 'success');
  } catch (error) {
    console.error('Failed to refresh index:', error);
    showStatus('Failed to refresh index', 'error');
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = 'Refresh Now';
  }
}

// Privacy policy link - for now just show an alert
privacyLink.addEventListener('click', (e) => {
  e.preventDefault();
  alert('Privacy Policy:\n\nThis extension does not collect any personal data.\nAll data is stored locally in browser.storage.local.\nOnly network requests are to the configured GitHub Pages CDN.\n\nFull policy would be hosted at the CDN origin.');
});

// Event listeners
saveBtn.addEventListener('click', saveSettings);
refreshBtn.addEventListener('click', refreshNow);

// Load settings on page load
loadSettings();

console.log('[Agentic Skills] Options page loaded');