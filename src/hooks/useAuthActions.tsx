
import { useCallback } from "react";
import { NavigateFunction } from "react-router-dom";
import { UserProfile } from "@/types";
import { useProfileActions } from "./auth/useProfileActions";
import { useAuthenticationActions } from "./auth/useAuthenticationActions";

interface UseAuthActionsProps {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setSession: React.Dispatch<React.SetStateAction<any>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: NavigateFunction;
  toast: any;
}

export const useAuthActions = (props: UseAuthActionsProps) => {
  const { fetchUserProfile, updateProfile } = useProfileActions(props);
  const { sendMagicLink, register, logout } = useAuthenticationActions(props);
  
  return {
    fetchUserProfile: useCallback(fetchUserProfile, [props.setLoading, props.setUser]),
    sendMagicLink,
    register,
    logout,
    updateProfile
  };
};
