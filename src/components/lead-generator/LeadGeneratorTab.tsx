
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SearchFilters from "./lead-finder/SearchFilters";
import ResultsDisplay from "./lead-finder/ResultsDisplay";
import AuthErrorDisplay from "./lead-finder/AuthErrorDisplay";
import ConnectionErrorDisplay from "./lead-finder/ConnectionErrorDisplay";
import useLeadFinder from "./lead-finder/useLeadFinder";

const LeadGeneratorTab = () => {
  const [renderError, setRenderError] = useState<string | null>(null);
  
  const {
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
  } = useLeadFinder();

  // Add an effect to detect if the component renders properly
  useEffect(() => {
    console.log("LeadGeneratorTab mounted successfully");
    
    // Record successful render
    try {
      window.sessionStorage.setItem('leadGeneratorTabRendered', 'true');
    } catch (err) {
      console.warn("Could not access sessionStorage:", err);
    }
    
    return () => {
      console.log("LeadGeneratorTab unmounted");
    };
  }, []);

  // Add additional logging for debugging
  useEffect(() => {
    console.log("LeadGeneratorTab current state:", {
      topicId,
      topicOptions,
      selectedUniversities,
      useCustomUniversities,
      loading,
      error,
      apiError,
      authError
    });
  }, [topicId, topicOptions, selectedUniversities, useCustomUniversities, loading, error, apiError, authError]);

  // Error fallback to ensure we always show something
  if (renderError) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Lead Generator</h2>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Rendering Error</AlertTitle>
          <AlertDescription>
            <p>{renderError}</p>
            <button 
              className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Lead Generator</h2>
        
        <AuthErrorDisplay 
          authError={authError}
          refreshData={refreshData}
          isRecovering={isRecovering}
        />
        
        <ConnectionErrorDisplay 
          connectionError={connectionError}
          refreshData={refreshData}
        />

        {/* Add explicit error handling display */}
        {error && !apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          <SearchFilters 
            universities={universities}
            topicOptions={topicOptions}
            selectedUniversities={selectedUniversities}
            setSelectedUniversities={setSelectedUniversities}
            useCustomUniversities={useCustomUniversities}
            setUseCustomUniversities={setUseCustomUniversities}
            topicId={topicId}
            setTopicId={setTopicId}
            loading={loading}
            isCheckingDefaults={isCheckingDefaults}
            universityCount={universityCount}
            defaultUniversityCount={defaultUniversityCount}
            hasMissingDomains={hasMissingDomains}
            handleRunSearch={handleRunSearch}
            refreshData={refreshData}
            isRecovering={isRecovering}
          />
          
          <ResultsDisplay 
            searchResults={searchResults}
            page={page}
            setPage={setPage}
            lastSearchTime={lastSearchTime}
            topicId={topicId}
            topicOptions={topicOptions}
            loading={loading}
            error={error}
            apiError={apiError}
            handleInviteToSprint={handleInviteToSprint}
            formatDate={formatDate}
            resultsPerPage={resultsPerPage}
          />
        </div>
      </div>
    );
  } catch (err: any) {
    console.error("Error rendering LeadGeneratorTab:", err);
    // Set the error state so the fallback UI renders on next render
    setRenderError(err.message || "Failed to render Lead Generator tab");
    
    // Return a minimal fallback UI immediately
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Lead Generator</h2>
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-700">Something went wrong while rendering this page. Attempting to recover...</p>
        </div>
      </div>
    );
  }
};

export default LeadGeneratorTab;
