/**
 * Timmy - Gmail Power Search
 * In-Gmail Pill Bar Content Script
 */

(function () {
  const STORAGE_KEYS = {
    PRESETS: 'timmy_presets',
    ENABLE_GMAIL_PILLS: 'timmy_enable_gmail_pills',
    DEFAULT_PRESET_ID: 'timmy_default_preset_id'
  };

  let pillContainer = null;
  let observer = null;
  let isEnabled = true;
  let currentPresets = [];

  function log(...args) {
    // console.log('[Timmy Gmail Bar]', ...args);
  }

  /**
   * Builds the final search query from pattern and term.
   */
  function buildSearchQuery(pattern, rawTerm) {
    const term = (rawTerm || '').trim();
    if (!pattern) return term;

    let result = '';
    if (pattern.includes('%s')) {
      if (term) {
        result = pattern.replace(/%s/g, term);
      } else {
        let cleanedPattern = pattern.replace(/"%s"/g, '');
        cleanedPattern = cleanedPattern.replace(/%s/g, '');
        result = cleanedPattern;
      }
    } else {
      result = term ? `${pattern} ${term}` : pattern;
    }
    return result.replace(/\s+/g, ' ').trim();
  }

  /**
   * Find Gmail's native search input.
   */
  function getGmailSearchInput() {
    return document.querySelector('input[name="q"]') || 
           document.querySelector('input[aria-label="Search mail"]') ||
           document.querySelector('input[aria-label*="Search"]') ||
           document.querySelector('form[role="search"] input');
  }

  /**
   * Execute search directly inside Gmail.
   */
  function triggerGmailSearch(finalQuery) {
    const input = getGmailSearchInput();
    if (input) {
      input.value = finalQuery;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Gmail routes searches using hash navigation
    const encoded = encodeURIComponent(finalQuery).replace(/%20/g, '+');
    window.location.hash = `#search/${encoded}`;

    if (input) {
      input.focus();
    }
  }

  /**
   * Create the pill bar element.
   */
  function createPillBar(presets) {
    if (document.getElementById('timmy-gmail-pillbar')) {
      document.getElementById('timmy-gmail-pillbar').remove();
    }

    const bar = document.createElement('div');
    bar.id = 'timmy-gmail-pillbar';

    // Badge
    const badge = document.createElement('span');
    badge.className = 'timmy-pill-badge';
    badge.innerHTML = '⚡ Timmy';
    badge.title = 'Timmy Power Search Presets (Click to run or modify search)';
    bar.appendChild(badge);

    // Filter to top 7 most useful pills for the inline bar
    const pillsToShow = (presets && presets.length > 0) 
      ? presets.slice(0, 8) 
      : (window.TimmyConstants?.DEFAULT_PRESETS || []).slice(0, 8);

    pillsToShow.forEach((preset) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'timmy-pill-btn';
      btn.dataset.presetId = preset.id;
      btn.title = preset.description || preset.label;

      const iconSpan = document.createElement('span');
      iconSpan.className = 'timmy-pill-icon';
      iconSpan.textContent = preset.icon || '🔍';

      const textSpan = document.createElement('span');
      textSpan.className = 'timmy-pill-text';
      textSpan.textContent = preset.shortLabel || preset.label;

      btn.appendChild(iconSpan);
      btn.appendChild(textSpan);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const input = getGmailSearchInput();
        let existingTerm = input ? input.value : '';

        // If user already typed some search term in Gmail, apply the preset to it
        const finalQuery = buildSearchQuery(preset.queryPattern, existingTerm);
        triggerGmailSearch(finalQuery);
      });

      bar.appendChild(btn);
    });

    return bar;
  }

  /**
   * Inject pill bar into Gmail's DOM.
   */
  function injectPillBar() {
    if (!isEnabled) {
      removePillBar();
      return;
    }

    if (document.getElementById('timmy-gmail-pillbar')) {
      return; // Already present
    }

    // Attempt to find Gmail's search bar wrapper
    const searchForm = document.querySelector('form[role="search"]') || 
                       document.querySelector('[role="search"]') ||
                       document.querySelector('header input[name="q"]')?.closest('header');

    if (!searchForm) {
      return; // Search bar not rendered yet
    }

    pillContainer = createPillBar(currentPresets);

    // Place underneath or adjacent to search bar
    if (searchForm.parentElement) {
      // If there's a dedicated search container, append after form
      searchForm.parentElement.insertAdjacentElement('afterend', pillContainer);
    } else {
      searchForm.insertAdjacentElement('afterend', pillContainer);
    }

    log('Pill bar successfully injected');
  }

  function removePillBar() {
    const existing = document.getElementById('timmy-gmail-pillbar');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Start observer to watch for Gmail's dynamic page loads.
   */
  function startObserver() {
    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
      if (isEnabled && !document.getElementById('timmy-gmail-pillbar')) {
        injectPillBar();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Initialize settings and load state.
   */
  function init() {
    const storage = chrome.storage.sync || chrome.storage.local;
    if (!storage) return;

    storage.get([STORAGE_KEYS.ENABLE_GMAIL_PILLS, STORAGE_KEYS.PRESETS], (data) => {
      isEnabled = data[STORAGE_KEYS.ENABLE_GMAIL_PILLS] !== false; // Default true
      currentPresets = data[STORAGE_KEYS.PRESETS] || window.TimmyConstants?.DEFAULT_PRESETS || [];

      if (isEnabled) {
        injectPillBar();
        startObserver();
      }
    });

    // Listen for setting changes in real time
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (changes[STORAGE_KEYS.ENABLE_GMAIL_PILLS]) {
        isEnabled = changes[STORAGE_KEYS.ENABLE_GMAIL_PILLS].newValue !== false;
        if (isEnabled) {
          injectPillBar();
          startObserver();
        } else {
          removePillBar();
          if (observer) observer.disconnect();
        }
      }

      if (changes[STORAGE_KEYS.PRESETS]) {
        currentPresets = changes[STORAGE_KEYS.PRESETS].newValue || [];
        if (isEnabled) {
          removePillBar();
          injectPillBar();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
