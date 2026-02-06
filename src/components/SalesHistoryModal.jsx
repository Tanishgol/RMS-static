import React, { useMemo } from 'react';
import { X, Trash2, TrendingUp, Calendar, Clock, ShoppingBag } from 'lucide-react';
import { FaRupeeSign } from "react-icons/fa";

export default function SalesHistoryModal({ history, onClose, onClearHistory }) {
    const tableStats = useMemo(() => {
        const stats = {};

        history.forEach(order => {
            const tId = order.tableId;
            if (!stats[tId]) {
                stats[tId] = {
                    tableId: tId,
                    totalOrders: 0,
                    totalSales: 0,
                    lastBillId: 0
                };
            }
            stats[tId].totalOrders += 1;
            stats[tId].totalSales += order.finalTotal;
            if (order.billId > stats[tId].lastBillId) {
                stats[tId].lastBillId = order.billId;
            }
        });
        return Object.values(stats).sort((a, b) => a.tableId - b.tableId);
    }, [history]);

    const grandTotalRevenue = history.reduce((sum, order) => sum + order.finalTotal, 0);

    const formatTime = (timestamp) => {
        if (!timestamp) return "-";
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                            <TrendingUp className="text-blue-600" /> Sales Overview
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            Aggregated performance by table
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-500 dark:text-gray-400"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800 flex flex-wrap gap-6 justify-between items-center">
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Total Revenue</p>
                        <p className="text-3xl font-black text-gray-800 dark:text-white">₹{grandTotalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Total Bills</p>
                        <p className="text-3xl font-black text-gray-800 dark:text-white">{history.length}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-black/20">
                    {tableStats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Calendar size={48} className="mb-4 opacity-20" />
                            <p className="font-medium">No sales records found yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tableStats.map((stat) => (
                                <div 
                                    key={stat.tableId} 
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-xl">
                                            <h3 className="text-lg font-black">Table {stat.tableId}</h3>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                            <Clock size={12} />
                                            {formatTime(stat.lastBillId)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-auto">
                                        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                                            <div className="flex items-center gap-2 mb-1 text-gray-400 dark:text-gray-500">
                                                <ShoppingBag size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Orders</span>
                                            </div>
                                            <p className="text-2xl font-black text-gray-800 dark:text-gray-100">
                                                {stat.totalOrders}
                                            </p>
                                        </div>

                                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl">
                                            <div className="flex items-center gap-2 mb-1 text-green-600/70 dark:text-green-400/70">
                                                <FaRupeeSign size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Sales</span>
                                            </div>
                                            <p className="text-2xl font-black text-green-600 dark:text-green-400">
                                                ₹{stat.totalSales.toFixed(0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {history.length > 0 && (
                    <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
                        <button 
                            onClick={onClearHistory}
                            className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold text-sm"
                        >
                            <Trash2 size={18} /> Clear History
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}