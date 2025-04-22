
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailData {
  to: string;
  name: string;
  sprintUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, name, sprintUrl } = await req.json() as WelcomeEmailData;

    // Log the received data
    console.log(`Received request to send welcome email to ${to} (${name}) with sprint URL: ${sprintUrl}`);

    // In a production implementation, this would use a service like Resend or SendGrid
    // For now, we'll just log the details and return success
    console.log(`TO: ${to}`);
    console.log(`NAME: ${name}`);
    console.log(`SPRINT_URL: ${sprintUrl}`);
    console.log(`Sending welcome email to ${to} with personalized sprint URL: ${sprintUrl}`);

    // Demo email content (not actually sent in this implementation)
    const emailContent = `
      <h1>Welcome to Your Founder Sprint, ${name}!</h1>
      <p>We're excited to have you join our founder community. Your personalized sprint journey is ready.</p>
      <p>To get started, <a href="${sprintUrl}">click here to access your sprint dashboard</a>.</p>
      <p>This email was triggered by the signup process and would be sent to: ${to}</p>
    `;

    console.log("Email content would be:");
    console.log(emailContent);

    // For now, we'll just return success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Welcome email would be sent (development mode)",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
