
import { useState } from "react";
import { Session } from "@supabase/supabase-js";
import { UserProfile } from "@/types";

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  return {
    user,
    session,
    loading,
    setUser,
    setSession,
    setLoading
  };
};
