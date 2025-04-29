
import { supabase } from "@/integrations/supabase/client";
import { PATHS } from "@/lib/constants";

export async function getUniversities() {
  const { data, error } = await supabase
    .from('universities')
    .select('id, name, is_default, domain')
    .order('name');
  
  if (error) {
    console.error("Error fetching universities:", error);
    console.log("Auth status:", supabase.auth);
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
  console.log("Adding university:", { name, domain });
  
  const { data, error } = await supabase
    .from('universities')
    .insert({ 
      name, 
      is_default: false,
      domain: domain || null
    })
    .select();
  
  if (error) {
    console.error("Error adding university:", error);
    throw error;
  }
  
  console.log("University added:", data);
  return data;
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
      return {
        data: [
          { name: 'Alice Smith', institution: 'MIT', email: 'alice.smith@mit.edu', verified: 'Yes' },
          { name: 'Bob Chen', institution: 'Stanford University', email: 'bob.chen@stanford.edu', verified: 'No' },
          { name: 'Cara Li', institution: 'University of Oxford', email: 'cara.li@ox.ac.uk', verified: 'Yes' },
        ],
        error: null
      };
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
    const data = await response.json();
    
    if (!response.ok) {
      console.error("API error response:", data);
      return {
        data: [],
        error: data.error || `Error: ${response.status} ${response.statusText}`
      };
    }
    
    // Check if the API returned an error with data
    if (data.error) {
      console.log(`API returned an error with ${data.data?.length || 0} leads`);
      return {
        data: data.data || [],
        error: data.error
      };
    }
    
    console.log(`API returned ${data.length} leads`);
    return {
      data: data,
      error: null
    };
  } catch (error: any) {
    console.error("Error finding emails:", error);
    return {
      data: [],
      error: error.message || "An unexpected error occurred"
    };
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
