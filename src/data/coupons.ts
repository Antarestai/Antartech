// src/data/coupons.ts
// ─────────────────────────────────────────────────────────────
// Sistema de Cupones de Descuento — AntarTech
// ─────────────────────────────────────────────────────────────

export interface Coupon {
  /** Código en mayúsculas (ej: 'PROMO10') */
  code: string;
  /** Descripción para mostrar en el checkout */
  description: string;
  /** Tipo de descuento:
   *  - 'percent': Porcentaje de descuento (ej: value: 10 para 10% OFF)
   *  - 'fixed': Monto fijo en pesos a restar (ej: value: 5000 para $5.000 OFF)
   *  - 'fixed_price': Fija el total de la orden a un monto exacto (ej: value: 100)
   */
  type: 'percent' | 'fixed' | 'fixed_price';
  /** Valor según el tipo */
  value: number;
  /** Si el cupón está activo o pausado */
  active: boolean;
  /** Fecha de vencimiento en formato 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:mm:ss' (opcional) */
  expiresAt?: string;
  /** Cantidad máxima de usos permitidos (opcional) */
  maxUses?: number;
  /** Contador de usos actuales (opcional) */
  usedCount?: number;
  /** Monto mínimo de compra en ARS para aplicar (opcional) */
  minAmount?: number;
}

/**
 * Diccionario de cupones de la tienda.
 * Actualmente vacío (sin códigos activos).
 * Podés agregar los códigos que quieras siguiendo los ejemplos comentados abajo.
 */
export const COUPONS: Record<string, Coupon> = {
  /*
  // ── EJEMPLOS PARA CUANDO QUIERAS ACTIVAR CUPONES ──

  // 1. Descuento porcentual con fecha de vencimiento:
  'ANTARES10': {
    code: 'ANTARES10',
    description: '10% OFF en toda tu compra',
    type: 'percent',
    value: 10,
    active: true,
    expiresAt: '2026-12-31T23:59:59', // Vence el 31 de Diciembre
  },

  // 2. Descuento fijo con límite de usos (ej: primeros 20):
  'LANZAMIENTO': {
    code: 'LANZAMIENTO',
    description: '$5.000 de regalo de lanzamiento',
    type: 'fixed',
    value: 5000,
    active: true,
    maxUses: 20,
    usedCount: 0, // Se incrementa por cada uso
  },

  // 3. Descuento con monto mínimo de compra:
  'PROMOSETUP': {
    code: 'PROMOSETUP',
    description: '15% OFF en compras mayores a $100.000',
    type: 'percent',
    value: 15,
    active: true,
    minAmount: 100000,
  },
  */
};

export type CouponValidationResult =
  | { valid: true; coupon: Coupon }
  | { valid: false; reason: string };

/**
 * Valida si un cupón ingresado es aplicable para la orden actual
 */
export function validateCoupon(rawCode: string, orderTotal: number = 0): CouponValidationResult {
  if (!rawCode || !rawCode.trim()) {
    return { valid: false, reason: 'Ingresá un código' };
  }

  const normalized = rawCode.trim().toUpperCase();
  const coupon = COUPONS[normalized];

  if (!coupon || !coupon.active) {
    return { valid: false, reason: 'El código ingresado no existe o no está activo' };
  }

  // Verificar fecha de expiración
  if (coupon.expiresAt) {
    const expirationDate = new Date(coupon.expiresAt);
    if (!isNaN(expirationDate.getTime()) && Date.now() > expirationDate.getTime()) {
      return { valid: false, reason: 'Este cupón ya expiró' };
    }
  }

  // Verificar límite de usos
  if (coupon.maxUses !== undefined && coupon.usedCount !== undefined) {
    if (coupon.usedCount >= coupon.maxUses) {
      return { valid: false, reason: 'Este cupón alcanzó el límite máximo de usos' };
    }
  }

  // Verificar monto mínimo de compra
  if (coupon.minAmount !== undefined && orderTotal < coupon.minAmount) {
    const minFmt = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(coupon.minAmount);
    return { valid: false, reason: `Este cupón requiere una compra mínima de ${minFmt}` };
  }

  return { valid: true, coupon };
}

/**
 * Helper de compatibilidad rápida
 */
export function findCoupon(rawCode: string, orderTotal: number = 0): Coupon | null {
  const result = validateCoupon(rawCode, orderTotal);
  return result.valid ? result.coupon : null;
}
