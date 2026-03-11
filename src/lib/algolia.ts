import { algoliasearch } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;

export const algoliaClient = algoliasearch(appId, searchKey);

export const ALGOLIA_INDICES = {
    USERS: 'users',
    BRICKS: 'bricks',
} as const;
