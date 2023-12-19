import React, { useEffect, useState } from 'react';
import {
  getUserFiles,
  revokeAccessToDataSource,
  generateOauthurl,
  resyncFile,
} from 'carbon-connect-js';
import { BASE_URL, onSuccessEvents } from '../constants';
import { useCarbon } from '../contexts/CarbonContext';
import {
  Table,
  Column,
  InfiniteLoader,
  AutoSizer,
  SortDirection,
} from 'react-virtualized';
import { CiFolderOn, CiFileOn } from 'react-icons/ci';
import {
  HiChevronDown,
  HiChevronRight,
  HiChevronUp,
  HiDocument,
  HiFolder,
} from 'react-icons/hi';
import { toast } from 'react-toastify';

const FileSelector = ({ account, searchQuery, files }) => {
  const {
    accessToken,
    processedIntegrations,
    entryPoint,
    authenticatedFetch,
    environment,
    topLevelChunkSize,
    topLevelOverlapSize,
    defaultChunkSize,
    defaultOverlapSize,
    tags,
  } = useCarbon();

  // This holds the loading state of the files data.
  const [isLoading, setIsLoading] = useState(false);

  // Active third party service. This is the service that the user has clicked on.
  const [service, setService] = useState(null);

  // This holds the currently selected files. Used for breadcrumb.
  const [pwd, setPwd] = useState([
    { id: null, name: '', offset: 0, hasMoreFiles: true, parentId: null },
  ]);

  // This holds the currently viewing folder's id. The parent id of the files.
  const [parentId, setParentId] = useState(null);

  // This holds the account data which the user has selected.
  //   const [account, setAccount] = useState(null);

  // This is the master data. This holds the entire files tree / objects returned from the API (iteratively).
  // We use this to select the active files list.
  const [filesMasterList, setFilesMasterList] = useState([]);

  // This is the unsorted list of files returned from the API.
  // This is used to show the list of files in the table in its original order.
  const [activeFilesList, setActiveFilesList] = useState([]);

  // This is the sorted list of files. This is the actual data shown in the table.
  // If the user clicks the unsorted view on the header, we assign the active files list to this.
  const [sortedFilesList, setSortedFilesList] = useState([]);

  // This holds the filtered files list.
  const [filteredFilesList, setFilteredFilesList] = useState([]);

  // This flag holds the boolean value of whether there are more files to load.
  const [hasMoreFiles, setHasMoreFiles] = useState(true);

  // Used for managing the sort state of the table
  const [sortState, setSortState] = useState({
    sortBy: '',
    sortDirection: 'ASC',
  });

  // This holds the offset value for the API call.
  const [offset, setOffset] = useState(0);

  // Selected files list. This is the list of files that the user has selected.
  const [selectedFilesList, setSelectedFilesList] = useState([]);

  // How the file selector works:
  // 1. We fetch the files data from the API and store it in the filesMasterList.
  // 2. We set the activeFilesList to the filesMasterList.
  // 3. We set the sortedFilesList to the activeFilesList. This is unsorted by default.
  // 4. We set the filteredFilesList to the sortedFilesList. This is unfiltered by default.
  // 5. When the user clicks the unsorted view on the header, we set the sortedFilesList to the activeFilesList.
  // 6. When the user types in the search bar, we set the filteredFilesList to the sortedFilesList.
  // 7. When the user clicks on a folder, we set the activeFilesList to the children of the folder.
  // 8. When the user clicks on the breadcrumb, we set the activeFilesList to the children of the folder.

  // How the data is updated:
  // 1. When the user scrolls to the end or enters inside a folder, we fetch the files data from the API.
  // 2. We append the data to the filesMasterList.
  // 3. We also set the activeFilesList to the children of the folder.
  // 4. We also set the sortedFilesList to the activeFilesList.
  // 5. We also set the filteredFilesList to the sortedFilesList.

  // Fetching the active service data
  useEffect(() => {
    setService(
      processedIntegrations.find(
        (integration) => integration.id === account.data_source_type
      )
    );
  }, [processedIntegrations]);

  // Fetches the initial files data from the API.
  // This useEffect is executed whenever there is a change to the pwd.
  // The first call happens with the root folder id i.e., null and an offset of 0.
  useEffect(() => {
    if (pwd.length > 0) {
      const lastPwd = pwd[pwd.length - 1];

      // We update the filesMasterList with the files data in this method.
      // TODO: Add/Update offset and hasMoreFiles to fileMasterList as well.
      fetchUserFilesMetaData(lastPwd.id, lastPwd.offset);
    }
  }, [pwd]);

  // Once the files data is fetched, we set the active files list to the master list.
  // We will also set the active files list to the selected folder's list using the master file data and parent id.
  // NOTE: This is a recursive logic and crucial to the working of the file selector.
  useEffect(() => {
    let temp = filesMasterList;
    for (const p of pwd) {
      if (p.id === null) {
        continue;
      } else {
        temp = temp.find((file) => file.id === p.id)?.children || [];
      }
    }
    setActiveFilesList(temp);
    // console.log('[FileSelector] filesMasterList: ', filesMasterList, pwd);
  }, [filesMasterList]);

  // Once the active files list is set, we set the sorted files list to the active files list.
  // This sorted file data is used to show the files in the table. This is updated when the active files list is updated.
  // or when the user clicks the unsorted view on the header.
  useEffect(() => {
    if (!activeFilesList.length) setSortedFilesList([]);
    else setSortedFilesList(activeFilesList);
    // console.log('[FileSelector] activeFilesList: ', activeFilesList);
  }, [activeFilesList]);

  // Once the sorted files list is set, we set the filtered files list to the sorted files list.
  useEffect(() => {
    const filteredFiles = getFilteredFiles();
    setFilteredFilesList(filteredFiles);
    // console.log('[FileSelector] filteredFiles: ', filteredFiles);
  }, [sortedFilesList, searchQuery]);

  // File sync related
  const fetchUserFilesMetaData = async (parentId = null, offset = 0) => {
    console.log(
      '[FileSelector] fetchUserFilesMetaData: ',
      parentId,
      offset,
      account
    );
    const requestBody = {
      // TODO: Uncomment this before launching.
      // data_source_id: account?.id,
      // TODO: Remove this before launching.
      data_source_id: 1668,
      pagination: {
        offset: offset,
      },
    };

    console.log('[FileSelector] requestBody: ', requestBody);
    if (parentId) {
      requestBody.parent_id = parentId.toString();
    }

    const userFilesMetaDataResponse = await authenticatedFetch(
      `${BASE_URL[environment]}/integrations/items/list`,
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (userFilesMetaDataResponse.status === 200) {
      const userFilesMetaData = await userFilesMetaDataResponse.json();
      const count = userFilesMetaData?.count;
      const userFiles = userFilesMetaData?.items;
      setOffset(offset + userFiles.length);

      if (count > offset + userFiles.length) {
        setHasMoreFiles(true);
      } else {
        setHasMoreFiles(false);
      }

      if (!parentId) {
        setFilesMasterList((prev) => [
          ...prev,
          ...(userFilesMetaData?.items || []),
        ]);
      } else {
        // We are inside a folder. We have to append the files list to the children of the parent folder.
        // We need to find the parent folder in the master files list and append the children to it.
        let newFilesMasterList = [...filesMasterList];
        let currentLevel = newFilesMasterList;
        for (const dir of pwd.slice(1)) {
          const folderIndex = currentLevel.findIndex((f) => f.id === dir.id);
          if (folderIndex !== -1) {
            if (!currentLevel[folderIndex].children) {
              currentLevel[folderIndex].children = [];
            }
            if (dir.id === parentId) {
              currentLevel[folderIndex].children = [
                ...currentLevel[folderIndex].children,
                ...userFiles,
              ];
              break;
            }
            currentLevel = currentLevel[folderIndex].children;
          }
        }
        setFilesMasterList(newFilesMasterList);
      }
    }
  };

  const syncSelectedFiles = async () => {
    const chunkSize =
      service?.chunkSize || topLevelChunkSize || defaultChunkSize;
    const overlapSize =
      service?.overlapSize || topLevelOverlapSize || defaultOverlapSize;
    const skipEmbeddingGeneration = service?.skipEmbeddingGeneration || false;

    const requestBody = {
      data_source_id: 1668,
      ids: [...selectedFilesList],
      tags: tags,
      chunk_size: chunkSize,
      chunk_overlap: overlapSize,
      skip_embedding_generation: skipEmbeddingGeneration,
    };

    const syncFilesResponse = await authenticatedFetch(
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

    if (syncFilesResponse.status === 200) {
      const syncFilesResponseData = await syncFilesResponse.json();
      console.log('[FileSelector] syncFiles: ', syncFilesResponseData);
      setSelectedFilesList([]);

      toast.success('Files synced successfully!');
    } else {
      toast.error('Files sync failed!');

      setSelectedFilesList([]);
    }
  };

  // BreadCrumb related
  // Function to update pwd when navigating to a new directory
  // const navigateToDirectory = (directoryId, directoryName) => {
  //   // Logic to update pwd and fetch new directory data
  //   // Assuming directoryId and directoryName are passed when a directory is clicked
  //   setPwd([...pwd, { id: directoryId, name: directoryName }]);
  //   // Fetch new directory data...
  // };

  // Function to handle breadcrumb navigation
  const onBreadcrumbClick = (index) => {
    // Navigate to the clicked directory in the breadcrumb
    const newPwd = pwd.slice(0, index + 1);
    // console.log('[FileSelector] onBreadcrumbClick: ', newPwd);
    setPwd(newPwd);
    // Fetch data for the selected directory...
  };

  // Breadcrumb UI
  const Breadcrumbs = () => (
    <div className="cc-flex cc-items-center cc-space-x-2 cc-text-sm cc-px-2">
      <span key={-1} onClick={() => onBreadcrumbClick(null)}>
        <CiFolderOn className="cc-w-5 cc-h-5 cc-cursor-pointer cc-text-yellow-500" />
      </span>
      {pwd.slice(1).map((dir, index, arr) => (
        <>
          <HiChevronRight className="cc-w-3 cc-h-3" />
          <span
            key={dir.id}
            onClick={() => onBreadcrumbClick(pwd.length - arr.length + index)}
            className="cc-cursor-pointer hover:cc-underline-offset-1"
          >
            {dir.name}
          </span>
        </>
      ))}
    </div>
  );

  // Infinite Loader related
  // Returns a boolean indicating whether the row is loaded.
  const isRowLoaded = ({ index }) => {
    return !!sortedFilesList[index];
  };

  // This function is called when the user scrolls to the bottom of the table.
  const loadMoreRows = async () => {
    if (!hasMoreFiles) return;
    fetchUserFilesMetaData(parentId);
  };

  // Table UI related
  const headerRowRenderer = ({ columns }) => (
    <div
      className="cc-flex cc-flex-row cc-items-center cc-space-x-2 cc-text-left cc-text-sm cc-font-semibold cc-text-gray-500 cc-border-b cc-border-gray-300 cc-py-1 cc-mb-1"
      role="row"
    >
      {columns}
    </div>
  );

  const headerRenderer = ({ label, dataKey }) => (
    <div className="cc-flex cc-flex-row cc-items-center cc-text-left cc-text-xs cc-font-normal cc-text-gray-500 cc-py-1 cc-capitalize cc-px-0">
      <span>{label.toUpperCase()}</span>

      {sortState.sortBy === dataKey &&
        (sortState.sortDirection === SortDirection.ASC ? (
          <HiChevronUp className="cc-w-4 cc-h-4" />
        ) : (
          <HiChevronDown className="cc-w-4 cc-h-4" />
        ))}
    </div>
  );

  // Table actions related
  const sort = ({ sortBy, sortDirection }) => {
    const { sortBy: prevSortBy, sortDirection: prevSortDirection } = sortState;

    if (prevSortDirection === SortDirection.DESC) {
      sortBy = null;
      sortDirection = null;
    }

    const tempFiles = [...filesMasterList];
    if (sortBy && sortDirection) {
      tempFiles.sort((a, b) => {
        if (a[sortBy] < b[sortBy])
          return sortDirection === SortDirection.ASC ? -1 : 1;
        if (a[sortBy] > b[sortBy])
          return sortDirection === SortDirection.ASC ? 1 : -1;
        return 0;
      });
    }
    setSortedFilesList(tempFiles);
    setSortState({ sortBy, sortDirection });
  };

  // Filter function for search
  const getFilteredFiles = () => {
    if (!searchQuery) return sortedFilesList;
    return sortedFilesList.filter((file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Row UI related
  const fileCellRenderer = ({ cellData, rowData }) => {
    // console.log('FileCellRenderer: ', cellData, rowData);

    // Getting the file name and extension
    const fileName = cellData;
    let fileExtension = '';
    let fileNameWithoutExtension = fileName;

    // Checking if the file is a folder
    const isFolder = rowData.is_expandable;
    if (!isFolder) {
      fileExtension = fileName.split('.').pop();
      fileNameWithoutExtension = fileName.replace(`.${fileExtension}`, '');
    }

    // Getting file name without extension
    // const fileNameWithoutExtension = fileName.replace(`.${fileExtension}`, '');

    return (
      <div className="cc-flex cc-items-center cc-space-x-2 cc-text-left cc-text-xs cc-font-normal cc-py-1 cc-capitalize cc-px-1">
        <span className="cc-flex cc-items-center cc-space-x-2">
          {isFolder ? (
            <CiFolderOn className="cc-w-5 cc-h-5 cc-text-yellow-500" />
          ) : (
            <CiFileOn className="cc-w-5 cc-h-5 cc-text-gray-500" />
          )}
        </span>
        <span>{fileNameWithoutExtension}</span>
      </div>
    );
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

  // Row actions related
  const onRowSingleClick = ({ rowData }) => {
    console.log('[FileSelector] onRowSingleClick: ', rowData);
    // For now, we are not allowing the user to select folders.
    if (rowData.is_expandable) return;

    // If the user has selected the file, we will deselect it.
    if (selectedFilesList.includes(rowData.id)) {
      setSelectedFilesList((prev) => prev.filter((id) => id !== rowData.id));
    }
    // If the user has not selected the file, we will select it.
    else {
      setSelectedFilesList((prev) => [...prev, rowData.id]);
    }
  };

  const onRowDoubleClick = ({ rowData }) => {
    // If it is a folder, we will navigate to the folder. Fetch the files in the folder.
    if (rowData.is_expandable) {
      // Navigate to the folder.
      setPwd((prevState) => {
        const pwdCopy = [...prevState];
        const lastPwd = pwdCopy[pwdCopy.length - 1];
        lastPwd['offset'] = offset;
        lastPwd['hasMoreFiles'] = hasMoreFiles;
        lastPwd['parentId'] = parentId;
        pwdCopy.push({
          id: rowData.id,
          name: rowData.name,
          offset: 0,
          hasMoreFiles: true,
          parentId: lastPwd['id'],
        });

        console.log('[FileSelector] onRowDoubleClick: ', pwdCopy);
        return pwdCopy;
      });
      setOffset(0);
      setHasMoreFiles(true);
    }
  };

  return (
    // NOTE: We have to use cc-pb-8 to ensure AutoResizer in the File selector sizes correctly.
    // `4` to account for the cc-mb-4 and `4` for the bread crumbs height.
    // If we change those values, then we have to update here as well.
    <div className="cc-flex cc-w-full cc-grow cc-flex-col cc-pb-8">
      <div className="cc-flex cc-flex-row cc-items-center cc-justify-between">
        <Breadcrumbs />

        <div className="cc-flex cc-flex-row cc-space-x-2">
          <button
            className={`cc-justify-end ${
              selectedFilesList == 0 ? 'cc-hidden' : ''
            } cc-flex cc-items-center cc-space-x-2 cc-text-xs cc-font-semibold cc-text-blue-500 cc-py-1 cc-px-2 cc-rounded-full cc-border cc-border-blue-500 cc-bg-blue-50 cc-transition cc-duration-150 cc-ease-in-out hover:cc-bg-blue-100`}
            onClick={syncSelectedFiles}
          >
            Sync {selectedFilesList.length} Files
          </button>
          <button
            className={`cc-justify-end ${
              selectedFilesList == 0 ? 'cc-hidden' : ''
            } cc-flex cc-items-center cc-space-x-2 cc-text-xs cc-font-semibold cc-text-red-500 cc-py-1 cc-px-2 cc-rounded-full cc-border cc-border-red-500 cc-bg-red-50 cc-transition cc-duration-150 cc-ease-in-out hover:cc-bg-red-100`}
            onClick={() => setSelectedFilesList([])}
          >
            Clear Selection
          </button>
        </div>
      </div>

      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={loadMoreRows}
        rowCount={
          // Check which list to be used here!
          hasMoreFiles ? filesMasterList.length + 1 : filesMasterList.length
        }
      >
        {({ onRowsRendered, registerChild }) => (
          <AutoSizer>
            {({ width, height }) => {
              return (
                <div className="cc-flex cc-grow cc-w-full cc-h-full">
                  <Table
                    headerRowRenderer={headerRowRenderer}
                    width={width - 2 || 688}
                    height={height - 2 || 200}
                    headerHeight={20}
                    rowHeight={40}
                    rowCount={filteredFilesList.length}
                    rowGetter={({ index }) => filteredFilesList[index]}
                    onRowsRendered={onRowsRendered}
                    ref={registerChild}
                    onRowClick={onRowSingleClick}
                    onRowDoubleClick={onRowDoubleClick}
                    rowClassName={({ index }) => {
                      let className =
                        'cc-py-2 cc-pr-2 hover:cc-cursor-pointer hover:cc-bg-gray-50 cc-border-b cc-border-gray-200 cc-flex cc-flex-row cc-items-center cc-w-full cc-h-20';

                      if (
                        selectedFilesList.includes(filteredFilesList[index]?.id)
                      )
                        className += ' cc-bg-blue-100';
                      else className += ' cc-bg-white';

                      return className;
                    }}
                    sort={sort}
                    sortBy={sortState.sortBy}
                    sortDirection={sortState.sortDirection}
                  >
                    <Column
                      label="Name"
                      dataKey="name"
                      width={(3 * width) / 4}
                      className="cc-text-xs cc-ml-1"
                      headerRenderer={headerRenderer}
                      cellRenderer={fileCellRenderer}
                      sortBy={sortState.sortBy}
                    />
                    {/* <Column
                      label="Status"
                      dataKey="sync_status"
                      width={width / 4}
                      // cellRenderer={statusCellRenderer}
                      headerRenderer={headerRenderer}
                    /> */}
                    <Column
                      label="Created At"
                      dataKey="created_at"
                      width={width / 4}
                      cellRenderer={dateCellRenderer}
                      headerRenderer={headerRenderer}
                    />
                    {/* <Column
                      label=""
                      dataKey=""
                      width={50}
                      // cellRenderer={resyncCellRenderer}
                      headerRenderer={() => <></>}
                    /> */}
                  </Table>
                </div>
              );
            }}
          </AutoSizer>
        )}
      </InfiniteLoader>
    </div>
  );
};

export default FileSelector;
