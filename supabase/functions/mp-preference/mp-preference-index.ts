import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderId, items, total, payer } = await req.json();
    const mpToken = Deno.env.get("MP_ACCESS_TOKEN")!;

    const preference = {
      items: items.map((c: any) => ({
        id: c.item.id,
        title: c.item.nombre,
        quantity: c.qty,
        unit_price: c.item.precio,
        currency_id: "ARS",
      })),
      payer: {
        name: payer?.nombre || "Cliente",
        phone: payer?.telefono ? { number: payer.telefono } : undefined,
      },
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

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const data = await res.json();
    console.log("Preference created:", data.id, "init_point:", data.init_point);

    if (!data.init_point) {
      console.error("MP error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "No se pudo crear el link de pago" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ init_point: data.init_point, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
