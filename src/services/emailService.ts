
import { supabase } from "@/integrations/supabase/client";

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    // Build the sprint URL with the current origin
    const sprintUrl = `${window.location.origin}/sprint-dashboard`;
    
    console.log(`Sending welcome email to ${email} (${name}) with sprint URL: ${sprintUrl}`);
    
    // Call the Supabase Edge Function that sends welcome emails
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { 
        to: email, 
        name: name, 
        sprintUrl: sprintUrl 
      }
    });
    
    if (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
    
    console.log('Welcome email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Exception sending welcome email:', error);
    return false;
  }
};
