import React, { useState, useEffect } from 'react';
import { Plus, Sun, Moon } from 'lucide-react';
import TableCard from './components/TableCard';
import BillModal from './components/BillModal';
import { STORAGE_KEY, PASSWORD } from './constants';

export default function App() {
  const [tables, setTables] = useState([]);
  const [tableCountInput, setTableCountInput] = useState('');
  const [activeTable, setActiveTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setTables(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  }, [tables]);

  // Dark Mode Toggle Logic
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addTables = () => {
    const count = parseInt(tableCountInput);
    if (isNaN(count) || count <= 0) return alert('Enter a valid number');

    const newTables = Array.from({ length: count }, (_, i) => ({
      id: tables.length + i + 1,
      guestCount: 0,
      totalOrders: 0,
      pendingOrders: 0,
      filledOrders: 0,
      orderItems: [],
      orderTime: null
    }));

    setTables([...tables, ...newTables]);
    setTableCountInput('');
  };

  const deleteTable = (id) => {
    if (prompt('Enter password to delete:') === PASSWORD) {
      setTables(tables.filter(t => t.id !== id));
    } else {
      alert('Incorrect password');
    }
  };

  const updateTable = (updatedTable) => {
    setTables(tables.map(t => t.id === updatedTable.id ? updatedTable : t));
    setActiveTable(updatedTable);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 md:p-8 font-sans transition-colors duration-300">
      <h1 className="text-3xl font-extrabold text-center mb-8 uppercase tracking-wider">
        Restaurant Management System
      </h1>

      <div className="max-w-xl mx-auto flex gap-2 mb-10">
        <input
          type="number"
          className="flex-1 p-3 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 appearance-none
            [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="Enter number of tables"
          value={tableCountInput}
          onChange={(e) => setTableCountInput(e.target.value)}
        />
        <button onClick={addTables} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-lg">
          <Plus size={20} /> Add Tables
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          {darkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {tables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            onView={() => { setActiveTable(table); setShowModal(true); }}
            onDelete={() => deleteTable(table.id)}
          />
        ))}
      </div>

      {showModal && activeTable && (
        <BillModal
          table={activeTable}
          onClose={() => setShowModal(false)}
          onUpdate={updateTable}
        />
      )}
    </div>
  );
}