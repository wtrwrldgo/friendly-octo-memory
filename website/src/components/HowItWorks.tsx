const steps = [
  {
    number: "01",
    title: "Ilovani yuklab oling",
    description: "App Store yoki Google Play'dan WaterGo ilovasini bepul yuklab oling.",
  },
  {
    number: "02",
    title: "Manzilni tanlang",
    description: "Yetkazib berish manzilingizni kiriting yoki xaritadan tanlang.",
  },
  {
    number: "03",
    title: "Suvni tanlang",
    description: "Kerakli suv turini va miqdorini tanlang. Turli brendlar mavjud.",
  },
  {
    number: "04",
    title: "Buyurtmani kuzating",
    description: "Kuryeringizni real vaqtda kuzating. Suv eshigingizgacha yetkaziladi.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Qanday <span className="text-primary-500">ishlaydi</span>?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Atigi 4 ta oddiy qadam - va suv eshigingizda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector lines for desktop */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 ring-4 ring-white">
                  <span className="text-3xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-600 max-w-xs mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
