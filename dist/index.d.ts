import React, { ReactNode } from "react";
import "./index.css";
export declare enum ActionType {
    INITIATE = "INITIATE",
    ADD = "ADD",
    UPDATE = "UPDATE",
    CANCEL = "CANCEL"
}
export declare enum IntegrationName {
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
    GITHUB = "GITHUB"
}
export declare enum SyncStatus {
    READY = "READY",
    QUEUED_FOR_SYNCING = "QUEUED_FOR_SYNCING",
    SYNCING = "SYNCING",
    SYNC_ERROR = "SYNC_ERROR"
}
export declare enum FilePickerMode {
    FILES = "FILES",
    FOLDERS = "FOLDERS",
    BOTH = "BOTH"
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
export type Integration = LocalFilesIntegration | WebScraperIntegration | BaseIntegration;
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
    file_statistics: object;
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
    data?: object;
}
export type TagValue = string | number | string[] | number[];
export declare enum EmbeddingGenerators {
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
    OPENAI_ADA_SMALL_1536 = "OPENAI_ADA_SMALL_1536"
}
export interface CarbonConnectProps {
    orgName: string;
    brandIcon: string;
    children?: ReactNode;
    tokenFetcher?: () => Promise<{
        access_token: string;
    }>;
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
declare const CarbonConnect: React.FC<CarbonConnectProps>;
export { CarbonConnect };
