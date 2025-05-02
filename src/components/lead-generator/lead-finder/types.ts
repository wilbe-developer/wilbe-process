
export interface University {
  id: string;
  name: string;
  is_default: boolean;
  domain?: string;
  openalex_ror?: string;
}

export interface LeadResult {
  name: string;
  institution: string;
  email: string;
  verified: string;
  reason?: string;
  orcid?: string;
  last_verified_at?: string;
  last_failed_at?: string;
}

export interface TopicOption {
  value: string;
  label: string;
}

export interface LeadSearchFilters {
  useCustomUniversities: boolean;
  selectedUniversities?: string[];
  topicId?: string;
}
