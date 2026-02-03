# Restaurant Management System (RMS) 🍽️🧾

A small React + Tailwind CSS app to manage restaurant tables, orders and bills. Built with Vite + React. Includes a simple bill modal, menu constants, dark mode support and localStorage persistence.

## Features ✨

- Add multiple tables at once ✅
- View table status: total / filled / pending orders 🟦🟩🟨
- Assign guest count and menu items to a table 🍝🍕
- Generate printable invoice (Print / Save as PDF) 🖨️
- Clearing table data automatically after printing the bill 🧹
- Delete a table (password protected) 🔒
- Light / Dark theme toggle (uses `dark` class) 🌞🌙
- Persistent tables stored in `localStorage` 💾

## Quick start ▶️ (Windows)

1. Open terminal in project folder:
   cd "c:\Users\Administrator\Desktop\React\RMS static"

2. Install dependencies:
   npm install

3. Run dev server:
   npm run dev

4. Open browser:
   http://localhost:3000 (or the port Vite prints)

## Project structure 📁

- src/
  - App.jsx — main app, table management and theme toggle
  - constants.js — menu items, TAX_PERCENTAGE (10), PASSWORD ("Hello@123"), STORAGE_KEY ("restaurantTables")
  - components/
    - TableCard.jsx — UI for each table card with status and actions
    - BillModal.jsx — (modal) add guests, add menu items, print invoice and clear table

## Important values (from constants.js) 🔧

- Default password to delete a table: `Hello@123`
- Local storage key: `restaurantTables`
- Tax percentage: `10%`
- Menu: predefined array of items with `name` and `price`

> To change any of the above, edit `src/constants.js`.

## UI / UX notes 📝

- Bottom actions on each table (View Bill) are disabled until Guest Count > 0.
- Number input spinners can be removed via CSS (use a `.no-spin` rule) if desired.
- Dark mode is applied by toggling the `dark` class on `document.documentElement` — ensure `tailwind.config.js` has `darkMode: 'class'`.

## Printing / PDF behavior 🖨️

- The Bill modal uses a print window (window.print) to generate PDF/print.
- After printing, the table's order and guest data is cleared (per current app behavior).

## Customization ideas 🔧

- Persist theme preference in localStorage (key like `rms_dark`).
- Replace window.print with html2pdf/jsPDF for richer PDF output.
- Add user auth instead of a simple password prompt for deletes.
- Improve menu management (add/remove items, categories).

## Contributing 🤝

PRs and issues welcome. Keep changes small and focused.

## License 📜

MIT — modify as you need.
