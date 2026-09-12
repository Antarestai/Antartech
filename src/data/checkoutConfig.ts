// src/data/checkoutConfig.ts
// ─────────────────────────────────────────────────────────────
// Configuración del Checkout Manual de AntarTech.
// Editá este archivo desde GitHub (celular) para actualizar
// datos bancarios, número de WhatsApp, textos, etc.
// ─────────────────────────────────────────────────────────────

export const CHECKOUT_CONFIG = {
  /** Número de WhatsApp del vendedor (con código de país) */
  whatsappNumber: '5491165361612',

  /** Email de contacto para comprobantes o consultas */
  contactEmail: 'antares.tech@gmail.com',

  /** Formspree endpoint (mismo que contacto, diferenciado por _subject) */
  formspreeEndpoint: 'https://formspree.io/f/xwvrbzob',

  /** Datos para Transferencia Bancaria */
  bankTransfer: {
    titular: 'Antares Taiel Cabrera',
    banco: 'ICBC',
    alias: 'AntaresTaiel7054ICBC',
    cbu: '0150519101000157919483',
    cuit: '20-45007054-9',
  },

  /** Instrucciones por método de pago */
  paymentInstructions: {
    transferencia:
      'Realizá la transferencia al CBU/Alias de abajo. Una vez hecha, te contactamos por WhatsApp para confirmar y coordinar la entrega.',
    mercadopago:
      'Una vez confirmado tu pedido, te enviaremos el link de pago de MercadoPago por WhatsApp para que puedas abonar de forma rápida y segura.',
    efectivo:
      'Abonás en efectivo al momento de retirar el producto. Coordinamos día y horario por WhatsApp.',
  },

  /** Instrucciones de entrega */
  deliveryInstructions: {
    envio:
      'Te informamos el costo de envío y tiempos estimados por WhatsApp después de confirmar el pedido.',
    retiro:
      'Coordinamos punto de encuentro y horario por WhatsApp después de confirmar tu pedido.',
  },
} as const;
