// src/data/coupons.ts
// ─────────────────────────────────────────────────────────────
// Cupones de descuento activos para AntarTech
// Podés agregar, modificar o dar de baja cupones desde acá.
// ─────────────────────────────────────────────────────────────

export interface Coupon {
  code: string;
  description: string;
  type: 'fixed_price' | 'percent' | 'fixed';
  value: number; // fixed_price: precio final total en ARS. percent: % de descuento. fixed: ARS a descontar.
  active: boolean;
}

export const COUPONS: Record<string, Coupon> = {
  ANTATEST: {
    code: 'ANTATEST',
    description: 'Cupón de prueba oficial ($100 ARS total)',
    type: 'fixed_price',
    value: 100, // Deja el total en $100 ARS para probar pagos reales
    active: true,
  },
  ANTARES10: {
    code: 'ANTARES10',
    description: '10% OFF en toda tu compra',
    type: 'percent',
    value: 10,
    active: true,
  },
  ANTARVIP: {
    code: 'ANTARVIP',
    description: '15% OFF Exclusivo AntarTech',
    type: 'percent',
    value: 15,
    active: true,
  },
};

/**
 * Busca y valida si un código de cupón ingresado es válido y activo
 */
export function findCoupon(rawCode: string): Coupon | null {
  if (!rawCode) return null;
  const normalized = rawCode.trim().toUpperCase();
  const found = COUPONS[normalized];
  if (found && found.active) {
    return found;
  }
  return null;
}
