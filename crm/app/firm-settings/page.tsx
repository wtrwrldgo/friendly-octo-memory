"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Loader2,
  Upload,
  X,
  FileText,
  DollarSign,
  Building2,
  Image,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Palette,
  CreditCard,
  Truck,
  Droplets
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Use relative URL to go through Next.js API routes (which proxy to backend)
const API_URL = "/api";

// Helper to convert HTTP backend URLs to HTTPS proxy URLs
const getProxyUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  // If it's already a data URL (base64), return as-is
  if (url.startsWith("data:")) return url;
  // If it's an HTTP URL from our VPS, proxy it via Next.js rewrite
  if (url.startsWith("http://45.92.173.121/")) {
    // Convert http://45.92.173.121/static/... to /proxy-image/static/...
    return url.replace("http://45.92.173.121/", "/proxy-image/");
  }
  // Otherwise return as-is (could be HTTPS or relative)
  return url;
};

export default function FirmSettingsPage() {
  const { profile, firm, updateFirm } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    homeBannerUrl: "",
    detailBannerUrl: "",
    description: "",
    address: "",
    deliveryTime: "",
    minOrder: 0,
    minOrderEnabled: false,
    deliveryFee: 0,
    deliveryFeeEnabled: false,
    deliveryFeeType: "FIXED" as "FIXED" | "PERCENTAGE",
    deliveryFeePercent: 0,
    bottleDeposit: 5000,
    bottleDepositEnabled: false,
    bottleDepositPrice: 15000,
    scheduleDaysLimit: 7,
    scheduleTimeInterval: 30,
  });

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Banner upload states
  const [uploadingHomeBanner, setUploadingHomeBanner] = useState(false);
  const [homeBannerError, setHomeBannerError] = useState("");
  const [homeBannerPreview, setHomeBannerPreview] = useState<string | null>(null);

  const [uploadingDetailBanner, setUploadingDetailBanner] = useState(false);
  const [detailBannerError, setDetailBannerError] = useState("");
  const [detailBannerPreview, setDetailBannerPreview] = useState<string | null>(null);

  // Fetch current firm data
  useEffect(() => {
    const fetchFirmData = async () => {
      if (!profile?.firmId) return;

      try {
        const response = await fetch(`${API_URL}/firms/${profile.firmId}`);
        const data = await response.json();

        if (data.success && data.data) {
          const firmData = data.data;
          setFormData({
            name: firmData.name || "",
            logoUrl: firmData.logo || firmData.logoUrl || "",
            homeBannerUrl: firmData.homeBannerUrl || firmData.home_banner_url || "",
            detailBannerUrl: firmData.detailBannerUrl || firmData.detail_banner_url || "",
            description: firmData.description || "",
            address: firmData.address || "",
            deliveryTime: firmData.deliveryTime || firmData.delivery_time || "",
            minOrder: firmData.minOrder || firmData.min_order || 0,
            minOrderEnabled: firmData.minOrderEnabled ?? firmData.min_order_enabled ?? false,
            deliveryFee: firmData.deliveryFee || firmData.delivery_fee || 0,
            deliveryFeeEnabled: firmData.deliveryFeeEnabled ?? firmData.delivery_fee_enabled ?? false,
            deliveryFeeType: firmData.deliveryFeeType || firmData.delivery_fee_type || "FIXED",
            deliveryFeePercent: firmData.deliveryFeePercent || firmData.delivery_fee_percent || 0,
            bottleDeposit: firmData.bottleDeposit || firmData.bottle_deposit || 5000,
            bottleDepositEnabled: firmData.bottleDepositEnabled ?? firmData.bottle_deposit_enabled ?? false,
            bottleDepositPrice: firmData.bottleDepositPrice || firmData.bottle_deposit_price || 15000,
            scheduleDaysLimit: firmData.scheduleDaysLimit || firmData.schedule_days_limit || 7,
            scheduleTimeInterval: firmData.scheduleTimeInterval || firmData.schedule_time_interval || 30,
          });
          if (firmData.logo || firmData.logoUrl) {
            const logoUrl = firmData.logo || firmData.logoUrl;
            setImagePreview(getProxyUrl(logoUrl));
          }
          if (firmData.homeBannerUrl || firmData.home_banner_url) {
            const homeBannerUrl = firmData.homeBannerUrl || firmData.home_banner_url;
            setHomeBannerPreview(getProxyUrl(homeBannerUrl));
          }
          if (firmData.detailBannerUrl || firmData.detail_banner_url) {
            const detailBannerUrl = firmData.detailBannerUrl || firmData.detail_banner_url;
            setDetailBannerPreview(getProxyUrl(detailBannerUrl));
          }
        }
      } catch (err) {
        console.error("Failed to fetch firm data:", err);
        setError("Failed to load firm data");
      } finally {
        setLoading(false);
      }
    };

    fetchFirmData();
  }, [profile?.firmId]);

  // Handle image file upload (called after local preview is already set)
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/upload/firm-logo", {
        method: "POST",
        body: formDataUpload,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        // Upload succeeded - store server URL for saving, keep local preview for display
        setFormData((prev) => ({ ...prev, logoUrl: data.data.url }));
        // DON'T update imagePreview - keep the local base64 preview
      } else {
        setUploadError(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File too large. Maximum size is 5MB.");
        return;
      }

      setUploadError("");

      // Create immediate local preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        const localPreview = reader.result as string;
        // Set imagePreview for DISPLAY (base64)
        setImagePreview(localPreview);
        // Then upload to server - this will set formData.logoUrl with server URL
        handleImageUpload(file);
      };
      reader.onerror = () => {
        setUploadError("Failed to read the image file");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle home banner upload (called after local preview is already set)
  const handleHomeBannerUpload = async (file: File) => {
    if (!file) return;

    setUploadingHomeBanner(true);
    setHomeBannerError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/upload/home-banner", {
        method: "POST",
        body: formDataUpload,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        // Upload succeeded - store server URL for saving, keep local preview for display
        setFormData((prev) => ({ ...prev, homeBannerUrl: data.data.url }));
        // DON'T update homeBannerPreview - keep the local base64 preview
      } else {
        setHomeBannerError(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setHomeBannerError("Failed to upload image");
    } finally {
      setUploadingHomeBanner(false);
    }
  };

  const handleHomeBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setHomeBannerError("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setHomeBannerError("File too large. Maximum size is 5MB.");
        return;
      }

      setHomeBannerError("");

      // Create immediate local preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        const localPreview = reader.result as string;
        setHomeBannerPreview(localPreview);
        handleHomeBannerUpload(file);
      };
      reader.onerror = () => {
        setHomeBannerError("Failed to read the image file");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle detail banner upload (called after local preview is already set)
  const handleDetailBannerUpload = async (file: File) => {
    if (!file) return;

    setUploadingDetailBanner(true);
    setDetailBannerError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/upload/detail-banner", {
        method: "POST",
        body: formDataUpload,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        // Upload succeeded - store server URL for saving, keep local preview for display
        setFormData((prev) => ({ ...prev, detailBannerUrl: data.data.url }));
        // DON'T update detailBannerPreview - keep the local base64 preview
      } else {
        setDetailBannerError(data.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setDetailBannerError("Failed to upload image");
    } finally {
      setUploadingDetailBanner(false);
    }
  };

  const handleDetailBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setDetailBannerError("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setDetailBannerError("File too large. Maximum size is 5MB.");
        return;
      }

      setDetailBannerError("");

      // Create immediate local preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        const localPreview = reader.result as string;
        setDetailBannerPreview(localPreview);
        handleDetailBannerUpload(file);
      };
      reader.onerror = () => {
        setDetailBannerError("Failed to read the image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.firmId) {
      setError("No firm ID found");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/firms/${profile.firmId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name,
          logoUrl: formData.logoUrl || null,
          homeBannerUrl: formData.homeBannerUrl || null,
          detailBannerUrl: formData.detailBannerUrl || null,
          description: formData.description || null,
          address: formData.address || null,
          deliveryTime: formData.deliveryTime || null,
          minOrder: Number(formData.minOrder) || 0,
          minOrderEnabled: formData.minOrderEnabled,
          deliveryFee: Number(formData.deliveryFee) || 0,
          deliveryFeeEnabled: formData.deliveryFeeEnabled,
          deliveryFeeType: formData.deliveryFeeType,
          deliveryFeePercent: Number(formData.deliveryFeePercent) || 0,
          bottleDeposit: Number(formData.bottleDeposit) || 5000,
          bottleDepositEnabled: formData.bottleDepositEnabled,
          bottleDepositPrice: Number(formData.bottleDepositPrice) || 15000,
          scheduleDaysLimit: Number(formData.scheduleDaysLimit) || 7,
          scheduleTimeInterval: Number(formData.scheduleTimeInterval) || 30,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Update AuthContext firm state so sidebar reflects changes immediately
        updateFirm({
          name: formData.name,
          logoUrl: formData.logoUrl || undefined,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || "Failed to update firm settings");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <Settings className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{t.settings.loadingSettings}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.common.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600 flex items-center justify-center shadow-xl shadow-violet-500/25">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settings.title}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t.settings.description}
                </p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl hover:shadow-emerald-500/25 active:scale-[0.98]"
              } text-white`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t.settings.saving}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{t.settings.saveChanges}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 relative z-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-400">{t.settings.settingsSaved}</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500">{t.settings.changesSaved}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 relative z-50">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">{t.settings.error}</p>
              <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Brand Identity Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.settings.brandIdentity}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.settings.brandIdentityDesc}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Logo Upload */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  {t.settings.firmLogo}
                </label>

                <div className="flex items-start gap-6">
                  {/* Preview */}
                  {imagePreview ? (
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-3 shadow-lg">
                        <img
                          src={imagePreview}
                          alt="Firm Logo"
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, logoUrl: "" });
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-gray-400" />
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="flex-1">
                    <div
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all cursor-pointer"
                    >
                      <input
                        type="file"
                        id="logoUpload"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploading}
                      />
                      <label htmlFor="logoUpload" className="cursor-pointer">
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.settings.uploading}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.settings.clickToUpload}</span>
                            <span className="text-xs text-gray-500">PNG, JPG, GIF, WebP (max 5MB)</span>
                          </div>
                        )}
                      </label>
                    </div>
                    {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}

                    {/* URL Input */}
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t.settings.pasteUrl}</label>
                      <input
                        type="text"
                        value={formData.logoUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, logoUrl: e.target.value });
                          setImagePreview(getProxyUrl(e.target.value) || null);
                        }}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Banners Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Home Banner */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t.settings.homePageBanner}
                  </label>
                  {homeBannerPreview && (
                    <div className="relative group mb-3">
                      <div className="rounded-2xl bg-gray-100 dark:bg-gray-700 p-2 shadow-lg">
                        <img
                          src={homeBannerPreview}
                          alt="Home Banner"
                          className="w-full h-32 object-cover rounded-xl"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, homeBannerUrl: "" });
                          setHomeBannerPreview(null);
                        }}
                        className="absolute -top-2 -right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-all">
                    <input
                      type="file"
                      id="homeBannerUpload"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleHomeBannerFileChange}
                      className="hidden"
                      disabled={uploadingHomeBanner}
                    />
                    <label htmlFor="homeBannerUpload" className="cursor-pointer flex flex-col items-center gap-2">
                      {uploadingHomeBanner ? (
                        <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500">{uploadingHomeBanner ? t.settings.uploading : t.settings.uploadHomeBanner}</span>
                    </label>
                  </div>
                  {homeBannerError && <p className="mt-1 text-xs text-red-500">{homeBannerError}</p>}
                </div>

                {/* Detail Banner */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t.settings.detailPageBanner}
                  </label>
                  {detailBannerPreview && (
                    <div className="relative group mb-3">
                      <div className="rounded-2xl bg-gray-100 dark:bg-gray-700 p-2 shadow-lg">
                        <img
                          src={detailBannerPreview}
                          alt="Detail Banner"
                          className="w-full h-32 object-cover rounded-xl"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, detailBannerUrl: "" });
                          setDetailBannerPreview(null);
                        }}
                        className="absolute -top-2 -right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 text-center hover:border-emerald-500 dark:hover:border-emerald-400 transition-all">
                    <input
                      type="file"
                      id="detailBannerUpload"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleDetailBannerFileChange}
                      className="hidden"
                      disabled={uploadingDetailBanner}
                    />
                    <label htmlFor="detailBannerUpload" className="cursor-pointer flex flex-col items-center gap-2">
                      {uploadingDetailBanner ? (
                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                      ) : (
                        <Image className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500">{uploadingDetailBanner ? t.settings.uploading : t.settings.uploadDetailBanner}</span>
                    </label>
                  </div>
                  {detailBannerError && <p className="mt-1 text-xs text-red-500">{detailBannerError}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-orange-500/5 to-amber-500/5 dark:from-orange-500/10 dark:to-amber-500/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.settings.basicInfo}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.settings.basicInfoDesc}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Firm Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.settings.firmName} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder={t.settings.firmNamePlaceholder}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.settings.descriptionLabel}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                  rows={4}
                  placeholder={t.settings.descriptionPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{formData.description.length}/500</p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.settings.address}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    maxLength={200}
                    placeholder={t.settings.addressPlaceholder}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Pricing Section */}
          <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.settings.deliveryPricing}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.settings.deliveryPricingDesc}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Delivery Time */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.settings.deliveryTime}
                </label>
                <div className="relative max-w-xs">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                    maxLength={50}
                    placeholder={t.settings.deliveryTimePlaceholder}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Minimum Order Toggle */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200/50 dark:border-amber-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t.settings.minOrderToggle || "Minimum Order"}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.settings.minOrderToggleDesc || "Set a minimum order amount for customers"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, minOrderEnabled: !formData.minOrderEnabled })}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                      formData.minOrderEnabled
                        ? "bg-gradient-to-r from-amber-500 to-orange-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                        formData.minOrderEnabled ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {formData.minOrderEnabled && (
                  <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t.settings.minOrderUZS}
                    </label>
                    <div className="relative max-w-xs">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.minOrder || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setFormData({ ...formData, minOrder: Number(val) || 0 });
                        }}
                        placeholder="50000"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Fee Toggle */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200/50 dark:border-emerald-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t.settings.deliveryFeeToggle || "Delivery Fee"}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.settings.deliveryFeeToggleDesc || "Charge customers for delivery"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deliveryFeeEnabled: !formData.deliveryFeeEnabled })}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      formData.deliveryFeeEnabled
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                        formData.deliveryFeeEnabled ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {formData.deliveryFeeEnabled && (
                  <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    {/* Fee Type Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t.settings.deliveryFeeTypeLabel || "Fee Type"}
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, deliveryFeeType: "FIXED" })}
                          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                            formData.deliveryFeeType === "FIXED"
                              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                              : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                          }`}
                        >
                          {t.settings.fixedPrice || "Fixed Price"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, deliveryFeeType: "PERCENTAGE" })}
                          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                            formData.deliveryFeeType === "PERCENTAGE"
                              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                              : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500"
                          }`}
                        >
                          {t.settings.percentage || "Percentage"}
                        </button>
                      </div>
                    </div>

                    {/* Fixed Price Input */}
                    {formData.deliveryFeeType === "FIXED" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t.settings.deliveryFeeUZS}
                        </label>
                        <div className="relative max-w-xs">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formData.deliveryFee || ""}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              setFormData({ ...formData, deliveryFee: Number(val) || 0 });
                            }}
                            placeholder="5000"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* Percentage Input */}
                    {formData.deliveryFeeType === "PERCENTAGE" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t.settings.deliveryFeePercentLabel || "Percentage of Order Total"}
                        </label>
                        <div className="relative max-w-xs">
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                          <input
                            type="number"
                            value={formData.deliveryFeePercent}
                            onChange={(e) => setFormData({ ...formData, deliveryFeePercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                            min={0}
                            max={100}
                            placeholder="10"
                            className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {t.settings.deliveryFeePercentDesc || "Delivery fee will be calculated as a percentage of the order total"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottle Deposit Toggle */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 border border-cyan-200/50 dark:border-cyan-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                      <Droplets className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t.settings.chargeBottleDeposit}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.settings.chargeBottleDepositDesc}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bottleDepositEnabled: !formData.bottleDepositEnabled })}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                      formData.bottleDepositEnabled
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                        formData.bottleDepositEnabled ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Conditional Price Input */}
                {formData.bottleDepositEnabled && (
                  <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t.settings.bottleDepositPriceLabel}
                    </label>
                    <div className="relative max-w-xs">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.bottleDepositPrice || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setFormData({ ...formData, bottleDepositPrice: Number(val) || 0 });
                        }}
                        placeholder="15000"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {t.settings.bottleDepositPriceDesc}
                    </p>
                  </div>
                )}
              </div>

              {/* Scheduling Settings */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  {t.settings.scheduledDeliverySettings}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Schedule Days Limit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t.settings.advanceBookingDays}
                    </label>
                    <select
                      value={formData.scheduleDaysLimit}
                      onChange={(e) => setFormData({ ...formData, scheduleDaysLimit: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value={1}>1 {t.settings.daysAhead}</option>
                      <option value={2}>2 {t.settings.daysAhead}</option>
                      <option value={3}>3 {t.settings.daysAhead}</option>
                      <option value={4}>4 {t.settings.daysAhead}</option>
                      <option value={5}>5 {t.settings.daysAhead}</option>
                      <option value={6}>6 {t.settings.daysAhead}</option>
                      <option value={7}>7 {t.settings.daysAhead}</option>
                      <option value={8}>8 {t.settings.daysAhead}</option>
                      <option value={9}>9 {t.settings.daysAhead}</option>
                      <option value={10}>10 {t.settings.daysAhead}</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">{t.settings.advanceBookingDaysDesc}</p>
                  </div>

                  {/* Schedule Time Interval */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t.settings.timeSlotIntervals}
                    </label>
                    <select
                      value={formData.scheduleTimeInterval}
                      onChange={(e) => setFormData({ ...formData, scheduleTimeInterval: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value={1}>1 {t.settings.minutes}</option>
                      <option value={2}>2 {t.settings.minutes}</option>
                      <option value={5}>5 {t.settings.minutes}</option>
                      <option value={10}>10 {t.settings.minutes}</option>
                      <option value={15}>15 {t.settings.minutes}</option>
                      <option value={30}>30 {t.settings.minutes}</option>
                      <option value={60}>1 {t.settings.hours || "hour"}</option>
                      <option value={120}>2 {t.settings.hours || "hours"}</option>
                      <option value={180}>3 {t.settings.hours || "hours"}</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">{t.settings.timeSlotIntervalsDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-xl ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-2xl hover:shadow-emerald-500/25 active:scale-[0.98]"
              } text-white`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t.settings.savingChanges}</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{t.settings.saveAllChanges}</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
