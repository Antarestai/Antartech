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
  {
    id: 'pb-1',
    deviceId: 'pc-power-button',
    productName: 'Switch de Encendido PC',
    author: 'Comprador verificado',
    date: 'Hace 3 meses',
    rating: 5,
    comment: 'Fabtastico.',
    image: '/images/reviews/power-button-review-1.jpg',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'pb-2',
    deviceId: 'pc-power-button',
    productName: 'Switch de Encendido PC',
    author: 'Comprador verificado',
    date: 'Hace 3 meses',
    rating: 5,
    comment: 'Excelente y encima viene con instrucciones súper claras!.',
    image: '/images/reviews/power-button-review-2.jpg',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'pb-3',
    deviceId: 'pc-power-button',
    productName: 'Switch de Encendido PC',
    author: 'Comprador verificado',
    date: 'Hace 3 meses',
    rating: 5,
    comment: 'Tengo la pc colgada arriba y el botón me solucionó una molestia. Es sensible como una tecla, pero se puede configurar en windows para que una vez encendida la pc el botón no haga nada. Lo que es más difícil de sacar es el kill switch si se presiona por 4 seg.',
    image: '/images/reviews/power-button-review-3.jpg',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'pb-4',
    deviceId: 'pc-power-button',
    productName: 'Switch de Encendido PC',
    author: 'Comprador verificado',
    date: 'Hace 4 meses',
    rating: 5,
    comment: 'Es un botón ni lo probé.',
    image: '/images/reviews/power-button-review-4.jpg',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'pb-5',
    deviceId: 'pc-power-button',
    productName: 'Switch de Encendido PC',
    author: 'Comprador verificado',
    date: 'Hace 2 semanas',
    rating: 5,
    comment: 'Excelente producto, cumple su función tal cuál lo publicado.',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'pb-6',
    deviceId: 'pc-power-button',
    productName: 'Switch de Encendido PC',
    author: 'Comprador verificado',
    date: 'Hace 2 meses',
    rating: 4,
    comment: 'Funcionó perfecto. El punto de empalme de los 2 cables en 1 hace la base del conector a la mother sea un poco más gordo de lo habitual por lo que conviene enchufarlo último con cuidado de no doblar los pins.',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'pb-7',
    deviceId: 'pc-power-button',
    productName: 'Switch de Encendido PC',
    author: 'Comprador verificado',
    date: 'Hace 1 mes',
    rating: 5,
    comment: 'Bueno, muy cómodo. 👍',
    verified: true,
    platform: 'mercadolibre',
  },
  {
    id: 'pb-8',
    deviceId: 'pc-power-button',
    productName: 'Switch de Encendido PC',
    author: 'Comprador verificado',
    date: 'Hace 4 meses',
    rating: 5,
    comment: '10 puntos.',
    verified: true,
    platform: 'mercadolibre',
  },
];
