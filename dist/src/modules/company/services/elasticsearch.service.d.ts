import type { CompanySearchView, SearchCompanyResult } from "../interfaces/company.interface.js";
import type { SearchCompanyDto } from "../dto/company.dto.js";
export declare class ElasticsearchService {
    /**
     * Ensure the company index exists with correct mappings.
     * Called once at server startup.
     */
    static ensureIndex(): Promise<void>;
    /**
     * Synchronize all existing active public companies from DB to ES
     */
    static syncExistingCompanies(): Promise<void>;
    /**
     * Upsert (index) a company document into Elasticsearch.
     * Called after create and update operations.
     */
    static indexCompany(company: CompanySearchView): Promise<void>;
    /**
     * Remove a company document from Elasticsearch.
     * Called after soft-delete operations.
     */
    static removeCompany(companyId: string): Promise<void>;
    /**
     * Search companies using a bool query with multi_match, fuzzy,
     * prefix boost, and optional keyword filters.
     */
    static searchCompanies(params: SearchCompanyDto): Promise<SearchCompanyResult>;
}
//# sourceMappingURL=elasticsearch.service.d.ts.map