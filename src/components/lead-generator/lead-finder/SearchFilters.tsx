
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Database, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "../MultiSelect";
import { University, TopicOption } from "./types";

interface SearchFiltersProps {
  universities: University[];
  topicOptions: TopicOption[];
  selectedUniversities: string[];
  setSelectedUniversities: (unis: string[]) => void;
  useCustomUniversities: boolean;
  setUseCustomUniversities: (use: boolean) => void;
  topicId: string;
  setTopicId: (id: string) => void;
  loading: boolean;
  isCheckingDefaults: boolean;
  universityCount: number;
  defaultUniversityCount: number;
  hasMissingDomains: boolean;
  handleRunSearch: () => void;
  refreshData: () => void;
  isRecovering: boolean;
}

export const SearchFilters = ({
  universities,
  topicOptions,
  selectedUniversities,
  setSelectedUniversities,
  useCustomUniversities,
  setUseCustomUniversities,
  topicId,
  setTopicId,
  loading,
  isCheckingDefaults,
  universityCount,
  defaultUniversityCount,
  hasMissingDomains,
  handleRunSearch,
  refreshData,
  isRecovering
}: SearchFiltersProps) => {
  const defaultUniversities = universities.filter(u => u.is_default);
  const defaultsWithoutDomains = defaultUniversities.filter(u => !u.domain);
  
  console.log("SearchFilters rendering with topicId:", topicId);
  console.log("Topic options:", topicOptions);

  return (
    <div className="md:col-span-1 space-y-4 border rounded-md p-4">
      <h3 className="font-medium">Filters</h3>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={useCustomUniversities}
          onCheckedChange={setUseCustomUniversities}
          id="custom-universities"
        />
        <label htmlFor="custom-universities">Use custom universities</label>
      </div>
      
      {!useCustomUniversities && defaultUniversities.length === 0 && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Default Universities</AlertTitle>
          <AlertDescription>
            Please go to the University Management tab and set some universities as default.
          </AlertDescription>
        </Alert>
      )}
      
      {hasMissingDomains && (
        <Alert variant="default" className="mt-2 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Warning</AlertTitle>
          <AlertDescription className="text-amber-700">
            Some universities are missing domain information. They will be skipped during the search.
          </AlertDescription>
        </Alert>
      )}
      
      {useCustomUniversities && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Select universities to include</p>
          <MultiSelect
            options={universities.map(u => ({
              value: u.id,
              label: u.name + (!u.domain ? " (no domain)" : "")
            }))}
            selected={selectedUniversities}
            onChange={setSelectedUniversities}
            placeholder="Search universities..."
          />
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="topicSelect" className="text-sm font-medium mb-1 block">
          OpenAlex Topic Filter
        </label>
        <Select value={topicId} onValueChange={setTopicId}>
          <SelectTrigger id="topicSelect">
            <SelectValue placeholder="Select a research topic" />
          </SelectTrigger>
          <SelectContent>
            {topicOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-1">
          <p className="text-xs text-gray-500">
            Filter researchers by OpenAlex topic ID
          </p>
        </div>
      </div>
      
      <div className="pt-2">
        <Button 
          onClick={handleRunSearch} 
          className="w-full"
          disabled={loading || isCheckingDefaults || (useCustomUniversities && selectedUniversities.length === 0)}
        >
          {loading || isCheckingDefaults ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              {isCheckingDefaults ? "Checking..." : "Searching..."}
            </>
          ) : "Run Search"}
        </Button>
      </div>
      
      {!useCustomUniversities && (
        <div className="text-xs text-gray-500 pt-2">
          Using {defaultUniversities.length} default universities
          {defaultUniversities.length === 0 && (
            <div className="mt-2 text-amber-600 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span>No default universities selected</span>
            </div>
          )}
          {defaultsWithoutDomains.length > 0 && (
            <div className="mt-2 text-amber-600 flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>{defaultsWithoutDomains.length} {defaultsWithoutDomains.length === 1 ? 'university has' : 'universities have'} no domain set</span>
            </div>
          )}
        </div>
      )}
      
      <div className="pt-4 border-t mt-4">
        <h4 className="text-sm font-medium mb-2">Database Status</h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Database className="h-3 w-3" />
          <span>Total Universities: {universityCount}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <Database className="h-3 w-3" />
          <span>Default Universities: {defaultUniversityCount}</span>
        </div>
        <div className="mt-2">
          <Button size="sm" variant="outline" onClick={refreshData} className="w-full text-xs gap-1">
            {isRecovering ? (
              <>
                <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                Refresh Data
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
