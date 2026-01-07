// file: app/firm-products/page.tsx

"use client";

import { useState, useMemo, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import {
  Package, Plus, Edit2, Trash2, Search, Save, Droplet, Zap, Wrench,
  AlertCircle, RefreshCw, DollarSign, Boxes, XCircle, Upload, X, Image as ImageIcon
} from "lucide-react";
import { useCRUD } from "@/hooks";
import { mockProducts } from "@/lib/mockData";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

type CategoryFilter = "All" | "Water" | "Accessories" | "Equipment";

export default function FirmProductsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CRUD Hook
  const { items: products, create, update, remove } = useCRUD<Product>({
    initialData: mockProducts,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    name_en: "",
    name_ru: "",
    name_uz: "",
    name_kaa: "",
    description: "",
    price: 0,
    unit: "bottle",
    volume: "19L",
    image: "",
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
      name_en: "",
      name_ru: "",
      name_uz: "",
      name_kaa: "",
      description: "",
      price: 0,
      unit: "bottle",
      volume: "19L",
      image: "",
      inStock: true,
      stockQuantity: 0,
      minOrder: 1,
      category: "Water",
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_en: (product as any).name_en || "",
      name_ru: (product as any).name_ru || "",
      name_uz: (product as any).name_uz || "",
      name_kaa: (product as any).name_kaa || "",
      description: product.description,
      price: product.price,
      unit: product.unit,
      volume: product.volume,
      image: product.image || "",
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      minOrder: product.minOrder,
      category: product.category,
    });
    setImageFile(null);
    setImagePreview(product.image || null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image || null;

    const uploadFormData = new FormData();
    uploadFormData.append("image", imageFile);

    const token = localStorage.getItem("auth_token");
    const response = await fetch("/api/upload/product-image", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: uploadFormData,
    });

    const data = await response.json();
    if (data.success && data.data?.url) {
      return data.data.url;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const productData = { ...formData, image: imageUrl };

      if (editingProduct) {
        update(editingProduct.id, productData);
      } else {
        create({
          ...productData,
          firmId: "1",
          createdAt: new Date().toISOString(),
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    const product = products.find(p => p.id === id);
    if (confirm(`${t.common.delete} "${product?.name}"? ${t.products.deleteConfirm}`)) {
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
          title={t.products.title}
          description={t.products.description}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {t.products.addProduct}
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
                <p className="text-sm font-medium text-blue-100">{t.products.totalProducts}</p>
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
                <p className="text-sm font-medium text-emerald-100">{t.products.totalValue}</p>
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
                <p className="text-sm font-medium text-cyan-100">{t.products.waterProducts}</p>
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
                <p className="text-sm font-medium text-amber-100">{t.products.lowStock}</p>
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
                placeholder={t.products.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { value: "All", label: t.common.all, icon: Package, color: "blue" },
                { value: "Water", label: t.products.water, icon: Droplet, color: "cyan" },
                { value: "Accessories", label: t.products.accessories, icon: Zap, color: "purple" },
                { value: "Equipment", label: t.products.equipment, icon: Wrench, color: "orange" },
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
                {t.products.found} <span className="font-bold text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">{filteredProducts.length}</span> {t.products.of} {products.length} {t.products.productsText}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("All");
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t.products.clearAllFilters}
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
              <p className="text-gray-700 dark:text-gray-300 text-xl font-semibold mb-2">{t.products.noProducts}</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
                {searchQuery || categoryFilter !== "All"
                  ? t.products.tryAdjustingFilters
                  : t.products.addFirstProduct}
              </p>
              {(!searchQuery && categoryFilter === "All") && (
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  {t.products.addFirstProduct}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const categoryConfig: Record<string, { bg: string; text: string; iconBg: string }> = {
                Water: { bg: "bg-cyan-50 dark:bg-cyan-900/20", text: "text-cyan-600 dark:text-cyan-400", iconBg: "bg-[#F8F9FB] dark:bg-gray-700" },
                Accessories: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", iconBg: "bg-[#F8F9FB] dark:bg-gray-700" },
                Equipment: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", iconBg: "bg-[#F8F9FB] dark:bg-gray-700" },
              };
              const catStyle = categoryConfig[product.category] || categoryConfig.Water;

              return (
                <div
                  key={product.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  {/* Action buttons - show on hover */}
                  <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-md"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-md"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>

                  {/* Product Image Area */}
                  <div className={`w-full h-32 mb-3 flex items-center justify-center rounded-xl ${catStyle.iconBg} overflow-hidden`}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center">
                        {getCategoryIcon(product.category, "w-16 h-16 text-blue-500")}
                      </div>
                    )}
                  </div>

                  {/* Title + Volume Badge Row */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight flex-1 line-clamp-2">
                      {product.name}
                    </h3>
                    {product.volume && (
                      <span className="shrink-0 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {product.volume}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                    {formatCurrency(product.price)}
                    <span className="text-xs font-medium text-gray-400 ml-1">UZS</span>
                  </p>

                  {/* Stock Status Button */}
                  <div className={`w-full py-2.5 rounded-xl text-center text-sm font-semibold ${
                    product.inStock && product.stockQuantity > 0
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}>
                    {product.inStock && product.stockQuantity > 0
                      ? `${t.products.stock}: ${product.stockQuantity}`
                      : t.products.outOfStock
                    }
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
        title={editingProduct ? t.products.editProduct : t.products.addNewProduct}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.products.productImage}</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex flex-col items-center justify-center gap-2"
              >
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.products.clickToUpload}</span>
                <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
              </button>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.products.productName} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="e.g., Premium 19L Water Bottle"
              required
            />
          </div>

          {/* Translated Names */}
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
            <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
              🌐 {t.products.translatedNames || "Translated Names"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">🇬🇧 English</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="English name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">🇷🇺 Russian</label>
                <input
                  type="text"
                  value={formData.name_ru}
                  onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Название на русском"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">🇺🇿 Uzbek</label>
                <input
                  type="text"
                  value={formData.name_uz}
                  onChange={(e) => setFormData({ ...formData, name_uz: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="O'zbekcha nomi"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">🏳️ Karakalpak</label>
                <input
                  type="text"
                  value={formData.name_kaa}
                  onChange={(e) => setFormData({ ...formData, name_kaa: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Qaraqalpaqsha atı"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.products.descriptionLabel} *</label>
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.products.priceUZS} *</label>
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.products.stockQuantity} *</label>
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.products.category} *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as "Water" | "Accessories" | "Equipment" })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              >
                <option value="Water">{t.products.water}</option>
                <option value="Accessories">{t.products.accessories}</option>
                <option value="Equipment">{t.products.equipment}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.products.volume}</label>
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.products.unit}</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="bottle, pack, unit"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t.products.minOrder} *</label>
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
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.products.productInStock}</label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isUploading}
              className="flex-1 px-6 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105 disabled:opacity-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isUploading ? t.products.saving : editingProduct ? t.products.updateProduct : t.products.createProduct}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
