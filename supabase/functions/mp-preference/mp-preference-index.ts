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
    const body = await req.json();
    const { orderId, items, payer } = body;
    const mpToken = Deno.env.get("MP_ACCESS_TOKEN");

    if (!mpToken) {
      return new Response(JSON.stringify({ error: "MP token not configured" }), { status: 500, headers });
    }

    const preference = {
      items: items.map((c: { qty: number; item: { id: string; nombre: string; precio: number } }) => ({
        id: c.item.id,
        title: c.item.nombre,
        quantity: c.qty,
        unit_price: c.item.precio,
        currency_id: "ARS",
      })),
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

    if (!data.init_point) {
      return new Response(JSON.stringify({ error: "MP error", detail: data }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ init_point: data.init_point }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers });
  }
});
