import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  try {
    const body = await req.json();
    console.log("MP Webhook:", JSON.stringify(body));

    // MP sends topic=payment and data.id with the payment ID
    if (body.type !== "payment" && body.topic !== "payment") {
      return new Response("ignored", { status: 200 });
    }

    const paymentId = body.data?.id || body.id;
    if (!paymentId) return new Response("no payment id", { status: 200 });

    // Get payment details from MP
    const mpToken = Deno.env.get("MP_ACCESS_TOKEN")!;
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpToken}` }
    });
    const payment = await mpRes.json();
    console.log("Payment status:", payment.status, "external_reference:", payment.external_reference);

    if (payment.status !== "approved") {
      return new Response("payment not approved", { status: 200 });
    }

    // external_reference is the order ID we set when creating the preference
    const orderId = payment.external_reference;
    if (!orderId) return new Response("no order id", { status: 200 });

    // Update order status to confirmed and set pago
    const { error } = await supabase
      .from("orders")
      .update({ status: "nuevo", pago: "transferencia", mp_payment_id: String(paymentId) })
      .eq("id", orderId)
      .eq("status", "pendiente_pago");

    if (error) {
      console.error("Supabase error:", error);
      return new Response("db error", { status: 500 });
    }

    console.log("Order confirmed:", orderId);
    return new Response("ok", { status: 200 });

  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("error", { status: 500 });
  }
});
