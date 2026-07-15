import elasticsearchClient from "../../../config/elasticsearch.js";
import {
    ES_INDICES,
    ES_COMPANY_MAPPINGS,
    ES_COMPANY_BOOSTS,
    ES_MAX_RESULT_WINDOW,
} from "../../../common/constants/elasticsearch.constants.js";
import { logger } from "../../../common/logger/logger.js";
import type { CompanySearchView, SearchCompanyResult } from "../interfaces/company.interface.js";
import type { SearchCompanyDto } from "../dto/company.dto.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";

import prisma from "../../../config/database.js";
import { companySelect } from "../../../common/prisma.select/company.select.js";

export class ElasticsearchService {

    /**
     * Ensure the company index exists with correct mappings.
     * Called once at server startup.
     */
    static async ensureIndex(): Promise<void> {
        try {
            const exists = await elasticsearchClient.indices.exists({
                index: ES_INDICES.COMPANIES,
            });

            if (!exists) {
                await elasticsearchClient.indices.create({
                    index: ES_INDICES.COMPANIES,
                    settings: {
                        number_of_shards: 1,
                        number_of_replicas: 1,
                        max_result_window: ES_MAX_RESULT_WINDOW,
                    } as any,
                    mappings: ES_COMPANY_MAPPINGS as any,
                });
                logger.info(`[Elasticsearch] Index "${ES_INDICES.COMPANIES}" created.`);
            } else {
                logger.info(`[Elasticsearch] Index "${ES_INDICES.COMPANIES}" already exists.`);
            }

            // Sync all existing public active companies from database
            await this.syncExistingCompanies();
        } catch (error) {
            logger.error({ err: error }, "[Elasticsearch] Failed to ensure company index.");
        }
    }

    /**
     * Synchronize all existing active public companies from DB to ES
     */
    static async syncExistingCompanies(): Promise<void> {
        try {
            const companies = await prisma.company.findMany({
                where: {
                    deletedAt: null,
                    status: "ACTIVE",
                    visibility: "PUBLIC"
                },
                select: companySelect
            });

            if (companies.length === 0) {
                return;
            }

            logger.info(`[Elasticsearch] Syncing ${companies.length} existing active public companies to ES...`);

            for (const company of companies) {
                const searchView: CompanySearchView = {
                    id: company.id,
                    companyName: company.companyName,
                    slug: company.slug,
                    industry: company.industry ?? null,
                    description: company.description ?? null,
                    headquarters: company.headquarters ?? null,
                    website: company.website ?? null,
                    companySize: company.companySize ?? null,
                    companyEmail: company.companyEmail ?? null,
                    phoneNumber: company.phoneNumber ?? null,
                    logo: company.logo ?? null,
                    coverImage: company.coverImage ?? null,
                    foundedYear: company.foundedYear ?? null,
                    linkedinUrl: company.linkedinUrl ?? null,
                    twitterUrl: company.twitterUrl ?? null,
                    status: "ACTIVE",
                    visibility: "PUBLIC",
                    isVerified: company.isVerified,
                    verifiedAt: company.verifiedAt || null,
                    verifiedBy: company.verifiedBy ?? null,
                    restoredAt: (company as any).restoredAt || null,
                    restoredBy: (company as any).restoredBy ?? null,
                    profileCompletion: company.profileCompletion,
                    createdAt: company.createdAt.toISOString(),
                    updatedAt: company.updatedAt.toISOString(),
                };
                await this.indexCompany(searchView);
            }

            logger.info(`[Elasticsearch] Finished syncing existing companies.`);
        } catch (error) {
            logger.error({ err: error }, "[Elasticsearch] Failed to sync existing companies.");
        }
    }


    /**
     * Upsert (index) a company document into Elasticsearch.
     * Called after create and update operations.
     */
    static async indexCompany(company: CompanySearchView): Promise<void> {
        try {
            const { id, ...doc } = company;
            await elasticsearchClient.index({
                index: ES_INDICES.COMPANIES,
                id,
                document: doc,
            });
        } catch (error) {
            logger.error(
                { err: error, companyId: company.id },
                "[Elasticsearch] Failed to index company."
            );
        }
    }

