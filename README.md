# Restaurant Management System (RMS) 🍽️🧾

A modern React + Tailwind CSS application for managing restaurant tables, orders, and bills with real-time analytics. Built with Vite + React, featuring dynamic billing, sales history tracking, dark mode support, and full localStorage persistence.

## Features ✨

- **Table Management** 🟦
  - Add multiple tables at once
  - View live table status (Total / Filled / Pending orders)
  - Table occupancy indicators (Occupied / Vacant)

- **Order Management** 🍝🍕
  - Assign guest count to tables
  - Add menu items with quantity control
  - 28 diverse menu items (Indian & Continental cuisine)
  - Real-time order tracking with served/pending status
  - Remove or modify items easily

- **Billing & Invoicing** 🖨️
  - Smart bill calculation with subtotal, tax, and discounts
  - 18% automatic tax application
  - Percentage-based discount support
  - Generate professional PDFs with jsPDF
  - Auto-clear table after bill generation

- **Sales Analytics** 📊
  - Sales history modal with table-wise performance
  - Grand total revenue tracking
  - Per-table order count and sales metrics
  - Clear history with confirmation (password protected)

- **Theme & Persistence** 🌞🌙💾
  - Light / Dark mode toggle (persistent in localStorage)
  - All data automatically saved to localStorage
  - Responsive design (mobile & desktop)

- **Security** 🔒
  - Password-protected table deletion (`Hello@123`)
  - Confirmation dialogs for destructive actions

## Quick Start ▶️ (Windows)

1. Clone the repository:
   ```bash
   https://github.com/Tanishgol/RMS-static
   ```

2. **Navigate to project folder:**
   ```
   cd RMS-static
   ```

3. **Install dependencies:**
   ```
   npm install
   ```

4. **Run development server:**
   ```
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173 (or the port Vite prints)
   ```

## Project Structure 📁

```
src/
├── App.jsx                          # Main app component (table management, theme toggle)
├── constants.js                     # Configuration (menu, tax, password, storage keys)
├── components/
│   ├── TableCard.jsx               # Individual table UI card with status badges
│   ├── BillModal.jsx               # Order management & bill generation (jsPDF)
│   └── SalesHistoryModal.jsx       # Analytics dashboard with table statistics
├── App.css
└── index.css
```
## Key Features Explained 📝

### Table Card (`TableCard.jsx`)
- Shows table status with color-coded badges (blue=total, green=filled, amber=pending)
- Displays guest count and last order time
- Quick access to View Bill and Delete actions

### Bill Modal (`BillModal.jsx`)
- **Add Items:** Select from menu, set quantity (disabled until guests > 0)
- **Manage Orders:** Toggle item "Served" status with CheckCircle button
- **Calculate Bills:**
  - Subtotal (only served items)
  - Discount (percentage-based)
  - Tax (18% on taxable amount)
  - Final total
- **Generate PDF:** Creates professional invoice via jsPDF
- **Auto-Clear:** Resets table data after PDF generation

### Sales History Modal (`SalesHistoryModal.jsx`)
- **Overview:** Grand total revenue + bill count
- **Table Stats:** Per-table order count and total sales
- **Time Tracking:** Shows last bill timestamp
- **Clear History:** Bulk delete with confirmation

### Dark Mode
- Toggle button in header
- Persisted in localStorage (`darkMode` key)
- Uses Tailwind's `dark:` utilities
- Smooth transitions

### localStorage Persistence
- **Tables:** `restaurantTables` → Full table state
- **Sales:** `restaurantSalesHistory` → All bills & metrics
- **Theme:** `darkMode` → Boolean (true/false)

## Usage Workflow 🔄

1. **Add Tables:** Enter number → Click "Add"
2. **View Table:** Click "View Bill" on any table card
3. **Set Guests:** Enter guest count in modal
4. **Add Items:** Select menu item → Set quantity → Click "Add to Order"
5. **Mark Served:** Click CheckCircle to toggle item status (only served items charged)
6. **Apply Discount:** Enter percentage in discount field
7. **Generate Bill:** Click "Generate PDF" → PDF downloads + table clears
8. **View Sales:** Click "History" button → See aggregate stats per table

## Dependencies 📦

- **React** — UI framework
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **jsPDF** — PDF generation
- **jspdf-autotable** — PDF table formatting
- **lucide-react** — Icons (UI components)
- **react-icons** — Rupee icon (FaRupeeSign)

## Build for Production 🚀

```
npm run build
```

Output: `dist/` folder (ready for deployment)

## Customization Ideas 🛠️

- Add categories/filters to menu (Veg/Non-Veg/Beverages)
- Export sales data as CSV/Excel
- Add user authentication (login system)
- Integrate with POS hardware (printers, scanners)
- Add table reservation system
- Implement multi-location support
- Add staff/waiter management
- Real-time kitchen display system (KDS)

## Tips & Tricks 💡

- **Number Input Spinners:** Spinners are hidden via CSS (`appearance-none`)
- **Print Styling:** PDFs generated use jsPDF autotable for clean formatting
- **Keyboard Navigation:** All inputs support Tab navigation
- **Data Safety:** Always backup localStorage before major updates

## License 📜

MIT — Modify and use as needed.

## Contributing 🤝

PRs welcome! Keep changes focused and test thoroughly with different table counts and order scenarios.

---

**Last Updated:** February 6, 2026  
**Version:** 1.0.0
