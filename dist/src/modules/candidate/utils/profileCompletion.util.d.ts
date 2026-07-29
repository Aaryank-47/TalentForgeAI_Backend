import type { CandidateWithRelationsCount } from "../interfaces/candidate.interface.js";
/**
 * Calculates the profile completion percentage for a candidate.
 *
 * Breakdown:
 * - fullName: 10%
 * - headline: 10%
 * - bio: 10%
 * - profilePicture: 10%
 * - phoneNumber: 10%
 * - currentLocation: 10%
 * - isOpenToWork: 5%
 * - experiences (at least 1): 15%
 * - educations (at least 1): 15%
 * - skills (at least 1): 10%
 * Total: 100%
 */
export declare function calculateCandidateProfileCompletion(candidate: CandidateWithRelationsCount): number;
//# sourceMappingURL=profileCompletion.util.d.ts.map