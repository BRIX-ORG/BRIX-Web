import { algoliasearch } from 'algoliasearch';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'mock_app_id';
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || 'mock_search_key';

export const algoliaClient = algoliasearch(appId, searchKey);

export const ALGOLIA_INDICES = {
    USERS: 'users',
    BRICKS: 'bricks',
} as const;
