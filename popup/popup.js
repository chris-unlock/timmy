/**
 * Timmy - Gmail Power Search
 * Popup Interactive Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { loadSettings, saveSettings, buildSearchQuery } = globalThis.TimmySearchUtils;
  const { DEFAULT_PRESETS } = globalThis.TimmyConstants;

  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const clearInputBtn = document.getElementById('clearInputBtn');
  const executeSearchBtn = document.getElementById('executeSearchBtn');
  const queryPreviewText = document.getElementById('queryPreviewText');
  const presetsGrid = document.getElementById('presetsGrid');
  const accountBadge = document.getElementById('accountBadge');
  const settingsToggleBtn = document.getElementById('settingsToggleBtn');
  const settingsDrawer = document.getElementById('settingsDrawer');
  const openFullOptionsBtn = document.getElementById('openFullOptionsBtn');
  const toggleGmailPills = document.getElementById('toggleGmailPills');
  const toggleReuseTab = document.getElementById('toggleReuseTab');
  const selectAccountMode = document.getElementById('selectAccountMode');
  const recentSection = document.getElementById('recentSection');
  const recentList = document.getElementById('recentList');
  const clearRecentBtn = document.getElementById('clearRecentBtn');

  // State
  let settings = await loadSettings();
  let selectedPresetId = settings.defaultPresetId || 'anywhere';
  let activeAccountIndex = '0';
  let isGmailTab = false;

  // Initialize active tab account detection
  chrome.runtime.sendMessage({ action: 'GET_ACTIVE_ACCOUNT' }, (res) => {
    if (res && res.isGmail) {
      isGmailTab = true;
      activeAccountIndex = res.accountIndex;
      accountBadge.textContent = `Gmail: /u/${activeAccountIndex}/`;
      accountBadge.title = `Active tab is Gmail Account /u/${activeAccountIndex}/`;
    } else {
      if (settings.accountMode === 'auto') {
        accountBadge.textContent = 'Auto /u/0/';
        accountBadge.title = 'Will auto-detect Gmail tab or default to /u/0/';
      } else {
        accountBadge.textContent = `Target: /u/${settings.accountMode}/`;
        accountBadge.title = `Configured to target /u/${settings.accountMode}/`;
      }
    }
  });

  // Populate Settings Drawer
  toggleGmailPills.checked = settings.enableGmailPills !== false;
  toggleReuseTab.checked = settings.tabBehavior !== 'new_tab';
  selectAccountMode.value = settings.accountMode || 'auto';

  // Toggle Settings Drawer
  settingsToggleBtn.addEventListener('click', () => {
    settingsDrawer.classList.toggle('hidden');
  });

  // Settings Handlers
  toggleGmailPills.addEventListener('change', async () => {
    await saveSettings({ enableGmailPills: toggleGmailPills.checked });
  });

  toggleReuseTab.addEventListener('change', async () => {
    await saveSettings({ tabBehavior: toggleReuseTab.checked ? 'reuse' : 'new_tab' });
  });

  selectAccountMode.addEventListener('change', async () => {
    await saveSettings({ accountMode: selectAccountMode.value });
    if (!isGmailTab) {
      accountBadge.textContent = selectAccountMode.value === 'auto' 
        ? 'Auto /u/0/' 
        : `Target: /u/${selectAccountMode.value}/`;
    }
  });

  openFullOptionsBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'OPEN_OPTIONS' });
    window.close();
  });

  // Render Presets
  function renderPresets() {
    presetsGrid.innerHTML = '';
    const presets = settings.presets || DEFAULT_PRESETS;

    presets.forEach((preset) => {
      const card = document.createElement('div');
      card.className = `preset-card ${preset.id === selectedPresetId ? 'active' : ''}`;
      card.dataset.presetId = preset.id;
      card.tabIndex = 0; // Accessible keyboard focus

      const isDefault = preset.id === settings.defaultPresetId;

      card.innerHTML = `
        <span class="preset-icon">${preset.icon || '🔍'}</span>
        <div class="preset-details">
          <span class="preset-name">${preset.shortLabel || preset.label}</span>
          <span class="preset-desc">${preset.queryPattern}</span>
        </div>
        ${isDefault ? '<span class="default-tag">Def</span>' : ''}
      `;

      // Click: select preset and if clicked with search term, run search
      card.addEventListener('click', () => {
        selectPreset(preset.id);
        if (searchInput.value.trim().length > 0) {
          executeSearch();
        }
      });

      // Keyboard navigation
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectPreset(preset.id);
          executeSearch();
        }
      });

      presetsGrid.appendChild(card);
    });
  }

  // Select Preset
  function selectPreset(presetId) {
    selectedPresetId = presetId;
    document.querySelectorAll('.preset-card').forEach((el) => {
      el.classList.toggle('active', el.dataset.presetId === presetId);
    });
    updateLivePreview();
  }

  // Update Live Query Preview
  function updateLivePreview() {
    const presets = settings.presets || DEFAULT_PRESETS;
    const active = presets.find(p => p.id === selectedPresetId) || presets[0];
    const rawTerm = searchInput.value;
    const finalQuery = buildSearchQuery(active.queryPattern, rawTerm);
    queryPreviewText.textContent = finalQuery || '(empty)';
  }

  // Render Recent Searches
  function renderRecents() {
    const recents = settings.recentSearches || [];
    if (recents.length === 0) {
      recentSection.classList.add('hidden');
      return;
    }

    recentSection.classList.remove('hidden');
    recentList.innerHTML = '';

    recents.slice(0, 6).forEach((item) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'recent-chip';
      chip.textContent = item.term;
      chip.title = `Search "${item.term}"`;

      chip.addEventListener('click', () => {
        searchInput.value = item.term;
        if (item.presetId) selectPreset(item.presetId);
        updateLivePreview();
        executeSearch();
      });

      recentList.appendChild(chip);
    });
  }

  clearRecentBtn.addEventListener('click', async () => {
    await saveSettings({ recentSearches: [] });
    settings.recentSearches = [];
    renderRecents();
  });

  // Execute Search
  function executeSearch() {
    const query = searchInput.value.trim();
    chrome.runtime.sendMessage({
      action: 'EXECUTE_SEARCH',
      query: query,
      presetId: selectedPresetId,
      accountIndex: isGmailTab ? activeAccountIndex : null
    }, () => {
      window.close();
    });
  }

  // Input Events
  searchInput.addEventListener('input', () => {
    if (searchInput.value.length > 0) {
      clearInputBtn.classList.remove('hidden');
    } else {
      clearInputBtn.classList.add('hidden');
    }
    updateLivePreview();
  });

  clearInputBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearInputBtn.classList.add('hidden');
    searchInput.focus();
    updateLivePreview();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  });

  executeSearchBtn.addEventListener('click', () => {
    executeSearch();
  });

  // Initial renders
  renderPresets();
  renderRecents();
  updateLivePreview();
  searchInput.focus();
});
