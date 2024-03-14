import React, { useEffect, useState } from 'react';
import {
  Table,
  Column,
  InfiniteLoader,
  AutoSizer,
  SortDirection,
} from 'react-virtualized';
import { toast } from 'react-toastify';
import { useCarbon } from '../contexts/CarbonContext';
import {
  HiArrowLeft,
  HiChevronDown,
  HiChevronUp,
  HiSearch,
  HiX,
} from 'react-icons/hi';
import {
  getUserFiles,
  revokeAccessToDataSource,
  resyncFile,
} from 'carbon-connect-js';
import { BASE_URL, onSuccessEvents, SYNC_FILES_ON_CONNECT, TWO_STEP_OAUTH_CONNECTORS } from '../constants';
import { VscDebugDisconnect, VscLoading, VscSync } from 'react-icons/vsc';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { CiCircleList } from 'react-icons/ci';
import 'react-virtualized/styles.css'; // import styles
import resyncIcon from '../logos/resyncIcon.svg';
import FileSelector from './FileSelector';

import ZendeskScreen from './ZendeskScreen';
import ConfluenceScreen from './ConfluenceScreen';
import SharepointScreen from './SharepointScreen';
import { FcSettings } from 'react-icons/fc';

const ThirdPartyHome = ({
  integrationName,
  activeIntegrations,
  setActiveStep,
}) => {
  const [service, setService] = useState(null);
  const [integrationData, setIntegrationData] = useState(null);
  const [connected, setConnected] = useState([]);
  const [canConnectMore, setCanConnectMore] = useState(false);
  const [viewSelectedAccountData, setViewSelectedAccountData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('files'); // ['files', 'config']
  const [isRevokingDataSource, setIsRevokingDataSource] = useState(false);
  const [isResyncingDataSource, setIsResyncingDataSource] = useState(false);

  const [showAdditionalStep, setShowAdditionalStep] = useState(false);
  const [files, setFiles] = useState([]);
  const [sortedFiles, setSortedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);

  const [hasMoreFiles, setHasMoreFiles] = useState(true);
  const [offset, setOffset] = useState(0);

  const [showFileSelector, setShowFileSelector] = useState(false);
  const [sortState, setSortState] = useState({
    sortBy: '',
    sortDirection: 'ASC',
  });

  const {
    accessToken,
    processedIntegrations,
    entryPoint,
    authenticatedFetch,
    environment,
    tags,
    topLevelChunkSize,
    topLevelOverlapSize,
    defaultChunkSize,
    defaultOverlapSize,
    embeddingModel,
    generateSparseVectors,
    prependFilenameToChunks,
    maxItemsPerChunk,
    onSuccess
  } = useCarbon();

  // Fetching the active service data
  useEffect(() => {
    setService(
      processedIntegrations.find(
        (integration) => integration.id === integrationName
      )
    );
  }, [processedIntegrations]);

  useEffect(() => {
    const integrationData = processedIntegrations.find(
      (integration) => integration.id === integrationName
    );
    setIntegrationData(integrationData);
  }, [processedIntegrations]);

  useEffect(() => {
    const connected = activeIntegrations.filter(
      (integration) => integration.data_source_type === integrationName
    );
    setConnected(connected);

    if (connected.length === 1 && viewSelectedAccountData === null) {
      setViewSelectedAccountData(connected[0]);
    }
  }, [activeIntegrations]);

  // TODO: This useEffect will be removed when we enable multiple accounts for all integrations
  useEffect(() => {
    if (integrationName === 'NOTION') setCanConnectMore(true);
    // else if (connected.length !== 0) setCanConnectMore(false);
    else setCanConnectMore(true);

    setIsLoading(false);
  }, [connected, integrationName]);

  useEffect(() => {
    if (viewSelectedAccountData) {
      loadMoreRows();
    }
  }, [viewSelectedAccountData]);

  useEffect(() => {
    if (!files.length) return;
    setSortedFiles(files);
  }, [files]);

  useEffect(() => {
    setFilteredFiles(getFilteredFiles());
  }, [sortedFiles, searchQuery]);

  useEffect(() => {
    if (!showFileSelector && viewSelectedAccountData?.id) {
      loadMoreRows();
    }
  }, [showFileSelector]);

  const loadMoreRows = async () => {
    const userFilesResponse = await getUserFiles({
      accessToken: accessToken,
      environment: environment,
      offset: offset,
      filters: {
        organization_user_data_source_id: [viewSelectedAccountData.id],
      },
    });

    if (userFilesResponse.status === 200) {
      const count = userFilesResponse.data.count;
      const userFiles = userFilesResponse.data.results;
      const newFiles = [...files, ...userFiles];
      setFiles(newFiles);
      setOffset(offset + userFiles.length);

      if (count > offset + userFiles.length) {
        setHasMoreFiles(true);
      } else {
        setHasMoreFiles(false);
      }
    } else {
      setHasMoreFiles(false);
    }
  };

  const isRowLoaded = ({ index }) => {
    return !!files[index];
  };

  const dateCellRenderer = ({ cellData }) => {
    const dateString = new Date(cellData).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

    const timeString = new Date(cellData).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit',
      hour12: true,
    });

    return (
      <span className="cc-inline-block cc-mx-0.5 cc-py-1 cc-text-xs cc-font-normal cc-rounded-full cc-text-center ">{`${dateString} ${timeString}`}</span>
    );
  };

  const statusCellRenderer = ({ cellData }) => {
    let pillClass =
      'cc-inline-block cc-flex cc-items-center cc-space-x-1.5 cc-mx-2.5';
    let textClass = 'cc-text-xs ';
    let dotClass = 'cc-w-2 cc-h-2 cc-rounded-full ';
    // cc-px-2 cc-py-1 cc-text-xs cc-font-normal cc-rounded-full cc-text-center

    switch (cellData) {
      case 'READY':
        pillClass += 'cc-text-green-700'; // cc-bg-green-300'; // Green for READY
        dotClass += 'cc-bg-green-500';
        break;
      case 'SYNCING':
      case 'QUEUED_FOR_SYNCING':
      case 'DELAYED':
        pillClass += 'cc-text-blue-700'; // cc-bg-blue-300'; // Blue for SYNCING
        dotClass += 'cc-bg-blue-500';
        break;
      // case 'QUEUED_FOR_SYNCING':
      //   pillClass += 'cc-text-yellow-700'; // cc-bg-yellow-300'; // Yellow for QUEUED_FOR_SYNCING
      //   dotClass += 'cc-bg-yellow-500';
      //   break;
      case 'SYNC_ERROR':
        pillClass += 'cc-text-red-700'; // cc-bg-red-300'; // Red for SYNC_ERROR
        dotClass += 'cc-bg-red-500';
        break;
      // case 'DELAYED':
      //   pillClass += 'cc-text-gray-700'; // cc-bg-gray-300'; // Grey for DELAYED
      //   dotClass += 'cc-bg-gray-500';
      //   break;
      default:
        pillClass += 'cc-text-blue-700'; // cc-bg-blue-300'; // Blue for any other status
        dotClass += 'cc-bg-blue-500';
    }

    const statusText = cellData[0] + cellData.slice(1).toLowerCase();
    return (
      <span className={pillClass}>
        <div className={dotClass} />
        <span className={textClass}>
          {cellData === 'READY'
            ? 'Ready'
            : cellData === 'SYNC_ERROR'
              ? 'Error'
              : 'In Progress'}
        </span>
      </span>
    );
  };

  const resyncCellRenderer = ({ rowData }) => {
    return (
      <img
        className="cc-rounded-lg cc-w-4 cc-h-4 cc-border-gray-300 cc-focus:cc-ring-0 cc-focus:cc-border-black cc-cursor-pointer cc-flex cc-items-center cc-justify-center cc-mx-auto"
        src={resyncIcon}
        alt="Resync File"
        onClick={() => performFileResync(rowData)}
      />
    );
  };

  const performFileResync = async (rowData) => {
    const chunkSize =
      service?.chunkSize || topLevelChunkSize || defaultChunkSize;
    const overlapSize =
      service?.overlapSize || topLevelOverlapSize || defaultOverlapSize;

    const resyncFileResponse = await resyncFile({
      accessToken: accessToken,
      fileId: rowData.id,
      environment: environment,
      chunkSize: chunkSize,
      chunkOverlap: overlapSize,
    });

    if (resyncFileResponse.status === 200) {
      const fileData = resyncFileResponse.data;

      // Update the file in the files array
      const fileIndex = files.findIndex((file) => file.id === fileData.id);

      // Update the file in the sortedFiles array
      const sortedFileIndex = sortedFiles.findIndex(
        (file) => file.id === fileData.id
      );

      const newFiles = [...files];
      const newSortedFiles = [...sortedFiles];

      newFiles[fileIndex] = fileData;
      newSortedFiles[sortedFileIndex] = fileData;

      setFiles(newFiles);
      setSortedFiles(newSortedFiles);

      toast.success('Resync initiated');
    } else {
      toast.error('Error resyncing file');
      console.error('Error resyncing file: ', resyncFileResponse.error);
    }
  };

  const headerRenderer = ({ label, dataKey }) => (
    <div className="cc-flex cc-flex-row cc-items-center cc-space-x-2 cc-text-left cc-text-xs cc-font-normal cc-text-gray-500 cc-py-1 cc-capitalize cc-px-0 cc-truncate">
      <span>{label.toUpperCase()}</span>

      {sortState.sortBy === dataKey &&
        (sortState.sortDirection === SortDirection.ASC ? (
          <HiChevronUp className="cc-w-4 cc-h-4" />
        ) : (
          <HiChevronDown className="cc-w-4 cc-h-4" />
        ))}
    </div>
  );

  const headerRowRenderer = ({ columns }) => (
    <div
      className="cc-flex cc-flex-row cc-items-center cc-space-x-1 cc-text-left cc-text-sm cc-font-semibold cc-text-gray-500 cc-py-1 cc-mb-1 cc-border-b"
      role="row"
    >
      {columns}
    </div>
  );

  const sort = ({ sortBy, sortDirection }) => {
    const { sortBy: prevSortBy, sortDirection: prevSortDirection } = sortState;

    if (prevSortDirection === SortDirection.DESC) {
      sortBy = null;
      sortDirection = null;
    }

    const tempFiles = [...files];
    if (sortBy && sortDirection) {
      tempFiles.sort((a, b) => {
        if (a[sortBy] < b[sortBy])
          return sortDirection === SortDirection.ASC ? -1 : 1;
        if (a[sortBy] > b[sortBy])
          return sortDirection === SortDirection.ASC ? 1 : -1;
        return 0;
      });
    }
    setSortedFiles(tempFiles);
    setSortState({ sortBy, sortDirection });
  };

  const handleAddAccountClick = async () => {
    if (TWO_STEP_OAUTH_CONNECTORS.indexOf(integrationName) !== -1)
      setShowAdditionalStep(true);
    else {
      toast.info(
        'You will be redirected to the service to connect your account'
      );
      await sendOauthRequest();
    }
  }

  const sendOauthRequest = async () => {
    try {
      const oauthWindow = window.open('', '_blank');
      oauthWindow.document.write('Loading...');

      const chunkSizeValue =
        service?.chunkSize || topLevelChunkSize || defaultChunkSize;
      const overlapSizeValue =
        service?.overlapSize || topLevelOverlapSize || defaultOverlapSize;
      const skipEmbeddingGeneration = service?.skipEmbeddingGeneration || false;
      const embeddingModelValue =
        service?.embeddingModel || embeddingModel || null;
      const generateSparseVectorsValue =
        service?.generateSparseVectors || generateSparseVectors || false;
      const prependFilenameToChunksValue =
        service?.prependFilenameToChunks || prependFilenameToChunks || false;
      const maxItemsPerChunkValue =
        service?.maxItemsPerChunk || maxItemsPerChunk || false;
      const syncFilesOnConnection = service?.syncFilesOnConnection ?? SYNC_FILES_ON_CONNECT

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
            sync_files_on_connection: syncFilesOnConnection
          }),
        }
      );

      const oAuthURLResponseData = await oAuthURLResponse.json();

      if (oAuthURLResponse.status === 200) {
        // setFlag(service?.data_source_type, true);
        onSuccess({
          status: 200,
          data: null,
          integration: service?.data_source_type,
          action: onSuccessEvents.INITIATE,
          event: onSuccessEvents.INITIATE,
        });

        oauthWindow.location.href = oAuthURLResponseData.oauth_url;
      } else {
        oauthWindow.document.write(oAuthURLResponseData.detail);
      }
    } catch (err) {
      console.log('[ThirdPartyHome.js] Error in handleServiceOAuthFlow: ', err);
    }
  };

  // Filter function for search
  const getFilteredFiles = () => {
    if (!searchQuery) return sortedFiles;
    const temp = sortedFiles.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return temp;
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const toggleFileSelector = () => {
    setShowFileSelector((prevShowFileSelector) => {
      return !prevShowFileSelector;
    });
    setSearchQuery('');
  };

  const resyncDataSource = async () => {
    setIsResyncingDataSource(true);
    const requestBody = {
      data_source_id: viewSelectedAccountData.id,
    };

    const resyncDataSourceResponse = await authenticatedFetch(
      `${BASE_URL[environment]}/integrations/items/sync`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (resyncDataSourceResponse.status === 200) {
      toast.success('Fetching files');
    } else {
      toast.error('Error fetching files');
    }
    setIsResyncingDataSource(false);
  };

  return (
    <div className="cc-h-full cc-w-full cc-flex cc-flex-col">
      <div
        className="cc-flex cc-flex-row cc-w-full cc-h-28 cc-items-center cc-px-4 cc-justify-between cc-bg-gray-200 cc-rounded-t-[6px] cc-space-x-2"
        style={{
          backgroundColor:
            integrationData?.branding?.header?.primaryBackgroundColor ??
            '#F5F5F5',
        }}
      >
        <div className="cc-flex cc-flex-row cc-items-center cc-space-x-4 cc-w-full ">
          <div className="cc-flex cc-flex-row cc-items-center cc-space-x-4">
            <HiArrowLeft
              onClick={() => {
                if (!entryPoint) setActiveStep(1);
                else setActiveStep(0);
              }}
              className="cc-cursor-pointer cc-h-6 cc-w-6 cc-text-gray-400"
            />

            {/* Logo */}
            <div className="cc-flex cc-bg-white cc-border cc-rounded-md cc-w-20 cc-h-20 cc-translate-y-0 md:cc-w-28 md:cc-h-28 md:cc-translate-y-4 cc-items-center cc-justify-center">
              <img
                className="cc-w-12 cc-h-12 md:cc-w-16 md:cc-h-16"
                src={integrationData?.logo}
                alt="Integration Logo"
              />
            </div>
          </div>

          <div className="cc-flex cc-flex-col md:cc-flex-row cc-space-y-2 cc-mr-2 cc-grow cc-justify-around md:cc-justify-between md:cc-space-x-4">
            <div className="">
              {/* Name */}
              <div
                className="cc-flex cc-space-x-2 cc-text-xl cc-items-center cc-text-black"
                style={{
                  color:
                    integrationData?.branding?.header?.primaryTextColor ??
                    '#000000',
                }}
              >
                <p>{integrationData?.name}</p>
              </div>

              {/* Description */}
              <div
                className="cc-text-[0.5rem] md:cc-text-xs cc-text-gray-500 cc-truncate cc-hidden md:cc-block"
                style={{
                  color:
                    integrationData?.branding?.header?.secondaryTextColor ??
                    '#000000',
                }}
              >
                {integrationData?.description}
              </div>
            </div>

            {!isLoading && connected?.length === 0 ? (
              !showAdditionalStep && (
                <button
                  className="cc-text-white cc-cursor-pointer cc-py-2 cc-px-4 cc-text-xs cc-rounded-md cc-w-1/3 sm:cc-w-2/3 md:cc-w-1/4 lg:cc-w-1/4 cc-text-center cc-truncate"
                  style={{
                    backgroundColor:
                      integrationData?.branding?.header?.primaryButtonColor ??
                      '#000000',
                    color:
                      integrationData?.branding?.header?.primaryLabelColor ??
                      '#FFFFFF',
                  }}
                  onClick={() => handleAddAccountClick()}
                >
                  Connect Account
                </button>
              )
            ) : (
              <select
                className="cc-py-2 cc-px-4 cc-text-xs cc-rounded-md cc-w-1/3 sm:cc-w-full md:cc-w-1/3 cc-truncate cc-text-left cc-bg-white cc-border cc-border-gray-300 cc-cursor-pointer"
                onChange={async (e) => {
                  if (e.target.value === 'add-account') {
                    handleAddAccountClick();
                    e.target.value = ''; // Reset the select value
                  } else if (e.target.value === '') {
                    setViewSelectedAccountData(null);
                  } else {
                    const selectedAccount = connected.find(
                      (account) =>
                        account.data_source_external_id === e.target.value
                    );
                    if (selectedAccount) {
                      setOffset(0);
                      setFiles([]);
                      setViewSelectedAccountData(selectedAccount || null);
                    } else {
                      toast.error('Error fetching files');
                    }
                  }
                }}
              >
                <option value="" className="cc-bg-white">
                  Select Account
                </option>
                {connected.map((account) => {
                  const connectedAccountEmail =
                    account.data_source_external_id.split('|')[1] ||
                    account.data_source_external_id.split('-')[1];
                  return (
                    <option
                      key={account.id}
                      value={account.data_source_external_id}
                      selected={
                        viewSelectedAccountData?.id === account.id
                          ? 'selected'
                          : ''
                      }
                    >
                      {connectedAccountEmail}
                    </option>
                  );
                })}
                {canConnectMore && (
                  <>
                    <hr className="cc-border-gray-300 cc-my-1" />
                    <option value="add-account">Add Account</option>
                  </>
                )}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="cc-grow cc-flex cc-flex-col cc-py-2 cc-px-4 cc-space-y-4">
        {isLoading ? (
          <div className="cc-flex cc-flex-col cc-grow cc-items-center cc-justify-center">
            <div className="cc-spinner cc-w-10 cc-h-10 cc-border-2 cc-border-t-4 cc-border-gray-200 cc-rounded-full cc-animate-spin"></div>
          </div>
        ) : viewSelectedAccountData ? (
          <div className="cc-flex-col cc-flex md:cc-translate-y-4 cc-text-sm cc-h-full cc-mb-4">
            <div className="cc-flex cc-border-b cc-mb-0">
              <button
                className={`cc-flex cc-py-2 cc-px-2 cc-text-center cc-cursor-pointer ${activeTab === 'files'
                  ? 'cc-border-b-4 cc-font-bold'
                  : 'cc-font-normal'
                  } cc-items-left cc-space-x-2 cc-justify-center cc-w-fit-content`}
                onClick={() => setActiveTab('files')}
              >
                Files
              </button>
              <button
                className={`cc-flex cc-py-2 cc-px-2 cc-text-center cc-cursor-pointer ${activeTab === 'config'
                  ? 'cc-border-b-2 cc-font-bold'
                  : 'cc-font-normal'
                  } cc-items-center cc-space-x-2 cc-justify-center cc-w-fit-content`}
                onClick={() => setActiveTab('config')}
              >
                Configuration
              </button>
            </div>

            {activeTab === 'files' && (
              <div className="cc-w-full cc-flex cc-flex-col cc-space-y-2 cc-border-t cc-h-full cc-py-2">
                {/* Common Action Bar */}
                <div className="cc-flex cc-flex-row cc-h-6 cc-items-center cc-space-x-2 cc-w-full cc-px-2 cc-my-2 cc-justify-between">
                  {/* Search Input */}
                  <label class="relative block cc-w-64  cc-flex cc-flex-row">
                    {/* <span class="sr-only">Search</span> */}
                    <span class="absolute inset-y-0 left-0 flex items-center pl-2">
                      <HiSearch className="cc-w-4 cc-h-4" />
                    </span>
                    <input
                      class="placeholder:italic placeholder:text-slate-400 block bg-white w-full border border-gray-200 rounded-md py-1 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-0 sm:text-sm"
                      placeholder="Search"
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </label>

                  {/* Switcher */}
                  <div className="cc-flex cc-flex-row cc-space-x-0 cc-border cc-rounded-md">
                    <button
                      className={`cc-flex cc-p-0.5 cc-text-center cc-cursor-pointer cc-items-center cc-justify-center cc-w-6 cc-text-xs cc-h-6 cc-rounded-l-md
                      ${showFileSelector ? '' : 'cc-bg-gray-300 cc-text-black'}
                      `}
                      onClick={() => {
                        toggleFileSelector();
                      }}
                    >
                      <CiCircleList className="cc-w-4 cc-h-4" />
                    </button>
                    <button
                      className={`cc-flex cc-p-0.5 cc-text-center cc-cursor-pointer cc-items-center cc-justify-center cc-w-6 cc-text-xs cc-h-6 cc-rounded-r-md
                      ${showFileSelector ? 'cc-bg-gray-300 cc-text-black' : ''
                        }`}
                      onClick={() => {
                        toggleFileSelector();
                      }}
                    >
                      <IoCloudUploadOutline className="cc-w-4 cc-h-4" />
                    </button>
                  </div>
                </div>

                {showFileSelector ? (
                  <FileSelector
                    account={viewSelectedAccountData}
                    searchQuery={searchQuery}
                    files={files}
                  />
                ) : viewSelectedAccountData.synced_files.length === 0 ? (
                  <div className="cc-flex cc-flex-col cc-items-center cc-justify-center cc-grow">
                    <p className="cc-text-gray-500 cc-text-sm">
                      No files synced
                    </p>
                  </div>
                ) : (
                  <div className="cc-flex cc-w-full cc-grow cc-flex-col cc-pb-4">
                    <InfiniteLoader
                      isRowLoaded={isRowLoaded}
                      loadMoreRows={loadMoreRows}
                      rowCount={hasMoreFiles ? files.length + 1 : files.length}
                    >
                      {({ onRowsRendered, registerChild }) => (
                        <AutoSizer>
                          {({ width, height }) => {
                            return (
                              <div className="cc-flex cc-grow cc-w-full">
                                <Table
                                  headerRowRenderer={headerRowRenderer}
                                  width={width - 2 || 688}
                                  height={height - 2 || 200}
                                  // height={100}
                                  headerHeight={20}
                                  rowHeight={40}
                                  // rowCount={sortedFiles.length}
                                  // rowGetter={({ index }) => sortedFiles[index]}
                                  rowCount={filteredFiles.length}
                                  rowGetter={({ index }) =>
                                    filteredFiles[index]
                                  }
                                  onRowsRendered={onRowsRendered}
                                  ref={registerChild}
                                  // onRowClick={({ index }) => {
                                  //   // const selectedFile = sortedFiles[index];
                                  //   const selectedFile = filteredFiles[index];
                                  //   if (!selectedFile) return;
                                  //   handleCheckboxChange(
                                  //     selectedFile.id,
                                  //     !selectedRows.has(selectedFile.id)
                                  //   );
                                  // }}
                                  rowClassName={({ index }) => {
                                    let className =
                                      'cc-py-2 cc-pr-2 hover:cc-cursor-pointer hover:cc-bg-gray-50 cc-border-b cc-border-gray-200 cc-flex cc-flex-row cc-items-center cc-w-full cc-h-20';

                                    // className +=
                                    //   index % 2 === 0
                                    //     ? 'cc-bg-white'
                                    //     : 'cc-bg-gray-100';

                                    return className;
                                  }}
                                  sort={sort}
                                  sortBy={sortState.sortBy}
                                  sortDirection={sortState.sortDirection}
                                >
                                  <Column
                                    label="File Name"
                                    dataKey="name"
                                    width={width / 3}
                                    className="cc-text-xs"
                                    headerRenderer={headerRenderer}
                                    sortBy={sortState.sortBy}
                                  />
                                  <Column
                                    label="Status"
                                    dataKey="sync_status"
                                    width={width / 4}
                                    cellRenderer={statusCellRenderer}
                                    headerRenderer={headerRenderer}
                                  />
                                  <Column
                                    label="Last Sync Time"
                                    dataKey="last_sync"
                                    width={width / 4}
                                    cellRenderer={dateCellRenderer}
                                    headerRenderer={headerRenderer}
                                  />
                                  <Column
                                    label=""
                                    dataKey=""
                                    width={50}
                                    cellRenderer={resyncCellRenderer}
                                    headerRenderer={() => <></>}
                                  />
                                </Table>
                              </div>
                            );
                          }}
                        </AutoSizer>
                      )}
                    </InfiniteLoader>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'config' && (
              <div className="cc-flex cc-flex-row cc-w-full cc-border cc-rounded-md cc-border-gray-300 cc-mt-4 cc-px-4 cc-py-4 cc-items-center cc-space-x-4">
                <h1 className="cc-grow cc-font-semibold">
                  {viewSelectedAccountData.data_source_external_id.split(
                    '|'
                  )[1] ||
                    viewSelectedAccountData.data_source_external_id.split(
                      '-'
                    )[1]}
                </h1>
                <VscSync
                  onClick={resyncDataSource}
                  className={`cc-cursor-pointer cc-text-gray-500 cc-h-6 cc-w-6 ${isResyncingDataSource ? 'animate-spin' : ''
                    }`}
                />
                {integrationName === 'NOTION' && (
                  <FcSettings
                    onClick={handleNewAccountClick}
                    className="cc-cursor-pointer cc-text-gray-500 cc-h-6 cc-w-6"
                  />
                )}

                <button
                  className="cc-text-red-600 cc-bg-red-200 cc-px-4 cc-py-2 cc-font-semibold cc-rounded-md cc-flex cc-items-center cc-space-x-2 cc-cursor-pointer"
                  onClick={async () => {
                    setIsRevokingDataSource(true);
                    const revokeAccessResponse = await revokeAccessToDataSource(
                      {
                        accessToken: accessToken,
                        environment: environment,
                        dataSourceId: viewSelectedAccountData.id,
                      }
                    );
                    if (revokeAccessResponse.status === 200) {
                      toast.success('Successfully disconnected account');
                      setIsRevokingDataSource(false);
                      setViewSelectedAccountData(null);
                      setActiveStep(1);
                    } else {
                      toast.error('Error disconnecting account');
                      setIsRevokingDataSource(false);
                    }
                  }}
                >
                  {isRevokingDataSource ? (
                    <VscLoading className="animate-spin" />
                  ) : (
                    <VscDebugDisconnect />
                  )}

                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="cc-grow cc-w-full cc-h-full cc-items-center cc-justify-center cc-flex">
            {connected.length === 0 ? (
              showAdditionalStep ? (
                (integrationName === 'ZENDESK' && (
                  <ZendeskScreen
                    buttonColor={
                      integrationData?.branding?.header?.primaryButtonColor
                    }
                    labelColor={
                      integrationData?.branding?.header?.primaryLabelColor
                    }
                  />
                )) ||
                (integrationName === 'CONFLUENCE' && (
                  <ConfluenceScreen
                    buttonColor={
                      integrationData?.branding?.header?.primaryButtonColor
                    }
                    labelColor={
                      integrationData?.branding?.header?.primaryLabelColor
                    }
                  />
                )) ||
                (integrationName === 'SHAREPOINT' && (
                  <SharepointScreen
                    buttonColor={
                      integrationData?.branding?.header?.primaryButtonColor
                    }
                    labelColor={
                      integrationData?.branding?.header?.primaryLabelColor
                    }
                  />
                ))
              ) : (
                <div className="cc-flex cc-flex-col cc-items-center cc-justify-center">
                  <p className="cc-text-gray-500 cc-text-sm">
                    No account connected
                  </p>
                </div>
              )
            ) : (
              <div className="cc-flex cc-flex-col cc-items-center cc-justify-center">
                <p className="cc-text-gray-500 cc-text-sm">
                  Select an account to view files
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThirdPartyHome;
