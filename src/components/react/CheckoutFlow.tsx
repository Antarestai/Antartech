// src/components/react/CheckoutFlow.tsx
// ──────────────────────────────────────────────────────────────────────
// Checkout Multipaso — Página dedicada /checkout
// Paso 0: Resumen del pedido
// Paso 1: Datos del cliente
// Paso 2: Método de pago y entrega
// Paso 3: Confirmación y envío
// ──────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHECKOUT_CONFIG } from '../../data/checkoutConfig';
import { cartStore } from '../../scripts/cartStore.js';

// ═══════════════════════ TYPES ═══════════════════════

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  subtotal: number;
  formattedPrice: string;
  formattedSubtotal: string;
}

interface OrderSummary {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  formattedTotal: string;
}

type DeliveryType = 'envio' | 'retiro';
type PaymentMethod = 'transferencia' | 'mercadopago' | 'efectivo' | '';

interface FormData {
  name: string;
  whatsapp: string;
  dni: string;
  delivery: DeliveryType;
  address: string;
  city: string;
  paymentMethod: PaymentMethod;
}

interface FieldErrors {
  name?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  paymentMethod?: string;
}

// ═══════════════════════ ANIMATION VARIANTS ═══════════════════════

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

const stepTransition = { duration: 0.25, ease: [0.4, 0, 0.2, 1] };

// ═══════════════════════ HELPERS ═══════════════════════

const STEP_LABELS = ['Pedido', 'Datos', 'Pago', 'Confirmar'];
const WA_NUMBER = CHECKOUT_CONFIG.whatsappNumber;
const CONTACT_EMAIL = CHECKOUT_CONFIG.contactEmail || 'antares.tech@gmail.com';

// ═══════════════════════ COMPONENT ═══════════════════════

