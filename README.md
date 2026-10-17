# ⚡ Timmy — Gmail Power Search

A lightweight, zero-tracking Chrome extension for Gmail and Google Workspace power users. Timmy bypasses Gmail's fuzzy AI search fallbacks, searches across hidden folders (Spam & Trash), and provides instant keyboard-driven search presets.

---

## ✨ Features

- **⚡ Address Bar Omnibox (`t <query>`)**: Type `t` followed by <kbd>Space</kbd> or <kbd>Tab</kbd> in your browser address bar to search Gmail instantly from any tab.
- **⌨️ Keyboard Shortcut (`Alt+Shift+T`)**: Pop open a search launcher anywhere with a live query preview and keyboard navigation.
- **💊 In-Gmail Filter Pills**: Native-feeling filter buttons placed right beneath Gmail's search bar for one-click filtering (`Entire Mailbox`, `Unread`, `>10MB`, `PDFs`, etc.). Can be toggled on/off in settings.
- **🎯 Precision Search**: Run exact verbatim searches in quotes to stop Gmail's AI from guessing or omitting keywords.
- **🌐 Comprehensive Search**: Easily include Spam and Trash (`in:anywhere`) to recover emails Gmail silently hides from standard search results.
- **🛠️ Custom Presets**: Add, edit, reorder, or delete search operator presets via the Options page.
- **🔒 Privacy First**: 100% client-side. No trackers, no analytics, no external servers, and no access to the content of your emails.

---

## 🚀 Installation

Timmy is built on **Manifest V3** and runs on Google Chrome, Brave, Microsoft Edge, and other Chromium-based browsers.

### 1. Download or Clone the Repository

```bash
git clone https://github.com/chris-unlock/timmy.git
```

*(Alternatively, click **Code → Download ZIP** on GitHub and extract the folder).*

### 2. Load into Chrome

1. Open Chrome and navigate to:
   ```text
   chrome://extensions
   ```
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `timmy` folder that you just cloned or extracted.
5. *(Optional)* Click the puzzle piece icon in Chrome's toolbar and **pin Timmy** for quick access.

---

## 💡 How to Use

### 1. Omnibox Search (`t <query>`)
1. Click the Chrome address bar (or press `Ctrl+L` / `Cmd+L`).
2. Type `t` and press <kbd>Space</kbd> or <kbd>Tab</kbd>.
3. Type your search term (e.g. `invoice 2026`).
4. Press <kbd>Enter</kbd> to run the default preset (Entire Mailbox including Spam & Trash), or use <kbd>↓</kbd> to pick another preset.

### 2. Extension Popup (`Alt+Shift+T`)
1. Press `Alt+Shift+T` (or click the Timmy icon in your toolbar).
2. Type your search term to see a live preview of the resulting Gmail search query.
3. Click any preset card or navigate with arrow keys and hit <kbd>Enter</kbd>.

### 3. In-Gmail Filter Pills
When viewing Gmail (`mail.google.com`), Timmy displays sleek filter pills under the search bar:
- `[⚡ Timmy]` `[🌐 Anywhere]` `[📥 Primary]` `[✉️ Unread]` `[📎 >10MB]` `[📄 PDFs]` `[🧾 Receipts]`
- Click any pill to append or switch the filter instantly.
- **Toggle Off**: Don't want the pills? Disable "In-Gmail Filter Pills" in Timmy's popup settings or options page at any time.

---

## 🛠️ Built-in Presets

| Preset | Query Pattern | Solves |
| :--- | :--- | :--- |
| **🌐 Entire Mailbox** | `in:anywhere %s` | Searches all mail including Spam & Trash (recovers emails Gmail hides) |
| **📥 Primary Only** | `category:primary %s` | Limits results strictly to your Primary inbox tab |
| **✉️ Actionable Unread** | `category:primary is:unread %s` | Highlights unread emails requiring your attention in Primary |
| **📬 All Unread (Clean)** | `is:unread -category:(promotions OR social) %s` | Unread emails without marketing newsletters and social notifications |
| **🎯 Exact Verbatim** | `"%s" in:anywhere` | Quotes terms to disable Gmail's fuzzy AI query guessing |
| **📎 Large Files** | `has:attachment larger:10M %s` | Quick discovery of large presentations and storage hogs (>10MB) |
| **📄 PDF Documents** | `filename:pdf %s` | Finds signed contracts, PDFs, tickets, and forms |
| **📊 Spreadsheets** | `filename:(xlsx OR csv OR sheets) %s` | Locates financial sheets and CSV exports |
| **📤 Sent to Others** | `from:me -to:me %s` | Outbox emails sent externally (omits notes sent to yourself) |
| **👤 Direct to Me** | `deliveredto:me %s` | Emails sent specifically to your address (filters out distro lists) |
| **🧾 Receipts & Invoices**| `in:anywhere (category:purchases OR invoice OR receipt) %s` | Scours all folders for purchase confirmations and billing receipts |
| **⏱️ Past 7 Days** | `newer_than:7d %s` | Restricts search to the past week |

*Manage and customize all presets by right-clicking the Timmy icon and choosing **Options**.*

---

## 🔒 Permissions & Privacy

Timmy is designed with user privacy as a foundational principle:

| Permission | Why It's Needed |
| :--- | :--- |
| `storage` | Saves your presets and extension preferences locally in your browser. |
| `tabs` | Finds existing open Gmail tabs to reuse them instead of opening duplicates. |
| `*://mail.google.com/*` | Injects the optional filter pill bar below Gmail's search bar. |

- ❌ **No account required**
- ❌ **No external network requests or APIs**
- ❌ **No telemetry, tracking, or ads**
- ❌ **Does not read, store, or transmit your emails**

---

## 📄 License

MIT License. Free and open source.
