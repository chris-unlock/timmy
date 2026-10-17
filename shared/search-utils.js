/**
 * Timmy - Gmail Power Search
 * Search Query & Navigation Utilities
 */

(function () {
  const isNode = typeof module !== 'undefined' && module.exports;
  const Constants = isNode 
    ? require('./constants') 
    : (globalThis.TimmyConstants || window.TimmyConstants);

  /**
   * Builds the final Gmail search operator string from a preset pattern and a user term.
   * Handles patterns with or without '%s'.
   */
  function buildSearchQuery(pattern, rawTerm) {
    const term = (rawTerm || '').trim();
    if (!pattern) return term;

    let result = '';
    if (pattern.includes('%s')) {
      if (term) {
        result = pattern.replace(/%s/g, term);
      } else {
        // Remove quotes around %s if empty (e.g. "%s" -> "")
        let cleanedPattern = pattern.replace(/"%s"/g, '');
        cleanedPattern = cleanedPattern.replace(/%s/g, '');
        result = cleanedPattern;
      }
    } else {
      result = term ? `${pattern} ${term}` : pattern;
    }

    // Collapse multiple spaces and trim
    return result.replace(/\s+/g, ' ').trim();
  }

  /**
   * Constructs the Gmail search URL for a given account index and query.
   */
  function buildGmailUrl(accountIndex, finalQuery) {
    const idx = (accountIndex !== undefined && accountIndex !== null && accountIndex !== '') 
      ? String(accountIndex) 
      : '0';
    
    // Gmail uses '+' for spaces and percent encoding for special characters
    const encodedQuery = encodeURIComponent(finalQuery || '').replace(/%20/g, '+');
    return `https://mail.google.com/mail/u/${idx}/#search/${encodedQuery}`;
  }

  /**
   * Extracts the account index (0, 1, 2...) from a Gmail URL.
   */
  function extractAccountIndex(url) {
    if (!url) return '0';
    const match = url.match(/\/mail\/u\/(\d+)\//i);
    return match ? match[1] : '0';
  }

  /**
   * Gets storage area (sync with local fallback).
   */
  function getStorageArea() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome.storage.sync || chrome.storage.local;
    }
    return null;
  }

  /**
   * Loads all Timmy settings from Chrome storage.
   */
  async function loadSettings() {
    const storage = getStorageArea();
    if (!storage) {
      return { ...Constants.DEFAULT_SETTINGS };
    }

    return new Promise((resolve) => {
      storage.get(null, (items) => {
        if (chrome.runtime.lastError || !items) {
          resolve({ ...Constants.DEFAULT_SETTINGS });
          return;
        }

        const settings = {
          presets: items[Constants.STORAGE_KEYS.PRESETS] || Constants.DEFAULT_PRESETS,
          defaultPresetId: items[Constants.STORAGE_KEYS.DEFAULT_PRESET_ID] || Constants.DEFAULT_SETTINGS.defaultPresetId,
          enableGmailPills: items[Constants.STORAGE_KEYS.ENABLE_GMAIL_PILLS] !== undefined 
            ? items[Constants.STORAGE_KEYS.ENABLE_GMAIL_PILLS] 
            : Constants.DEFAULT_SETTINGS.enableGmailPills,
          accountMode: items[Constants.STORAGE_KEYS.ACCOUNT_MODE] || Constants.DEFAULT_SETTINGS.accountMode,
          tabBehavior: items[Constants.STORAGE_KEYS.TAB_BEHAVIOR] || Constants.DEFAULT_SETTINGS.tabBehavior,
          recentSearches: items[Constants.STORAGE_KEYS.RECENT_SEARCHES] || []
        };
        resolve(settings);
      });
    });
  }

  /**
   * Saves settings to Chrome storage.
   */
  async function saveSettings(partialSettings) {
    const storage = getStorageArea();
    if (!storage) return false;

    const data = {};
    if (partialSettings.presets !== undefined) {
      data[Constants.STORAGE_KEYS.PRESETS] = partialSettings.presets;
    }
    if (partialSettings.defaultPresetId !== undefined) {
      data[Constants.STORAGE_KEYS.DEFAULT_PRESET_ID] = partialSettings.defaultPresetId;
    }
    if (partialSettings.enableGmailPills !== undefined) {
      data[Constants.STORAGE_KEYS.ENABLE_GMAIL_PILLS] = partialSettings.enableGmailPills;
    }
    if (partialSettings.accountMode !== undefined) {
      data[Constants.STORAGE_KEYS.ACCOUNT_MODE] = partialSettings.accountMode;
    }
    if (partialSettings.tabBehavior !== undefined) {
      data[Constants.STORAGE_KEYS.TAB_BEHAVIOR] = partialSettings.tabBehavior;
    }
    if (partialSettings.recentSearches !== undefined) {
      data[Constants.STORAGE_KEYS.RECENT_SEARCHES] = partialSettings.recentSearches;
    }

    return new Promise((resolve) => {
      storage.set(data, () => {
        resolve(!chrome.runtime.lastError);
      });
    });
  }

  /**
   * Adds a term to recent searches list.
   */
  async function addRecentSearch(term, presetId) {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();
    const settings = await loadSettings();
    const existing = settings.recentSearches || [];

    // Filter out duplicate
    const updated = [
      { term: cleanTerm, presetId: presetId || settings.defaultPresetId, timestamp: Date.now() },
      ...existing.filter(item => item.term.toLowerCase() !== cleanTerm.toLowerCase())
    ].slice(0, 10);

    await saveSettings({ recentSearches: updated });
  }

  const TimmySearchUtils = {
    buildSearchQuery,
    buildGmailUrl,
    extractAccountIndex,
    loadSettings,
    saveSettings,
    addRecentSearch
  };

  if (typeof globalThis !== 'undefined') {
    globalThis.TimmySearchUtils = TimmySearchUtils;
  }
  if (isNode) {
    module.exports = TimmySearchUtils;
  }
})();
