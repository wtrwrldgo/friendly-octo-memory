export default function Download() {
  return (
    <section id="download" className="py-16 md:py-24 bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left text-white">
            <h2 className="text-3xl md:text-4xl font-bold">
              Hoziroq ilovani yuklab oling
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              WaterGo ilovasi bilan suv buyurtma qilish hech qachon bu qadar oson bo&apos;lmagan.
              Bepul yuklab oling va birinchi buyurtmangizga 20% chegirma oling!
            </p>

            {/* Download buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </a>

              <a
                href="#"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Get it on</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </a>
            </div>

            {/* Promo badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <span className="text-sm text-white">4.9 reyting, 10,000+ yuklab olishlar</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-64 h-[500px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Screen content simulation */}
                  <div className="absolute inset-0 bg-gradient-to-b from-primary-100 to-white p-6">
                    {/* Status bar */}
                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                        <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                        <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
                      </div>
                    </div>

                    {/* App header */}
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
                        </svg>
                      </div>
                      <h3 className="mt-2 font-semibold text-gray-900">
                        <span className="text-gray-900">Water</span>
                        <span className="text-primary-500">Go</span>
                      </h3>
                    </div>

                    {/* Search bar */}
                    <div className="bg-gray-100 rounded-full px-4 py-2 mb-4">
                      <span className="text-gray-400 text-sm">Manzilni kiriting...</span>
                    </div>

                    {/* Product cards */}
                    <div className="space-y-3">
                      <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Nestle Pure Life</div>
                          <div className="text-xs text-gray-500">19L</div>
                        </div>
                        <div className="text-primary-500 font-bold text-sm">25,000</div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Bon Aqua</div>
                          <div className="text-xs text-gray-500">19L</div>
                        </div>
                        <div className="text-primary-500 font-bold text-sm">22,000</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400 rounded-full opacity-80 blur-sm"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-300 rounded-full opacity-80 blur-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
