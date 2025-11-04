// file: app/firm-products/page.tsx

"use client";

import { useState, useMemo } from "react";
import { Package, Plus, Edit, Trash2, Search, Save, X, Droplet, Zap, Wrench, TrendingUp, AlertCircle } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useCRUD, useModal, useForm } from "@/hooks";
import { mockProducts } from "@/lib/mockData";
import { formatCurrency, isValidPrice } from "@/lib/utils";
import { Product } from "@/types";
import Modal from "@/components/Modal";

export default function FirmProductsPage() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Water");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // CRUD Hook
  const { items: products, create, update, remove } = useCRUD<Product>({
    initialData: mockProducts,
    onBeforeDelete: (id) => {
      const product = products.find(p => p.id === id);
      return confirm(`Delete "${product?.name}"? This action cannot be undone.`);
    },
  });

  // Modal Hook
  const modal = useModal();

  // Form Hook with Validation
  const form = useForm<Omit<Product, "id" | "firmId" | "createdAt">>({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      unit: "bottle",
      volume: "19L",
      inStock: true,
      stockQuantity: 0,
      minOrder: 1,
      category: "Water",
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.name.trim()) errors.name = "Product name is required";
      if (!values.description.trim()) errors.description = "Description is required";
      if (!isValidPrice(values.price)) errors.price = "Invalid price";
      if (values.stockQuantity < 0) errors.stockQuantity = "Stock cannot be negative";
      if (values.minOrder < 1) errors.minOrder = "Minimum order must be at least 1";
      return errors;
    },
    onSubmit: (values) => {
      if (editingProduct) {
        update(editingProduct.id, values);
      } else {
        create({
          ...values,
          firmId: "1",
          createdAt: new Date().toISOString(),
        });
      }
      modal.close();
      form.resetForm();
      setEditingProduct(null);
    },
  });

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

  // Category Statistics
  const categoryStats = useMemo(() => {
    const stats = {
      All: products.length,
      Water: products.filter(p => p.category === "Water").length,
      Accessories: products.filter(p => p.category === "Accessories").length,
      Equipment: products.filter(p => p.category === "Equipment").length,
    };
    return stats;
  }, [products]);

  // Stats
  const totalValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stockQuantity < 20 && p.stockQuantity > 0).length;
  }, [products]);

  // Open Modal for Creating Product
  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetForm();
    modal.open();
  };

  // Open Modal for Editing Product
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    form.setValues({
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
    modal.open();
  };

  // Get Category Icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Water":
        return <Droplet className="w-5 h-5" />;
      case "Accessories":
        return <Zap className="w-5 h-5" />;
      case "Equipment":
        return <Wrench className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  // Get Category Color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Water":
        return "from-blue-500 to-cyan-500";
      case "Accessories":
        return "from-purple-500 to-pink-500";
      case "Equipment":
        return "from-orange-500 to-red-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" : "bg-gradient-to-br from-gray-50 via-white to-gray-50"}`}>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Product Catalog
              </h1>
              <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Manage your inventory and pricing
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-5 rounded-2xl border backdrop-blur-sm ${theme === "dark" ? "bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/20" : "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-blue-300" : "text-blue-600"}`}>Total Products</p>
                  <p className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{products.length}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg`}>
                  <Package className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border backdrop-blur-sm ${theme === "dark" ? "bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20" : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-green-300" : "text-green-600"}`}>Total Value</p>
                  <p className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatCurrency(totalValue)}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg`}>
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border backdrop-blur-sm ${theme === "dark" ? "bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/20" : "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-orange-300" : "text-orange-600"}`}>Low Stock Alerts</p>
                  <p className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{lowStockCount}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg`}>
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all ${
                    theme === "dark"
                      ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                  }`}
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(categoryStats).map(([category, count]) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-5 py-3.5 rounded-2xl font-semibold transition-all ${
                    categoryFilter === category
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30 scale-105"
                      : theme === "dark"
                      ? "bg-gray-800/50 text-gray-400 hover:bg-gray-800 border-2 border-gray-700"
                      : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  {category} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${theme === "dark" ? "bg-gray-800/30 border-gray-700" : "bg-white border-gray-300"}`}>
            <Package className={`w-20 h-20 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
            <h3 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              No products found
            </h3>
            <p className={`text-lg mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {searchQuery || categoryFilter !== "All"
                ? "Try adjusting your filters"
                : "Add your first product to get started"}
            </p>
            {(!searchQuery && categoryFilter === "All") && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`group rounded-2xl border-2 p-6 transition-all hover:shadow-2xl hover:-translate-y-1 relative ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-500/20"
                }`}
              >
                {/* Edit/Delete Buttons */}
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className={`p-2 rounded-lg transition-all ${
                      theme === "dark"
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => remove(product.id)}
                    className={`p-2 rounded-lg transition-all ${
                      theme === "dark"
                        ? "bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white"
                        : "bg-red-100 hover:bg-red-500 text-red-600 hover:text-white"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Image - Large and Centered */}
                <div className="relative w-full h-40 mb-4 flex items-center justify-center">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-auto object-contain"
                    />
                  ) : (
                    <div className={`w-32 h-32 rounded-2xl flex items-center justify-center ${
                      product.category === "Water"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : product.category === "Accessories"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    }`}>
                      {getCategoryIcon(product.category)}
                    </div>
                  )}
                </div>

                {/* Product Name */}
                <h3 className={`text-lg font-bold mb-1 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {product.name}
                </h3>

                {/* Product Volume */}
                <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-3 text-center">
                  {product.volume}
                </p>

                {/* Product Price - Large and Prominent */}
                <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold mb-4 text-center">
                  {formatCurrency(product.price)}
                </p>

                {/* Stock Info */}
                <div className={`w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold mb-3 ${
                  product.stockQuantity > 50
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : product.stockQuantity > 20
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : product.stockQuantity > 0
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}>
                  Stock: {product.stockQuantity} {product.unit}s
                </div>

                {/* Status Badge */}
                <div className={`w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold ${
                  product.inStock
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Product Modal - keeping existing modal code */}
      <Modal
        isOpen={modal.isOpen}
        onClose={() => {
          modal.close();
          form.resetForm();
          setEditingProduct(null);
        }}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={form.handleSubmit} className="space-y-4">
          {/* Product Name */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.values.name}
              onChange={form.handleChange}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } ${form.errors.name && form.touched.name ? "border-red-500" : ""}`}
              placeholder="e.g., Premium 19L Water Bottle"
            />
            {form.errors.name && form.touched.name && (
              <p className="text-red-500 text-sm mt-1">{form.errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Description *
            </label>
            <textarea
              name="description"
              value={form.values.description}
              onChange={form.handleChange}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } ${form.errors.description && form.touched.description ? "border-red-500" : ""}`}
              placeholder="Describe your product..."
            />
            {form.errors.description && form.touched.description && (
              <p className="text-red-500 text-sm mt-1">{form.errors.description}</p>
            )}
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Price (UZS) *
              </label>
              <input
                type="number"
                name="price"
                value={form.values.price}
                onChange={form.handleChange}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${form.errors.price && form.touched.price ? "border-red-500" : ""}`}
                placeholder="30000"
              />
              {form.errors.price && form.touched.price && (
                <p className="text-red-500 text-sm mt-1">{form.errors.price}</p>
              )}
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stockQuantity"
                value={form.values.stockQuantity}
                onChange={form.handleChange}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${form.errors.stockQuantity && form.touched.stockQuantity ? "border-red-500" : ""}`}
                placeholder="100"
              />
              {form.errors.stockQuantity && form.touched.stockQuantity && (
                <p className="text-red-500 text-sm mt-1">{form.errors.stockQuantity}</p>
              )}
            </div>
          </div>

          {/* Category & Volume */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Category *
              </label>
              <select
                name="category"
                value={form.values.category}
                onChange={form.handleChange}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="Water">Water</option>
                <option value="Accessories">Accessories</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Volume
              </label>
              <input
                type="text"
                name="volume"
                value={form.values.volume}
                onChange={form.handleChange}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="19L, 5L, N/A"
              />
            </div>
          </div>

          {/* Unit & Min Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={form.values.unit}
                onChange={form.handleChange}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="bottle, pack, unit"
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Min Order *
              </label>
              <input
                type="number"
                name="minOrder"
                value={form.values.minOrder}
                onChange={form.handleChange}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${form.errors.minOrder && form.touched.minOrder ? "border-red-500" : ""}`}
                placeholder="1"
              />
              {form.errors.minOrder && form.touched.minOrder && (
                <p className="text-red-500 text-sm mt-1">{form.errors.minOrder}</p>
              )}
            </div>
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="inStock"
              checked={form.values.inStock}
              onChange={(e) => form.setValues({ ...form.values, inStock: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
            />
            <label className={`text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Product in stock
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                modal.close();
                form.resetForm();
                setEditingProduct(null);
              }}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                theme === "dark"
                  ? "bg-white/5 hover:bg-white/10 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              <X className="w-5 h-5 inline mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.isValid}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
