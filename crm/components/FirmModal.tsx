"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  Camera,
  Star,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  EyeOff,
  Coins,
} from "lucide-react";
import { Firm, FirmStatus } from "@/types";
import SuccessModal from "./SuccessModal";

const BACKEND_URL = "http://localhost:3001";

interface FirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  firm?: Firm | null;
}

export default function FirmModal({
  isOpen,
  onClose,
  onSuccess,
  firm,
}: FirmModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    status: "DRAFT" as FirmStatus,
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    ownerPassword: "",
    bottleDepositEnabled: false,
    bottleDepositPrice: 15000,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdFirmName, setCreatedFirmName] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  // Image upload states
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animation states
  const [isClosing, setIsClosing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isEditing = !!firm;

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      requestAnimationFrame(() => setShowModal(true));
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (firm) {
      setFormData({
        name: firm.name,
        city: firm.city,
        status: firm.status,
        ownerName: "",
        ownerPhone: "",
        ownerEmail: "",
        ownerPassword: "",
        bottleDepositEnabled: firm.bottleDepositEnabled || false,
        bottleDepositPrice: firm.bottleDepositPrice || 15000,
      });
      // Set existing logo if editing
      if (firm.logoUrl) {
        setLogoPreview(firm.logoUrl);
      }
    } else {
      setFormData({
        name: "",
        city: "",
        status: "DRAFT",
        ownerName: "",
        ownerPhone: "",
        ownerEmail: "",
        ownerPassword: "",
        bottleDepositEnabled: false,
        bottleDepositPrice: 15000,
      });
      setLogoPreview(null);
      setLogoFile(null);
    }
    setError("");
  }, [firm, isOpen]);

  const handleClose = () => {
    if (loading) return;
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      onClose();
    }, 200);
  };

  // Handle local file selection - creates preview immediately
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Store the file for later upload
    setLogoFile(file);
    setError("");

    // Create local preview using FileReader - THIS IS THE FIX
    const reader = new FileReader();
    reader.onloadend = () => {
      // This creates a base64 data URL that works for local preview
      setLogoPreview(reader.result as string);
    };
    reader.onerror = () => {
      setError("Failed to read the image file");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload logo to backend
  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return logoPreview; // Return existing URL if editing

    setUploadingLogo(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", logoFile);

      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${BACKEND_URL}/api/upload/admin/firm-logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success && result.data?.logoUrl) {
        return result.data.logoUrl;
      } else {
        console.warn("Logo upload failed, continuing without logo:", result.message);
        return null;
      }
    } catch (error) {
      console.warn("Logo upload error, continuing without logo:", error);
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("auth_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Upload logo first if there's a new file
      let logoUrl = null;
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      if (isEditing) {
        const response = await fetch(`/api/firms/${firm.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            city: formData.city,
            bottleDepositEnabled: formData.bottleDepositEnabled,
            bottleDepositPrice: formData.bottleDepositPrice,
            ...(logoUrl && { logoUrl }),
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to update firm");
        }
      } else {
        if (!formData.ownerName || !formData.ownerEmail || !formData.ownerPassword || !formData.ownerPhone) {
          throw new Error("Owner name, phone, email, and password are required");
        }

        const firmResponse = await fetch(`${BACKEND_URL}/api/firms`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: formData.name,
            isActive: false,
            ...(logoUrl && { logoUrl }),
            owner: {
              name: formData.ownerName,
              phone: formData.ownerPhone,
              email: formData.ownerEmail,
              password: formData.ownerPassword,
            },
          }),
        });

        const firmResult = await firmResponse.json();

        if (!firmResult.success) {
          throw new Error(firmResult.message || "Failed to create firm");
        }

        setCreatedFirmName(formData.name);
        setCreatedCredentials({
          email: formData.ownerEmail,
          password: formData.ownerPassword,
        });

        onSuccess();
        handleClose();
        setShowSuccessModal(true);
        return;
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to save firm");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setCreatedFirmName("");
    setCreatedCredentials(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Firm Created Successfully!"
        message={`"${createdFirmName}" has been registered. The owner can now login to configure their firm.`}
        credentials={createdCredentials || undefined}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop with blur */}
        <div
          className={`absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity duration-300 ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleClose}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-violet-500/30"
              style={{
                left: `${10 + i * 8}%`,
                top: `${20 + (i % 4) * 18}%`,
                animation: `float ${3 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Modal */}
        <div
          className={`relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 ${
            isClosing
              ? "opacity-0 scale-90 translate-y-8"
              : showModal
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-90 translate-y-8"
          }`}
          style={{
            animation: showModal && !isClosing ? "firmModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
          }}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none" />

          {/* Decorative orbs */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90 z-10 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>

          {/* Header */}
          <div className="relative flex items-center gap-4 p-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-800/50">
            {/* Icon with effects */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditing ? "Edit Firm" : "Register New Firm"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isEditing ? "Update firm details" : "Create firm and owner account"}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-shake relative z-50">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Info banner for new firms */}
            {!isEditing && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    New firms start in <strong>Draft</strong> status. The owner configures settings after login.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Logo Upload Section */}
              <div className="pb-5 border-b border-slate-200/50 dark:border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Firm Logo
                </h3>

                <div className="flex items-start gap-4">
                  {/* Logo Preview Area */}
                  <div
                    onClick={() => !uploadingLogo && !loading && fileInputRef.current?.click()}
                    className={`relative w-28 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                      logoPreview
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                        : "border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500 bg-slate-50 dark:bg-slate-700/50 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                    }`}
                  >
                    {uploadingLogo ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                        <span className="text-xs text-violet-500">Uploading...</span>
                      </div>
                    ) : logoPreview ? (
                      <>
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-violet-500 transition-colors">
                        <ImageIcon className="w-10 h-10" />
                        <span className="text-xs font-medium">Upload</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo || loading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="flex items-center gap-2 px-4 py-2.5 mt-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-semibold transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                    <p className="text-xs text-slate-500 mt-3">
                      PNG, JPG, WEBP up to 5MB. Square images recommended.
                    </p>
                  </div>
                </div>
              </div>

              {/* Firm Details Section */}
              <div className={!isEditing ? "pb-5 border-b border-slate-200/50 dark:border-slate-700/50" : ""}>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Firm Details
                </h3>

                {/* Firm Name */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Firm Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                      placeholder="e.g., AquaPure Tashkent"
                      required
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                      placeholder="e.g., Tashkent"
                      required
                    />
                  </div>
                </div>

                {/* Bottle Deposit Section - Only show when editing */}
                {isEditing && (
                  <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-700/50">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      Bottle Deposit
                    </h3>

                    {/* Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 mb-4">
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Enable Bottle Deposit</p>
                        <p className="text-xs text-slate-500 mt-1">Charge customers for bottle deposit</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, bottleDepositEnabled: !formData.bottleDepositEnabled })}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                          formData.bottleDepositEnabled
                            ? "bg-gradient-to-r from-violet-500 to-purple-500"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                            formData.bottleDepositEnabled ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Price Input - Only show when enabled */}
                    {formData.bottleDepositEnabled && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Deposit Price (UZS)
                        </label>
                        <div className="relative group">
                          <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                          <input
                            type="number"
                            value={formData.bottleDepositPrice}
                            onChange={(e) => setFormData({ ...formData, bottleDepositPrice: parseInt(e.target.value) || 0 })}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                            placeholder="15000"
                            min="0"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Amount charged per bottle as deposit</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Owner Account Section (only for new firms) */}
              {!isEditing && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Owner Account
                  </h3>

                  {/* Owner Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Owner Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                        placeholder="e.g., Aziz Karimov"
                        required
                      />
                    </div>
                  </div>

                  {/* Owner Phone */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Owner Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                      <input
                        type="tel"
                        value={formData.ownerPhone}
                        onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                        placeholder="+998901234567"
                        required
                      />
                    </div>
                  </div>

                  {/* Owner Email */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Owner Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                      <input
                        type="email"
                        value={formData.ownerEmail}
                        onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                        placeholder="owner@aquapure.uz"
                        required
                      />
                    </div>
                  </div>

                  {/* Owner Password */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Owner Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                      <input
                        type="password"
                        value={formData.ownerPassword}
                        onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                        placeholder="Min 6 characters"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 ml-1">Owner will use these credentials to login to CRM</p>
                  </div>
                </div>
              )}

              {/* Status Info (read-only display for editing) */}
              {isEditing && firm && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Current Status
                  </label>
                  <div className="flex items-center gap-3">
                    {firm.status === "ACTIVE" && (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">Active</p>
                          <p className="text-xs text-slate-500">Visible in client app</p>
                        </div>
                      </>
                    )}
                    {firm.status === "PENDING_REVIEW" && (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-amber-600 dark:text-amber-400">Pending Review</p>
                          <p className="text-xs text-slate-500">Awaiting admin approval</p>
                        </div>
                      </>
                    )}
                    {firm.status === "DRAFT" && (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-slate-500/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-600 dark:text-slate-400">Draft</p>
                          <p className="text-xs text-slate-500">Not yet submitted for review</p>
                        </div>
                      </>
                    )}
                    {firm.status === "SUSPENDED" && (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-600 dark:text-red-400">Suspended</p>
                          <p className="text-xs text-slate-500">Hidden from client app</p>
                        </div>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                    Status is managed through the Firm Moderation page
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 group"
                disabled={loading}
              >
                <span className="group-hover:scale-105 inline-block transition-transform">Cancel</span>
              </button>
              <button
                type="submit"
                disabled={loading || uploadingLogo}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isEditing ? "Updating..." : "Creating..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>{isEditing ? "Update Firm" : "Register Firm"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <style jsx global>{`
          @keyframes firmModalIn {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(30px);
            }
            50% {
              transform: scale(1.02) translateY(-5px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0) scale(1);
              opacity: 0.3;
            }
            50% {
              transform: translateY(-20px) scale(1.2);
              opacity: 0.6;
            }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
        `}</style>
      </div>
    </>
  );
}