    /**
     * Remove a company document from Elasticsearch.
     * Called after soft-delete operations.
     */
    static async removeCompany(companyId: string): Promise<void> {
        try {
            await elasticsearchClient.delete({
                index: ES_INDICES.COMPANIES,
                id: companyId,
            });
        } catch (error: any) {
            // A 404 means the doc was never indexed — not a real error
            if (error?.meta?.statusCode !== 404) {
                logger.error(
                    { err: error, companyId },
                    "[Elasticsearch] Failed to remove company."
                );
            }
        }
    }

    /**
     * Search companies using a bool query with multi_match, fuzzy,
     * prefix boost, and optional keyword filters.
     */
    static async searchCompanies(params: SearchCompanyDto): Promise<SearchCompanyResult> {
        const { keyword, industry, location, companySize, sortBy, sortOrder } = params;

        const pagination = PaginationHelper.getPagination({
            page: String(params.page),
            limit: String(params.limit),
            sortBy,
            sortOrder,
        });

        const mustClauses: Record<string, any>[] = [
            // Only ACTIVE, non-deleted, PUBLIC companies
            { term: { status: "ACTIVE" } },
            { term: { visibility: "PUBLIC" } },
        ];

        const shouldClauses: Record<string, any>[] = [];

        if (keyword) {
            // Full-text multi_match with field boosting
            shouldClauses.push(
                {
                    multi_match: {
                        query: keyword,
                        fields: [
                            `companyName^${ES_COMPANY_BOOSTS.COMPANY_NAME}`,
                            `industry^${ES_COMPANY_BOOSTS.INDUSTRY}`,
                            `description^${ES_COMPANY_BOOSTS.DESCRIPTION}`,
                            `headquarters^${ES_COMPANY_BOOSTS.HEADQUARTERS}`,
                            `website^${ES_COMPANY_BOOSTS.WEBSITE}`,
                        ],
                        type: "best_fields",
                        fuzziness: "AUTO",
                        prefix_length: 1,
                    },
                },
                // Prefix match on companyName for autocomplete-style search
                {
                    prefix: {
                        companyName: {
                            value: keyword.toLowerCase(),
                            boost: ES_COMPANY_BOOSTS.COMPANY_NAME,
                        },
                    },
                }
            );
        }

        if (industry) {
            mustClauses.push({
                match: {
                    industry: {
                        query: industry,
                        fuzziness: "AUTO",
                    },
                },
            });
        }

        if (location) {
            mustClauses.push({
                match: {
                    headquarters: {
                        query: location,
                        fuzziness: "AUTO",
                    },
                },
            });
        }

        if (companySize) {
            mustClauses.push({
                term: { companySize },
            });
        }

        const query: Record<string, any> = {
            bool: {
                must: mustClauses,
                ...(shouldClauses.length > 0
                    ? { should: shouldClauses, minimum_should_match: 1 }
                    : {}),
            },
        };

        // Build sort — relevance-first when keyword is given, field-order otherwise
        const sort: Record<string, any>[] = keyword
            ? [{ _score: { order: "desc" } }]
            : [{ [sortBy ?? "createdAt"]: { order: sortOrder ?? "desc" } }];

        const response = await elasticsearchClient.search<CompanySearchView>({
            index: ES_INDICES.COMPANIES,
            from: pagination.skip,
            size: pagination.take,
            query,
            sort,
        });

        const hits = response.hits.hits;
        const totalItems =
            typeof response.hits.total === "number"
                ? response.hits.total
                : (response.hits.total?.value ?? 0);

        const data = hits
            .map((hit) => hit._source)
            .filter((doc): doc is CompanySearchView => doc !== undefined);

        return {
            data,
            pagination: PaginationHelper.buildMeta(pagination.page, pagination.limit, totalItems),
        };
    }
}
