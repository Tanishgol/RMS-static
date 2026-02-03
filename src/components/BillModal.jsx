import React, { useState } from 'react';
import { X, Plus, CheckCircle, Trash2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import { MENU_ITEMS, TAX_PERCENTAGE } from '../constants';

export default function BillModal({ table, onClose, onUpdate }) {
    const [selectedFood, setSelectedFood] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Disable logic
    const isInputDisabled = table.guestCount <= 0;

    const addItem = () => {
        if (table.guestCount <= 0) return alert("Please add guests before adding items.");
        if (!selectedFood) return;

        const itemDetails = MENU_ITEMS.find(i => i.name === selectedFood);
        const newItem = {
            ...itemDetails,
            quantity: parseInt(quantity),
            total: itemDetails.price * parseInt(quantity),
            filled: false
        };

        onUpdate({
            ...table,
            orderItems: [...table.orderItems, newItem],
            totalOrders: table.totalOrders + 1,
            pendingOrders: table.pendingOrders + 1,
            orderTime: table.orderTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setSelectedFood("");
        setQuantity(1);
    };

    const toggleItemStatus = (index) => {
        const newItems = [...table.orderItems];
        newItems[index].filled = !newItems[index].filled;

        onUpdate({
            ...table,
            orderItems: newItems,
            filledOrders: table.filledOrders + (newItems[index].filled ? 1 : -1),
            pendingOrders: table.pendingOrders + (newItems[index].filled ? -1 : 1)
        });
    };

    const removeItem = (index) => {
        const item = table.orderItems[index];
        const newItems = table.orderItems.filter((_, i) => i !== index);
        onUpdate({
            ...table,
            orderItems: newItems,
            totalOrders: table.totalOrders - 1,
            filledOrders: item.filled ? table.filledOrders - 1 : table.filledOrders,
            pendingOrders: !item.filled ? table.pendingOrders - 1 : table.pendingOrders
        });
    };

    const subtotal = table.orderItems.reduce((sum, item) => item.filled ? sum + item.total : sum, 0);
    const tax = subtotal * (TAX_PERCENTAGE / 100);
    const total = subtotal + tax;

    const handlePrint = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`RESTAURANT BILL - TABLE ${table.id}`, 10, 20);
        // ... simple list dump for now ...
        let yPos = 40;
        doc.setFontSize(12);
        table.orderItems.forEach((item) => {
            if (item.filled) {
                doc.text(`${item.name} x ${item.quantity} = ${item.total}`, 10, yPos);
                yPos += 10;
            }
        });
        doc.text(`Total: ${total}`, 10, yPos + 10);

        doc.save(`Bill_Table_${table.id}.pdf`);

        // Clear table data after generating PDF
        onUpdate({
            ...table,
            guestCount: 0,
            totalOrders: 0,
            pendingOrders: 0,
            filledOrders: 0,
            orderItems: [],
            orderTime: null
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-gray-800 dark:text-gray-100">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-colors duration-300">
                {/* Header */}
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                    <div>
                        <h2 className="text-3xl font-black text-gray-800 dark:text-white">Billing: Table {table.id}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium text-left">Manage orders and generate invoices</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <label className="text-xs font-bold uppercase text-gray-400">Guest Count</label>
                            <input
                                type="number"
                                className="w-20 p-2 text-center border-2 border-blue-100 dark:border-gray-600 rounded-xl focus:border-blue-500 outline-none font-bold bg-white dark:bg-gray-700 text-gray-800 dark:text-white appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                value={table.guestCount}
                                min="0"
                                onChange={(e) => onUpdate({ ...table, guestCount: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500 dark:text-gray-300"><X size={24} /></button>
                    </div>
                </div>

                {/* Input Bar */}
                <div className={`p-6 grid grid-cols-1 md:grid-cols-12 gap-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 items-end transition-opacity duration-200 ${isInputDisabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <div className="md:col-span-7">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1 text-left">Menu Item</label>
                        <select
                            className="w-full p-3 border-2 border-gray-100 dark:border-gray-600 rounded-xl focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white font-medium cursor-pointer transition-colors"
                            value={selectedFood}
                            onChange={(e) => setSelectedFood(e.target.value)}
                            disabled={isInputDisabled}
                        >
                            <option value="">Select an Item...</option>
                            {MENU_ITEMS.map(item => <option key={item.name} value={item.name}>{item.name} (₹{item.price})</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1 text-left">Quantity</label>
                        <input
                            type="number"
                            className="w-full p-3 border-2 border-gray-100 dark:border-gray-600 rounded-xl focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 font-bold text-gray-800 dark:text-white appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            value={quantity} min="1"
                            onChange={(e) => setQuantity(e.target.value)}
                            disabled={isInputDisabled}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <button
                            onClick={addItem}
                            disabled={isInputDisabled}
                            className="w-full bg-green-500 disabled:bg-gray-300 text-white p-3.5 rounded-xl hover:bg-green-600 transition font-bold shadow-lg shadow-green-100 dark:shadow-none flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Add to Order
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white dark:bg-gray-800">
                            <tr className="border-b-2 dark:border-gray-700 text-gray-400 uppercase text-[10px] tracking-widest font-black">
                                <th className="pb-4">Item Name</th>
                                <th className="pb-4">Quantity</th>
                                <th className="pb-4">Price</th>
                                <th className="pb-4">Total</th>
                                <th className="pb-4 text-center">Served?</th>
                                <th className="pb-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {table.orderItems.map((item, idx) => (
                                <tr key={idx} className={`group hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition ${item.filled ? 'bg-green-300/30 dark:bg-green-900/20' : 'bg-red-300/30 dark:bg-red-900/20'}`}>
                                    <td className="py-4 font-bold text-gray-700 dark:text-gray-200">{item.name}</td>
                                    <td className="py-4 font-semibold text-gray-500 dark:text-gray-400">{item.quantity}</td>
                                    <td className="py-4 text-gray-500 dark:text-gray-400">₹{item.price}</td>
                                    <td className="py-4 font-bold text-gray-800 dark:text-gray-100">₹{item.total}</td>
                                    <td className="py-4 text-center">
                                        <button onClick={() => toggleItemStatus(idx)} className={`p-2 rounded-lg transition-all ${item.filled ? 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400' : 'text-gray-300 bg-gray-100 dark:bg-gray-700 dark:text-gray-500'}`}>
                                            <CheckCircle size={20} />
                                        </button>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button onClick={() => removeItem(idx)} className="text-red-300 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 transition p-2">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {table.orderItems.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-sm">No items added yet.</div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-10">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Subtotal</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">₹{subtotal.toFixed(2)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter text-nowrap">Tax ({TAX_PERCENTAGE}%)</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">₹{tax.toFixed(2)}</p>
                            </div>
                            <div className="text-center bg-blue-600 text-white px-6 py-2 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none">
                                <p className="text-[10px] font-black uppercase tracking-tighter opacity-80">Final Total</p>
                                <p className="text-2xl font-black">₹{total.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button onClick={onClose} className="flex-1 md:flex-none px-8 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition">Close</button>
                            <button onClick={handlePrint} className="flex-1 md:flex-none px-8 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl font-bold hover:bg-black dark:hover:bg-white/90 transition shadow-lg shadow-gray-200 dark:shadow-none flex items-center justify-center gap-2">
                                <Printer size={18} /> Generate PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}