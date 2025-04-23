
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MerchEmailRequest {
  to: string;
  name: string;
  product: string;
  size: string;
  address: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, product, size, address } = await req.json() as MerchEmailRequest;

    console.log("Received request to send merch confirmation email:", {
      to, name, product, size, address
    });

    const emailRes = await resend.emails.send({
      from: "Wilbe <onboarding@resend.dev>",
      to: [to],
      subject: "Your Wilbe Merch Order Confirmation",
      html: `
        <h2>Thank you for your Wilbe merch order, ${name}!</h2>
        <p><strong>Product:</strong> ${product}</p>
        <p><strong>Size:</strong> ${size}</p>
        <p><strong>Shipping Address:</strong><br/>${address}</p>
        <p>We'll be in touch soon with tracking info.</p>
        <p>- The Wilbe Team</p>
      `,
    });

    console.log("Merch confirmation email sent:", emailRes);

    return new Response(
      JSON.stringify({ message: "Email sent", id: emailRes.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending merch confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
