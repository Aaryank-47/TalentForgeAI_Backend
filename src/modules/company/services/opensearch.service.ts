import opensearchClient from "../../../config/opensearch.js";
import {
    ES_INDICES,
    ES_COMPANY_MAPPINGS,
    ES_COMPANY_BOOSTS,
    ES_MAX_RESULT_WINDOW,
} from "../../../common/constants/opensearch.constants.js";
import { logger } from "../../../common/logger/logger.js";
import type { CompanySearchView, SearchCompanyResult } from "../interfaces/company.interface.js";
import type { SearchCompanyDto } from "../dto/company.dto.js";
import { PaginationHelper } from "../../../common/helper/pagination.helper.js";
import prisma from "../../../config/database.js";
import { companySelect } from "../../../common/prisma.select/company.select.js";

export class OpensearchService {

    /**
     * Ensure the company index exists with correct mappings.
     * Called once at server startup.
     */
    static async ensureIndex(): Promise<void> {
        try {
            const existsRes = await opensearchClient.indices.exists({
                index: ES_INDICES.COMPANIES,
            });
            const exists = Boolean(existsRes.body ?? existsRes);

            if (!exists) {
                await opensearchClient.indices.create({
                    index: ES_INDICES.COMPANIES,
                    body: {
                        settings: {
                            number_of_shards: 1,
                            number_of_replicas: 1,
                            max_result_window: ES_MAX_RESULT_WINDOW,
                        },
                        mappings: ES_COMPANY_MAPPINGS,
                    }
                });
                logger.info(`[OpenSearch] Index "${ES_INDICES.COMPANIES}" created.`);
            } else {
                logger.info(`[OpenSearch] Index "${ES_INDICES.COMPANIES}" already exists.`);
            }

            // Sync all existing public active companies from database
            await this.syncExistingCompanies();
        } catch (error) {
            logger.error({ err: error }, "[OpenSearch] Failed to ensure company index.");
        }
    }

    /**
     * Synchronize all existing active public companies from DB to OpenSearch
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

            logger.info(`[OpenSearch] Syncing ${companies.length} existing active public companies to OpenSearch...`);

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

            logger.info(`[OpenSearch] Finished syncing existing companies.`);
        } catch (error) {
            logger.error({ err: error }, "[OpenSearch] Failed to sync existing companies.");
        }
    }

    /**
     * Upsert (index) a company document into OpenSearch.
     * Called after create and update operations.
     */
    static async indexCompany(company: CompanySearchView): Promise<void> {
        try {
            const { id, ...doc } = company;
            await opensearchClient.index({
                index: ES_INDICES.COMPANIES,
                id,
                body: doc,
                refresh: true
            });
        } catch (error) {
            logger.error(
                { err: error, companyId: company.id },
                "[OpenSearch] Failed to index company."
            );
        }
    }

    /**
     * Remove a company document from OpenSearch.
     * Called after soft-delete operations.
     */
    static async removeCompany(companyId: string): Promise<void> {
        try {
            await opensearchClient.delete({
                index: ES_INDICES.COMPANIES,
                id: companyId,
            });
        } catch (error: any) {
            if (error?.meta?.statusCode !== 404 && error?.statusCode !== 404) {
                logger.error(
                    { err: error, companyId },
                    "[OpenSearch] Failed to remove company."
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
            { term: { status: "ACTIVE" } },
            { term: { visibility: "PUBLIC" } },
        ];

        const shouldClauses: Record<string, any>[] = [];

        if (keyword) {
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

        const sort: Record<string, any>[] = keyword
            ? [{ _score: { order: "desc" } }]
            : [{ [sortBy ?? "createdAt"]: { order: sortOrder ?? "desc" } }];

        const response = await opensearchClient.search({
            index: ES_INDICES.COMPANIES,
            from: pagination.skip,
            size: pagination.take,
            body: {
                query,
                sort,
            },
        });

        const searchBody: any = response.body ?? response;
        const hits = searchBody?.hits?.hits || [];
        const totalItems =
            typeof searchBody?.hits?.total === "number"
                ? searchBody.hits.total
                : (searchBody?.hits?.total?.value ?? 0);

        const data = hits
            .map((hit: any) => hit._source)
            .filter((doc: any): doc is CompanySearchView => doc !== undefined);

        return {
            data,
            pagination: PaginationHelper.buildMeta(pagination.page, pagination.limit, totalItems),
        };
    }
}
