export const BASE_URL = {
  PRODUCTION: 'https://api.carbon.ai',
  DEVELOPMENT: 'https://api.dev.carbon.ai',
  LOCAL: 'http://localhost:8000',
};

export const onSuccessEvents = {
  ADD: 'ADD',
  CANCEL: 'CANCEL',
  ERROR: 'ERROR',
  INITIATE: 'INITIATE',
  REMOVE: 'REMOVE',
  UPDATE: 'UPDATE',
};

export const SYNC_FILES_ON_CONNECT = true

export const TWO_STEP_CONNECTORS = [
  'ZENDESK', 'SHAREPOINT', 'CONFLUENCE', 'SALESFORCE', 'S3', 'FRESHDESK', 'GITBOOK'
]

export const THIRD_PARTY_CONNECTORS = [
  'BOX',
  'CONFLUENCE',
  'DROPBOX',
  'GOOGLE_DRIVE',
  'INTERCOM',
  'NOTION',
  'ONEDRIVE',
  'SHAREPOINT',
  'ZENDESK',
  'ZOTERO',
  'FRESHDESK',
  'GITBOOK',
  'GMAIL',
  'OUTLOOK',
  'SALESFORCE',
  'S3'
]

// used to check if we need to generate sync/OAuth URL for syncing files
export const SYNC_URL_BASED_CONNECTORS = [
  'BOX',
  'CONFLUENCE',
  'DROPBOX',
  'GOOGLE_DRIVE',
  'INTERCOM',
  'NOTION',
  'ONEDRIVE',
  'SHAREPOINT',
  'ZENDESK',
  'ZOTERO',
  'SALESFORCE'
]