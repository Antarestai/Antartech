// src/components/react/CheckoutFlow.tsx
// ──────────────────────────────────────────────────────────────────────
// Checkout Manual Multipaso — 4 pasos con Framer Motion
// Paso 1: Resumen del pedido
// Paso 2: Datos del cliente
// Paso 3: Método de pago y entrega
// Paso 4: Confirmación y envío
// ──────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHECKOUT_CONFIG } from '../../data/checkoutConfig';
import { cartStore, CHECKOUT_OPEN_EVENT } from '../../scripts/cartStore.js';

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
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const stepTransition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 40, scale: 0.97 },
};

// ═══════════════════════ HELPERS ═══════════════════════

const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);

const cleanPhone = (v: string) => v.replace(/\D/g, '');

const STEP_LABELS = ['Pedido', 'Datos', 'Pago', 'Confirmar'];

// ═══════════════════════ COMPONENT ═══════════════════════

export default function CheckoutFlow() {
  // — State —
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    whatsapp: '',
    dni: '',
    delivery: 'envio',
    address: '',
    city: '',
    paymentMethod: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // — Effects —
  useEffect(() => {
    const handleOpen = () => {
      const summary = cartStore.getOrderSummary();
      if (summary.items.length === 0) return;
      setOrder(summary);
      setStep(0);
      setDirection(1);
      setFormData({
        name: '',
        whatsapp: '',
        dni: '',
        delivery: 'envio',
        address: '',
        city: '',
        paymentMethod: '',
      });
      setErrors({});
      setTouched({});
      setSubmitting(false);
      setSubmitted(false);
      setSubmitError(false);
      setIsOpen(true);
    };
    window.addEventListener(CHECKOUT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CHECKOUT_OPEN_EVENT, handleOpen);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Scroll content to top on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // — Validation —
  const validate = useCallback(
    (s: number, data: FormData): FieldErrors => {
      const e: FieldErrors = {};
      if (s >= 1) {
        if (!data.name.trim() || data.name.trim().length < 2) e.name = 'Ingresá tu nombre';
        const digits = cleanPhone(data.whatsapp);
        if (digits.length < 10) e.whatsapp = 'Ingresá un número válido (mínimo 10 dígitos)';
        if (data.delivery === 'envio') {
          if (!data.address.trim()) e.address = 'Ingresá tu dirección';
          if (!data.city.trim()) e.city = 'Ingresá tu ciudad';
        }
      }
      if (s >= 2) {
        if (!data.paymentMethod) e.paymentMethod = 'Elegí un método de pago';
      }
      return e;
    },
    [],
  );

  // — Navigation —
  const goNext = () => {
    const errs = validate(step, formData);
    // Only check relevant errors for the current step
    const stepKeys: (keyof FieldErrors)[][] = [
      [],
      ['name', 'whatsapp', 'address', 'city'],
      ['paymentMethod'],
      [],
    ];
    const relevantErrors = stepKeys[step]?.filter((k) => errs[k]);
    if (relevantErrors && relevantErrors.length > 0) {
      setErrors(errs);
      // Mark all relevant fields as touched
      const t: Record<string, boolean> = { ...touched };
      relevantErrors.forEach((k) => { t[k] = true; });
      setTouched(t);
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const close = () => {
    if (submitting) return;
    setIsOpen(false);
  };

  // — Field handlers —
  const updateField = (field: keyof FormData, value: string) => {
    const next = { ...formData, [field]: value };
    // If switching to retiro and efectivo is not selected, keep paymentMethod
    // If switching to envio and efectivo was selected, clear paymentMethod
    if (field === 'delivery' && value === 'envio' && formData.paymentMethod === 'efectivo') {
      next.paymentMethod = '';
    }
    setFormData(next);
    // Live validation for touched fields
    if (touched[field]) {
      setErrors(validate(step, next));
    }
  };

  const blur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(step, formData));
  };

  // — Copy to clipboard —
  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch { /* Silently fail on older browsers */ }
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
      .map((i) => `${i.quantity}x ${i.title} (${i.formattedPrice} c/u) = ${i.formattedSubtotal}`)
      .join('\n');

    const deliveryLabel = formData.delivery === 'envio' ? 'Envío a domicilio' : 'Retiro en persona';
    const payLabels: Record<string, string> = {
      transferencia: 'Transferencia Bancaria',
      mercadopago: 'MercadoPago',
      efectivo: 'Efectivo al Retirar',
    };

    try {
      const res = await fetch(CHECKOUT_CONFIG.formspreeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `🛒 Nuevo Pedido — ${formData.name}`,
          Nombre: formData.name,
          WhatsApp: formData.whatsapp,
          DNI: formData.dni || '—',
          Entrega: deliveryLabel,
          Dirección: formData.delivery === 'envio' ? `${formData.address}, ${formData.city}` : '—',
          'Método de Pago': payLabels[formData.paymentMethod] || '—',
          Productos: productLines,
          Total: order.formattedTotal,
        }),
      });
      if (!res.ok) throw new Error('Error');
      setSubmitted(true);
      cartStore.clearCart();
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // — Don't render anything if closed —
  if (!isOpen) return null;

  // ═══════════════════════ RENDER HELPERS ═══════════════════════

  const inputClass = (field: keyof FieldErrors) => {
    const base =
      'w-full bg-gray-50 dark:bg-white/[0.04] border rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-600';
    if (touched[field] && errors[field])
      return `${base} border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/30`;
    if (touched[field] && !errors[field])
      return `${base} border-emerald-400 dark:border-emerald-500 focus:ring-2 focus:ring-emerald-400/30`;
    return `${base} border-gray-200 dark:border-white/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30`;
  };

  const fieldError = (field: keyof FieldErrors) =>
    touched[field] && errors[field] ? (
      <p className="text-[11px] text-red-400 mt-1 font-medium">{errors[field]}</p>
    ) : null;

  // ═══════════════════════ STEP RENDERERS ═══════════════════════

  // — Step 0: Resumen —
  const renderOrderSummary = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        {order!.items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 p-3 bg-white/60 dark:bg-white/[0.03] rounded-xl border border-gray-200/50 dark:border-white/[0.06]"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
            />
            <div className="flex-grow min-w-0">
              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {item.quantity} × {item.formattedPrice}
              </p>
            </div>
            <p className="font-black text-sm text-indigo-600 dark:text-cyan-400 shrink-0 self-center">
              {item.formattedSubtotal}
            </p>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-end pt-3 border-t border-gray-200/50 dark:border-white/[0.06]">
        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Total</span>
        <span className="text-2xl font-black text-gray-900 dark:text-white">{order!.formattedTotal}</span>
      </div>
    </div>
  );

  // — Step 1: Datos —
  const renderCustomerData = () => (
    <div className="space-y-5">
      {/* Nombre */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-cyan-400 mb-1.5">
          Nombre Completo *
        </label>
        <input
          type="text"
          placeholder="Ej: Juan Pérez"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          onBlur={() => blur('name')}
          className={inputClass('name')}
        />
        {fieldError('name')}
      </div>

      {/* WhatsApp */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-cyan-400 mb-1.5">
          WhatsApp *
        </label>
        <input
          type="tel"
          placeholder="Ej: 1165361612"
          value={formData.whatsapp}
          onChange={(e) => updateField('whatsapp', e.target.value)}
          onBlur={() => blur('whatsapp')}
          className={inputClass('whatsapp')}
        />
        {fieldError('whatsapp')}
      </div>

      {/* DNI */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-cyan-400 mb-1.5">
          DNI <span className="text-gray-400 font-normal normal-case">(opcional)</span>
        </label>
        <input
          type="text"
          placeholder="Ej: 45007054"
          value={formData.dni}
          onChange={(e) => updateField('dni', e.target.value)}
          className="w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 placeholder-gray-400 dark:placeholder-gray-600 transition-all duration-300"
        />
      </div>

      {/* Entrega */}
      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-cyan-400 mb-2">
          Entrega
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['envio', 'retiro'] as DeliveryType[]).map((type) => {
            const active = formData.delivery === type;
            const label = type === 'envio' ? 'Envío a domicilio' : 'Retiro en persona';
            const icon = type === 'envio' ? '📦' : '🏪';
            return (
              <button
                key={type}
                type="button"
                onClick={() => updateField('delivery', type)}
                className={`flex items-center gap-2 p-3.5 rounded-xl border text-left text-sm font-bold transition-all duration-300 cursor-pointer ${
                  active
                    ? 'border-indigo-500 dark:border-cyan-500 bg-indigo-50 dark:bg-cyan-500/10 text-indigo-700 dark:text-cyan-300 shadow-sm shadow-indigo-500/10'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-xs">{label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 font-light">
          {CHECKOUT_CONFIG.deliveryInstructions[formData.delivery]}
        </p>
      </div>

      {/* Dirección (solo si envío) */}
      <AnimatePresence>
        {formData.delivery === 'envio' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden space-y-4"
          >
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-cyan-400 mb-1.5">
                Dirección *
              </label>
              <input
                type="text"
                placeholder="Calle, número, piso/depto"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                onBlur={() => blur('address')}
                className={inputClass('address')}
              />
              {fieldError('address')}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-cyan-400 mb-1.5">
                Ciudad / Localidad *
              </label>
              <input
                type="text"
                placeholder="Ej: CABA, La Plata, Córdoba"
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

  // — Step 2: Método de Pago —
  const renderPaymentMethod = () => {
    const methods: { id: PaymentMethod; label: string; icon: string; disabledWhen?: boolean; disabledText?: string }[] = [
      { id: 'transferencia', label: 'Transferencia Bancaria', icon: '🏦' },
      { id: 'mercadopago', label: 'MercadoPago', icon: '📱' },
      {
        id: 'efectivo',
        label: 'Efectivo al Retirar',
        icon: '💵',
        disabledWhen: formData.delivery === 'envio',
        disabledText: 'Solo disponible con retiro en persona',
      },
    ];

    return (
      <div className="space-y-4">
        {methods.map((m) => {
          const active = formData.paymentMethod === m.id;
          const disabled = m.disabledWhen ?? false;
          return (
            <div key={m.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => updateField('paymentMethod', m.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-white/5'
                    : active
                      ? 'border-indigo-500 dark:border-cyan-500 bg-indigo-50 dark:bg-cyan-500/10 shadow-sm shadow-indigo-500/10'
                      : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <div className="flex-grow">
                  <p className={`font-bold text-sm ${active ? 'text-indigo-700 dark:text-cyan-300' : 'text-gray-800 dark:text-gray-200'}`}>
                    {m.label}
                  </p>
                  {disabled && m.disabledText && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{m.disabledText}</p>
                  )}
                </div>
                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-indigo-500 dark:bg-cyan-500 flex items-center justify-center shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </motion.div>
                )}
              </button>

              {/* Expanded details for active methods */}
              <AnimatePresence>
                {active && m.id === 'transferencia' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/[0.06] space-y-2.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                        {CHECKOUT_CONFIG.paymentInstructions.transferencia}
                      </p>
                      <div className="space-y-2">
                        {[
                          { label: 'Titular', value: CHECKOUT_CONFIG.bankTransfer.titular },
                          { label: 'Banco', value: CHECKOUT_CONFIG.bankTransfer.banco },
                          { label: 'Alias', value: CHECKOUT_CONFIG.bankTransfer.alias, copyable: true },
                          { label: 'CBU', value: CHECKOUT_CONFIG.bankTransfer.cbu, copyable: true },
                          { label: 'CUIT', value: CHECKOUT_CONFIG.bankTransfer.cuit },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold shrink-0">
                              {row.label}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-gray-800 dark:text-white truncate">
                                {row.value}
                              </span>
                              {row.copyable && (
                                <button
                                  type="button"
                                  onClick={() => copyText(row.value, row.label)}
                                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-cyan-500/20 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors shrink-0 cursor-pointer"
                                >
                                  {copiedField === row.label ? '✓' : 'Copiar'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                {active && m.id === 'mercadopago' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200/50 dark:border-blue-500/10">
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                        {CHECKOUT_CONFIG.paymentInstructions.mercadopago}
                      </p>
                    </div>
                  </motion.div>
                )}
                {active && m.id === 'efectivo' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 rounded-xl bg-green-50 dark:bg-green-500/5 border border-green-200/50 dark:border-green-500/10">
                      <p className="text-xs text-green-700 dark:text-green-300 font-medium">
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
          <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.paymentMethod}</p>
        )}
      </div>
    );
  };

  // — Step 3: Confirmación —
  const renderConfirmation = () => {
    const payLabels: Record<string, string> = {
      transferencia: 'Transferencia Bancaria',
      mercadopago: 'MercadoPago',
      efectivo: 'Efectivo al Retirar',
    };
    return (
      <div className="space-y-5">
        {/* Mini order list */}
        <div className="space-y-2">
          {order!.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {item.quantity}× {item.title}
              </span>
              <span className="font-bold text-gray-900 dark:text-white">{item.formattedSubtotal}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200/50 dark:border-white/[0.06]">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Total</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">{order!.formattedTotal}</span>
          </div>
        </div>

        {/* Client data summary */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/50 dark:border-white/[0.06] space-y-2">
          {[
            { label: 'Nombre', value: formData.name },
            { label: 'WhatsApp', value: formData.whatsapp },
            ...(formData.dni ? [{ label: 'DNI', value: formData.dni }] : []),
            { label: 'Entrega', value: formData.delivery === 'envio' ? 'Envío a domicilio' : 'Retiro en persona' },
            ...(formData.delivery === 'envio' ? [{ label: 'Dirección', value: `${formData.address}, ${formData.city}` }] : []),
            { label: 'Pago', value: payLabels[formData.paymentMethod] || '' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold shrink-0 pt-0.5">{row.label}</span>
              <span className="text-xs font-medium text-gray-800 dark:text-gray-200 text-right">{row.value}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center font-light leading-relaxed">
          Al confirmar, nuestro equipo va a validar el pedido y te contactará por WhatsApp para coordinar la entrega.
        </p>

        {submitError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-xs text-red-400 font-bold">Algo salió mal. Intentá de nuevo.</p>
          </div>
        )}
      </div>
    );
  };

  // — Success Screen —
  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0, 0.7, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center py-8 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-6"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-500"
        >
          <polyline points="20 6 9 17 4 12" />
        </motion.svg>
      </motion.div>
      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
        ¡Pedido Enviado!
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-light max-w-xs leading-relaxed">
        Recibimos tu pedido. Te vamos a contactar por WhatsApp para coordinar el pago y la entrega.
      </p>
      <button
        type="button"
        onClick={close}
        className="mt-8 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black uppercase text-xs tracking-widest transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 cursor-pointer"
      >
        Cerrar
      </button>
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="checkout-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#0b091a] rounded-2xl border border-gray-200/60 dark:border-white/10 shadow-2xl shadow-black/30 flex flex-col overflow-hidden"
          >
            {/* ─── Header ─── */}
            {!submitted && (
              <div className="shrink-0 px-6 pt-5 pb-4 border-b border-gray-200/50 dark:border-white/[0.06]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-black uppercase tracking-widest text-gray-900 dark:text-white">
                    {submitted ? 'Listo' : 'Tu Pedido'}
                  </h2>
                  <button
                    type="button"
                    onClick={close}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label="Cerrar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-1.5">
                  {STEP_LABELS.map((label, i) => (
                    <div key={label} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-1.5 rounded-full bg-gray-200/60 dark:bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500"
                          initial={false}
                          animate={{ width: i <= step ? '100%' : '0%' }}
                          transition={{ duration: 0.4, ease: 'easeInOut' }}
                        />
                      </div>
                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold transition-colors duration-300 ${
                          i <= step ? 'text-indigo-600 dark:text-cyan-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Content ─── */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto px-6 py-5 custom-scrollbar">
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

            {/* ─── Footer ─── */}
            {!submitted && (
              <div className="shrink-0 px-6 py-4 border-t border-gray-200/50 dark:border-white/[0.06] flex items-center gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={submitting}
                    className="px-5 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Atrás
                  </button>
                )}
                {step === 0 && (
                  <button
                    type="button"
                    onClick={close}
                    className="px-5 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Volver
                  </button>
                )}
                <button
                  type="button"
                  onClick={step < 3 ? goNext : handleSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black uppercase text-xs tracking-widest transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                      </svg>
                      Procesando...
                    </>
                  ) : step < 3 ? (
                    'Continuar'
                  ) : (
                    'Confirmar Pedido'
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
