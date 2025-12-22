// file: app/firm-products/page.tsx

"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import {
  Plus, Edit2, Trash2, Search, Save, Droplet,
  Package, DollarSign, CheckCircle, AlertTriangle
} from "lucide-react";
import { useCRUD } from "@/hooks";
import { mockProducts } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";

export default function FirmProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // CRUD Hook - filter only water products
  const { items: allProducts, create, update, remove } = useCRUD<Product>({
    initialData: mockProducts,
  });

  // Only water products
  const products = useMemo(() =>
    allProducts.filter(p => p.category === "Water"),
    [allProducts]
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    unit: "bottle",
    volume: "19L",
    inStock: true,
    stockQuantity: 0,
    minOrder: 1,
  });

  // Stats
  const stats = useMemo(() => ({
    total: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0),
    inStock: products.filter(p => p.inStock && p.stockQuantity > 0).length,
    lowStock: products.filter(p => p.stockQuantity < 20 && p.stockQuantity > 0).length,
  }), [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.volume.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [products, searchQuery]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      unit: "bottle",
      volume: "19L",
      inStock: true,
      stockQuantity: 0,
      minOrder: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      volume: product.volume,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      minOrder: product.minOrder,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      update(editingProduct.id, { ...formData, category: "Water" });
    } else {
      create({
        ...formData,
        category: "Water",
        firmId: "1",
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    const product = products.find(p => p.id === id);
    if (confirm(`Delete "${product?.name}"?`)) {
      remove(id);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <PageHeader
          title="Water Products"
          description="Your water catalog"
        />
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Water
        </button>
      </div>

      {/* Minimal Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inStock}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">In Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStock}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search water products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Droplet className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No water products found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {searchQuery ? "Try a different search" : "Add your first water product"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:border-cyan-200 dark:hover:border-cyan-800 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300"
            >
              {/* Water Icon */}
              <div className="w-full flex justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 flex items-center justify-center">
                    <Droplet className="w-10 h-10 text-cyan-500" />
                  </div>
                  {/* Volume badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-cyan-500 text-white text-xs font-bold">
                    {product.volume}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="text-center mt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {formatCurrency(product.price)}
                </p>

                {/* Stock */}
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                  product.stockQuantity > 50
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    : product.stockQuantity > 20
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : product.stockQuantity > 0
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                }`}>
                  {product.stockQuantity} in stock
                </div>
              </div>

              {/* Actions - show on hover */}
              <div className="flex items-center justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(product)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal - Simplified for Water Only */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Water Product" : "Add Water Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              placeholder="Premium Water 19L"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none"
              placeholder="Fresh spring water..."
              required
            />
          </div>

          {/* Volume & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Volume
              </label>
              <select
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              >
                <option value="19L">19L</option>
                <option value="10L">10L</option>
                <option value="5L">5L</option>
                <option value="1.5L">1.5L</option>
                <option value="0.5L">0.5L</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Price (UZS)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                placeholder="30000"
                required
              />
            </div>
          </div>

          {/* Stock & Min Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                placeholder="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Min Order
              </label>
              <input
                type="number"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                placeholder="1"
                required
              />
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center gap-3 py-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, inStock: !formData.inStock })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.inStock ? "bg-cyan-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                formData.inStock ? "left-7" : "left-1"
              }`} />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formData.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/25"
            >
              <Save className="w-4 h-4" />
              {editingProduct ? "Update" : "Add Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
