// file: app/firm-order-create/page.tsx

"use client";

import { useState, useMemo } from "react";
import {
  ShoppingCart, Plus, Minus, Trash2, User, MapPin, Phone,
  Search, Package, Check, X, Droplet, Zap, Wrench, UserPlus,
  Filter, Briefcase, ArrowRight, FileText, Clock, Building2,
  ChevronRight, CreditCard, Truck, CheckCircle2, AlertCircle
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { mockProducts, mockClients } from "@/lib/mockData";
import { formatCurrency, isValidPhone, isValidEmail } from "@/lib/utils";
import { Product, Client, ClientType } from "@/types";
import Modal from "@/components/Modal";
import { useForm } from "@/hooks";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function FirmOrderCreatePage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Water");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState<Product | null>(null);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("All");

  // Filter products
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
      return matchesSearch && matchesCategory && product.inStock;
    });
  }, [searchQuery, categoryFilter]);

  // Category statistics
  const categoryStats = useMemo(() => {
    return {
      All: mockProducts.filter(p => p.inStock).length,
      Water: mockProducts.filter(p => p.category === "Water" && p.inStock).length,
      Accessories: mockProducts.filter(p => p.category === "Accessories" && p.inStock).length,
      Equipment: mockProducts.filter(p => p.category === "Equipment" && p.inStock).length,
    };
  }, []);

  // Filtered clients
  const filteredClients = useMemo(() => {
    return mockClients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
        client.phone.includes(clientSearchQuery) ||
        (client.email?.toLowerCase().includes(clientSearchQuery.toLowerCase()) || false);
      const matchesType = clientTypeFilter === "All" || client.type === clientTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [clientSearchQuery, clientTypeFilter]);

  // Client type statistics
  const clientTypeStats = useMemo(() => {
    return {
      All: mockClients.length,
      B2B: mockClients.filter(c => c.type === "B2B").length,
      B2C: mockClients.filter(c => c.type === "B2C").length,
      B2G: mockClients.filter(c => c.type === "B2G").length,
    };
  }, []);

  // New client form
  const newClientForm = useForm<Omit<Client, "id" | "firmId" | "totalOrders" | "revenue" | "createdAt">>({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      type: "B2C",
      lastOrderAt: undefined,
    },
    validate: (values) => {
      const errors: any = {};
      if (!values.name.trim()) errors.name = "Name is required";
      if (!isValidPhone(values.phone)) errors.phone = "Invalid phone number (format: +998XXXXXXXXX)";
      if (values.email && !isValidEmail(values.email)) errors.email = "Invalid email";
      if (!values.address.trim()) errors.address = "Address is required";
      return errors;
    },
    onSubmit: (values) => {
      const newClient: Client = {
        ...values,
        id: `c-${Date.now()}`,
        firmId: "1",
        totalOrders: 0,
        revenue: 0,
        createdAt: new Date().toISOString(),
      };
      mockClients.push(newClient);
      selectClient(newClient);
      setShowNewClientModal(false);
      setShowClientModal(false);
      newClientForm.resetForm();
    },
  });

  // Cart calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Progress calculation
  const orderProgress = useMemo(() => {
    let steps = 0;
    if (selectedClient) steps++;
    if (cart.length > 0) steps++;
    if (deliveryAddress.trim()) steps++;
    return steps;
  }, [selectedClient, cart, deliveryAddress]);

  // Add to cart
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      setCart([...cart, { product, quantity: product.minOrder }]);
    }
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;
    if (quantity < product.minOrder) return;
    if (quantity > product.stockQuantity) return;
    setCart(cart.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Select client
  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setDeliveryAddress(client.address);
    setShowClientModal(false);
  };

  // Create order
  const createOrder = () => {
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }
    if (cart.length === 0) {
      alert("Please add products to cart");
      return;
    }
    if (!deliveryAddress.trim()) {
      alert("Please enter delivery address");
      return;
    }
    alert(`Order created successfully!\n\nClient: ${selectedClient.name}\nItems: ${cartItemsCount}\nTotal: ${formatCurrency(cartTotal)}`);
    setCart([]);
    setSelectedClient(null);
    setDeliveryAddress("");
    setNotes("");
    router.push("/firm-orders");
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Water":
        return <Droplet className="w-4 h-4" />;
      case "Accessories":
        return <Zap className="w-4 h-4" />;
      case "Equipment":
        return <Wrench className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Water":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30";
      case "Accessories":
        return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30";
      case "Equipment":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getClientTypeConfig = (type: ClientType) => {
    switch (type) {
      case "B2B":
        return {
          icon: Building2,
          gradient: "from-violet-500 to-purple-600",
          shadow: "shadow-violet-500/25",
          bg: "bg-violet-100 dark:bg-violet-900/30",
          text: "text-violet-700 dark:text-violet-400"
        };
      case "B2G":
        return {
          icon: MapPin,
          gradient: "from-blue-500 to-indigo-600",
          shadow: "shadow-blue-500/25",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-700 dark:text-blue-400"
        };
      default:
        return {
          icon: User,
          gradient: "from-emerald-500 to-teal-600",
          shadow: "shadow-emerald-500/25",
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          text: "text-emerald-700 dark:text-emerald-400"
        };
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" : "bg-gradient-to-br from-gray-50 via-white to-gray-50"}`}>
      <div className="p-6 md:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25`}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {t.orderCreate.title}
                </h1>
              </div>
              <p className={`text-base ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {t.orderCreate.description}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
              <div className="flex items-center gap-4">
                {[
                  { label: t.orderCreate.stepClient, icon: User, done: !!selectedClient },
                  { label: t.orderCreate.stepProducts, icon: Package, done: cart.length > 0 },
                  { label: t.orderCreate.stepAddress, icon: MapPin, done: deliveryAddress.trim().length > 0 },
                ].map((step, index) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      step.done
                        ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25"
                        : theme === "dark"
                          ? "bg-gray-700 text-gray-400"
                          : "bg-gray-100 text-gray-400"
                    }`}>
                      {step.done ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${
                      step.done
                        ? theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                        : theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                    {index < 2 && (
                      <ChevronRight className={`w-4 h-4 ${theme === "dark" ? "text-gray-600" : "text-gray-300"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Products */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Selection */}
            <div className={`rounded-2xl border p-6 ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedClient
                    ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                }`}>
                  {selectedClient ? <Check className="w-5 h-5" /> : <span className="text-sm font-bold">1</span>}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {t.orderCreate.selectClient}
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                    {t.orderCreate.chooseClientOrCreate}
                  </p>
                </div>
              </div>

              {selectedClient ? (
                <div className={`flex items-center justify-between p-4 rounded-xl border ${theme === "dark" ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${getClientTypeConfig(selectedClient.type).gradient} text-white font-bold text-lg shadow-lg ${getClientTypeConfig(selectedClient.type).shadow}`}>
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {selectedClient.name}
                        </p>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getClientTypeConfig(selectedClient.type).bg} ${getClientTypeConfig(selectedClient.type).text}`}>
                          {selectedClient.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          <Phone className="w-3.5 h-3.5" />
                          {selectedClient.phone}
                        </span>
                        <span className={`text-sm flex items-center gap-1.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedClient.address.substring(0, 30)}...
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowClientModal(true)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      theme === "dark"
                        ? "bg-white/10 hover:bg-white/15 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {t.orderCreate.change}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClientModal(true)}
                  className={`w-full py-5 border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-3 font-semibold hover:border-blue-400 hover:bg-blue-500/5 ${
                    theme === "dark"
                      ? "border-gray-600 text-gray-400 hover:text-blue-400"
                      : "border-gray-300 text-gray-500 hover:text-blue-500"
                  }`}
                >
                  <User className="w-5 h-5" />
                  {t.orderCreate.selectClient}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Product Filters */}
            <div className={`rounded-2xl border p-6 ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  cart.length > 0
                    ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                }`}>
                  {cart.length > 0 ? <Check className="w-5 h-5" /> : <span className="text-sm font-bold">2</span>}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {t.orderCreate.browseProducts}
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                    {filteredProducts.length} {t.orderCreate.productsAvailable}
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                  <input
                    type="text"
                    placeholder={t.orderCreate.searchProducts}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all ${
                      theme === "dark"
                        ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                    }`}
                  />
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {Object.entries(categoryStats).map(([category, count]) => {
                  const isActive = categoryFilter === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all text-sm flex items-center gap-2 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                          : theme === "dark"
                          ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700 border border-gray-600"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                      }`}
                    >
                      {category !== "All" && getCategoryIcon(category)}
                      {category}
                      <span className={`text-xs ${isActive ? "text-blue-100" : "opacity-60"}`}>({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const inCart = cart.find(item => item.product.id === product.id);
                  return (
                    <div
                      key={product.id}
                      className={`group rounded-xl border p-5 transition-all cursor-pointer relative overflow-hidden ${
                        inCart
                          ? theme === "dark"
                            ? "bg-emerald-900/20 border-emerald-500/30 ring-2 ring-emerald-500/20"
                            : "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20"
                          : theme === "dark"
                            ? "bg-gray-700/30 border-gray-600 hover:border-blue-500/50 hover:bg-gray-700/50"
                            : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg"
                      }`}
                      onClick={() => setShowProductDetail(product)}
                    >
                      {/* In Cart Badge */}
                      {inCart && (
                        <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-500/25">
                          <Check className="w-3 h-3" />
                          {inCart.quantity}
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="relative w-full h-32 mb-4 flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-auto object-contain"
                          />
                        ) : (
                          <div className={`w-24 h-24 rounded-xl flex items-center justify-center ${getCategoryColor(product.category)}`}>
                            {getCategoryIcon(product.category)}
                          </div>
                        )}
                      </div>

                      {/* Category Badge */}
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium mb-2 ${getCategoryColor(product.category)}`}>
                        {getCategoryIcon(product.category)}
                        {product.category}
                      </div>

                      {/* Product Name */}
                      <h4 className={`text-base font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {product.name}
                      </h4>

                      {/* Product Volume */}
                      <p className={`text-sm mb-3 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        {product.volume}
                      </p>

                      {/* Price & Add Button */}
                      <div className="flex items-center justify-between">
                        <p className="text-blue-600 dark:text-blue-400 text-xl font-bold">
                          {formatCurrency(product.price)}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className={`p-2.5 rounded-xl font-semibold transition-all ${
                            inCart
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                          }`}
                        >
                          {inCart ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className={`w-16 h-16 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={`text-lg font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {t.orderCreate.noProductsFound}
                  </p>
                  <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    {t.orderCreate.tryAdjustingSearch}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right - Cart & Checkout */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className={`rounded-2xl border p-6 sticky top-6 ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-xl"}`}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25`}>
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {t.orderCreate.orderSummary}
                    </h3>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                      {cartItemsCount} {t.orderCreate.items}
                    </p>
                  </div>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className={`text-center py-10 rounded-xl border-2 border-dashed ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                  <ShoppingCart className={`w-12 h-12 mx-auto mb-3 ${theme === "dark" ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={`font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {t.orderCreate.cartEmpty}
                  </p>
                  <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    {t.orderCreate.addFromCatalog}
                  </p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3 mb-5 max-h-80 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className={`p-4 rounded-xl border ${
                          theme === "dark"
                            ? "bg-gray-700/30 border-gray-600"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-2">
                            <h4 className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                              {item.product.name}
                            </h4>
                            <p className={`text-xs mt-0.5 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                              {item.product.volume} · {formatCurrency(item.product.price)} {t.orderCreate.each}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              theme === "dark"
                                ? "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-1 p-1 rounded-lg ${theme === "dark" ? "bg-gray-600/50" : "bg-gray-200"}`}>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= item.product.minOrder}
                              className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                                theme === "dark"
                                  ? "hover:bg-gray-500/50 text-white"
                                  : "hover:bg-gray-300 text-gray-700"
                              }`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className={`text-sm font-bold w-8 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stockQuantity}
                              className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                                theme === "dark"
                                  ? "hover:bg-gray-500/50 text-white"
                                  : "hover:bg-gray-300 text-gray-700"
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  <div className="mb-4">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      <Truck className="w-4 h-4" />
                      {t.orderCreate.deliveryAddress}
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm resize-none ${
                        theme === "dark"
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                      }`}
                      placeholder={t.orderCreate.enterDeliveryAddress}
                    />
                  </div>

                  {/* Notes */}
                  <div className="mb-5">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      <FileText className="w-4 h-4" />
                      {t.orderCreate.notesOptional}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm resize-none ${
                        theme === "dark"
                          ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                          : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                      }`}
                      placeholder={t.orderCreate.specialInstructions}
                    />
                  </div>

                  {/* Total */}
                  <div className={`p-4 rounded-xl mb-5 ${
                    theme === "dark"
                      ? "bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {t.orderCreate.subtotal} ({cartItemsCount} {t.orderCreate.items})
                      </span>
                      <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {t.orderCreate.total}
                      </span>
                      <span className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Validation Messages */}
                  {(!selectedClient || !deliveryAddress.trim()) && (
                    <div className={`p-3 rounded-xl mb-4 flex items-start gap-2 ${
                      theme === "dark" ? "bg-amber-900/20 border border-amber-500/20" : "bg-amber-50 border border-amber-200"
                    }`}>
                      <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${theme === "dark" ? "text-amber-400" : "text-amber-600"}`} />
                      <div className={`text-sm ${theme === "dark" ? "text-amber-300" : "text-amber-700"}`}>
                        {!selectedClient && <p>{t.orderCreate.pleaseSelectClient}</p>}
                        {selectedClient && !deliveryAddress.trim() && <p>{t.orderCreate.pleaseEnterAddress}</p>}
                      </div>
                    </div>
                  )}

                  {/* Create Order Button */}
                  <button
                    onClick={createOrder}
                    disabled={!selectedClient || cart.length === 0 || !deliveryAddress.trim()}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-4 rounded-xl font-bold transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {t.orderCreate.createOrder}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Client Selection Modal */}
        <Modal
          isOpen={showClientModal}
          onClose={() => {
            setShowClientModal(false);
            setClientSearchQuery("");
            setClientTypeFilter("All");
          }}
          title={t.orderCreate.selectClientTitle}
          size="lg"
        >
          <div className="space-y-4">
            {/* Search & Filters */}
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                <input
                  type="text"
                  placeholder={t.orderCreate.searchByNamePhoneEmail}
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder-gray-500"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* Client Type Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className={`w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                {Object.entries(clientTypeStats).map(([type, count]) => (
                  <button
                    key={type}
                    onClick={() => setClientTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      clientTypeFilter === type
                        ? type === "B2B"
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25"
                          : type === "B2C"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                          : type === "B2G"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                          : "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg"
                        : theme === "dark"
                        ? "bg-gray-700/50 text-gray-400 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type} ({count})
                  </button>
                ))}
              </div>

              {/* Create New Client Button */}
              <button
                onClick={() => {
                  setShowNewClientModal(true);
                  setShowClientModal(false);
                }}
                className={`w-full py-3 border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-2 font-semibold hover:border-blue-500 hover:bg-blue-500/5 ${
                  theme === "dark"
                    ? "border-blue-500/30 text-blue-400"
                    : "border-blue-300 text-blue-600"
                }`}
              >
                <UserPlus className="w-5 h-5" />
                {t.orderCreate.createNewClient}
              </button>
            </div>

            {/* Client List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className="text-center py-10">
                  <User className={`w-12 h-12 mx-auto mb-3 ${theme === "dark" ? "text-gray-600" : "text-gray-300"}`} />
                  <p className={`font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    {t.orderCreate.noClientsFound}
                  </p>
                  <button
                    onClick={() => {
                      setShowNewClientModal(true);
                      setShowClientModal(false);
                    }}
                    className="mt-3 text-blue-500 hover:text-blue-600 text-sm font-semibold"
                  >
                    {t.orderCreate.createANewClient}
                  </button>
                </div>
              ) : (
                filteredClients.map((client) => {
                  const config = getClientTypeConfig(client.type);
                  return (
                    <button
                      key={client.id}
                      onClick={() => selectClient(client)}
                      className={`w-full p-4 rounded-xl border transition-all text-left hover:shadow-lg ${
                        theme === "dark"
                          ? "bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-gray-500"
                          : "bg-white border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.gradient} text-white font-bold shadow-lg ${config.shadow}`}>
                          {client.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className={`font-bold truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                              {client.name}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold flex-shrink-0 ${config.bg} ${config.text}`}>
                              {client.type}
                            </span>
                          </div>
                          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                            {client.phone}
                          </p>
                          <p className={`text-xs truncate ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                            {client.address}
                          </p>
                        </div>
                        <ChevronRight className={`w-5 h-5 flex-shrink-0 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </Modal>

        {/* Create New Client Modal */}
        <Modal
          isOpen={showNewClientModal}
          onClose={() => {
            setShowNewClientModal(false);
            newClientForm.resetForm();
          }}
          title={t.orderCreate.createNewClientTitle}
          size="lg"
        >
          <form onSubmit={newClientForm.handleSubmit} className="space-y-5">
            {/* Client Name */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.orderCreate.clientName} *
              </label>
              <input
                type="text"
                name="name"
                value={newClientForm.values.name}
                onChange={newClientForm.handleChange}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                  theme === "dark"
                    ? "bg-gray-700/50 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${newClientForm.errors.name && newClientForm.touched.name ? "border-red-500" : ""}`}
                placeholder={t.orderCreate.clientNamePlaceholder}
              />
              {newClientForm.errors.name && newClientForm.touched.name && (
                <p className="text-red-500 text-sm mt-1">{newClientForm.errors.name}</p>
              )}
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t.orderCreate.phoneNumber} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newClientForm.values.phone}
                  onChange={newClientForm.handleChange}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } ${newClientForm.errors.phone && newClientForm.touched.phone ? "border-red-500" : ""}`}
                  placeholder="+998901234567"
                />
                {newClientForm.errors.phone && newClientForm.touched.phone && (
                  <p className="text-red-500 text-sm mt-1">{newClientForm.errors.phone}</p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t.orderCreate.emailOptional}
                </label>
                <input
                  type="email"
                  name="email"
                  value={newClientForm.values.email}
                  onChange={newClientForm.handleChange}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                    theme === "dark"
                      ? "bg-gray-700/50 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } ${newClientForm.errors.email && newClientForm.touched.email ? "border-red-500" : ""}`}
                  placeholder="aziz@example.com"
                />
                {newClientForm.errors.email && newClientForm.touched.email && (
                  <p className="text-red-500 text-sm mt-1">{newClientForm.errors.email}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.orderCreate.deliveryAddressLabel} *
              </label>
              <textarea
                name="address"
                value={newClientForm.values.address}
                onChange={newClientForm.handleChange}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none ${
                  theme === "dark"
                    ? "bg-gray-700/50 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } ${newClientForm.errors.address && newClientForm.touched.address ? "border-red-500" : ""}`}
                placeholder={t.orderCreate.addressPlaceholder}
              />
              {newClientForm.errors.address && newClientForm.touched.address && (
                <p className="text-red-500 text-sm mt-1">{newClientForm.errors.address}</p>
              )}
            </div>

            {/* Client Type */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.orderCreate.clientType} *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: "B2C" as ClientType, label: t.orderCreate.individual, icon: User },
                  { type: "B2B" as ClientType, label: t.orderCreate.business, icon: Building2 },
                  { type: "B2G" as ClientType, label: t.orderCreate.government, icon: MapPin },
                ].map((item) => {
                  const config = getClientTypeConfig(item.type);
                  const isSelected = newClientForm.values.type === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => newClientForm.setValues({ ...newClientForm.values, type: item.type })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `border-transparent bg-gradient-to-br ${config.gradient} text-white shadow-lg ${config.shadow}`
                          : theme === "dark"
                          ? "border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-center">
                        <item.icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? "text-white" : ""}`} />
                        <p className="text-sm font-bold">{item.type}</p>
                        <p className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "opacity-60"}`}>{item.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewClientModal(false);
                  setShowClientModal(true);
                  newClientForm.resetForm();
                }}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                {t.orderCreate.cancel}
              </button>
              <button
                type="submit"
                disabled={!newClientForm.isValid}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-5 h-5" />
                {t.orderCreate.createClient}
              </button>
            </div>
          </form>
        </Modal>

        {/* Product Detail Modal */}
        {showProductDetail && (
          <Modal
            isOpen={!!showProductDetail}
            onClose={() => setShowProductDetail(null)}
            title={t.orderCreate.productDetails}
            size="md"
          >
            <div className="space-y-5">
              {/* Product Header */}
              <div className={`p-5 rounded-xl ${getCategoryColor(showProductDetail.category)}`}>
                <div className="flex items-center gap-2 mb-3">
                  {getCategoryIcon(showProductDetail.category)}
                  <span className="text-sm font-bold">{showProductDetail.category}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{showProductDetail.name}</h3>
                <p className="text-sm opacity-80">{showProductDetail.description}</p>
              </div>

              {/* Product Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-gray-700/30" : "bg-gray-50"}`}>
                  <p className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>{t.orderCreate.price}</p>
                  <p className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {formatCurrency(showProductDetail.price)}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-gray-700/30" : "bg-gray-50"}`}>
                  <p className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>{t.orderCreate.inStock}</p>
                  <p className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {showProductDetail.stockQuantity}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-gray-700/30" : "bg-gray-50"}`}>
                  <p className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>{t.orderCreate.volume}</p>
                  <p className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {showProductDetail.volume}
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-gray-700/30" : "bg-gray-50"}`}>
                  <p className={`text-xs font-medium mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>{t.orderCreate.minOrder}</p>
                  <p className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {showProductDetail.minOrder}
                  </p>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  addToCart(showProductDetail);
                  setShowProductDetail(null);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {t.orderCreate.addToCart}
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
