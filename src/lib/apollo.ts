import axios, { AxiosInstance } from "axios";

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

export interface ApolloOrganization {
  id: string;
  name: string;
  website_url: string;
  blog_url?: string;
  primary_domain: string;
  industry: string;
  estimated_num_employees: number;
  city?: string;
  state?: string;
  country?: string;
  annual_revenue?: number;
  annual_revenue_printed?: string;
  publicly_traded_symbol?: string;
  technology_names?: string[];
  founded_year?: number;
}

export interface OrganizationSearchParams {
  q_keywords?: string;
  organization_locations?: string[];
  organization_num_employees_ranges?: string[];
  industry_tag_ids?: string[];
  page?: number;
  per_page?: number;
}

export interface OrganizationSearchResponse {
  organizations: ApolloOrganization[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
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

export interface BulkEnrichmentDetail {
  first_name?: string;
  last_name?: string;
  email?: string;
  linkedin_url?: string;
  organization_name?: string;
}

export interface BulkEnrichmentResponse {
  enriched_data?: Array<{
    details: BulkEnrichmentDetail;
    person: ApolloContact;
  }>;
}

class ApolloClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: "https://api.apollo.io/v1",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": apiKey,
      },
    });
  }

  /**
   * Search for contacts based on criteria
   */
  async searchContacts(
    params: ApolloSearchParams
  ): Promise<ApolloSearchResponse> {
    try {
      console.log("🔍 Apollo Search - Input params:", JSON.stringify(params, null, 2));
      
      // Important: Do NOT add reveal_personal_emails to search endpoint
      // The search endpoint does not return new email addresses or phone numbers.
      // Emails are only enriched via People Enrichment or Bulk People Enrichment endpoints.
      const searchPayload = {
        ...params,
        // reveal_personal_emails is NOT supported on search endpoint
      };

      console.log("📤 Apollo Search - Full request payload:", JSON.stringify(searchPayload, null, 2));
      
      const response = await this.client.post<ApolloSearchResponse>(
        '/mixed_people/search',
        searchPayload
      );
      
      console.log("✅ Apollo Search - Response received:", {
        total_entries: response.data.pagination?.total_entries,
        returned_count: response.data.contacts?.length || response.data.people?.length,
        has_emails: (response.data.people || response.data.contacts || []).some(c => c.email && !c.email.includes("email_not_unlocked")),
      });

      // Log individual contact email status
      const contacts = response.data.people || response.data.contacts || [];
      contacts.forEach((contact, idx) => {
        console.log(`  Contact ${idx + 1}: ${contact.first_name} ${contact.last_name} - Email: ${contact.email || 'NO EMAIL'}`);
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Apollo Search - API Error:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           JSON.stringify(error.response?.data) ||
                           error.message;

        // Handle specific error cases
        if (error.response?.status === 422) {
          if (error.response?.data?.error?.includes("Value too long") || 
              error.response?.data?.error === "Value too long") {
            console.error(
              "⚠️ Apollo API Limit Error: Parameters are too long or too many items in arrays."
            );
            console.error(
              "Apollo limits array parameters to ~5-10 items. Check: person_titles[], person_seniorities[], person_locations[], etc."
            );
            throw new Error(
              `Apollo API error: ${errorMessage}. Tip: Try reducing the number of filters (especially locations, job titles, etc.). Apollo limits array parameters to 5-10 items.`
            );
          }
        }

        throw new Error(`Apollo API error: ${errorMessage}`);
      }
      console.error("❌ Apollo Search - Unexpected error:", error);
      throw error;
    }
  }

  /**
   * Enrich a contact by email
   */
  async enrichContact(email: string): Promise<ApolloEnrichResponse> {
    try {
      console.log("🔧 Apollo Enrich by Email - Email:", email);
      
      const response = await this.client.get<ApolloEnrichResponse>('/people/match', {
        params: {
          email,
          reveal_personal_emails: true, // Enable email revelation
        },
      });

      console.log("✅ Apollo Enrich - Response:", {
        name: response.data.person?.name,
        email: response.data.person?.email,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Apollo Enrich - API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          email: email,
        });
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        throw new Error(`Apollo API error: ${errorMessage}`);
      }
      console.error("❌ Apollo Enrich - Unexpected error:", error);
      throw error;
    }
  }

  /**
   * Enrich a contact by ID
   */
  async getContactById(id: string): Promise<ApolloEnrichResponse> {
    try {
      console.log("🔧 Apollo Enrich by ID - Contact ID:", id);
      
      const response = await this.client.get<ApolloEnrichResponse>(`/people/${id}`, {
        params: {
          reveal_personal_emails: true, // Enable email revelation
        },
      });

      console.log("✅ Apollo Enrich by ID - Response:", {
        name: response.data.person?.name,
        email: response.data.person?.email,
        has_email: !!response.data.person?.email && !response.data.person.email.includes("email_not_unlocked"),
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Apollo Enrich by ID - API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          contact_id: id,
        });
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message;
        throw new Error(`Apollo API error: ${errorMessage}`);
      }
      console.error("❌ Apollo Enrich by ID - Unexpected error:", error);
      throw error;
    }
  }

  /**
   * Bulk enrich up to 10 contacts with a single API call
   */
  async bulkEnrichContacts(
    details: BulkEnrichmentDetail[]
  ): Promise<BulkEnrichmentResponse> {
    try {
      // Limit to 10 contacts per request as per Apollo API limits
      if (details.length > 10) {
        console.warn(`⚠️ Bulk Enrich - Requested ${details.length} contacts, limiting to 10`);
      }

      const limitedDetails = details.slice(0, 10);
      
      console.log(
        `🔧 Apollo Bulk Enrich - Enriching ${limitedDetails.length} contacts with single API call`
      );

      const response = await this.client.post<BulkEnrichmentResponse>(
        "/people/bulk_match",
        {
          details: limitedDetails,
          reveal_personal_emails: true, // Enable email revelation
        }
      );

      console.log("✅ Apollo Bulk Enrich - Response:", {
        enriched_count: response.data.enriched_data?.length || 0,
      });

      // Log details for each enriched contact
      if (response.data.enriched_data) {
        response.data.enriched_data.forEach((item, idx) => {
          console.log(
            `  Enriched ${idx + 1}: ${item.person?.name} - Email: ${
              item.person?.email || "NO EMAIL"
            }`
          );
        });
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Apollo Bulk Enrich - API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          JSON.stringify(error.response?.data) ||
          error.message;
        throw new Error(`Apollo Bulk Enrich API error: ${errorMessage}`);
      }
      console.error("❌ Apollo Bulk Enrich - Unexpected error:", error);
      throw error;
    }
  }

  /**
   * Search for organizations based on criteria
   */
  async searchOrganizations(
    params: OrganizationSearchParams
  ): Promise<OrganizationSearchResponse> {
    try {
      console.log("🏢 Apollo Organization Search - Input params:", JSON.stringify(params, null, 2));

      const searchPayload = {
        ...params,
      };

      console.log("📤 Apollo Organization Search - Full request payload:", JSON.stringify(searchPayload, null, 2));

      const response = await this.client.post<OrganizationSearchResponse>(
        "/organizations/search",
        searchPayload
      );

      console.log("✅ Apollo Organization Search - Response received:", {
        total_entries: response.data.pagination?.total_entries,
        returned_count: response.data.organizations?.length || 0,
      });

      response.data.organizations?.forEach((org, idx) => {
        console.log(
          `  Organization ${idx + 1}: ${org.name} - Industry: ${org.industry} - Employees: ${org.estimated_num_employees}`
        );
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ Apollo Organization Search - API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          JSON.stringify(error.response?.data) ||
          error.message;
        throw new Error(`Apollo Organization Search API error: ${errorMessage}`);
      }
      console.error("❌ Apollo Organization Search - Unexpected error:", error);
      throw error;
    }
  }

  /**
   * Hybrid search: First search organizations, then find people within those organizations
   * This provides better filtering than people search alone
   */
  async hybridSearch(params: {
    q_keywords?: string;
    person_titles?: string[];
    organization_locations?: string[];
    organization_num_employees_ranges?: string[];
    industry_keywords?: string[];
    page?: number;
    per_page?: number;
  }): Promise<ApolloSearchResponse> {
    try {
      console.log("🔗 Apollo Hybrid Search - Starting organization search first...");

      // Step 1: Search for organizations based on org-level criteria
      const orgSearchParams: OrganizationSearchParams = {
        q_keywords: params.industry_keywords?.join(" "),
        organization_locations: params.organization_locations,
        organization_num_employees_ranges: params.organization_num_employees_ranges,
        page: 1,
        per_page: 100, // Get more orgs to search within
      };

      const orgResponse = await this.searchOrganizations(orgSearchParams);
      const organizationIds = orgResponse.organizations?.map((org) => org.id) || [];

      console.log(
        `✅ Found ${organizationIds.length} organizations, now searching for people within them...`
      );

      if (organizationIds.length === 0) {
        console.log("⚠️ No organizations found, falling back to standard people search");
        return this.searchContacts({
          q_keywords: params.q_keywords,
          person_titles: params.person_titles,
          page: params.page || 1,
          per_page: params.per_page || 25,
        });
      }

      // Step 2: Search for people within those organizations
      const peopleSearchParams: any = {
        q_keywords: params.q_keywords,
        person_titles: params.person_titles,
        organization_ids: organizationIds, // Only search within matched organizations
        page: params.page || 1,
        per_page: params.per_page || 25,
      };

      console.log(
        `📥 Searching for people within ${organizationIds.length} organizations...`
      );

      const peopleResponse = await this.searchContacts(peopleSearchParams);

      console.log("✅ Hybrid search complete");

      return peopleResponse;
    } catch (error) {
      console.error("❌ Apollo Hybrid Search - Error:", error);
      // Fallback to standard search if hybrid fails
      console.log("⚠️ Falling back to standard people search");
      return this.searchContacts({
        q_keywords: params.q_keywords,
        person_titles: params.person_titles,
        page: params.page || 1,
        per_page: params.per_page || 25,
      });
    }
  }
}

// Singleton instance
let apolloClient: ApolloClient | null = null;

export function getApolloClient(): ApolloClient {
  if (!process.env.APOLLO_API_KEY) {
    throw new Error("APOLLO_API_KEY environment variable is not set");
  }

  if (!apolloClient) {
    apolloClient = new ApolloClient(process.env.APOLLO_API_KEY);
  }

  return apolloClient;
}

export default ApolloClient;
