import React, { useState, ReactNode } from "react";
import "./index.css";

// @ts-ignore
import IntegrationModal from "./components/IntegrationModal";

// @ts-ignore
import { CarbonProvider } from "./contexts/CarbonContext";

// Enums
export enum ActionType {
  INITIATE = "INITIATE",
  ADD = "ADD",
  UPDATE = "UPDATE",
  CANCEL = "CANCEL",
}

export enum IntegrationName {
  LOCAL_FILES = "LOCAL_FILES",
  NOTION = "NOTION",
  WEB_SCRAPER = "WEB_SCRAPER",
  GOOGLE_DRIVE = "GOOGLE_DRIVE",
  INTERCOM = "INTERCOM",
  DROPBOX = "DROPBOX",
  ONEDRIVE = "ONEDRIVE",
  BOX = "BOX",
  ZENDESK = "ZENDESK",
  SHAREPOINT = "SHAREPOINT",
  ZOTERO = "ZOTERO",
  CONFLUENCE = "CONFLUENCE",
  S3 = "S3",
  GMAIL = "GMAIL",
  FRESHDESK = "FRESHDESK",
  GITBOOK = "GITBOOK",
  OUTLOOK = "OUTLOOK",
  SALESFORCE = "SALESFORCE",
  GITHUB = "GITHUB",
}

export enum SyncStatus {
  READY = "READY",
  QUEUED_FOR_SYNCING = "QUEUED_FOR_SYNCING",
  SYNCING = "SYNCING",
  SYNC_ERROR = "SYNC_ERROR",
}

export enum FilePickerMode {
  FILES = "FILES",
  FOLDERS = "FOLDERS",
  BOTH = "BOTH",
}

export interface FileType {
  extension: string;
  chunkSize?: number;
  overlapSize?: number;
  setPageAsBoundary?: boolean;
  useOcr?: boolean;
  generateSparseVectors?: boolean;
  parsePdfTablesWithOcr?: boolean;
}

export interface BaseIntegration {
  id: IntegrationName;
  chunkSize?: number;
  overlapSize?: number;
  skipEmbeddingGeneration?: boolean;
  enableAutoSync?: boolean;
  generateSparseVectors?: boolean;
  prependFilenameToChunks?: boolean;
  maxItemsPerChunk?: number;
  syncFilesOnConnection?: boolean;
  setPageAsBoundary?: boolean;
  showFilesTab?: boolean;
  useOcr?: boolean;
  parsePdfTablesWithOcr?: boolean;
}

export interface LocalFilesIntegration extends BaseIntegration {
  maxFileSize: number;
  allowMultipleFiles: boolean;
  maxFilesCount?: number;
  allowedFileTypes?: FileType[];
  filePickerMode?: FilePickerMode;
}

export interface WebScraperIntegration extends BaseIntegration {
  recursionDepth?: number;
  maxPagesToScrape?: number;
  htmlTagsToSkip?: string[];
  cssClassesToSkip?: string[];
  cssSelectorsToSkip?: string[];
  sitemapEnabled?: boolean;
}

export type Integration =
  | LocalFilesIntegration
  | WebScraperIntegration
  | BaseIntegration;

export interface LocalFile {
  id: string;
  name: string;
  source: IntegrationName;
  external_file_id: string;
  tags: string[];
  sync_status: SyncStatus;
}

export interface WebScraper {
  urls: string[];
  validUrls: string[];
  tags: string[];
}

export interface OnSuccessDataFileObject {
  id: string;
  source: IntegrationName;
  organization_id: string;
  organization_supplied_user_id: string;
  organization_user_data_source_id: string;
  external_file_id: string;
  external_url: string;
  sync_status: SyncStatus;
  last_sync: string;
  tags: Record<string, TagValue> | null;
  // TODO: Need a more detailed type
  file_statistics: object;
  // TODO: Need a more detailed type
  file_metadata: object;
  chunk_size: number;
  chunk_overlap: number;
  name: string;
  enable_auto_sync: boolean;
  presigned_url: string;
  parsed_text_url: string;
  skip_embedding_generation: boolean;
  created_at: string;
  updated_at: string;
  action: ActionType;
}

