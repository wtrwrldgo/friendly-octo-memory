export interface Translations {
  // Order Tracking Screen
  orderTracking: string;
  orderId: string;
  deliveredBy: string;

  // Order Stages
  orderPlaced: string;
  inQueue: string;
  courierOnTheWay: string;
  delivered: string;

  // Queue Info
  queuePosition: string; // "You are {position} in the queue. Courier is delivering {count} more orders before yours."

  // Order Details
  orderList: string;
  deliveryBy: string;
  serviceFee: string;
  payment: string;
  onlyWithCash: string;
  address: string;
  total: string;
  free: string;

  // Actions
  cancelOrder: string;
  reportProblem: string;
  backToHome: string;
  call: string;

  // Driver
  yourDriver: string;
  driverName: string;
}

const en: Translations = {
  orderTracking: 'Order Tracking',
  orderId: 'Order #',
  deliveredBy: 'Delivered by:',

  orderPlaced: 'Order placed',
  inQueue: 'In queue',
  courierOnTheWay: 'Courier on the way',
  delivered: 'Delivered',

  queuePosition: 'You are {position} in the queue. Courier is delivering {count} more orders before yours.',

  orderList: 'Order List',
  deliveryBy: 'Delivery by',
  serviceFee: 'Service Fee',
  payment: 'Payment',
  onlyWithCash: 'Only with cash',
  address: 'Address',
  total: 'Total',
  free: 'Free',

  cancelOrder: 'Cancel order',
  reportProblem: 'Report a problem',
  backToHome: 'Back to Home',
  call: 'Call',

  yourDriver: 'Your Driver',
  driverName: 'Driver',
};

const ru: Translations = {
  orderTracking: 'Отслеживание заказа',
  orderId: 'Заказ №',
  deliveredBy: 'Доставляется:',

  orderPlaced: 'Заказ размещен',
  inQueue: 'В очереди',
  courierOnTheWay: 'Курьер в пути',
  delivered: 'Доставлен',

  queuePosition: 'Вы {position} в очереди. Курьер доставляет еще {count} заказов перед вашим.',

  orderList: 'Список заказа',
  deliveryBy: 'Доставка',
  serviceFee: 'Сервисный сбор',
  payment: 'Оплата',
  onlyWithCash: 'Только наличными',
  address: 'Адрес',
  total: 'Итого',
  free: 'Бесплатно',

  cancelOrder: 'Отменить заказ',
  reportProblem: 'Сообщить о проблеме',
  backToHome: 'На главную',
  call: 'Позвонить',

  yourDriver: 'Ваш водитель',
  driverName: 'Водитель',
};

const uz: Translations = {
  orderTracking: 'Buyurtmani kuzatish',
  orderId: 'Buyurtma №',
  deliveredBy: 'Yetkazib beradi:',

  orderPlaced: 'Buyurtma joylashtirildi',
  inQueue: 'Navbatda',
  courierOnTheWay: 'Kuryer yo\'lda',
  delivered: 'Yetkazildi',

  queuePosition: 'Siz navbatda {position}-sizda. Kuryer sizdan oldin yana {count} ta buyurtmani yetkazib bermoqda.',

  orderList: 'Buyurtma ro\'yxati',
  deliveryBy: 'Yetkazib berish',
  serviceFee: 'Xizmat to\'lovi',
  payment: 'To\'lov',
  onlyWithCash: 'Faqat naqd pul bilan',
  address: 'Manzil',
  total: 'Jami',
  free: 'Bepul',

  cancelOrder: 'Buyurtmani bekor qilish',
  reportProblem: 'Muammo haqida xabar berish',
  backToHome: 'Bosh sahifaga',
  call: 'Qo\'ng\'iroq qilish',

  yourDriver: 'Sizning haydovchingiz',
  driverName: 'Haydovchi',
};

const translations: Record<string, Translations> = {
  en,
  ru,
  uz,
};

export const getTranslation = (language: string): Translations => {
  return translations[language] || translations['en'];
};

// Helper function to format queue position text
export const formatQueuePosition = (translation: string, position: number, count: number): string => {
  return translation
    .replace('{position}', position.toString())
    .replace('{count}', count.toString());
};

// Helper function to get translated product name based on language
export const getTranslatedProductName = (
  product: { name: string; name_en?: string; name_ru?: string; name_uz?: string; name_kaa?: string },
  language: string
): string => {
  const translationMap: Record<string, string | undefined> = {
    en: product.name_en,
    ru: product.name_ru,
    uz: product.name_uz,
    kaa: product.name_kaa,
  };
  // Return translated name if available, otherwise fallback to default name
  return translationMap[language] || product.name;
};
