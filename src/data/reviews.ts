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
  versionBadge?: string;
  developerNote?: {
    title: string;
    text: string;
  };
}

export const REVIEWS: Review[] = [
  {
    id: 'hb-1',
    deviceId: 'handbrake',
    productName: 'Freno de Mano USB Simracing',
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
    productName: 'Freno de Mano USB Simracing',
    author: 'Comprador verificado',
    date: 'Hace 3 meses',
    rating: 5,
    comment: 'Muy buen producto, cumplio ampliamente las expectativas. Soy fanatico de la impresion 3d. Me sorprendio la calidad constructiva. En cuanto a precision cumple muy bien tambien.',
    image: '/images/reviews/handbrake-review-2.jpg',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'hb-3',
    deviceId: 'handbrake',
    productName: 'Freno de Mano USB Simracing',
    author: 'Comprador verificado',
    date: 'Hace 1 mes',
    rating: 4,
    comment: 'Muy bueno.',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'hb-4',
    deviceId: 'handbrake',
    productName: 'Freno de Mano USB Simracing',
    author: 'Comprador verificado',
    date: 'Hace 4 meses',
    rating: 1,
    comment: 'Está impresa en 3d, la calidad de impresión es muy baja, no estan reforzados los soportes, cruje en el uso como si fuera de papel.',
    verified: true,
    platform: 'mercadolibre',
    versionBadge: 'Feedback inicial · Versión V1',
    developerNote: {
      title: 'Respuesta de AntarTech',
      text: 'Esta opinión corresponde a la de un hater, primera versión de prueba de hace 4 meses y sirvió directamente como base de mejora. El usuario no lo tenía instalado en un cockpit ni de manera optima, sino en un agarre provisorio a mesa. A partir de este feedback se rediseñó la pieza entera: con paredes reforzadas al triple de espesor, mayor densidad de relleno, encastres optimizados y anclaje reforzado. La versión actual no es para nada la misma.',
    },
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
