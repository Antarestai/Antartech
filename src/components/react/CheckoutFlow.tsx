// src/components/react/CheckoutFlow.tsx
// ──────────────────────────────────────────────────────────────────────
// Checkout Multipaso — Página dedicada /checkout
// Paso 0: Resumen del pedido
// Paso 1: Datos del cliente
// Paso 2: Método de pago y entrega (con 5% OFF por transferencia)
// Paso 3: Confirmación y envío (JSON limpio a Formspree)
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

const formatPrice = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);

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
  const [mpPaymentUrl, setMpPaymentUrl] = useState<string | null>(null);
  const [returnStatus, setReturnStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // — Verificar si viene redirigido de vuelta desde Mercado Pago —
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mpStatus = params.get('mp_status') || params.get('collection_status') || params.get('status');
      if (mpStatus === 'success' || mpStatus === 'approved') {
        setReturnStatus('approved');
        cartStore.clearCart();
      } else if (mpStatus === 'failure' || mpStatus === 'rejected') {
        setReturnStatus('rejected');
      } else if (mpStatus === 'pending' || mpStatus === 'in_process') {
        setReturnStatus('pending');
      }
    }
  }, []);

  // — Cargar carrito al montar —
  useEffect(() => {
    const summary = cartStore.getOrderSummary();
    if (summary.items.length === 0) {
      setLoading(false);
      return;
    }
    setOrder(summary);
    setLoading(false);
  }, []);

  // Scroll suave hacia arriba en cambio de paso
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // — Cálculos de descuento —
  const isTransfer = formData.paymentMethod === 'transferencia';
  const discountPercent = 5;
  const discountAmount = isTransfer && order ? Math.round(order.totalPrice * 0.05) : 0;
  const finalTotal = order ? order.totalPrice - discountAmount : 0;
  const formattedFinalTotal = formatPrice(finalTotal);
  const formattedDiscount = formatPrice(discountAmount);

  // — Validación —
  const validate = useCallback(
    (s: number, data: FormData): FieldErrors => {
      const e: FieldErrors = {};
      if (s >= 1) {
        if (!data.name.trim() || data.name.trim().length < 2) {
          e.name = 'Ingresá tu nombre y apellido completo';
        }

        // WhatsApp: solo números, entre 10 y 13 dígitos
        const digits = data.whatsapp.replace(/\D/g, '');
        if (!digits || digits.length < 10) {
          e.whatsapp = 'Ingresá un número de celular válido de 10 dígitos (ej: 1123456789)';
        } else if (digits.length > 13) {
          e.whatsapp = 'El número no debe superar los 13 dígitos';
        }

        if (data.delivery === 'envio') {
          if (!data.address.trim() || data.address.trim().length < 4) {
            e.address = 'Ingresá tu dirección completa (calle y número)';
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

  // — Navegación entre pasos —
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

  // — Manejo de campos —
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

  // — Copiar al portapapeles —
  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2500);
    } catch { /* noop */ }
  };

  // — Envío final a Formspree (JSON limpio, 100% compatible) —
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

    const deliveryLabel =
      formData.delivery === 'envio'
        ? 'Envío por Correo Argentino a todo el país'
        : 'Retiro en persona (Bauness 481, Ciudad Evita / a coordinar)';
    const payLabels: Record<string, string> = {
      transferencia: 'Transferencia Bancaria (ICBC) — 5% OFF',
      mercadopago: 'MercadoPago',
      efectivo: 'Efectivo al Retirar',
    };

    try {
      const payload = {
        _subject: `🛒 Nuevo Pedido (${deliveryLabel}) — ${formData.name}`,
        Nombre: formData.name,
        WhatsApp: formData.whatsapp,
        DNI: formData.dni || 'No especificado',
        Entrega: deliveryLabel,
        Dirección: formData.delivery === 'envio' ? `${formData.address}, ${formData.city}` : 'Retiro en persona',
        'Método de Pago': payLabels[formData.paymentMethod] || '—',
        'Subtotal Original': order.formattedTotal,
        'Descuento Transferencia': isTransfer ? `5% (-${formattedDiscount})` : 'No aplica',
        'Monto Final a Cobrar': formattedFinalTotal,
        Productos: productLines,
      };

      const res = await fetch(CHECKOUT_CONFIG.formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Formspree error:', res.status, errorData);
        throw new Error('Error al enviar pedido');
      }

      // Si eligió Mercado Pago, intentar generar el link de Checkout Pro en Vercel
      if (formData.paymentMethod === 'mercadopago') {
        try {
          const mpRes = await fetch('/api/create-preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: order.items,
              payer: {
                name: formData.name,
                whatsapp: formData.whatsapp,
              },
            }),
          });
          if (mpRes.ok) {
            const mpData = await mpRes.json();
            if (mpData?.init_point) {
              setMpPaymentUrl(mpData.init_point);
            }
          }
        } catch (mpErr) {
          console.warn('Fallback a WhatsApp para Mercado Pago:', mpErr);
        }
      }

      setSubmitted(true);
      cartStore.clearCart();
    } catch (err) {
      console.error('Submit error:', err);
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
      `• Total transferido (con 5% OFF): ${formattedFinalTotal}\n` +
      `• Banco: ICBC (Antares Taiel Cabrera)`
    );
    return `https://wa.me/${WA_NUMBER}?text=${msg}`;
  };

  const getComprobanteMailLink = () => {
    const subject = encodeURIComponent(`Comprobante de Transferencia — ${formData.name} (${formattedFinalTotal})`);
    const body = encodeURIComponent(
      `Hola AntarTech,\n\nAdjunto comprobante de transferencia de mi pedido por ${formattedFinalTotal} (con 5% OFF).\n\n` +
      `Nombre: ${formData.name}\nWhatsApp: ${formData.whatsapp}\n\nMuchas gracias!`
    );
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  // ═══════════════════════ ESTADO DE RETORNO MERCADO PAGO ═══════════════════════

  if (returnStatus) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        {returnStatus === 'approved' && (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">¡Pago Aprobado en Mercado Pago!</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium max-w-sm mx-auto leading-relaxed">
              Tu pago fue acreditado correctamente. Ya tenemos tu orden registrada y nos pondremos en contacto por WhatsApp a la brevedad para coordinar la entrega.
            </p>
            <div className="pt-6">
              <a href="/" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-500/25">
                Volver a la Tienda
              </a>
            </div>
          </div>
        )}
        {returnStatus === 'rejected' && (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-500 mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">El pago no pudo completarse</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium max-w-sm mx-auto leading-relaxed">
              El pago fue cancelado o rechazado en Mercado Pago. Podés intentar nuevamente o abonar por transferencia con 5% de descuento.
            </p>
            <div className="pt-6">
              <a href="/checkout" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-500/25">
                Reintentar Pedido
              </a>
            </div>
          </div>
        )}
        {returnStatus === 'pending' && (
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-500 mb-6">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Pago Pendiente en Mercado Pago</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium max-w-sm mx-auto leading-relaxed">
              Tu pago se encuentra pendiente de acreditación (por ejemplo, si elegiste abonar en efectivo en Pago Fácil o Rapipago). Apenas se confirme en Mercado Pago te contactaremos por WhatsApp.
            </p>
            <div className="pt-6">
              <a href="/" className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold uppercase text-xs tracking-widest transition-all shadow-lg shadow-indigo-500/25">
                Volver a la Tienda
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════ EMPTY / LOADING STATES ═══════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-9 h-9 border-3 border-gray-300 dark:border-gray-700 border-t-indigo-500 dark:border-t-cyan-500 rounded-full animate-spin" />
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
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-8 font-medium">Agregá tus productos antes de iniciar el proceso de compra.</p>
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
      'w-full bg-white dark:bg-[#0e0c1e] border rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white outline-none transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm';
    if (touched[field] && errors[field])
      return `${base} border-red-500 ring-2 ring-red-500/20`;
    if (touched[field] && !errors[field])
      return `${base} border-emerald-500 ring-2 ring-emerald-500/20`;
    return `${base} border-gray-300 dark:border-white/15 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20`;
  };

  const fieldError = (field: keyof FieldErrors) =>
    touched[field] && errors[field] ? (
      <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-bold flex items-center gap-1">
        <span>⚠</span> {errors[field]}
      </p>
    ) : null;

  // ═══════════════════════ STEP 0: RESUMEN ═══════════════════════

  const renderOrderSummary = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        {order!.items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 bg-white/70 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm">
            <img src={item.image} alt={item.title} className="w-18 h-18 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-white/10" loading="lazy" />
            <div className="flex flex-col justify-between flex-grow min-w-0">
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                  Cantidad: <span className="font-bold text-gray-900 dark:text-white">{item.quantity}</span> × {item.formattedPrice}
                </p>
              </div>
              <p className="font-black text-sm text-indigo-600 dark:text-cyan-400 mt-2">{item.formattedSubtotal}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/10 shadow-sm flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold block">Total Estimado</span>
          <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{order!.totalItems} {order!.totalItems === 1 ? 'producto' : 'productos'}</span>
        </div>
        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{order!.formattedTotal}</span>
      </div>

      {/* Banner 5% OFF por transferencia */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3">
        <span className="text-xl">💡</span>
        <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
          <strong>¿Pagás por Transferencia?</strong> Tenés un <strong>5% de descuento directo</strong> sobre el total en el paso de pago.
        </p>
      </div>
    </div>
  );

  // ═══════════════════════ STEP 1: DATOS ═══════════════════════

  const renderCustomerData = () => (
    <div className="space-y-6">
      {/* Nombre */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
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
        <label className="block text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
          WhatsApp / Celular *
        </label>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="1123456789"
          value={formData.whatsapp}
          onChange={(e) => {
            const numericOnly = e.target.value.replace(/\D/g, '');
            updateField('whatsapp', numericOnly);
          }}
          onBlur={() => blur('whatsapp')}
          className={inputClass('whatsapp')}
        />
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 font-medium flex items-center gap-1.5">
          <span className="text-cyan-500 font-bold">ℹ</span> Ingresá código de área + número sin el 0 ni el 15 (ej: 11 2345 6789).
        </p>
        {fieldError('whatsapp')}
      </div>

      {/* DNI */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
          DNI <span className="text-gray-400 font-normal normal-case">(opcional)</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Número de documento"
          value={formData.dni}
          onChange={(e) => updateField('dni', e.target.value.replace(/\D/g, ''))}
          className="w-full bg-white dark:bg-[#0e0c1e] border border-gray-300 dark:border-white/15 rounded-xl px-4 py-3.5 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 shadow-sm"
        />
      </div>

      {/* Forma de Entrega */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2.5">
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
                    ? 'border-indigo-500 dark:border-cyan-500 bg-indigo-50/90 dark:bg-cyan-500/15 text-indigo-900 dark:text-cyan-200 shadow-sm ring-2 ring-indigo-500/30'
                    : 'border-gray-300 dark:border-white/15 bg-white/60 dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-white/30'
                }`}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-xs font-bold">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Texto aclaratorio de entrega con alto contraste */}
        <div className="p-4 rounded-xl bg-gray-100/90 dark:bg-white/[0.05] border border-gray-300/80 dark:border-white/10 mt-3.5 space-y-1.5 shadow-sm">
          {formData.delivery === 'envio' ? (
            <>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                <span>🚚</span> Envíos a todo el país por Correo Argentino
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                Despachamos tu pedido por <strong>Correo Argentino a cualquier localidad de la Argentina</strong>. Al confirmar la compra, te informamos el costo exacto según tu código postal y te compartimos el código de seguimiento oficial.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span>📍</span> Punto de Retiro en Persona
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                Podés retirar personalmente por <strong>Bauness 481 (Ciudad Evita)</strong> o coordinar un punto de encuentro que nos quede cómodo a ambos por WhatsApp tras confirmar tu pedido.
              </p>
            </>
          )}
        </div>
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
              <label className="block text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
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
              <label className="block text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-2">
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
    const methods: { id: PaymentMethod; label: string; icon: string; badge?: string; badgeColor?: string; disabledWhen?: boolean; disabledText?: string }[] = [
      {
        id: 'transferencia',
        label: 'Transferencia Bancaria',
        icon: '🏦',
        badge: '5% OFF',
        badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-black',
      },
      {
        id: 'mercadopago',
        label: 'MercadoPago',
        icon: '📱',
        badge: 'Link directo',
        badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      },
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
            <div key={m.id} className="rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-md shadow-sm">
              <button
                type="button"
                disabled={disabled}
                onClick={() => updateField('paymentMethod', m.id)}
                className={`w-full flex items-center gap-3.5 p-4 text-left transition-all duration-300 cursor-pointer ${
                  disabled
                    ? 'opacity-40 cursor-not-allowed bg-gray-50/50 dark:bg-transparent'
                    : active
                      ? 'bg-indigo-50/70 dark:bg-cyan-500/10'
                      : 'hover:bg-gray-50/80 dark:hover:bg-white/[0.02]'
                }`}
              >
                <span className="text-2xl shrink-0">{m.icon}</span>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-bold text-sm ${active ? 'text-indigo-900 dark:text-cyan-300' : 'text-gray-900 dark:text-white'}`}>
                      {m.label}
                    </p>
                    {m.badge && (
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.badgeColor || ''}`}>
                        {m.badge}
                      </span>
                    )}
                  </div>
                  {disabled && m.disabledText && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{m.disabledText}</p>
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
                    <div className="p-4 space-y-4 bg-gray-50/60 dark:bg-black/25">

                      {/* BANNER DESTACADO: MONTO A TRANSFERIR CON 5% OFF + BOTÓN COPIAR */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                              Monto a Transferir (5% OFF Aplicado)
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2.5 mt-1">
                            <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                              {formattedFinalTotal}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              {order!.formattedTotal}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              Ahorrás {formattedDiscount}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyText(String(finalTotal), 'monto')}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                          {copiedField === 'monto' ? '✓ Monto Copiado' : 'Copiar Monto'}
                        </button>
                      </div>

                      {/* Datos Bancarios con botón copiar para cada campo */}
                      <div className="space-y-2 bg-white dark:bg-[#0e0c1e] p-4 rounded-xl border border-gray-200/80 dark:border-white/10 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                          Datos de la Cuenta ICBC
                        </span>
                        {[
                          { label: 'Titular', value: CHECKOUT_CONFIG.bankTransfer.titular },
                          { label: 'Banco', value: CHECKOUT_CONFIG.bankTransfer.banco },
                          { label: 'Alias', value: CHECKOUT_CONFIG.bankTransfer.alias, copyable: true },
                          { label: 'CBU', value: CHECKOUT_CONFIG.bankTransfer.cbu, copyable: true },
                          { label: 'CUIT', value: CHECKOUT_CONFIG.bankTransfer.cuit },
                          { label: 'Monto Exacto', value: formattedFinalTotal, copyTextValue: String(finalTotal), copyable: true },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">{row.label}</span>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate">{row.value}</span>
                              {row.copyable && (
                                <button
                                  type="button"
                                  onClick={() => copyText(row.copyTextValue || row.value, row.label)}
                                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-cyan-500/20 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors shrink-0 cursor-pointer"
                                >
                                  {copiedField === row.label ? '✓ Copiado' : 'Copiar'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Explicación clara sobre el comprobante */}
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                        <span className="text-base">📸</span>
                        <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                          <strong>Envío del comprobante:</strong> Al confirmar el pedido, te facilitamos un botón para enviar la foto del comprobante directamente por <strong>WhatsApp</strong> o por <strong>Email</strong> con un solo clic.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {active && m.id === 'mercadopago' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-gray-200/60 dark:border-white/[0.06]">
                    <div className="p-4 bg-blue-50/60 dark:bg-blue-500/5 space-y-2">
                      <p className="text-xs text-blue-900 dark:text-blue-200 font-bold leading-relaxed">
                        {CHECKOUT_CONFIG.paymentInstructions.mercadopago}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                        Abonás con dinero en cuenta de MercadoPago, tarjetas de crédito, débito o cuotas tras confirmar.
                      </p>
                    </div>
                  </motion.div>
                )}

                {active && m.id === 'efectivo' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-gray-200/60 dark:border-white/[0.06]">
                    <div className="p-4 bg-emerald-50/60 dark:bg-emerald-500/5 space-y-3">
                      <p className="text-xs text-emerald-950 dark:text-emerald-200 font-bold leading-relaxed flex items-center gap-1.5">
                        <span>💵</span> Abonás en efectivo en mano al momento de retirar tu compra.
                      </p>
                      <div className="p-3.5 bg-white dark:bg-[#0e0c1e] rounded-xl border border-gray-200/80 dark:border-white/10 text-xs text-gray-800 dark:text-gray-200 space-y-2 shadow-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">📍 Dirección de Retiro:</span>
                          <span><strong>Bauness 481, Ciudad Evita</strong> (coordinamos día y horario).</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-indigo-600 dark:text-cyan-400 shrink-0">🤝 O a coordinar:</span>
                          <span>También podemos acordar un punto de encuentro que nos quede cómodo a ambos por WhatsApp.</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {touched['paymentMethod'] && errors.paymentMethod && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-bold flex items-center gap-1">
            <span>⚠</span> {errors.paymentMethod}
          </p>
        )}
      </div>
    );
  };

  // ═══════════════════════ STEP 3: CONFIRMACIÓN ═══════════════════════

  const renderConfirmation = () => {
    const payLabels: Record<string, string> = {
      transferencia: 'Transferencia Bancaria (ICBC) — 5% OFF',
      mercadopago: 'MercadoPago',
      efectivo: 'Efectivo al Retirar',
    };
    return (
      <div className="space-y-5">
        {/* Resumen de Productos con desglose de descuento */}
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">Resumen de Productos</span>
          {order!.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="text-gray-700 dark:text-gray-300 font-medium truncate mr-2">
                {item.quantity}× {item.title}
              </span>
              <span className="font-bold text-gray-900 dark:text-white shrink-0">{item.formattedSubtotal}</span>
            </div>
          ))}

          <div className="pt-3 border-t border-gray-200/70 dark:border-white/[0.06] space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Subtotal:</span>
              <span>{order!.formattedTotal}</span>
            </div>

            {isTransfer && (
              <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Descuento Transferencia (5% OFF):</span>
                <span>-{formattedDiscount}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-200/70 dark:border-white/[0.06]">
              <span className="text-sm uppercase tracking-wider text-gray-900 dark:text-white font-black">Total a Pagar</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-cyan-400">{formattedFinalTotal}</span>
            </div>
          </div>
        </div>

        {/* Datos del Cliente y Entrega */}
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-2.5">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block mb-2">Datos del Pedido</span>
          {[
            { label: 'Nombre', value: formData.name },
            { label: 'WhatsApp', value: formData.whatsapp },
            ...(formData.dni ? [{ label: 'DNI', value: formData.dni }] : []),
            {
              label: 'Entrega',
              value:
                formData.delivery === 'envio'
                  ? 'Envío por Correo Argentino a todo el país'
                  : 'Retiro en persona — Bauness 481, Ciudad Evita (o a coordinar)',
            },
            ...(formData.delivery === 'envio' ? [{ label: 'Dirección', value: `${formData.address}, ${formData.city}` }] : []),
            { label: 'Método de Pago', value: payLabels[formData.paymentMethod] || '—' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-3 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium shrink-0">{row.label}:</span>
              <span className="font-bold text-gray-900 dark:text-white text-right truncate">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-500/20 text-center">
          <p className="text-xs text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">
            Al hacer clic en <strong>Confirmar Pedido</strong>, recibiremos tu orden para verificarla y te contactaremos por WhatsApp para coordinar.
          </p>
        </div>

        {submitError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center space-y-2">
            <p className="text-xs text-red-500 dark:text-red-400 font-bold">
              Hubo un problema de conexión al registrar el pedido.
            </p>
            <p className="text-[11px] text-gray-600 dark:text-gray-300">
              Podés reintentar ahora o comunicarte directamente por{' '}
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hola AntarTech, quise realizar un pedido a nombre de ${formData.name} por ${formattedFinalTotal} pero me dio error en la web.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-emerald-500"
              >
                WhatsApp aquí
              </a>.
            </p>
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
      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium max-w-sm mx-auto leading-relaxed mb-6">
        Recibimos los datos de tu pedido por un total de <strong>{formattedFinalTotal}</strong>. Te contactaremos a tu WhatsApp ({formData.whatsapp}) a la brevedad.
      </p>

      {/* Si eligió transferencia bancaria: recordatorio del monto y botones directos */}
      {formData.paymentMethod === 'transferencia' && (
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-4 mb-8 text-left">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>📸</span> Envío de Comprobante de Transferencia
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-1 leading-relaxed">
              Monto transferido: <strong className="text-emerald-600 dark:text-emerald-400">{formattedFinalTotal}</strong> (5% OFF). Hacé clic abajo para enviarnos la captura:
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <a
              href={getComprobanteWaLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE55] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#25D366]/25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Enviar por WhatsApp
            </a>
            <a
              href={getComprobanteMailLink()}
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-gray-300 dark:border-white/15 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Por Email
            </a>
          </div>
        </div>
      )}

      {/* Si eligió MercadoPago */}
      {formData.paymentMethod === 'mercadopago' && mpPaymentUrl && (
        <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-500/30 text-left space-y-3.5 mb-8 shadow-sm">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <span>💳</span> Pago Seguro con Mercado Pago
            </h4>
            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mt-1 leading-relaxed">
              Tu orden fue registrada y tu link de pago por <strong>{order!.formattedTotal}</strong> está listo. Hacé clic para abonar con tarjeta, débito o dinero en cuenta:
            </p>
          </div>
          <a
            href={mpPaymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#009EE3] hover:bg-[#0089C7] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#009EE3]/25 hover:scale-[1.01]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            Pagar Ahora con Mercado Pago ({order!.formattedTotal})
          </a>
        </div>
      )}

      {formData.paymentMethod === 'mercadopago' && !mpPaymentUrl && (
        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-500/25 text-xs text-blue-900 dark:text-blue-200 font-medium mb-8 text-left leading-relaxed">
          📱 Registramos tu pedido con Mercado Pago. Te enviaremos el link de pago directamente a tu WhatsApp ({formData.whatsapp}) a la brevedad.
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

  // — Selector de paso —
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
              className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
            >
              ← Seguir Comprando
            </a>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center gap-2 mb-8">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-1.5 rounded-full bg-gray-300 dark:bg-white/[0.1] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500"
                    initial={false}
                    animate={{ width: i <= step ? '100%' : '0%' }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                  />
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 ${
                  i <= step ? 'text-indigo-600 dark:text-cyan-400' : 'text-gray-400 dark:text-gray-500'
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
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-200/70 dark:border-white/10">
          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            className="px-6 py-3.5 rounded-xl border border-gray-300 dark:border-white/15 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
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
            ) : step < 3 ? (
              'Continuar'
            ) : (
              `Confirmar Pedido (${formattedFinalTotal})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
