import type { TreatmentGroup } from '../types';

/**
 * Generates a random alphanumeric string of a given length.
 * Excludes characters that might be confusing (e.g., I, l, 1, O, 0).
 */
const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Generates a User ID in the format: [GroupPrefix]-[RandomString]
 * e.g., 0-X9J2K
 */
export const generateUserID = (group: TreatmentGroup): string => {
    const prefix = group;
    const randomPart = generateRandomString(5);
    return `${prefix}-${randomPart}`;
};
