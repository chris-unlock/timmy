/**
 * Timmy - Gmail Power Search
 * Options Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { loadSettings, saveSettings } = globalThis.TimmySearchUtils;
  const { DEFAULT_PRESETS, DEFAULT_SETTINGS } = globalThis.TimmyConstants;

  // State
  let settings = await loadSettings();

  // DOM Elements - Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const toastMessage = document.getElementById('toastMessage');

  // DOM Elements - Presets
  const presetsTableBody = document.getElementById('presetsTableBody');
  const addNewPresetBtn = document.getElementById('addNewPresetBtn');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
  
  // Modal Elements
  const presetModal = document.getElementById('presetModal');
  const modalTitle = document.getElementById('modalTitle');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const presetForm = document.getElementById('presetForm');
  const editPresetId = document.getElementById('editPresetId');
  const presetIcon = document.getElementById('presetIcon');
  const presetShortLabel = document.getElementById('presetShortLabel');
  const presetLabel = document.getElementById('presetLabel');
  const presetPattern = document.getElementById('presetPattern');
  const presetDesc = document.getElementById('presetDesc');

  // DOM Elements - General
  const generalGmailPills = document.getElementById('generalGmailPills');
  const generalTabBehavior = document.getElementById('generalTabBehavior');
  const generalAccountMode = document.getElementById('generalAccountMode');
  const saveGeneralBtn = document.getElementById('saveGeneralBtn');

  // DOM Elements - Omnibox & Shortcuts
  const openShortcutsBtn = document.getElementById('openShortcutsBtn');

  // DOM Elements - Backup
  const exportConfigBtn = document.getElementById('exportConfigBtn');
  const importConfigBtn = document.getElementById('importConfigBtn');
  const importFileInput = document.getElementById('importFileInput');

  // Toast Notification
  function showToast(msg) {
    toastMessage.textContent = msg;
    toastMessage.classList.remove('hidden');
    setTimeout(() => {
      toastMessage.classList.add('hidden');
    }, 2400);
  }

  // Tab Navigation
  navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.dataset.tab;

      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const pane = document.getElementById(`tab-${targetTab}`);
      if (pane) pane.classList.add('active');
    });
  });

  // Render Presets Table
  function renderPresetsTable() {
    presetsTableBody.innerHTML = '';
    const presets = settings.presets || DEFAULT_PRESETS;

    presets.forEach((preset, index) => {
      const tr = document.createElement('tr');
      const isDefault = preset.id === settings.defaultPresetId;

      tr.innerHTML = `
        <td class="preset-icon-cell">${preset.icon || '🔍'}</td>
        <td>
          <div class="preset-title-wrap">
            <span class="preset-title-main">${escapeHtml(preset.shortLabel || preset.label)}</span>
            <span class="preset-title-desc">${escapeHtml(preset.description || preset.label)}</span>
          </div>
        </td>
        <td>
          <code class="query-code" title="${escapeHtml(preset.queryPattern)}">${escapeHtml(preset.queryPattern)}</code>
        </td>
        <td class="default-radio-cell">
          <input type="radio" name="defaultPresetRadio" value="${preset.id}" ${isDefault ? 'checked' : ''} title="Make Default Preset">
        </td>
        <td class="actions-cell">
          <button class="action-icon-btn move-up-btn" data-index="${index}" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.3;"' : ''}>↑</button>
          <button class="action-icon-btn move-down-btn" data-index="${index}" title="Move Down" ${index === presets.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>↓</button>
          <button class="action-icon-btn edit-btn" data-index="${index}" title="Edit Preset">✏️</button>
          <button class="action-icon-btn delete-btn" data-index="${index}" title="Delete Preset">🗑️</button>
        </td>
      `;

      // Set as Default Radio
      const radio = tr.querySelector('input[name="defaultPresetRadio"]');
      radio.addEventListener('change', async () => {
        settings.defaultPresetId = preset.id;
        await saveSettings({ defaultPresetId: preset.id });
        chrome.runtime.sendMessage({ action: 'SETTINGS_UPDATED' });
        showToast(`Default preset set to "${preset.shortLabel || preset.label}"`);
      });

      // Move Up
      const moveUpBtn = tr.querySelector('.move-up-btn');
      moveUpBtn.addEventListener('click', async () => {
        if (index > 0) {
          const temp = presets[index];
          presets[index] = presets[index - 1];
          presets[index - 1] = temp;
          settings.presets = presets;
          await saveSettings({ presets });
          renderPresetsTable();
        }
      });

      // Move Down
      const moveDownBtn = tr.querySelector('.move-down-btn');
      moveDownBtn.addEventListener('click', async () => {
        if (index < presets.length - 1) {
          const temp = presets[index];
          presets[index] = presets[index + 1];
          presets[index + 1] = temp;
          settings.presets = presets;
          await saveSettings({ presets });
          renderPresetsTable();
        }
      });

      // Edit
      const editBtn = tr.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        openEditModal(preset);
      });

      // Delete
      const deleteBtn = tr.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', async () => {
        if (presets.length <= 1) {
          alert('You must have at least one search preset.');
          return;
        }
        if (confirm(`Delete preset "${preset.shortLabel || preset.label}"?`)) {
          presets.splice(index, 1);
          if (settings.defaultPresetId === preset.id) {
            settings.defaultPresetId = presets[0].id;
          }
          settings.presets = presets;
          await saveSettings({ presets, defaultPresetId: settings.defaultPresetId });
          chrome.runtime.sendMessage({ action: 'SETTINGS_UPDATED' });
          renderPresetsTable();
          showToast('Preset deleted');
        }
      });

      presetsTableBody.appendChild(tr);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // Modal Handlers
  function openAddModal() {
    modalTitle.textContent = 'Add New Search Preset';
    editPresetId.value = '';
    presetIcon.value = '🔍';
    presetShortLabel.value = '';
    presetLabel.value = '';
    presetPattern.value = 'in:anywhere %s';
    presetDesc.value = '';
    presetModal.classList.remove('hidden');
    presetShortLabel.focus();
  }

  function openEditModal(preset) {
    modalTitle.textContent = 'Edit Search Preset';
    editPresetId.value = preset.id;
    presetIcon.value = preset.icon || '🔍';
    presetShortLabel.value = preset.shortLabel || preset.label || '';
    presetLabel.value = preset.label || '';
    presetPattern.value = preset.queryPattern || '';
    presetDesc.value = preset.description || '';
    presetModal.classList.remove('hidden');
    presetShortLabel.focus();
  }

  function closeModal() {
    presetModal.classList.add('hidden');
  }

  addNewPresetBtn.addEventListener('click', openAddModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);
  presetModal.addEventListener('click', (e) => {
    if (e.target === presetModal) closeModal();
  });

  presetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editPresetId.value || 'custom_' + Date.now();
    const presets = settings.presets || DEFAULT_PRESETS;

    const newPreset = {
      id: id,
      icon: presetIcon.value.trim() || '🔍',
      shortLabel: presetShortLabel.value.trim(),
      label: presetLabel.value.trim() || presetShortLabel.value.trim(),
      queryPattern: presetPattern.value.trim(),
      description: presetDesc.value.trim(),
      isBuiltin: false
    };

    const existingIdx = presets.findIndex(p => p.id === id);
    if (existingIdx >= 0) {
      presets[existingIdx] = { ...presets[existingIdx], ...newPreset };
    } else {
      presets.push(newPreset);
    }

    settings.presets = presets;
    await saveSettings({ presets });
    chrome.runtime.sendMessage({ action: 'SETTINGS_UPDATED' });
    closeModal();
    renderPresetsTable();
    showToast('Preset saved successfully');
  });

  // Reset Presets
  resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Reset all presets back to factory defaults? Custom presets will be removed.')) {
      settings.presets = DEFAULT_PRESETS;
      settings.defaultPresetId = DEFAULT_SETTINGS.defaultPresetId;
      await saveSettings({ presets: DEFAULT_PRESETS, defaultPresetId: settings.defaultPresetId });
      chrome.runtime.sendMessage({ action: 'SETTINGS_UPDATED' });
      renderPresetsTable();
      showToast('Presets reset to factory defaults');
    }
  });

  // General Settings
  generalGmailPills.checked = settings.enableGmailPills !== false;
  generalTabBehavior.value = settings.tabBehavior || 'reuse';
  generalAccountMode.value = settings.accountMode || 'auto';

  saveGeneralBtn.addEventListener('click', async () => {
    const updates = {
      enableGmailPills: generalGmailPills.checked,
      tabBehavior: generalTabBehavior.value,
      accountMode: generalAccountMode.value
    };
    await saveSettings(updates);
    Object.assign(settings, updates);
    showToast('General preferences saved');
  });

  // Open Chrome Shortcuts
  openShortcutsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  // Export
  exportConfigBtn.addEventListener('click', () => {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: settings
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timmy-presets-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Preset configuration exported');
  });

  // Import
  importConfigBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const importedSettings = parsed.settings || parsed;

        if (Array.isArray(importedSettings.presets) && importedSettings.presets.length > 0) {
          settings = { ...settings, ...importedSettings };
          await saveSettings(settings);
          chrome.runtime.sendMessage({ action: 'SETTINGS_UPDATED' });
          renderPresetsTable();
          generalGmailPills.checked = settings.enableGmailPills !== false;
          generalTabBehavior.value = settings.tabBehavior || 'reuse';
          generalAccountMode.value = settings.accountMode || 'auto';
          showToast('Configuration imported successfully!');
        } else {
          alert('Invalid configuration file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    importFileInput.value = '';
  });

  // Initial table render
  renderPresetsTable();
});
