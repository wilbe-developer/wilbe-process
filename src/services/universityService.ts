
import { supabase } from "@/integrations/supabase/client";

export async function getUniversities() {
  const { data, error } = await supabase
    .from('universities')
    .select('id, name, is_default')
    .order('name');
  
  if (error) {
    console.error("Error fetching universities:", error);
    throw error;
  }
  
  return data || [];
}

export async function updateUniversity(id: string, fields: { name?: string; is_default?: boolean }) {
  const { error } = await supabase
    .from('universities')
    .update(fields)
    .eq('id', id);
  
  if (error) {
    console.error("Error updating university:", error);
    throw error;
  }
}

export async function addUniversity(name: string) {
  const { error } = await supabase
    .from('universities')
    .insert({ name, is_default: false });
  
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
  // Example data for UI demonstration
  return [
    { name: 'Alice Smith', institution: 'MIT', email: 'alice.smith@mit.edu', verified: 'Yes' },
    { name: 'Bob Chen', institution: 'Stanford University', email: 'bob.chen@stanford.edu', verified: 'No' },
    { name: 'Cara Li', institution: 'University of Oxford', email: 'cara.li@ox.ac.uk', verified: 'Yes' },
  ];
}
