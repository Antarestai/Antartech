// api/create-preference.js
// ──────────────────────────────────────────────────────────────────────
// Serverless Function en Vercel para crear la preferencia de pago
// segura en Mercado Pago Checkout Pro sin exponer el Access Token.
// ──────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Solo permitir solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: 'MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno de Vercel.',
      fallback: true,
    });
  }

  try {
    const { items, payer, orderId } = req.body || {};

    if (!items || !items.length) {
      return res.status(400).json({ error: 'No se recibieron productos en el pedido.' });
    }

    // Mapeo seguro de items para la API de Mercado Pago
    const mpItems = items.map((item) => ({
      id: String(item.id || 'prod'),
      title: String(item.title || 'Producto AntarTech'),
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.price || 0),
      currency_id: 'ARS',
      picture_url: item.image && item.image.startsWith('http')
        ? item.image
        : item.image
          ? `https://antartech.com.ar${item.image}`
          : undefined,
    }));

    const preferencePayload = {
      items: mpItems,
      payer: {
        name: payer?.name || 'Cliente AntarTech',
        phone: {
          number: payer?.whatsapp ? String(payer.whatsapp) : '',
        },
      },
      back_urls: {
        success: 'https://antartech.com.ar/checkout?mp_status=success',
        failure: 'https://antartech.com.ar/checkout?mp_status=failure',
        pending: 'https://antartech.com.ar/checkout?mp_status=pending',
      },
      auto_return: 'approved',
      statement_descriptor: 'ANTARTECH',
      external_reference: orderId || `ANTAR-${Date.now()}`,
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencePayload),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Error devuelto por Mercado Pago:', mpData);
      return res.status(mpResponse.status).json({
        error: mpData.message || 'Error al comunicarse con Mercado Pago.',
        details: mpData,
        fallback: true,
      });
    }

    // Devolvemos el link oficial de pago generado
    return res.status(200).json({
      id: mpData.id,
      init_point: mpData.init_point,
    });
  } catch (err) {
    console.error('Error interno al crear preferencia:', err);
    return res.status(500).json({
      error: 'Error interno en el servidor.',
      fallback: true,
    });
  }
}
