import React, { createContext, useContext, useState, useEffect } from 'react';

import { BASE_URL, onSuccessEvents, SYNC_FILES_ON_CONNECT, SYNC_SOURCE_ITEMS } from '../constants';
import { generateRequestId } from "../utils/helpers";
import { INTEGRATIONS_LIST } from "../utils/integrationsList";

const DEFAULT_CHUNK_SIZE = 1500;
const DEFAULT_OVERLAP_SIZE = 20;

const CarbonContext = createContext();

export const CarbonProvider = ({
  children,
  tokenFetcher,
  enabledIntegrations,
  orgName,
  brandIcon,
  loadingIconColor,
  environment,
  entryPoint,
  tags,
  maxFileSize,
  onSuccess,
  onError,
  primaryBackgroundColor,
  primaryTextColor,
  secondaryBackgroundColor,
  secondaryTextColor,
  allowMultipleFiles,
  chunkSize,
  overlapSize,
  maxFileCount,
  tosURL,
  privacyPolicyURL,
  open,
  setOpen,
  alwaysOpen,
  navigateBackURL,
  activeStep,
  setActiveStep,
  backButtonText,
  enableToasts,
  zIndex,
  embeddingModel,
  generateSparseVectors,
  prependFilenameToChunks,
  maxItemsPerChunk,
  setPageAsBoundary,
  showFilesTab,
  useRequestIds,
  requestIds,
  setRequestIds,
  useOcr,
  parsePdfTablesWithOcr,
  sendDeletionWebhooks
}) => {
  const [showModal, setShowModal] = useState(open);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [accessToken, setAccessToken] = useState(null);
  const [processedIntegrations, setProcessedIntegrations] = useState([]);
  const [entryPointIntegrationObject, setEntryPointIntegrationObject] =
    useState(null);
  const [whiteLabelingData, setWhiteLabelingData] = useState(null);

  const manageModalOpenState = (modalOpenState) => {
    if (alwaysOpen) return;
    if (!modalOpenState) {
      if (entryPoint === 'LOCAL_FILES' || entryPoint === 'WEB_SCRAPER')
        setActiveStep(entryPoint);
      else setActiveStep(0);
    }
    if (setOpen) setOpen(modalOpenState);
    setShowModal(modalOpenState);
  };

  const authenticatedFetch = async (url, options = {}, retry = true) => {
    try {
      const response = await fetch(url, {
        body: options.body,
        method: options.method,
        headers: options.headers
      });

      if (response.status === 401 && retry) {
        const response = await tokenFetcher();
        setAccessToken(response.access_token);

        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Token ${response.access_token}`,
          },
        };

        return await authenticatedFetch(url, newOptions, false); // Passing 'false' to avoid endless loop in case refreshing the token doesn't help
      }

      return response;
    } catch (err) {
      console.error(
        `[CarbonContext.js] Error in authenticatedFetch [${url}]: `,
        err
      );
    }
  };

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await tokenFetcher();
      setAccessToken(response.access_token);

      const whiteLabelingResponse = await authenticatedFetch(
        `${BASE_URL[environment]}/auth/v1/white_labeling`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Token ${response.access_token}`,
          },
        }
      );
      const whiteLabelingResponseData = await whiteLabelingResponse.json();
      setWhiteLabelingData(whiteLabelingResponseData);
    } catch (err) {
      setError(true);
      console.error('[CarbonContext.js] Error in fetchTokens: ', err);
    }
    setLoading(false);
  };

  // todo - handle multiple data sources - this is used for white labeling
  const handleServiceOAuthFlow = async (service) => {
    try {
      // const alreadyActiveOAuth = getFlag(service?.data_source_type);
      // if (alreadyActiveOAuth === 'true') {
      //   toast.error(
      //     `Please finish the ${service?.data_source_type} authentication before starting another.`
      //   );
      //   return;
      // }

      const chunkSizeValue =
        service?.chunkSize || chunkSize || DEFAULT_CHUNK_SIZE;
      const overlapSizeValue =
        service?.overlapSize || overlapSize || DEFAULT_OVERLAP_SIZE;
      const skipEmbeddingGeneration = service?.skipEmbeddingGeneration || false;
      const embeddingModelValue =
        service?.embeddingModel || embeddingModel || null;
      const generateSparseVectorsValue =
        service?.generateSparseVectors || generateSparseVectors || false;
      const prependFilenameToChunksValue =
        service?.prependFilenameToChunks || prependFilenameToChunks || false;
      const maxItemsPerChunkValue =
        service?.maxItemsPerChunk || maxItemsPerChunk || false;
      const syncFilesOnConnection = service?.syncFilesOnConnection ?? SYNC_FILES_ON_CONNECT;
      const setPageAsBoundaryValue = service?.setPageAsBoundary || setPageAsBoundary || false;
      const useOcrValue = service?.useOcr || useOcr || false;
      const parsePdfTablesWithOcrValue = service?.parsePdfTablesWithOcr || parsePdfTablesWithOcr || false;
      const syncSourceItems = service?.syncSourceItems ?? SYNC_SOURCE_ITEMS;

      let requestId = null
      if (useRequestIds) {
        requestId = generateRequestId(20)
        setRequestIds({ ...requestIds, [service?.data_source_type]: requestId })
      }

      const oAuthURLResponse = await authenticatedFetch(
        `${BASE_URL[environment]}/integrations/oauth_url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `Token ${accessToken}`,
          },
          body: JSON.stringify({
            tags: tags,
            service: service?.data_source_type,
            chunk_size: chunkSizeValue,
            chunk_overlap: overlapSizeValue,
            skip_embedding_generation: skipEmbeddingGeneration,
            embedding_model: embeddingModelValue,
            generate_sparse_vectors: generateSparseVectorsValue,
            prepend_filename_to_chunks: prependFilenameToChunksValue,
            ...(maxItemsPerChunkValue && { max_items_per_chunk: maxItemsPerChunkValue }),
            sync_files_on_connection: syncFilesOnConnection,
            set_page_as_boundary: setPageAsBoundaryValue,
            connecting_new_account: true,
            ...(requestId && { request_id: requestId }),
            use_ocr: useOcrValue,
            parse_pdf_tables_with_ocr: parsePdfTablesWithOcrValue,
            sync_source_items: syncSourceItems
          }),
        }
      );

      if (oAuthURLResponse.status === 200) {
        // setFlag(service?.data_source_type, true);
        onSuccess({
          status: 200,
          data: { request_id: requestId },
          integration: service?.data_source_type,
          action: onSuccessEvents.INITIATE,
          event: onSuccessEvents.INITIATE,
        });
        const oAuthURLResponseData = await oAuthURLResponse.json();

        window.open(oAuthURLResponseData.oauth_url, '_blank');
      }
    } catch (err) {
      console.error('[CarbonContext.js] Error in handleServiceOAuthFlow: ', err);
    }
  };

  useEffect(() => {
    let temp = [];
    for (let i = 0; i < INTEGRATIONS_LIST.length; i++) {
      const integration = INTEGRATIONS_LIST[i];
      const integrationOptions = enabledIntegrations.find(
        (enabledIntegration) =>
          enabledIntegration.id === integration.id && integration.active
      );
      if (!integrationOptions) continue;
      temp.push({ ...integrationOptions, ...integration });
    }
    setProcessedIntegrations(temp);

    if (entryPoint) {
      const obj = temp.find((integration) => integration.id === entryPoint);
      if (!obj) {
        const isIntegrationAvailable = INTEGRATIONS_LIST.find(
          (integration) => integration.id === entryPoint
        );
        if (isIntegrationAvailable)
          console.error(
            'Invalid entry point. Make sure that the integrations is enabled through enabledIntegrations prop.'
          );
        else
          console.error(
            'Invalid entry point. Make sure that right integration id is passed.'
          );
      }

      setEntryPointIntegrationObject(obj);
    }
  }, []);

  useEffect(() => {
    setShowModal(open);
  }, [open]);

  const contextValues = {
    accessToken,
    setAccessToken,
    fetchTokens,
    authenticatedFetch,
    enabledIntegrations,
    orgName,
    brandIcon,
    loadingIconColor,
    environment,
    entryPoint,
    tags,
    maxFileSize,
    onSuccess,
    onError,
    primaryBackgroundColor,
    primaryTextColor,
    secondaryBackgroundColor,
    secondaryTextColor,
    allowMultipleFiles,
    topLevelChunkSize: chunkSize,
    topLevelOverlapSize: overlapSize,
    processedIntegrations,
    entryPointIntegrationObject,
    defaultChunkSize: 1500,
    defaultOverlapSize: 20,
    maxFileCount,
    handleServiceOAuthFlow,
    whiteLabelingData,
    tosURL,
    privacyPolicyURL,
    open,
    setOpen,
    showModal,
    setShowModal,
    alwaysOpen,
    navigateBackURL,
    manageModalOpenState,
    activeStep,
    setActiveStep,
    backButtonText,
    enableToasts,
    zIndex,
    embeddingModel,
    generateSparseVectors,
    prependFilenameToChunks,
    maxItemsPerChunk,
    setPageAsBoundary,
    showFilesTab,
    setRequestIds,
    requestIds,
    useRequestIds,
    useOcr,
    parsePdfTablesWithOcr,
    loading,
    sendDeletionWebhooks
  };

  return (
    <CarbonContext.Provider value={contextValues}>
      {children}
    </CarbonContext.Provider>
  );
};

export const useCarbon = () => {
  const context = useContext(CarbonContext);
  if (context === undefined) {
    throw new Error('useCarbon must be used within an CarbonProvider');
  }
  return context;
};

export default CarbonContext;
