import axios, { AxiosInstance } from 'axios';

export interface ApolloSearchParams {
  q_keywords?: string;
  person_titles?: string[];
  person_seniorities?: string[];
  organization_locations?: string[];
  organization_num_employees_ranges?: string[];
  organization_industry_tag_ids?: string[];
  q_organization_keyword_tags?: string[];
  page?: number;
  per_page?: number;
}

export interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone_numbers?: Array<{
    raw_number: string;
    sanitized_number: string;
    type: string;
  }>;
  title: string;
  headline: string;
  photo_url: string;
  linkedin_url: string;
  twitter_url?: string;
  facebook_url?: string;
  github_url?: string;
  
  // Employment
  employment_history?: Array<{
    _id: string;
    created_at: string;
    current: boolean;
    degree?: string;
    description?: string;
    emails?: string[];
    end_date?: string;
    grade_level?: string;
    kind?: string;
    major?: string;
    organization_id?: string;
    organization_name?: string;
    raw_address?: string;
    start_date?: string;
    title?: string;
    updated_at: string;
    id: string;
    key: string;
  }>;
  
  // Organization
  organization?: {
    id: string;
    name: string;
    website_url: string;
    blog_url?: string;
    angellist_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
    facebook_url?: string;
    primary_phone?: {
      number: string;
      source: string;
    };
    languages: string[];
    alexa_ranking?: number;
    phone?: string;
    linkedin_uid?: string;
    founded_year?: number;
    publicly_traded_symbol?: string;
    publicly_traded_exchange?: string;
    logo_url?: string;
    crunchbase_url?: string;
    primary_domain: string;
    industry: string;
    keywords: string[];
    estimated_num_employees: number;
    industries: string[];
    secondary_industries: string[];
    snippets_loaded: boolean;
    industry_tag_id: string;
    retail_location_count: number;
    raw_address: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    owned_by_organization_id?: string;
    suborganizations: any[];
    num_suborganizations: number;
    seo_description: string;
    short_description: string;
    annual_revenue_printed?: string;
    annual_revenue?: number;
    technology_names?: string[];
    current_technologies?: Array<{
      uid: string;
      name: string;
      category: string;
    }>;
  };
  
  // Additional fields
  seniority: string;
  departments: string[];
  subdepartments: string[];
  functions: string[];
  
  // Contact info
  city: string;
  state: string;
  country: string;
  
  // Education
  education?: Array<{
    _id: string;
    created_at: string;
    current: boolean;
    degree?: string;
    description?: string;
    end_date?: string;
    grade_level?: string;
    major?: string;
    organization_name?: string;
    raw_address?: string;
    start_date?: string;
    updated_at: string;
    id: string;
    key: string;
  }>;
}

export interface ApolloSearchResponse {
  breadcrumbs: any[];
  partial_results_only: boolean;
  disable_eu_prospecting: boolean;
  partial_results_limit: number;
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
  contacts: ApolloContact[];
  people: ApolloContact[];
  breadcrumb_labels: any[];
  num_fetch_result: any;
}

export interface ApolloEnrichResponse {
  person: ApolloContact;
}

class ApolloClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: 'https://api.apollo.io/v1',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apiKey,
      },
    });
  }

  /**
   * Search for contacts based on criteria
   */
  async searchContacts(params: ApolloSearchParams): Promise<ApolloSearchResponse> {
    try {
      console.log("Apollo API Request Body:", JSON.stringify(params, null, 2));
      
      const response = await this.client.post<ApolloSearchResponse>(
        '/mixed_people/search',
        params
      );
      
      console.log("Apollo API Response:", {
        total: response.data.pagination?.total_entries,
        returned: response.data.contacts?.length || response.data.people?.length,
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Apollo API Error Details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           JSON.stringify(error.response?.data) ||
                           error.message;
        throw new Error(`Apollo API error: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Enrich a contact by email
   */
  async enrichContact(email: string): Promise<ApolloEnrichResponse> {
    try {
      const response = await this.client.get<ApolloEnrichResponse>('/people/match', {
        params: {
          email,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Apollo API Error Details:", {
          status: error.response?.status,
          data: error.response?.data,
        });
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message;
        throw new Error(`Apollo API error: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Enrich a contact by ID
   */
  async getContactById(id: string): Promise<ApolloEnrichResponse> {
    try {
      const response = await this.client.get<ApolloEnrichResponse>(`/people/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Apollo API Error Details:", {
          status: error.response?.status,
          data: error.response?.data,
        });
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message;
        throw new Error(`Apollo API error: ${errorMessage}`);
      }
      throw error;
    }
  }
}

// Singleton instance
let apolloClient: ApolloClient | null = null;

export function getApolloClient(): ApolloClient {
  if (!process.env.APOLLO_API_KEY) {
    throw new Error('APOLLO_API_KEY environment variable is not set');
  }
  
  if (!apolloClient) {
    apolloClient = new ApolloClient(process.env.APOLLO_API_KEY);
  }
  
  return apolloClient;
}

export default ApolloClient;


