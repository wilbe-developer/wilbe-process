
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useSprintProfileQuickEdit = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch sprint profile (one per user)
  const { data: sprintProfile, isLoading } = useQuery({
    queryKey: ["sprintProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("sprint_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Update a profile field
  const updateSprintProfile = useMutation({
    mutationFn: async (updates: Partial<any>) => {
      if (!user) throw new Error("No user found");
      const { error } = await supabase
        .from("sprint_profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (error) throw error;
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprintProfile", user?.id] });
    }
  });

  return { sprintProfile, isLoading, updateSprintProfile };
};
