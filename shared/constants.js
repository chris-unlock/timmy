/**
 * Timmy - Gmail Power Search
 * Shared Constants and Default Configuration
 */

const DEFAULT_PRESETS = [
  {
    id: 'anywhere',
    label: 'Entire Mailbox (Spam & Trash)',
    shortLabel: 'Anywhere',
    icon: '🌐',
    queryPattern: 'in:anywhere %s',
    category: 'retrieval',
    description: 'Searches all folders including Spam and Trash (bypasses Gmail’s hidden omissions)',
    isDefault: true,
    isBuiltin: true
  },
  {
    id: 'primary',
    label: 'Primary Inbox Only',
    shortLabel: 'Primary',
    icon: '📥',
    queryPattern: 'category:primary %s',
    category: 'inbox',
    description: 'Restricts search strictly to Primary tab (filters out Updates, Promotions, Social)',
    isBuiltin: true
  },
  {
    id: 'unread_primary',
    label: 'Actionable Unread (Primary)',
    shortLabel: 'Unread Primary',
    icon: '✉️',
    queryPattern: 'category:primary is:unread %s',
    category: 'inbox',
    description: 'Actionable unread items waiting in your primary inbox',
    isBuiltin: true
  },
  {
    id: 'unread_clean',
    label: 'All Unread (No Newsletters)',
    shortLabel: 'Unread Clean',
    icon: '📬',
    queryPattern: 'is:unread -category:(promotions OR social) %s',
    category: 'inbox',
    description: 'All unread mail excluding promotional spam and social feeds',
    isBuiltin: true
  },
  {
    id: 'exact_verbatim',
    label: 'Exact Verbatim Match',
    shortLabel: 'Exact Match',
    icon: '🎯',
    queryPattern: '"%s" in:anywhere',
    category: 'precision',
    description: 'Encloses your term in quotes across all mail to shut off Gmail’s fuzzy AI guesses',
    isBuiltin: true
  },
  {
    id: 'large_files',
    label: 'Large Files (> 10MB)',
    shortLabel: '> 10MB',
    icon: '📎',
    queryPattern: 'has:attachment larger:10M %s',
    category: 'attachments',
    description: 'Finds heavy attachments, large slide decks, and storage hogs',
    isBuiltin: true
  },
  {
    id: 'pdf_docs',
    label: 'PDF Documents',
    shortLabel: 'PDFs',
    icon: '📄',
    queryPattern: 'filename:pdf %s',
    category: 'attachments',
    description: 'Searches specifically for PDF attachments (contracts, invoices, tickets)',
    isBuiltin: true
  },
  {
    id: 'spreadsheets',
    label: 'Spreadsheets (XLSX, CSV)',
    shortLabel: 'Sheets',
    icon: '📊',
    queryPattern: 'filename:(xlsx OR csv OR sheets) %s',
    category: 'attachments',
    description: 'Finds Excel sheets, CSV exports, and Google Sheets links',
    isBuiltin: true
  },
  {
    id: 'sent_to_others',
    label: 'Sent to Others',
    shortLabel: 'Sent',
    icon: '📤',
    queryPattern: 'from:me -to:me %s',
    category: 'people',
    description: 'Emails sent by you to external recipients (omits self-notes)',
    isBuiltin: true
  },
  {
    id: 'direct_to_me',
    label: 'Directly to Me (Not Lists)',
    shortLabel: 'Direct to Me',
    icon: '👤',
    queryPattern: 'deliveredto:me %s',
    category: 'people',
    description: 'Emails sent directly to your address, bypassing group mailing lists',
    isBuiltin: true
  },
  {
    id: 'receipts_purchases',
    label: 'Receipts & Invoices',
    shortLabel: 'Receipts',
    icon: '🧾',
    queryPattern: 'in:anywhere (category:purchases OR invoice OR receipt OR "order confirmation") %s',
    category: 'financial',
    description: 'Scours everywhere for purchase confirmations, invoices, and billing receipts',
    isBuiltin: true
  },
  {
    id: 'past_week',
    label: 'Past 7 Days',
    shortLabel: 'Last 7d',
    icon: '⏱️',
    queryPattern: 'newer_than:7d %s',
    category: 'time',
    description: 'Restricts query to the past week',
    isBuiltin: true
  }
];

const DEFAULT_SETTINGS = {
  presets: DEFAULT_PRESETS,
  defaultPresetId: 'anywhere',
  enableGmailPills: true,
  accountMode: 'auto', // 'auto' | '0' | '1' | '2' ...
  tabBehavior: 'reuse', // 'reuse' | 'new_tab'
  recentSearches: []
};

const STORAGE_KEYS = {
  PRESETS: 'timmy_presets',
  DEFAULT_PRESET_ID: 'timmy_default_preset_id',
  ENABLE_GMAIL_PILLS: 'timmy_enable_gmail_pills',
  ACCOUNT_MODE: 'timmy_account_mode',
  TAB_BEHAVIOR: 'timmy_tab_behavior',
  RECENT_SEARCHES: 'timmy_recent_searches'
};

// Export for module/background as well as standard global scope
const TimmyConstants = {
  DEFAULT_PRESETS,
  DEFAULT_SETTINGS,
  STORAGE_KEYS
};

if (typeof globalThis !== 'undefined') {
  globalThis.TimmyConstants = TimmyConstants;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimmyConstants;
}
