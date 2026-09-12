// src/data/reviews.ts

export interface Review {
  id: string;
  deviceId: string;
  productName: string;
  author: string;
  date: string;
  rating: number; // 1-5
  comment: string;
  image?: string;
  verified: boolean;
  platform: 'mercadolibre';
}

export const REVIEWS: Review[] = [
  {
    id: 'hb-1',
    deviceId: 'handbrake',
    productName: 'Freno de Mano Pro Hall USB Simracing',
    author: 'Comprador verificado',
    date: 'Hace 2 semanas',
    rating: 5,
    comment: 'Un lujo.',
    image: '/images/reviews/handbrake-review-1.jpg',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'hb-2',
    deviceId: 'handbrake',
    productName: 'Freno de Mano Pro Hall USB Simracing',
    author: 'Comprador verificado',
    date: 'Hace 3 meses',
    rating: 5,
    comment: 'Muy buen producto, cumplio ampliamente las expectativas. Soy fanatico de la impresion 3d. Me sorprendio la calidad constructiva. En cuanto a precision cumple muy bien tambien.',
    image: '/images/reviews/handbrake-review-2.jpg',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'ak-1',
    deviceId: 'antaknob',
    productName: 'AntaKnob — Perilla de Volumen / Macropad',
    author: 'Comprador verificado',
    date: 'Reciente',
    rating: 5,
    comment: 'Impecable: fachero, cómodo, anda de una, se puede configurar a gusto muy fácil. Además trae un cable excelente.',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'ak-2',
    deviceId: 'antaknob',
    productName: 'AntaKnob — Perilla de Volumen / Macropad',
    author: 'Comprador verificado',
    date: 'Hace 3 meses',
    rating: 5,
    comment: 'Fantástico con tipo c y cable largo.',
    verified: true,
    platform: 'mercadolibre',
  },
];
