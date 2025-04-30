
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { findEmails, getUniversities } from "@/services/universityService";
import { supabase } from "@/integrations/supabase/client";
import { PATHS } from "@/lib/constants";
import { LeadResult, University, TopicOption, LeadSearchFilters } from "./types";

export const useLeadFinder = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [useCustomUniversities, setUseCustomUniversities] = useState(false);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<LeadResult[]>([]);
  const [lastSearchTime, setLastSearchTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMissingDomains, setHasMissingDomains] = useState(false);
  const [isCheckingDefaults, setIsCheckingDefaults] = useState(false);
  const [universityCount, setUniversityCount] = useState(0);
  const [defaultUniversityCount, setDefaultUniversityCount] = useState(0);
  const [topicId, setTopicId] = useState<string>("");
  const [isRecovering, setIsRecovering] = useState(false);
  const { toast } = useToast();
  
  const resultsPerPage = 5;
  
  const topicOptions: TopicOption[] = [
    { value: "", label: "No Topic Filter" },
    { value: "C166413987", label: "Biology" },
    { value: "C86803240", label: "Computer Science" },
    { value: "C185592680", label: "Chemistry" },
    { value: "C127313418", label: "Physics" },
    { value: "C71924100", label: "Medicine" },
    { value: "C144133560", label: "Mathematics" },
    { value: "C121332964", label: "Psychology" },
    { value: "C39432304", label: "Environmental Science" },
    { value: "C162324750", label: "Neuroscience" }
  ];

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setAuthError(`Authentication error: ${error.message}`);
          console.error("Auth error:", error);
        } else if (!data.session) {
          setAuthError("Not authenticated. Sign in to access university data.");
          console.warn("No active session found");
        } else {
          setAuthError(null);
          console.log("Authenticated as:", data.session.user.email);
        }
      } catch (err) {
        console.error("Failed to check authentication:", err);
        setAuthError("Failed to verify authentication status. Please refresh the page.");
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      setConnectionError(null);
      setError(null);
      
      // Verify authentication before fetching
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        setAuthError("Not authenticated. Sign in to access university data.");
        setLoading(false);
        return;
      }
      
      const data = await getUniversities();
      console.log("Universities fetched:", data);
      setUniversities(data);
      setUniversityCount(data.length);
      
      // Check if default universities are missing domains
      const defaultUnis = data.filter(u => u.is_default);
      setDefaultUniversityCount(defaultUnis.length);
      
      const defaultsWithoutDomains = defaultUnis
        .filter(u => !u.domain)
        .length > 0;
      
      setHasMissingDomains(defaultsWithoutDomains);
      
      if (defaultUnis.length === 0) {
        toast({
          title: "No Default Universities",
          description: "No default universities found. Please add some in the University Management tab.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error fetching universities:", error);
      
      // Check for RLS policy violations
      if (error.message && (error.message.includes("policy") || error.message.includes("permission"))) {
        setAuthError(`Permission error: ${error.message}. You may need to sign in to access this data.`);
      } else {
        setConnectionError("Failed to connect to the database. Please check your connection and try again.");
      }
      
      toast({
        title: "Connection Error",
        description: error.message || "Failed to load universities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (useCustomUniversities) {
      // Check if selected universities are missing domains
      const missingDomains = universities
        .filter(u => selectedUniversities.includes(u.id) && !u.domain)
        .length > 0;
      
      setHasMissingDomains(missingDomains);
    }
  }, [selectedUniversities, universities, useCustomUniversities]);

  const checkForDefaultUniversities = async () => {
    setIsCheckingDefaults(true);
    try {
      // Check if there are any universities set as default
      const defaultUniversities = universities.filter(u => u.is_default);
      
      if (defaultUniversities.length === 0) {
        setError("No default universities found. Please add some in the University Management tab.");
        toast({
          title: "No Default Universities",
          description: "Please go to the University Management tab and set at least one university as default.",
          variant: "destructive",
        });
        return false;
      }
      
      // Check if default universities have domains
      const missingDomains = defaultUniversities.filter(u => !u.domain);
      if (missingDomains.length > 0 && missingDomains.length === defaultUniversities.length) {
        setError("All default universities are missing domain information. Please add domains in the University Management tab.");
        toast({
          title: "Missing Domains",
          description: "All default universities are missing domain information. Please add domains in the University Management tab.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } finally {
      setIsCheckingDefaults(false);
    }
  };

  const handleRunSearch = async () => {
    try {
      // Reset state for new search
      setError(null);
      setApiError(null);
      setLoading(true);
      setPage(1);
      setSearchResults([]);
      
      // Check which universities will be used
      const uniList = useCustomUniversities 
        ? universities.filter(u => selectedUniversities.includes(u.id))
        : universities.filter(u => u.is_default);
      
      if (uniList.length === 0) {
        setError(useCustomUniversities 
          ? "Please select at least one university" 
          : "No default universities found. Please add some in the University Management tab.");
        setLoading(false);
        
        toast({
          title: "No Universities Selected",
          description: useCustomUniversities 
            ? "Please select at least one university" 
            : "No default universities found. Please add some in the University Management tab.",
          variant: "destructive",
        });
        return;
      }

      // If using default universities, do an additional check
      if (!useCustomUniversities) {
        const defaultsOk = await checkForDefaultUniversities();
        if (!defaultsOk) {
          setLoading(false);
          return;
        }
      }

      // Count universities with missing domains
      const missingDomains = uniList.filter(u => !u.domain).length;
      if (missingDomains > 0) {
        console.warn(`${missingDomains} universities in the search are missing domains`);
        
        toast({
          title: "Warning",
          description: `${missingDomains} universities are missing domain information and will be skipped.`,
          variant: "destructive",
        });
      }
      
      const filters: LeadSearchFilters = {
        useCustomUniversities,
        selectedUniversities: useCustomUniversities ? selectedUniversities : undefined,
        topicId: topicId || undefined,
      };
      
      console.log("Running search with filters:", filters);
      try {
        const result = await findEmails(filters);
        
        if (result.error) {
          setApiError(result.error);
          if (result.data?.length === 0) {
            toast({
              title: "API Error",
              description: result.error,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Warning",
              description: result.error,
              variant: "destructive",
            });
          }
        }
        
        setSearchResults(result.data || []);
        
        const now = new Date();
        setLastSearchTime(now.toLocaleString());
        
        if (result.data?.length === 0 && !result.error) {
          toast({
            title: "No results",
            description: "No leads found. Make sure universities have domain information set.",
            variant: "destructive",
          });
        } else if (result.data?.length > 0) {
          toast({
            title: "Search Complete",
            description: `Found ${result.data.length} potential leads`,
          });
        }
      } catch (searchError: any) {
        console.error("Search error:", searchError);
        setError(searchError.message || "An error occurred during the search");
        toast({
          title: "API Error",
          description: searchError.message || "Failed to perform search. Check the server logs for details.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during the search");
      toast({
        title: "Error",
        description: error.message || "Failed to perform search",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteToSprint = (email: string) => {
    toast({
      title: "Invite Sent",
      description: `Invitation sent to ${email}`,
    });
  };

  const refreshData = async () => {
    try {
      setIsRecovering(true);
      // Clear all error states
      setAuthError(null);
      setConnectionError(null);
      setError(null);
      setApiError(null);
      
      // Re-verify authentication
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // We need to redirect to login
        window.location.href = PATHS.LOGIN;
        return;
      }
      
      await fetchUniversities();
      toast({
        title: "Data Refreshed",
        description: "University data has been refreshed from the database.",
      });
    } catch (error: any) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return {
    universities,
    useCustomUniversities,
    setUseCustomUniversities,
    selectedUniversities,
    setSelectedUniversities,
    searchResults,
    lastSearchTime,
    loading,
    error,
    apiError,
    connectionError,
    authError,
    page,
    setPage,
    hasMissingDomains,
    isCheckingDefaults,
    universityCount,
    defaultUniversityCount,
    topicId,
    setTopicId,
    topicOptions,
    isRecovering,
    resultsPerPage,
    handleRunSearch,
    handleInviteToSprint,
    refreshData,
    formatDate
  };
};

export default useLeadFinder;
