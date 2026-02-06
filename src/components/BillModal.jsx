import React, { useState } from "react";
import { X, Plus, CheckCircle, Trash2, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MENU_ITEMS, TAX_PERCENTAGE } from "../constants";

export default function BillModal({ table, onClose, onUpdate, onCheckout }) {
  const [selectedFood, setSelectedFood] = useState("");
  const [quantity, setQuantity] = useState(1);
  const isInputDisabled = table.guestCount <= 0;
  const discountRate = table.discount || 0;

  const addItem = () => {
    if (table.guestCount <= 0)
      return alert("Please add guests before adding items.");
    if (!selectedFood) return;
    const itemDetails = MENU_ITEMS.find((i) => i.name === selectedFood);
    const quantityToAdd = parseInt(quantity);
    const existingItemIndex = table.orderItems.findIndex(
      (item) => item.name === selectedFood,
    );
    if (existingItemIndex !== -1) {
      const updatedOrderItems = [...table.orderItems];
      const existingItem = updatedOrderItems[existingItemIndex];
      const newQty = existingItem.quantity + quantityToAdd;
      updatedOrderItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQty,
        total: existingItem.price * newQty,
        filled: false,
      };
      onUpdate({
        ...table,
        orderItems: updatedOrderItems,
        pendingOrders: table.pendingOrders + 1,
        filledOrders: existingItem.filled
          ? table.filledOrders - 1
          : table.filledOrders,
        orderTime: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } else {
      const newItem = {
        ...itemDetails,
        quantity: quantityToAdd,
        total: itemDetails.price * quantityToAdd,
        filled: false,
      };
      onUpdate({
        ...table,
        orderItems: [...table.orderItems, newItem],
        totalOrders: table.totalOrders + 1,
        pendingOrders: table.pendingOrders + 1,
        orderTime:
          table.orderTime ||
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
      });
    }
    setSelectedFood("");
    setQuantity(1);
  };

  const updateItemQuantity = (index, newQty) => {
    if (newQty < 1) return;
    const updatedOrderItems = [...table.orderItems];
    const item = updatedOrderItems[index];
    item.quantity = newQty;
    item.total = item.price * newQty;
    onUpdate({ ...table, orderItems: updatedOrderItems });
  };
  const toggleItemStatus = (index) => {
    const newItems = [...table.orderItems];
    newItems[index].filled = !newItems[index].filled;
    onUpdate({
      ...table,
      orderItems: newItems,
      filledOrders: table.filledOrders + (newItems[index].filled ? 1 : -1),
      pendingOrders: table.pendingOrders + (newItems[index].filled ? -1 : 1),
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
      pendingOrders: !item.filled
        ? table.pendingOrders - 1
        : table.pendingOrders,
    });
  };

  const subtotal = table.orderItems.reduce(
    (sum, item) => (item.filled ? sum + item.total : sum),
    0,
  );
  const discountAmount = subtotal * (discountRate / 100);
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * (TAX_PERCENTAGE / 100);
  const total = taxableAmount + tax;

  const handlePrint = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`RESTAURANT BILL - TABLE ${table.id}`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    doc.text(`Date: ${today}`, 14, 30);
    doc.text(`Guests: ${table.guestCount || 0}`, 14, 35);

    let pdfSubTotal = 0;
    const tableBody = table.orderItems
      .filter((item) => item.filled)
      .map((item) => {
        const itemTotal = item.price * item.quantity;
        pdfSubTotal += itemTotal;
        return [
          item.name,
          item.quantity.toString(),
          `Rs.${item.price}`,
          `Rs.${itemTotal}`,
        ];
      });

    autoTable(doc, {
      startY: 40,
      head: [["Item", "Qty", "Price", "Total"]],
      body: tableBody,
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
    });

    const pdfDiscountAmt = pdfSubTotal * (discountRate / 100);
    const pdfTaxable = pdfSubTotal - pdfDiscountAmt;
    const pdfTax = pdfTaxable * (TAX_PERCENTAGE / 100);
    const pdfTotal = pdfTaxable + pdfTax;

    let finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 40) + 10;
    const rightAlignText = (text, y) => {
      const pageWidth = doc.internal.pageSize.width;
      doc.text(text, pageWidth - 14, y, { align: "right" });
    };

    doc.setFontSize(10);
    doc.setTextColor(0);
    rightAlignText(`Subtotal: Rs.${pdfSubTotal.toFixed(2)}`, finalY);
    if (discountRate > 0) {
      rightAlignText(
        `Discount (${discountRate}%): -Rs.${pdfDiscountAmt.toFixed(2)}`,
        finalY + 6,
      );
      finalY += 6;
    }
    rightAlignText(
      `Tax (${TAX_PERCENTAGE}%): Rs.${pdfTax.toFixed(2)}`,
      finalY + 6,
    );
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    rightAlignText(`Grand Total: Rs.${pdfTotal.toFixed(2)}`, finalY + 14);

    doc.save(`Bill_Table_${table.id}.pdf`);

    if (onCheckout) {
      onCheckout({
        tableId: table.id,
        guestCount: table.guestCount,
        itemCount: table.orderItems.length,
        subTotal: pdfSubTotal,
        discount: pdfDiscountAmt,
        tax: pdfTax,
        finalTotal: pdfTotal,
        items: table.orderItems,
      });
    }

    onUpdate({
      ...table,
      guestCount: 0,
      totalOrders: 0,
      pendingOrders: 0,
      filledOrders: 0,
      orderItems: [],
      orderTime: null,
      discount: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-gray-800 dark:text-gray-100">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-colors duration-300">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
          <div>
            <h2 className="text-3xl font-black text-gray-800 dark:text-white">
              Billing: Table {table.id}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium text-left">
              Manage orders and generate invoices
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <label className="text-xs font-bold mb-2 uppercase text-gray-400">
                Guest Count
              </label>
              <input
                type="number"
                className="w-20 p-2 text-center border-2 border-blue-100 dark:border-gray-600 rounded-xl focus:border-blue-500 outline-none font-bold bg-white dark:bg-gray-700 text-gray-800 dark:text-white appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={table.guestCount}
                min="0"
                onChange={(e) =>
                  onUpdate({
                    ...table,
                    guestCount: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition text-gray-500 dark:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div
          className={`p-6 grid grid-cols-1 md:grid-cols-12 gap-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 items-end transition-opacity duration-200 ${isInputDisabled ? "opacity-40 pointer-events-none" : "opacity-100"}`}
        >
          <div className="md:col-span-7">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1 text-left">
              Menu Item
            </label>
            <select
              className="w-full p-3 border-2 border-gray-100 dark:border-gray-600 rounded-xl focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white font-medium cursor-pointer transition-colors"
              value={selectedFood}
              onChange={(e) => setSelectedFood(e.target.value)}
              disabled={isInputDisabled}
            >
              <option value="">Select an Item...</option>
              {MENU_ITEMS.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name} (₹{item.price})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1 text-left">
              Quantity
            </label>
            <input
              type="number"
              className="w-full p-3 border-2 border-gray-100 dark:border-gray-600 rounded-xl focus:border-blue-500 outline-none bg-gray-50 dark:bg-gray-700 font-bold text-gray-800 dark:text-white appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              value={quantity}
              min="1"
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

        <div className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-gray-800">
          <table className="w-full text-left text-sm table-fixed">
            <thead className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
              <tr className="border-b dark:border-gray-700 text-gray-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="w-[30%] pl-6 pr-4 py-3">Item</th>
                <th className="w-[10%] px-4 py-3 text-center">Qty</th>
                <th className="w-[15%] px-4 py-3 text-right">Price</th>
                <th className="w-[15%] px-4 py-3 text-right">Total</th>
                <th className="w-[15%] px-4 py-3 text-center">Served</th>
                <th className="w-[15%] pl-4 pr-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {table.orderItems.map((item, idx) => (
                <tr
                  key={idx}
                  className={`transition ${item.filled ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/10"} hover:bg-gray-50 dark:hover:bg-gray-700/40`}
                >
                  <td className="pl-6 pr-4 py-3 font-medium text-gray-800 dark:text-gray-200 truncate">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      min="1"
                      className="w-12 text-center bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none text-gray-600 dark:text-gray-400 font-semibold"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItemQuantity(idx, parseInt(e.target.value) || 1)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                    ₹{item.price}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                    ₹{item.total}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleItemStatus(idx)}
                      className={`p-2 rounded-full transition focus:outline-none focus:ring-2 ${item.filled ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400 focus:ring-green-500" : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 focus:ring-gray-500"}`}
                      aria-label="Toggle served status"
                    >
                      <CheckCircle size={18} />
                    </button>
                  </td>
                  <td className="pl-4 pr-6 py-3 text-right">
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-2 rounded-full text-red-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:text-red-400 transition focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {table.orderItems.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-400">
              🍽️ No items added yet
            </div>
          )}
        </div>

        <div className="p-8 bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                <span className="text-xs font-bold uppercase text-gray-400 pl-2">
                  Discount (%)
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-16 p-1 text-right font-bold bg-transparent outline-none text-gray-800 dark:text-white border-b-2 border-transparent focus:border-blue-500 transition-colors"
                  value={discountRate}
                  onChange={(e) =>
                    onUpdate({
                      ...table,
                      discount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    Subtotal
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    ₹{subtotal.toFixed(2)}
                  </p>
                </div>
                {discountRate > 0 && (
                  <div className="text-center">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-tighter">
                      Discount
                    </p>
                    <p className="text-lg font-bold text-red-500">
                      -₹{discountAmount.toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter text-nowrap">
                    Tax ({TAX_PERCENTAGE}%)
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    ₹{tax.toFixed(2)}
                  </p>
                </div>
                <div className="text-center bg-blue-600 text-white px-6 py-2 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none">
                  <p className="text-[10px] font-black uppercase tracking-tighter opacity-80">
                    Final Total
                  </p>
                  <p className="text-2xl font-black">₹{total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 w-full">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-200 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-8 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl font-bold hover:bg-black dark:hover:bg-white/90 transition shadow-lg shadow-gray-200 dark:shadow-none flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Generate PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
