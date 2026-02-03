import React from 'react';
import { Users, Clock, Receipt, Trash2 } from 'lucide-react';

const StatusBadge = ({ label, count, color }) => (
    <div className={`${color} px-3 py-2 rounded-lg text-xs flex flex-col items-center flex-1`}>
        <span className="opacity-80 font-medium mb-1">{label}</span>
        <span className="font-extrabold text-base">{count}</span>
    </div>
);

export default function TableCard({ table, onView, onDelete }) {
    return (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="p-6">
                <div className="flex justify-between mb-4">
                    <h5 className="text-2xl font-bold text-gray-800 dark:text-white">Table {table.id}</h5>
                    <span className={`px-3 py-2 rounded-full text-xs font-bold ${table.totalOrders > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                        {table.totalOrders > 0 ? 'Occupied' : 'Vacant'}
                    </span>
                </div>

                <div className="flex gap-2 mb-5">
                    <StatusBadge label="Total" count={table.totalOrders} color="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200" />
                    <StatusBadge label="Filled" count={table.filledOrders} color="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200" />
                    <StatusBadge label="Pending" count={table.pendingOrders} color="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200" />
                </div>

                <div className="space-y-3 text-sm mb-6 text-gray-600 dark:text-gray-300">
                    <div className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                        <Users size={18} />
                        Guests: <strong className="text-gray-800 dark:text-gray-100">{table.guestCount || 'None'}</strong>
                    </div>
                    <div className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                        <Clock size={18} />
                        Last Order: <strong className="text-gray-800 dark:text-gray-100">{table.orderTime || '-'}</strong>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onView} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold flex gap-2 justify-center transition-colors">
                        <Receipt size={18} /> View Bill
                    </button>
                    <button onClick={onDelete} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 transition-colors">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}