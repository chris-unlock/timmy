/**
 * Timmy - Gmail Power Search
 * Background Service Worker (Manifest V3)
 */

import '../shared/constants.js';
import '../shared/search-utils.js';

const { DEFAULT_PRESETS, DEFAULT_SETTINGS, STORAGE_KEYS } = globalThis.TimmyConstants;
const { buildSearchQuery, buildGmailUrl, extractAccountIndex, loadSettings, addRecentSearch } = globalThis.TimmySearchUtils;

/**
 * Initialize default settings on install or update.
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  const storage = chrome.storage.sync || chrome.storage.local;
  storage.get([STORAGE_KEYS.PRESETS, STORAGE_KEYS.DEFAULT_PRESET_ID], (res) => {
    const updates = {};
    if (!res[STORAGE_KEYS.PRESETS] || !Array.isArray(res[STORAGE_KEYS.PRESETS]) || res[STORAGE_KEYS.PRESETS].length === 0) {
      updates[STORAGE_KEYS.PRESETS] = DEFAULT_PRESETS;
    }
    if (!res[STORAGE_KEYS.DEFAULT_PRESET_ID]) {
      updates[STORAGE_KEYS.DEFAULT_PRESET_ID] = DEFAULT_SETTINGS.defaultPresetId;
    }
    if (Object.keys(updates).length > 0) {
      storage.set(updates);
    }
  });

  updateOmniboxDefaultSuggestion();
});

/**
 * Updates Omnibox default suggestion banner.
 */
async function updateOmniboxDefaultSuggestion() {
  const settings = await loadSettings();
  const presets = settings.presets || DEFAULT_PRESETS;
  const def = presets.find(p => p.id === settings.defaultPresetId) || presets[0] || DEFAULT_PRESETS[0];

  chrome.omnibox.setDefaultSuggestion({
    description: `Timmy Search: <match>%s</match> <dim>(Enter for [${def.shortLabel}]: ${escapeXml(def.queryPattern)})</dim>`
  });
}

function escapeXml(unsafe) {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Omnibox: When user starts typing `t <space>`
 */
chrome.omnibox.onInputStarted.addListener(() => {
  updateOmniboxDefaultSuggestion();
});

/**
 * Omnibox: As user types terms, suggest presets.
 */
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  const query = (text || '').trim();
  const settings = await loadSettings();
  const presets = settings.presets || DEFAULT_PRESETS;

  const suggestions = presets.slice(0, 6).map((preset) => {
    const finalQuery = buildSearchQuery(preset.queryPattern, query);
    const isDefault = preset.id === settings.defaultPresetId;
    const badge = isDefault ? ' [DEFAULT]' : '';
    
    return {
      content: `preset:${preset.id}:${query}`,
      description: `<match>${escapeXml(preset.icon || '🔍')} ${escapeXml(preset.shortLabel)}${badge}:</match> <dim>${escapeXml(finalQuery)}</dim>`
    };
  });

  suggest(suggestions);
});

/**
 * Omnibox: When user hits Enter or selects a suggestion.
 */
chrome.omnibox.onInputEntered.addListener(async (input, disposition) => {
  let presetId = null;
  let query = input;

  if (input.startsWith('preset:')) {
    const parts = input.split(':');
    if (parts.length >= 3) {
      presetId = parts[1];
      query = parts.slice(2).join(':');
    }
  }

  await performSearch({
    query,
    presetId,
    disposition: disposition || 'currentTab'
  });
});

/**
 * Core search and navigation runner.
 */
async function performSearch({ query, presetId = null, accountIndexOverride = null, disposition = 'currentTab' }) {
  const settings = await loadSettings();
  const presets = settings.presets || DEFAULT_PRESETS;
  const activePreset = presets.find(p => p.id === (presetId || settings.defaultPresetId)) || presets[0] || DEFAULT_PRESETS[0];

  const finalQuery = buildSearchQuery(activePreset.queryPattern, query);
  
  if (query && query.trim()) {
    await addRecentSearch(query.trim(), activePreset.id);
  }

  // Determine target account index and tab
  let accountIndex = '0';
  let targetTab = null;

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const allGmailTabs = await chrome.tabs.query({ url: '*://mail.google.com/mail/*' });

  const isActiveTabGmail = activeTab && activeTab.url && activeTab.url.includes('mail.google.com/mail/');

  if (accountIndexOverride !== null && accountIndexOverride !== undefined) {
    accountIndex = String(accountIndexOverride);
  } else if (settings.accountMode === 'auto') {
    if (isActiveTabGmail) {
      accountIndex = extractAccountIndex(activeTab.url);
      targetTab = activeTab;
    } else if (allGmailTabs.length > 0) {
      accountIndex = extractAccountIndex(allGmailTabs[0].url);
      if (settings.tabBehavior === 'reuse') {
        targetTab = allGmailTabs[0];
      }
    }
  } else {
    accountIndex = settings.accountMode || '0';
    if (settings.tabBehavior === 'reuse' && allGmailTabs.length > 0) {
      const match = allGmailTabs.find(t => t.url && t.url.includes(`/mail/u/${accountIndex}/`));
      targetTab = match || allGmailTabs[0];
    }
  }

  const targetUrl = buildGmailUrl(accountIndex, finalQuery);

  // Navigate according to tab behavior & disposition
  if (disposition === 'newForegroundTab') {
    await chrome.tabs.create({ url: targetUrl, active: true });
  } else if (disposition === 'newBackgroundTab') {
    await chrome.tabs.create({ url: targetUrl, active: false });
  } else {
    // Current / reuse flow
    if (targetTab && settings.tabBehavior === 'reuse') {
      await chrome.tabs.update(targetTab.id, { url: targetUrl, active: true });
      if (targetTab.windowId) {
        await chrome.windows.update(targetTab.windowId, { focused: true });
      }
    } else if (isActiveTabGmail) {
      await chrome.tabs.update(activeTab.id, { url: targetUrl, active: true });
    } else {
      await chrome.tabs.create({ url: targetUrl, active: true });
    }
  }
}

/**
 * Handle messages from popup, options, or content scripts.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'EXECUTE_SEARCH') {
    performSearch({
      query: message.query,
      presetId: message.presetId,
      accountIndexOverride: message.accountIndex
    }).then(() => {
      sendResponse({ success: true });
    }).catch((err) => {
      sendResponse({ success: false, error: err.message });
    });
    return true; // async response
  }

  if (message.action === 'GET_ACTIVE_ACCOUNT') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab && tab.url && tab.url.includes('mail.google.com/mail/')) {
        sendResponse({ isGmail: true, accountIndex: extractAccountIndex(tab.url), tabId: tab.id });
      } else {
        sendResponse({ isGmail: false, accountIndex: '0' });
      }
    });
    return true;
  }

  if (message.action === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return false;
  }

  if (message.action === 'SETTINGS_UPDATED') {
    updateOmniboxDefaultSuggestion();
    sendResponse({ success: true });
    return false;
  }
});
