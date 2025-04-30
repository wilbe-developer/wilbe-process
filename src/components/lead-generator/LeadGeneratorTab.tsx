
import { useState } from "react";
import SearchFilters from "./lead-finder/SearchFilters";
import ResultsDisplay from "./lead-finder/ResultsDisplay";
import AuthErrorDisplay from "./lead-finder/AuthErrorDisplay";
import ConnectionErrorDisplay from "./lead-finder/ConnectionErrorDisplay";
import useLeadFinder from "./lead-finder/useLeadFinder";

const LeadGeneratorTab = () => {
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
};

export default LeadGeneratorTab;
