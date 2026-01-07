export default function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Toza suv <span className="text-primary-500">eshigingizgacha</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-lg mx-auto md:mx-0">
              WaterGo orqali toza ichimlik suvini bir necha daqiqada buyurtma qiling.
              Tez yetkazib berish va qulay narxlar.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href="#download"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white rounded-full font-semibold text-lg hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
              >
                Hoziroq buyurtma bering
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-500 border-2 border-primary-500 rounded-full font-semibold text-lg hover:bg-primary-50 transition-colors"
              >
                Batafsil
              </a>
            </div>
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-500">10K+</div>
                <div className="text-sm text-gray-500">Mijozlar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-500">50K+</div>
                <div className="text-sm text-gray-500">Yetkazildi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-500">4.9</div>
                <div className="text-sm text-gray-500">Reyting</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-primary-100 rounded-full blur-3xl opacity-60"></div>

              {/* Logo text display */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="relative bg-white rounded-3xl shadow-2xl p-12">
                  {/* Water drop icon */}
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                    <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
                    </svg>
                  </div>
                  {/* Logo text */}
                  <div className="text-center">
                    <span className="text-5xl font-bold">
                      <span className="text-gray-900">Water</span>
                      <span className="text-primary-500">Go</span>
                    </span>
                    <p className="text-gray-500 mt-2">Suv yetkazib berish</p>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-primary-400/10 rounded-3xl blur-xl -z-10 scale-110"></div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-10 right-10 w-16 h-16 bg-primary-200 rounded-full animate-bounce opacity-70"></div>
              <div className="absolute bottom-20 left-5 w-12 h-12 bg-primary-300 rounded-full animate-pulse opacity-70"></div>
              <div className="absolute top-1/2 right-0 w-10 h-10 bg-primary-400 rounded-full animate-ping opacity-30"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