// Callback data types
export interface OnSuccessData {
  status: number;
  data: {
    data_source_external_id: string | null;
    sync_status: string | null;
    files: LocalFile[] | WebScraper[] | OnSuccessDataFileObject[] | null;
    request_id: string | null;
  } | null;
  action: ActionType;
  event: ActionType;
  integration: IntegrationName;
}

export interface OnErrorData {
  status: number;
  action: ActionType;
  event: ActionType;
  integration: IntegrationName;
  // TODO: Need a more detailed type
  data?: object;
}

export type TagValue = string | number | string[] | number[];

export enum EmbeddingGenerators {
  OPENAI = "OPENAI",
  AZURE_OPENAI = "AZURE_OPENAI",
  AZURE_ADA_LARGE_256 = "AZURE_ADA_LARGE_256",
  AZURE_ADA_LARGE_1024 = "AZURE_ADA_LARGE_1024",
  AZURE_ADA_LARGE_3072 = "AZURE_ADA_LARGE_3072",
  AZURE_ADA_SMALL_512 = "AZURE_ADA_SMALL_512",
  AZURE_ADA_SMALL_1536 = "AZURE_ADA_SMALL_1536",
  COHERE_MULTILINGUAL_V3 = "COHERE_MULTILINGUAL_V3",
  VERTEX_MULTIMODAL = "VERTEX_MULTIMODAL",
  OPENAI_ADA_LARGE_256 = "OPENAI_ADA_LARGE_256",
  OPENAI_ADA_LARGE_1024 = "OPENAI_ADA_LARGE_1024",
  OPENAI_ADA_LARGE_3072 = "OPENAI_ADA_LARGE_3072",
  OPENAI_ADA_SMALL_512 = "OPENAI_ADA_SMALL_512",
  OPENAI_ADA_SMALL_1536 = "OPENAI_ADA_SMALL_1536",
}

export interface CarbonConnectProps {
  orgName: string;
  brandIcon: string;
  loadingScreenColor: string;
  children?: ReactNode;
  tokenFetcher?: () => Promise<{ access_token: string }>;
  onSuccess?: (data: OnSuccessData) => void;
  onError?: (data: OnErrorData) => void;
  tags?: Record<string, TagValue>;
  maxFileSize?: number;
  environment?: string;
  entryPoint?: string | null;
  enabledIntegrations?: Integration[];
  primaryBackgroundColor?: string;
  primaryTextColor?: string;
  secondaryBackgroundColor?: string;
  secondaryTextColor?: string;
  allowMultipleFiles?: boolean;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>> | null;
  chunkSize?: number;
  overlapSize?: number;
  tosURL?: string;
  privacyPolicyURL?: string;
  alwaysOpen?: boolean;
  navigateBackURL?: string | null;
  backButtonText?: string;
  zIndex?: number;
  enableToasts?: boolean;
  embeddingModel?: EmbeddingGenerators;
  generateSparseVectors?: boolean;
  prependFilenameToChunks?: boolean;
  maxItemsPerChunk?: number;
  setPageAsBoundary?: boolean;
  showFilesTab?: boolean;
  useRequestIds?: boolean;
  useOcr?: boolean;
  parsePdfTablesWithOcr?: boolean;
}

