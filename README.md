# ⚡ Timmy — Gmail Power Search

**Timmy** is a Google Chrome extension built for power users of Gmail and Google Workspace. It bypasses Gmail's fuzzy AI query fallbacks, silent exclusions of Trash/Spam, and complex syntax memorization by providing one-click and keyboard-driven power search recipes.

---

## 🚀 Quick Setup (Load Unpacked into Chrome)

1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions
   ```
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select this directory:
   ```text
   c:\Users\cbhad\Documents\UnlockStrategyProjects\timmy
   ```
5. Timmy will appear in your extensions list and toolbar! Pin it to your Chrome toolbar for easy access.

---

## ⚡ How to Use Timmy

### 1. Omnibox Keyword (`t <query>`)
Search Gmail directly from Chrome's address bar without opening anything:
1. Focus the Chrome address bar (`Ctrl+L` or `Cmd+L`).
2. Type `t` and press <kbd>Space</kbd> or <kbd>Tab</kbd>.
3. Type your search term (e.g., `invoice 2026`).
4. Press <kbd>Enter</kbd> to search your default preset (Entire Mailbox including Spam & Trash).
5. Or use <kbd>↓</kbd> (Down Arrow) to choose any other preset suggestion.

### 2. Extension Popup (`Alt+Shift+T` or Click Icon)
* Type any search query to see a live preview of the resulting Gmail search query.
* Click any preset card or select it with keyboard arrows to run the search.
* Quick settings drawer lets you toggle the in-page pills, select default accounts, or configure tab reuse.

### 3. In-Gmail Power Filter Pills (Toggleable)
When you visit `mail.google.com`, Timmy adds sleek pill buttons right underneath Gmail's search bar:
* `[⚡ Timmy]` `[🌐 Anywhere]` `[📥 Primary]` `[✉️ Unread]` `[📎 >10MB]` `[📄 PDFs]` `[🧾 Receipts]`
* Click any pill to instantly apply that filter to your current search.
* **Toggle On/Off**: Don't want the pills on screen? Simply turn off "In-Gmail Filter Pills" from the popup or options page anytime.

---

## 🎨 Swapping in Your Custom Icon

When your custom icons are ready, replace the placeholder files inside the `icons/` folder:

* `icons/icon16.png` (16 × 16 px)
* `icons/icon32.png` (32 × 32 px)
* `icons/icon48.png` (48 × 48 px)
* `icons/icon128.png` (128 × 128 px)

After replacing the images, go to `chrome://extensions` and click the **Reload (↻)** icon on Timmy.

---

## 🛠️ Built-in Power Search Presets

| Icon | Preset Name | Search Operator Pattern | Solves |
| :---: | :--- | :--- | :--- |
| 🌐 | **Entire Mailbox** | `in:anywhere %s` | Searches all mail including Spam & Trash (recovers emails Gmail silently hides) |
| 📥 | **Primary Only** | `category:primary %s` | Limits results to your main inbox tab |
| ✉️ | **Actionable Unread** | `category:primary is:unread %s` | Unread emails requiring your attention in Primary |
| 📬 | **Unread Clean** | `is:unread -category:(promotions OR social) %s` | Unread mail without marketing newsletters |
| 🎯 | **Exact Match** | `"%s" in:anywhere` | Quotes terms to shut off Gmail's fuzzy AI guessing |
| 📎 | **Large Files** | `has:attachment larger:10M %s` | Identifies storage hogs and big presentations |
| 📄 | **PDF Documents** | `filename:pdf %s` | Direct hunting for signed contracts, PDFs, tickets |
| 📊 | **Spreadsheets** | `filename:(xlsx OR csv OR sheets) %s` | Finds financial sheets and CSV exports |
| 📤 | **Sent to Others** | `from:me -to:me %s` | Outbox emails sent externally (omits self-notes) |
| 👤 | **Direct to Me** | `deliveredto:me %s` | Dispatched specifically to your address (not distro lists) |
| 🧾 | **Receipts & Invoices**| `in:anywhere (category:purchases OR invoice OR receipt) %s` | Finds billing receipts across all folders |
| ⏱️ | **Past 7 Days** | `newer_than:7d %s` | Limits search to the past week |

You can add, edit, or reorder presets via the **Options Page** (`Right click Timmy icon → Options`).
