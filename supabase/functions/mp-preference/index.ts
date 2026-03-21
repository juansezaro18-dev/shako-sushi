Deno.serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const text = await req.text();
    if (!text) return new Response(JSON.stringify({ error: "empty body" }), { status: 400, headers });
    
    const { orderId, items, total, payer } = JSON.parse(text);
    const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpToken) return new Response(JSON.stringify({ error: "MP token not configured" }), { status: 500, headers });

    // Calculate original total from items
    const originalTotal = items.reduce((s: number, c: any) => s + c.item.precio * c.qty, 0);
    const surcharge = Math.round(total - originalTotal);

    // Build items array
    const mpItems = items.map((c: any) => ({
      id: c.item.id,
      title: c.item.nombre,
      quantity: c.qty,
      unit_price: c.item.precio,
      currency_id: "ARS",
    }));

    // Add surcharge item if needed
    if (surcharge > 0) {
      mpItems.push({
        id: "recargo_mp",
        title: "Recargo por pago con tarjeta/MP",
        quantity: 1,
        unit_price: surcharge,
        currency_id: "ARS",
      });
    }

    const preference = {
      items: mpItems,
      payer: { name: payer?.nombre || "Cliente" },
      external_reference: orderId,
      back_urls: {
        success: `https://shako-sushi.vercel.app/?pago=ok&order=${orderId}`,
        failure: `https://shako-sushi.vercel.app/?pago=error&order=${orderId}`,
        pending: `https://shako-sushi.vercel.app/?pago=pendiente&order=${orderId}`,
      },
      auto_return: "approved",
      statement_descriptor: "SHAKO SUSHI",
      notification_url: "https://dinylgezchbrojrszalt.supabase.co/functions/v1/mp-webhook",
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const data = await mpRes.json();
    if (!data.init_point) return new Response(JSON.stringify({ error: "MP error", detail: data }), { status: 500, headers });

    return new Response(JSON.stringify({ init_point: data.init_point }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers });
  }
});
