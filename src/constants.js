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

export const SYNC_SOURCE_ITEMS = true

export const TWO_STEP_CONNECTORS = [
  'ZENDESK', 'SHAREPOINT', 'CONFLUENCE', 'SALESFORCE', 'S3', 'FRESHDESK', 'GITBOOK', 'GITHUB'
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
  'S3',
  'GITHUB'
]

// used to check if we need to generate sync/OAuth URL for syncing files
export const SYNC_URL_BASED_CONNECTORS = [
  'BOX',
  'DROPBOX',
  'GOOGLE_DRIVE',
  'INTERCOM',
  'NOTION',
  'ONEDRIVE',
  'SHAREPOINT',
  'ZENDESK',
  'ZOTERO',
]

export const FILE_PICKER_BASED_CONNECTORS = ['GITHUB']

export const PICKER_OR_URL_BASED_CONNECTORS = ['CONFLUENCE', 'SALESFORCE']

export const LOCAL_FILE_TYPES = [
  "TEXT",
  "CSV",
  "TSV",
  "PDF",
  "DOCX",
  "PPTX",
  "XLSX",
  "MD",
  "RTF",
  "JSON",
  "HTML",
  "RAW_TEXT",
  "JPG",
  "JPEG",
  "PNG",
  "MP3",
  "MP4",
  "MP2",
  "AAC",
  "WAV",
  "FLAC",
  "PCM",
  "M4A",
  "OGG",
  "OPUS",
  "WEBM"
]