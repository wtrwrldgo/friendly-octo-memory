// file: app/firm-order-create/page.tsx

"use client";

import { useState, useMemo } from "react";
import { ShoppingCart, Plus, Minus, Trash2, User, MapPin, Phone, Mail, Search, Package, Check, X, Droplet, Zap, Wrench, UserPlus, Filter, Briefcase } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
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
      // In real app, this would call API to create client
      const newClient: Client = {
        ...values,
        id: `c-${Date.now()}`,
        firmId: "1",
        totalOrders: 0,
        revenue: 0,
        createdAt: new Date().toISOString(),
      };

      // Add to mock data (in real app, would be from API response)
      mockClients.push(newClient);

      // Select the new client
      selectClient(newClient);

      // Close modals and reset form
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

    // In real app, this would call API
    alert(`Order created successfully!\n\nClient: ${selectedClient.name}\nItems: ${cartItemsCount}\nTotal: ${formatCurrency(cartTotal)}`);

    // Reset and redirect
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

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" : "bg-gradient-to-br from-gray-50 via-white to-gray-50"}`}>
      <div className="p-6 md:p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Create New Order
              </h1>
              <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Browse products and create orders for your clients
              </p>
            </div>
            {selectedClient && cart.length > 0 && (
              <div className={`px-6 py-4 rounded-2xl border-2 backdrop-blur-sm ${theme === "dark" ? "bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20" : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"}`}>
                <p className={`text-sm font-medium mb-1 ${theme === "dark" ? "text-green-300" : "text-green-600"}`}>Cart Total</p>
                <p className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{formatCurrency(cartTotal)}</p>
              </div>
            )}
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <div className={`rounded-3xl border-2 p-6 backdrop-blur-sm ${theme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Select Client
              </h3>
            </div>
            {selectedClient ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {selectedClient.name}
                    </p>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      {selectedClient.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowClientModal(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-white/5 hover:bg-white/10 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClientModal(true)}
                className="w-full py-4 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 font-semibold"
                style={{
                  borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                  color: theme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                }}
              >
                <User className="w-5 h-5" />
                Select Client
              </button>
            )}
          </div>

          {/* Product Filters */}
          <div className={`rounded-3xl border-2 p-6 backdrop-blur-sm ${theme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" : "bg-white border-gray-200 shadow-lg"}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Browse Products
              </h3>
            </div>

            {/* Search */}
            <div className="mb-4">
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
            <div className="flex gap-2 mb-6 flex-wrap">
              {Object.entries(categoryStats).map(([category, count]) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-5 py-3 rounded-2xl font-semibold transition-all text-sm ${
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

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const inCart = cart.find(item => item.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    className={`group rounded-2xl border-2 p-6 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer relative overflow-hidden ${
                      theme === "dark"
                        ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50"
                        : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-500/20"
                    }`}
                    onClick={() => setShowProductDetail(product)}
                  >
                    {/* In Cart Badge */}
                    {inCart && (
                      <div className="absolute top-3 right-3 z-20 bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Check className="w-3 h-3" />
                        {inCart.quantity}
                      </div>
                    )}

                    {/* Product Image - Large and Centered */}
                    <div className="relative w-full h-40 mb-4 flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-auto object-contain"
                        />
                      ) : (
                        <div className={`w-32 h-32 rounded-2xl flex items-center justify-center ${getCategoryColor(product.category)}`}>
                          {getCategoryIcon(product.category)}
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <h4 className={`text-lg font-bold mb-1 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {product.name}
                    </h4>

                    {/* Product Volume */}
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-3 text-center">
                      {product.volume}
                    </p>

                    {/* Product Price - Large and Prominent */}
                    <p className="text-blue-600 dark:text-blue-400 text-2xl font-bold mb-4 text-center">
                      {formatCurrency(product.price)}
                    </p>

                    {/* Add Button - Full Width */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                        inCart
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-5 h-5" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <Package className={`w-12 h-12 mx-auto mb-3 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  No products found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right - Cart & Checkout */}
        <div className="space-y-6">
          {/* Cart */}
          <div className={`rounded-3xl border-2 p-6 sticky top-8 backdrop-blur-sm ${theme === "dark" ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-xl" : "bg-white border-gray-200 shadow-xl"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                Cart
              </h3>
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg text-sm font-bold">
                {cartItemsCount} items
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className={`w-12 h-12 mx-auto mb-3 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Your cart is empty
                </p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className={`p-3 rounded-xl border ${
                        theme === "dark"
                          ? "bg-white/5 border-white/10"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-semibold text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= item.product.minOrder}
                            className={`p-1 rounded ${
                              theme === "dark"
                                ? "bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-30"
                            } transition-colors disabled:cursor-not-allowed`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`text-sm font-bold w-8 text-center ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockQuantity}
                            className={`p-1 rounded ${
                              theme === "dark"
                                ? "bg-white/10 hover:bg-white/20 text-white disabled:opacity-30"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-30"
                            } transition-colors disabled:cursor-not-allowed`}
                          >
                            <Plus className="w-3 h-3" />
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
                <div className="mb-4 space-y-2">
                  <label className={`block text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm resize-none ${
                      theme === "dark"
                        ? "bg-white/5 border-white/10 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                    placeholder="Enter delivery address"
                  />
                </div>

                {/* Notes */}
                <div className="mb-4 space-y-2">
                  <label className={`block text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm resize-none ${
                      theme === "dark"
                        ? "bg-white/5 border-white/10 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                    placeholder="Add any special instructions..."
                  />
                </div>

                {/* Total */}
                <div className={`p-4 rounded-xl mb-4 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20"
                    : "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Total
                    </span>
                    <span className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                {/* Create Order Button */}
                <button
                  onClick={createOrder}
                  disabled={!selectedClient || cart.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white py-4 rounded-2xl font-bold transition-all shadow-2xl shadow-green-500/30 hover:shadow-green-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Create Order
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
        title="Select Client"
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
                placeholder="Search by name, phone, or email..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white placeholder-gray-500"
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
                        ? "bg-purple-600 text-white shadow-lg"
                        : type === "B2C"
                        ? "bg-green-600 text-white shadow-lg"
                        : type === "B2G"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-600 text-white shadow-lg"
                      : theme === "dark"
                      ? "bg-white/5 text-gray-400 hover:bg-white/10"
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
              className="w-full py-3 border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-2 font-semibold hover:border-blue-500 hover:bg-blue-500/10"
              style={{
                borderColor: theme === "dark" ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.4)",
                color: theme === "dark" ? "rgba(96, 165, 250, 1)" : "rgba(37, 99, 235, 1)",
              }}
            >
              <UserPlus className="w-5 h-5" />
              Create New Client
            </button>
          </div>

          {/* Client List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <User className={`w-12 h-12 mx-auto mb-3 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  No clients found
                </p>
                <button
                  onClick={() => {
                    setShowNewClientModal(true);
                    setShowClientModal(false);
                  }}
                  className="mt-3 text-blue-500 hover:text-blue-600 text-sm font-semibold"
                >
                  Create a new client
                </button>
              </div>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client)}
                  className={`w-full p-4 rounded-xl border transition-all text-left hover:shadow-lg ${
                    theme === "dark"
                      ? "bg-white/5 border-white/10 hover:bg-white/10"
                      : "bg-gray-50 border-gray-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {client.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {client.name}
                      </h4>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {client.phone}
                      </p>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
                        {client.address}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      client.type === "B2B"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                        : client.type === "B2G"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    }`}>
                      {client.type}
                    </div>
                  </div>
                </button>
              ))
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
        title="Create New Client"
        size="lg"
      >
        <form onSubmit={newClientForm.handleSubmit} className="space-y-4">
          {/* Client Name */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Client Name *
            </label>
            <input
              type="text"
              name="name"
              value={newClientForm.values.name}
              onChange={newClientForm.handleChange}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } ${newClientForm.errors.name && newClientForm.touched.name ? "border-red-500" : ""}`}
              placeholder="e.g., Aziz Karimov or Tech Solutions LLC"
            />
            {newClientForm.errors.name && newClientForm.touched.name && (
              <p className="text-red-500 text-sm mt-1">{newClientForm.errors.name}</p>
            )}
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={newClientForm.values.phone}
                onChange={newClientForm.handleChange}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white"
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
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={newClientForm.values.email}
                onChange={newClientForm.handleChange}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition ${
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-white"
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
              Delivery Address *
            </label>
            <textarea
              name="address"
              value={newClientForm.values.address}
              onChange={newClientForm.handleChange}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } ${newClientForm.errors.address && newClientForm.touched.address ? "border-red-500" : ""}`}
              placeholder="e.g., Chilanzar 10, apt 45, Tashkent"
            />
            {newClientForm.errors.address && newClientForm.touched.address && (
              <p className="text-red-500 text-sm mt-1">{newClientForm.errors.address}</p>
            )}
          </div>

          {/* Client Type */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Client Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => newClientForm.setValues({ ...newClientForm.values, type: "B2C" })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  newClientForm.values.type === "B2C"
                    ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                    : theme === "dark"
                    ? "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <User className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs font-bold">B2C</p>
                  <p className="text-xs opacity-70">Individual</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => newClientForm.setValues({ ...newClientForm.values, type: "B2B" })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  newClientForm.values.type === "B2B"
                    ? "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    : theme === "dark"
                    ? "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <Briefcase className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs font-bold">B2B</p>
                  <p className="text-xs opacity-70">Business</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => newClientForm.setValues({ ...newClientForm.values, type: "B2G" })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  newClientForm.values.type === "B2G"
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : theme === "dark"
                    ? "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <MapPin className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-xs font-bold">B2G</p>
                  <p className="text-xs opacity-70">Government</p>
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowNewClientModal(false);
                setShowClientModal(true);
                newClientForm.resetForm();
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
              disabled={!newClientForm.isValid}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-5 h-5" />
              Create Client
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Detail Modal */}
      {showProductDetail && (
        <Modal
          isOpen={!!showProductDetail}
          onClose={() => setShowProductDetail(null)}
          title="Product Details"
          size="md"
        >
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${getCategoryColor(showProductDetail.category)}`}>
              <div className="flex items-center gap-3 mb-3">
                {getCategoryIcon(showProductDetail.category)}
                <span className="text-sm font-bold">{showProductDetail.category}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{showProductDetail.name}</h3>
              <p className="text-sm">{showProductDetail.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                <p className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Price</p>
                <p className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {formatCurrency(showProductDetail.price)}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                <p className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>In Stock</p>
                <p className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {showProductDetail.stockQuantity}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                <p className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Volume</p>
                <p className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {showProductDetail.volume}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${theme === "dark" ? "bg-white/5" : "bg-gray-50"}`}>
                <p className={`text-sm mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Min Order</p>
                <p className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {showProductDetail.minOrder}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                addToCart(showProductDetail);
                setShowProductDetail(null);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </Modal>
      )}
      </div>
    </div>
  );
}
