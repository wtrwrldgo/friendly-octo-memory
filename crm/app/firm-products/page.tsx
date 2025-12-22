// file: app/firm-products/page.tsx

"use client";

import { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import {
  Package, Plus, Edit2, Trash2, Search, Save, Droplet, Zap, Wrench,
  AlertCircle, RefreshCw, DollarSign, Boxes, XCircle
} from "lucide-react";
import { useCRUD } from "@/hooks";
import { mockProducts } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";

type CategoryFilter = "All" | "Water" | "Accessories" | "Equipment";

export default function FirmProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // CRUD Hook
  const { items: products, create, update, remove } = useCRUD<Product>({
    initialData: mockProducts,
  });

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
    category: "Water" as "Water" | "Accessories" | "Equipment",
  });

  // Stats
  const stats = useMemo(() => ({
    total: products.length,
    water: products.filter(p => p.category === "Water").length,
    accessories: products.filter(p => p.category === "Accessories").length,
    equipment: products.filter(p => p.category === "Equipment").length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0),
    lowStock: products.filter(p => p.stockQuantity < 20 && p.stockQuantity > 0).length,
  }), [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

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
      category: "Water",
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
      category: product.category,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      update(editingProduct.id, formData);
    } else {
      create({
        ...formData,
        firmId: "1",
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    const product = products.find(p => p.id === id);
    if (confirm(`Delete "${product?.name}"? This action cannot be undone.`)) {
      remove(id);
    }
  };

  const getCategoryIcon = (category: string, size: string = "w-5 h-5") => {
    switch (category) {
      case "Water":
        return <Droplet className={size} />;
      case "Accessories":
        return <Zap className={size} />;
      case "Equipment":
        return <Wrench className={size} />;
      default:
        return <Package className={size} />;
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Product Catalog"
          description="Manage your inventory and pricing"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="mb-8">
        {/* Stats Cards - Premium Design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Products</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Boxes className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100">Total Value</p>
                <p className="text-4xl font-bold text-white mt-2">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-cyan-400 to-cyan-500 shadow-xl shadow-cyan-500/25 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-100">Water Products</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.water}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Droplet className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="group relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full bg-white/5"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-amber-100">Low Stock</p>
                <p className="text-4xl font-bold text-white mt-2">{stats.lowStock}</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter - Premium Design */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-5 mb-6 shadow-xl shadow-gray-200/50 dark:shadow-none">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: "All", label: "All", icon: Package, color: "blue" },
                { value: "Water", label: "Water", icon: Droplet, color: "cyan" },
                { value: "Accessories", label: "Accessories", icon: Zap, color: "purple" },
                { value: "Equipment", label: "Equipment", icon: Wrench, color: "orange" },
              ].map((filter) => {
                const Icon = filter.icon;
                const isActive = categoryFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setCategoryFilter(filter.value as CategoryFilter)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results count */}
          {(searchQuery || categoryFilter !== "All") && (
            <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Found <span className="font-bold text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">{filteredProducts.length}</span> of {products.length} products
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Clear all filters
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl py-24">
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xl font-semibold mb-2">No products found</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
                {searchQuery || categoryFilter !== "All"
                  ? "Try adjusting your filters"
                  : "Add your first product to get started"}
              </p>
              {(!searchQuery && categoryFilter === "All") && (
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Add First Product
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const categoryConfig: Record<string, { bg: string; text: string; iconBg: string }> = {
                Water: { bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-600 dark:text-cyan-400", iconBg: "bg-cyan-100 dark:bg-cyan-900/40" },
                Accessories: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-100 dark:bg-purple-900/40" },
                Equipment: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", iconBg: "bg-orange-100 dark:bg-orange-900/40" },
              };
              const catStyle = categoryConfig[product.category] || categoryConfig.Water;

              return (
                <div
                  key={product.id}
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>

                  <div className="relative">
                    {/* Product Image/Icon */}
                    <div className="w-full h-32 mb-4 flex items-center justify-center">
                      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${catStyle.iconBg}`}>
                        {getCategoryIcon(product.category, "w-10 h-10")}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3 ${catStyle.bg} ${catStyle.text}`}>
                      {getCategoryIcon(product.category, "w-3.5 h-3.5")}
                      <span className="text-xs font-semibold">{product.category}</span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{product.name}</h3>

                    {/* Volume */}
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-3">{product.volume}</p>

                    {/* Price */}
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{formatCurrency(product.price)}</p>

                    {/* Stock Info */}
                    <div className={`w-full py-2 px-3 rounded-xl text-center text-sm font-medium mb-3 ${
                      product.stockQuantity > 50
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        : product.stockQuantity > 20
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : product.stockQuantity > 0
                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                        : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    }`}>
                      Stock: {product.stockQuantity} {product.unit}s
                    </div>

                    {/* Status Badge */}
                    <div className={`w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold ${
                      product.inStock
                        ? "bg-emerald-500 text-white"
                        : "bg-red-500 text-white"
                    }`}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="e.g., Premium 19L Water Bottle"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              placeholder="Describe your product..."
              required
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Price (UZS) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="30000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Stock Quantity *</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="100"
                required
              />
            </div>
          </div>

          {/* Category & Volume */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "Water" | "Accessories" | "Equipment" })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              >
                <option value="Water">Water</option>
                <option value="Accessories">Accessories</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Volume</label>
              <input
                type="text"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="19L, 5L, N/A"
              />
            </div>
          </div>

          {/* Unit & Min Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="bottle, pack, unit"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Min Order *</label>
              <input
                type="number"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="1"
                required
              />
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.inStock}
              onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0"
            />
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Product in stock</label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
            >
              <Save className="w-5 h-5" />
              {editingProduct ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
