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
      'Pago 100% automático e instantáneo. Al confirmar tu pedido, se generará tu link oficial de Mercado Pago para abonar al instante con dinero en cuenta, tarjetas de crédito, débito o cuotas.',
    efectivo:
      'Abonás en efectivo al momento de retirar. Podés retirar personalmente por Bauness 481 (Ciudad Evita) o a coordinar un punto de encuentro por WhatsApp.',
  },

  /** Instrucciones de entrega */
  deliveryInstructions: {
    envio:
      'Los envíos se realizan por Correo Argentino a todo el país. Te informamos el costo exacto y el código de seguimiento por WhatsApp.',
    retiro:
      'Podés retirar personalmente por Bauness 481 (Ciudad Evita) o a coordinar un punto de encuentro por WhatsApp tras confirmar el pedido.',
  },
} as const;
