
import { supabase } from "@/integrations/supabase/client";

interface SendEmailProps {
  to: string;
  subject: string;
  body: string;
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        to: email,
        name: name,
        sprintUrl: `${window.location.origin}/sprint-dashboard`
      }
    });
    
    if (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error calling email function:', error);
    return false;
  }
}
