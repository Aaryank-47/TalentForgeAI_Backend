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
export function calculateCandidateProfileCompletion(candidate: CandidateWithRelationsCount): number {
    let completion = 0;

    if (candidate.fullName && candidate.fullName.trim() !== '') {
        completion += 10;
    }
    if (candidate.headline && candidate.headline.trim() !== '') {
        completion += 10;
    }
    if (candidate.bio && candidate.bio.trim() !== '') {
        completion += 10;
    }
    if (candidate.profilePicture && candidate.profilePicture.trim() !== '') {
        completion += 10;
    }
    if (candidate.phoneNumber && candidate.phoneNumber.trim() !== '') {
        completion += 10;
    }
    if (candidate.currentLocation && candidate.currentLocation.trim() !== '') {
        completion += 10;
    }
    if (candidate.isOpenToWork) {
        completion += 5;
    }
    if (candidate._count.experiences > 0) {
        completion += 15;
    }
    if (candidate._count.educations > 0) {
        completion += 15;
    }
    if (candidate._count.skills > 0) {
        completion += 10;
    }

    return completion;
}