const CarbonConnect: React.FC<CarbonConnectProps> = ({
  orgName,
  brandIcon,
  loadingScreenColor = "#3B82F6",
  children,
  tokenFetcher = () => {},
  onSuccess = () => {},
  onError = () => {},
  tags = {},
  maxFileSize = 20000000,
  environment = "PRODUCTION",
  entryPoint = null,
  enabledIntegrations = [
    {
      id: "LOCAL_FILES",
      chunkSize: 100,
      overlapSize: 10,
      maxFileSize: 20000000,
      allowMultipleFiles: true,
      skipEmbeddingGeneration: false,
      setPageAsBoundary: false,
      filePickerMode: "FILES",
      allowedFileTypes: [
        {
          extension: "csv",
        },
        {
          extension: "txt",
        },
        {
          extension: "pdf",
        },
      ],
    },
  ],
  primaryBackgroundColor = "#000000",
  primaryTextColor = "#FFFFFF",
  secondaryBackgroundColor = "#FFFFFF",
  secondaryTextColor = "#000000",
  allowMultipleFiles = false,
  open = false,
  setOpen = null,
  chunkSize = 1500,
  overlapSize = 20,
  tosURL = "https://carbon.ai/terms",
  privacyPolicyURL = "https://carbon.ai/privacy",
  alwaysOpen = false,
  navigateBackURL = null,
  backButtonText = "Go Back",
  zIndex = 1000,
  enableToasts = true,
  embeddingModel = EmbeddingGenerators.OPENAI,
  generateSparseVectors = false,
  prependFilenameToChunks = false,
  maxItemsPerChunk = null,
  setPageAsBoundary = false,
  showFilesTab = true,
  useRequestIds = false,
  useOcr = false,
  parsePdfTablesWithOcr = false,
}) => {
  const [activeStep, setActiveStep] = useState<string | number>(
    entryPoint === "LOCAL_FILES" || entryPoint === "WEB_SCRAPER"
      ? entryPoint
      : 0
  );

  const [requestIds, setRequestIds] = useState({});

  return (
    <CarbonProvider
      tokenFetcher={tokenFetcher}
      enabledIntegrations={enabledIntegrations}
      orgName={orgName}
      brandIcon={brandIcon}
      loadingScreenColor={loadingScreenColor}
      environment={environment}
      entryPoint={entryPoint}
      tags={tags}
      maxFileSize={maxFileSize}
      onSuccess={onSuccess}
      onError={onError}
      primaryBackgroundColor={primaryBackgroundColor}
      primaryTextColor={primaryTextColor}
      secondaryBackgroundColor={secondaryBackgroundColor}
      secondaryTextColor={secondaryTextColor}
      allowMultipleFiles={allowMultipleFiles}
      chunkSize={chunkSize}
      overlapSize={overlapSize}
      tosURL={tosURL}
      privacyPolicyURL={privacyPolicyURL}
      open={open}
      setOpen={setOpen}
      alwaysOpen={alwaysOpen}
      navigateBackURL={navigateBackURL}
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      backButtonText={backButtonText}
      enableToasts={enableToasts}
      zIndex={zIndex}
      embeddingModel={embeddingModel}
      generateSparseVectors={generateSparseVectors}
      prependFilenameToChunks={prependFilenameToChunks}
      maxItemsPerChunk={maxItemsPerChunk}
      setPageAsBoundary={setPageAsBoundary}
      showFilesTab={showFilesTab}
      useRequestIds={useRequestIds}
      requestIds={requestIds}
      setRequestIds={setRequestIds}
      useOcr={useOcr}
      parsePdfTablesWithOcr={parsePdfTablesWithOcr}
    >
      <IntegrationModal
        orgName={orgName}
        brandIcon={brandIcon}
        environment={environment}
        entryPoint={entryPoint}
        tags={tags}
        maxFileSize={maxFileSize}
        enabledIntegrations={enabledIntegrations}
        onSuccess={onSuccess}
        onError={onError}
        primaryBackgroundColor={primaryBackgroundColor}
        primaryTextColor={primaryTextColor}
        secondaryBackgroundColor={secondaryBackgroundColor}
        secondaryTextColor={secondaryTextColor}
        allowMultipleFiles={allowMultipleFiles}
        open={open}
        setOpen={setOpen}
        alwaysOpen={alwaysOpen}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        backButtonText={backButtonText}
        zIndex={zIndex}
        enableToasts={enableToasts}
        requestIds={requestIds}
      >
        {children}
      </IntegrationModal>
    </CarbonProvider>
  );
};

export { CarbonConnect };