export default function CheckoutFlow() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    whatsapp: '',
    dni: '',
    delivery: 'envio',
    address: '',
    city: '',
    paymentMethod: '',
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // — Load cart on mount —
  useEffect(() => {
    const summary = cartStore.getOrderSummary();
    if (summary.items.length === 0) {
      setLoading(false);
      return;
    }
    setOrder(summary);
    setLoading(false);
  }, []);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // — Validation —
  const validate = useCallback(
    (s: number, data: FormData): FieldErrors => {
      const e: FieldErrors = {};
      if (s >= 1) {
        if (!data.name.trim() || data.name.trim().length < 2) {
          e.name = 'Ingresá tu nombre completo';
        }

        // WhatsApp: solo números, mínimo 10 dígitos (ej: 1123456789) y máximo 13
        const digits = data.whatsapp.replace(/\D/g, '');
        if (!digits || digits.length < 10) {
          e.whatsapp = 'Ingresá un número válido de 10 dígitos (ej: 1123456789, sin 0 ni 15)';
        } else if (digits.length > 13) {
          e.whatsapp = 'El número no debe superar 13 dígitos';
        }

        if (data.delivery === 'envio') {
          if (!data.address.trim() || data.address.trim().length < 4) {
            e.address = 'Ingresá tu dirección (calle y número)';
          }
          if (!data.city.trim() || data.city.trim().length < 2) {
            e.city = 'Ingresá tu localidad o ciudad';
          }
        }
      }
      if (s >= 2) {
        if (!data.paymentMethod) {
          e.paymentMethod = 'Elegí un método de pago para continuar';
        }
      }
      return e;
    },
    [],
  );

  // — Navigation —
  const goNext = () => {
    const errs = validate(step, formData);
    const stepKeys: (keyof FieldErrors)[][] = [
      [],
      ['name', 'whatsapp', 'address', 'city'],
      ['paymentMethod'],
      [],
    ];
    const relevantErrors = stepKeys[step]?.filter((k) => errs[k]);
    if (relevantErrors && relevantErrors.length > 0) {
      setErrors(errs);
      const t: Record<string, boolean> = { ...touched };
      relevantErrors.forEach((k) => { t[k] = true; });
      setTouched(t);
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    if (step === 0) {
      window.location.href = '/#store';
      return;
    }
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  // — Field handlers —
  const updateField = (field: keyof FormData, value: string) => {
    const next = { ...formData, [field]: value };
    if (field === 'delivery' && value === 'envio' && formData.paymentMethod === 'efectivo') {
      next.paymentMethod = '';
    }
    setFormData(next);
    if (touched[field]) {
      setErrors(validate(step, next));
    }
  };

  const blur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(step, formData));
  };

  // — Copy —
  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* noop */ }
  };

  // — Submit —
  const handleSubmit = async () => {
    if (!order) return;
    const errs = validate(2, formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setSubmitError(false);

    const productLines = order.items
      .map((i) => `${i.quantity}x ${i.title} ($${i.price.toLocaleString('es-AR')} c/u) = $${i.subtotal.toLocaleString('es-AR')}`)
      .join('\n');

    const deliveryLabel = formData.delivery === 'envio' ? 'Envío a domicilio' : 'Retiro en persona';
    const payLabels: Record<string, string> = {
      transferencia: 'Transferencia Bancaria',
      mercadopago: 'MercadoPago',
      efectivo: 'Efectivo al Retirar',
    };

    try {
      const formPayload = new FormData();
      formPayload.append('_subject', `🛒 Nuevo Pedido (${deliveryLabel}) — ${formData.name}`);
      formPayload.append('Nombre', formData.name);
      formPayload.append('WhatsApp', formData.whatsapp);
      formPayload.append('DNI', formData.dni || 'No especificado');
      formPayload.append('Tipo de Entrega', deliveryLabel);
      formPayload.append('Dirección', formData.delivery === 'envio' ? `${formData.address}, ${formData.city}` : 'Retiro en persona');
      formPayload.append('Método de Pago', payLabels[formData.paymentMethod] || '—');
      formPayload.append('Productos', productLines);
      formPayload.append('Total', order.formattedTotal);
      
      if (receiptFile) {
        formPayload.append('Comprobante', receiptFile);
      }

      const res = await fetch(CHECKOUT_CONFIG.formspreeEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formPayload,
      });

      if (!res.ok) throw new Error('Error al enviar pedido');
      setSubmitted(true);
      cartStore.clearCart();
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // — Links auxiliares para comprobante —
  const getComprobanteWaLink = () => {
    const msg = encodeURIComponent(
      `Hola AntarTech! Te envío el comprobante de transferencia de mi pedido.\n\n` +
      `• Nombre: ${formData.name}\n` +
      `• Total: ${order?.formattedTotal ?? ''}\n` +
      `• Método: Transferencia Bancaria ICBC`
    );
    return `https://wa.me/${WA_NUMBER}?text=${msg}`;
  };

  const getComprobanteMailLink = () => {
    const subject = encodeURIComponent(`Comprobante de Transferencia — Pedido de ${formData.name}`);
    const body = encodeURIComponent(
      `Hola AntarTech,\n\nAdjunto el comprobante de transferencia de mi pedido por ${order?.formattedTotal ?? ''}.\n\n` +
      `Nombre: ${formData.name}\nWhatsApp: ${formData.whatsapp}\n\nSaludos!`
    );
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  // ═══════════════════════ EMPTY / LOADING STATES ═══════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-gray-300 dark:border-gray-700 border-t-indigo-500 dark:border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!order || order.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/10 dark:bg-cyan-500/10 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-600 dark:text-cyan-400">
            <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.56-7.43H5.05"/>
          </svg>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">Tu carrito está vacío</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-light">Agregá tus productos antes de iniciar el proceso de compra.</p>
        <a
          href="/#store"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
        >
          Explorar Productos
        </a>
      </div>
    );
  }

  // ═══════════════════════ RENDER HELPERS ═══════════════════════

  const inputClass = (field: keyof FieldErrors) => {
    const base =
      'w-full bg-white dark:bg-[#0e0c1e] border rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-600 shadow-sm';
    if (touched[field] && errors[field])
      return `${base} border-red-500 ring-2 ring-red-500/20`;
    if (touched[field] && !errors[field])
      return `${base} border-emerald-500 ring-2 ring-emerald-500/20`;
    return `${base} border-gray-200 dark:border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20`;
  };

  const fieldError = (field: keyof FieldErrors) =>
    touched[field] && errors[field] ? (
      <p className="text-[11px] text-red-500 dark:text-red-400 mt-1.5 font-medium flex items-center gap-1">
        <span>⚠</span> {errors[field]}
      </p>
    ) : null;

  // ═══════════════════════ STEP 0: RESUMEN ═══════════════════════

  const renderOrderSummary = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        {order!.items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 bg-white/70 dark:bg-white/[0.03] backdrop-blur-md rounded-2xl border border-gray-200/70 dark:border-white/[0.08] shadow-sm">
            <img src={item.image} alt={item.title} className="w-18 h-18 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200/50 dark:border-white/10" loading="lazy" />
            <div className="flex flex-col justify-between flex-grow min-w-0">
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Cantidad: <span className="font-bold text-gray-800 dark:text-gray-200">{item.quantity}</span> × {item.formattedPrice}
                </p>
              </div>
              <p className="font-black text-sm text-indigo-600 dark:text-cyan-400 mt-2">{item.formattedSubtotal}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-gray-200/70 dark:border-white/[0.08] shadow-sm flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">Total a Pagar</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-light">{order!.totalItems} {order!.totalItems === 1 ? 'producto' : 'productos'}</span>
        </div>
        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{order!.formattedTotal}</span>
      </div>
    </div>
  );

  // ═══════════════════════ STEP 1: DATOS ═══════════════════════

  const renderCustomerData = () => (
    <div className="space-y-5">
      {/* Nombre */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
          Nombre y Apellido *
        </label>
        <input
          type="text"
          placeholder="Nombre y apellido"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          onBlur={() => blur('name')}
          className={inputClass('name')}
        />
        {fieldError('name')}
      </div>

      {/* WhatsApp */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
          WhatsApp / Celular *
        </label>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="1123456789"
          value={formData.whatsapp}
          onChange={(e) => {
            // Solo dígitos numéricos, sin letras ni símbolos
            const numericOnly = e.target.value.replace(/\D/g, '');
            updateField('whatsapp', numericOnly);
          }}
          onBlur={() => blur('whatsapp')}
          className={inputClass('whatsapp')}
        />
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 font-light">
          Ingresá código de área + número sin el 0 ni el 15 (solo números).
        </p>
        {fieldError('whatsapp')}
      </div>

      {/* DNI */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
          DNI <span className="text-gray-400 font-normal normal-case">(opcional)</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Número de documento"
          value={formData.dni}
          onChange={(e) => updateField('dni', e.target.value.replace(/\D/g, ''))}
          className="w-full bg-white dark:bg-[#0e0c1e] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder-gray-400 dark:placeholder-gray-600 transition-all duration-300 shadow-sm"
        />
      </div>

      {/* Tipo de Entrega */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2.5">
          Forma de Entrega *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['envio', 'retiro'] as DeliveryType[]).map((type) => {
            const active = formData.delivery === type;
            const label = type === 'envio' ? 'Envío a Domicilio' : 'Retiro en Persona';
            const icon = type === 'envio' ? '📦' : '🏪';
            return (
              <button
                key={type}
                type="button"
                onClick={() => updateField('delivery', type)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  active
                    ? 'border-indigo-500 dark:border-cyan-500 bg-indigo-50/80 dark:bg-cyan-500/10 text-indigo-900 dark:text-cyan-200 shadow-sm ring-1 ring-indigo-500/30'
                    : 'border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-xs font-bold">{label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-light">
          {CHECKOUT_CONFIG.deliveryInstructions[formData.delivery]}
        </p>
      </div>

      {/* Campos de Dirección si es envío */}
      <AnimatePresence>
        {formData.delivery === 'envio' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-4 pt-1"
          >
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
                Dirección Completa *
              </label>
              <input
                type="text"
                placeholder="Calle y altura, depto / piso"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                onBlur={() => blur('address')}
                className={inputClass('address')}
              />
              {fieldError('address')}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
                Ciudad / Localidad *
              </label>
              <input
                type="text"
                placeholder="Ciudad y provincia"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                onBlur={() => blur('city')}
                className={inputClass('city')}
              />
              {fieldError('city')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ═══════════════════════ STEP 2: PAGO ═══════════════════════

  const renderPaymentMethod = () => {
    const methods: { id: PaymentMethod; label: string; icon: string; badge?: string; disabledWhen?: boolean; disabledText?: string }[] = [
      { id: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦', badge: '0% comisión' },
      { id: 'mercadopago', label: 'MercadoPago', icon: '📱', badge: 'Link directo' },
      {
        id: 'efectivo',
        label: 'Efectivo al Retirar',
        icon: '💵',
        disabledWhen: formData.delivery === 'envio',
        disabledText: 'Solo disponible para retiro en persona',
      },
    ];

    return (
      <div className="space-y-4">
        {methods.map((m) => {
          const active = formData.paymentMethod === m.id;
          const disabled = m.disabledWhen ?? false;
          return (
            <div key={m.id} className="rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-md shadow-sm">
              <button
                type="button"
                disabled={disabled}
                onClick={() => updateField('paymentMethod', m.id)}
                className={`w-full flex items-center gap-3.5 p-4 text-left transition-all duration-300 cursor-pointer ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed bg-gray-50/50 dark:bg-transparent'
                    : active
                      ? 'bg-indigo-50/60 dark:bg-cyan-500/10'
                      : 'hover:bg-gray-50/80 dark:hover:bg-white/[0.02]'
                }`}
              >
                <span className="text-2xl shrink-0">{m.icon}</span>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${active ? 'text-indigo-900 dark:text-cyan-300' : 'text-gray-900 dark:text-white'}`}>
                      {m.label}
                    </p>
                    {m.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {m.badge}
                      </span>
                    )}
                  </div>
                  {disabled && m.disabledText && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{m.disabledText}</p>
                  )}
                </div>
                {active && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 flex items-center justify-center shrink-0 text-white shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}
              </button>

              {/* Contenido expandible según método */}
              <AnimatePresence>
                {active && m.id === 'transferencia' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-gray-200/60 dark:border-white/[0.06]">
                    <div className="p-4 space-y-4 bg-gray-50/50 dark:bg-black/20">
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                        {CHECKOUT_CONFIG.paymentInstructions.transferencia}
                      </p>

                      {/* Datos Bancarios con botón copiar */}
                      <div className="space-y-2 bg-white dark:bg-[#0e0c1e] p-3.5 rounded-xl border border-gray-200/70 dark:border-white/10 shadow-sm">
                        {[
                          { label: 'Titular', value: CHECKOUT_CONFIG.bankTransfer.titular },
                          { label: 'Banco', value: CHECKOUT_CONFIG.bankTransfer.banco },
                          { label: 'Alias', value: CHECKOUT_CONFIG.bankTransfer.alias, copyable: true },
                          { label: 'CBU', value: CHECKOUT_CONFIG.bankTransfer.cbu, copyable: true },
                          { label: 'CUIT', value: CHECKOUT_CONFIG.bankTransfer.cuit },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-2 py-1">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold shrink-0">{row.label}</span>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate">{row.value}</span>
                              {row.copyable && (
                                <button
                                  type="button"
                                  onClick={() => copyText(row.value, row.label)}
                                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-cyan-500/20 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors shrink-0 cursor-pointer"
                                >
                                  {copiedField === row.label ? '✓ Copiado' : 'Copiar'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Subida de Comprobante */}
                      <div className="pt-2 border-t border-gray-200/50 dark:border-white/[0.06]">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
                          📸 Comprobante de Pago (Opcional si ya transferiste)
                        </label>
                        {receiptFile ? (
                          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-600 dark:text-emerald-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                              <div className="min-w-0">
                                <span className="text-xs font-bold truncate block">{receiptFile.name}</span>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{(receiptFile.size / 1024).toFixed(0)} KB adjunto</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setReceiptFile(null)}
                              className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              Quitar
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-white/15 rounded-xl hover:border-indigo-500 dark:hover:border-cyan-400 transition-colors cursor-pointer bg-white/60 dark:bg-white/[0.02]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Subir foto o captura del comprobante</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">JPG, PNG o PDF (o podés enviarlo por WhatsApp después)</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setReceiptFile(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {active && m.id === 'mercadopago' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-gray-200/60 dark:border-white/[0.06]">
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-500/5 space-y-2">
                      <p className="text-xs text-blue-900 dark:text-blue-200 font-medium leading-relaxed">
                        {CHECKOUT_CONFIG.paymentInstructions.mercadopago}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-light">
                        Vas a poder abonar con dinero en cuenta, tarjetas de crédito, débito o cuotas a través de MercadoPago.
                      </p>
                    </div>
                  </motion.div>
                )}

                {active && m.id === 'efectivo' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-gray-200/60 dark:border-white/[0.06]">
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-500/5">
                      <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
                        {CHECKOUT_CONFIG.paymentInstructions.efectivo}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {touched['paymentMethod'] && errors.paymentMethod && (
          <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 font-medium flex items-center gap-1">
            <span>⚠</span> {errors.paymentMethod}
          </p>
        )}
      </div>
    );
  };

  // ═══════════════════════ STEP 3: CONFIRMACIÓN ═══════════════════════

  const renderConfirmation = () => {
    const payLabels: Record<string, string> = {
      transferencia: 'Transferencia Bancaria (ICBC)',
      mercadopago: 'MercadoPago',
      efectivo: 'Efectivo al Retirar',
    };
    return (
      <div className="space-y-5">
        {/* Productos */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-2.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">Resumen de Productos</span>
          {order!.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="text-gray-700 dark:text-gray-300 font-medium truncate mr-2">
                {item.quantity}× {item.title}
              </span>
              <span className="font-bold text-gray-900 dark:text-white shrink-0">{item.formattedSubtotal}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200/60 dark:border-white/[0.06]">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Total Final</span>
            <span className="text-xl font-black text-indigo-600 dark:text-cyan-400">{order!.formattedTotal}</span>
          </div>
        </div>

        {/* Datos del Cliente y Entrega */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-2.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">Datos de Entrega y Pago</span>
          {[
            { label: 'Nombre', value: formData.name },
            { label: 'WhatsApp', value: formData.whatsapp },
            ...(formData.dni ? [{ label: 'DNI', value: formData.dni }] : []),
            { label: 'Entrega', value: formData.delivery === 'envio' ? 'Envío a domicilio' : 'Retiro en persona' },
            ...(formData.delivery === 'envio' ? [{ label: 'Dirección', value: `${formData.address}, ${formData.city}` }] : []),
            { label: 'Método de Pago', value: payLabels[formData.paymentMethod] || '—' },
            ...(receiptFile ? [{ label: 'Comprobante', value: `Adjunto (${receiptFile.name})` }] : []),
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-3 text-xs">
              <span className="text-gray-400 font-medium shrink-0">{row.label}:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 text-right truncate">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-500/20 text-center">
          <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">
            Al hacer clic en <strong>Confirmar Pedido</strong>, nos llegará tu orden para validarla y coordinar la entrega con vos por WhatsApp.
          </p>
        </div>

        {submitError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-xs text-red-500 font-bold">Ocurrió un error al enviar el pedido. Por favor intentá nuevamente o contactanos directamente.</p>
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════ SUCCESS ═══════════════════════

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0, 0.7, 0.3, 1] }}
      className="max-w-md mx-auto py-8 text-center"
    >
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-6">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">¡Pedido Confirmado!</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 font-light max-w-sm mx-auto leading-relaxed mb-6">
        Recibimos los datos de tu pedido correctamente. Nos vamos a contactar a tu WhatsApp ({formData.whatsapp}) a la brevedad.
      </p>

      {/* Si eligió transferencia bancaria: recordatorio y botones de comprobante */}
      {formData.paymentMethod === 'transferencia' && (
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-4 mb-8 text-left">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>📸</span> Comprobante de Transferencia
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-light mt-1">
              {receiptFile
                ? 'Ya recibimos tu comprobante adjunto. Si querés agilizar la acreditación, también podés enviarlo por WhatsApp.'
                : 'Si aún no enviaste el comprobante de pago, podés enviarlo ahora mismo para comenzar a preparar tu paquete:'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={getComprobanteWaLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE55] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#25D366]/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Enviar por WhatsApp
            </a>
            <a
              href={getComprobanteMailLink()}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Por Email
            </a>
          </div>
        </div>
      )}

      {/* Si eligió MercadoPago */}
      {formData.paymentMethod === 'mercadopago' && (
        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 font-medium mb-8 text-left leading-relaxed">
          📱 Te enviaremos el link de pago de MercadoPago directamente a tu WhatsApp para que puedas completar el pago con tarjeta o dinero en cuenta.
        </div>
      )}

      <a
        href="/"
        className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
      >
        Volver a la Tienda
      </a>
    </motion.div>
  );

  // — Step selector —
  const renderStep = () => {
    if (submitted) return renderSuccess();
    switch (step) {
      case 0: return renderOrderSummary();
      case 1: return renderCustomerData();
      case 2: return renderPaymentMethod();
      case 3: return renderConfirmation();
      default: return null;
    }
  };

  // ═══════════════════════ MAIN RENDER ═══════════════════════

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Header */}
      {!submitted && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-6 rounded-full bg-gradient-to-b from-indigo-600 to-cyan-500 inline-block"></span>
              Finalizar Pedido
            </h1>
            <a
              href="/#store"
              className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
            >
              ← Seguir Comprando
            </a>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center gap-2 mb-8">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-1.5 rounded-full bg-gray-300/60 dark:bg-white/[0.08] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500"
                    initial={false}
                    animate={{ width: i <= step ? '100%' : '0%' }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                  />
                </div>
                <span className={`text-[9px] uppercase tracking-wider font-bold transition-colors duration-300 ${
                  i <= step ? 'text-indigo-600 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Content Container */}
      <div ref={contentRef} className="min-h-[320px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={submitted ? 'success' : step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      {!submitted && (
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200/60 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            className="px-6 py-3.5 rounded-xl border border-gray-300/80 dark:border-white/10 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {step === 0 ? '← Volver' : 'Atrás'}
          </button>
          <button
            type="button"
            onClick={step < 3 ? goNext : handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black uppercase text-xs tracking-widest transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                </svg>
                Procesando Pedido...
              </>
            ) : step < 3 ? 'Continuar' : 'Confirmar Pedido'}
          </button>
        </div>
      )}
    </div>
  );
}
