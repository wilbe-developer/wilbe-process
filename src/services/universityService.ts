
import { supabase } from "@/integrations/supabase/client";
import { PATHS } from "@/lib/constants";

export async function getUniversities() {
  const { data, error } = await supabase
    .from('universities')
    .select('id, name, is_default, domain')
    .order('name');
  
  if (error) {
    console.error("Error fetching universities:", error);
    throw error;
  }
  
  return data || [];
}

export async function updateUniversity(id: string, fields: { name?: string; is_default?: boolean; domain?: string }) {
  const { error } = await supabase
    .from('universities')
    .update(fields)
    .eq('id', id);
  
  if (error) {
    console.error("Error updating university:", error);
    throw error;
  }
}

export async function addUniversity(name: string, domain?: string) {
  const { error } = await supabase
    .from('universities')
    .insert({ 
      name, 
      is_default: false,
      domain: domain || null
    });
  
  if (error) {
    console.error("Error adding university:", error);
    throw error;
  }
}

export async function deleteUniversity(id: string) {
  const { error } = await supabase
    .from('universities')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting university:", error);
    throw error;
  }
}

export async function findEmails(filters: { 
  useCustomUniversities: boolean;
  selectedUniversities?: string[];
}) {
  try {
    // For local development without API, return example data
    if (process.env.NODE_ENV === 'development' && !process.env.VERCEL && window.location.hostname === 'localhost') {
      console.log("Using example data for local development");
      return [
        { name: 'Alice Smith', institution: 'MIT', email: 'alice.smith@mit.edu', verified: 'Yes' },
        { name: 'Bob Chen', institution: 'Stanford University', email: 'bob.chen@stanford.edu', verified: 'No' },
        { name: 'Cara Li', institution: 'University of Oxford', email: 'cara.li@ox.ac.uk', verified: 'Yes' },
      ];
    }

    // Construct query parameters
    const queryParams = new URLSearchParams({
      useCustom: filters.useCustomUniversities.toString()
    });

    if (filters.useCustomUniversities && filters.selectedUniversities) {
      queryParams.append('universities', JSON.stringify(filters.selectedUniversities));
    }

    const apiUrl = `/api/find-emails?${queryParams.toString()}`;
    console.log(`Calling API endpoint: ${apiUrl}`);
    console.log('API query params:', Object.fromEntries(queryParams.entries()));

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      let errorMessage = `Error fetching email leads: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        if (errorData.error) errorMessage = errorData.error;
        if (errorData.details) errorMessage += `: ${errorData.details}`;
      } catch (parseError) {
        console.error("Could not parse error response:", parseError);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log(`API returned ${data.length} leads`);
    return data;
  } catch (error) {
    console.error("Error finding emails:", error);
    throw error;
  }
}

// Get metrics from Supabase for monitoring (admin only)
export async function getEmailMetrics() {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) {
    console.error("Error fetching email metrics:", error);
    throw error;
  }
  
  return data || [];
}
