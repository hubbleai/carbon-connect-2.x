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
	deleteFiles
} from 'carbon-connect-js';
import { BASE_URL, FILE_PICKER_BASED_CONNECTORS, LOCAL_FILE_TYPES, onSuccessEvents, PICKER_OR_URL_BASED_CONNECTORS, SYNC_FILES_ON_CONNECT, SYNC_SOURCE_ITEMS, SYNC_URL_BASED_CONNECTORS, TWO_STEP_CONNECTORS } from '../constants';
import { VscDebugDisconnect, VscLoading, VscSync } from 'react-icons/vsc';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { CiCircleList } from 'react-icons/ci';
import 'react-virtualized/styles.css'; // import styles
import resyncIcon from '../logos/resyncIcon.svg';
import deleteIcon from '../logos/delete-button.svg';
import { MdOutlineCloudUpload, MdRefresh } from "react-icons/md";
import { INTEGRATIONS_LIST } from "../utils/integrationsList";

const PER_PAGE = 25

const LocalFilesScreen = ({
	setActiveStep,

}) => {
	const {
		accessToken,
		entryPoint,
		environment,
		showFilesTab,
		processedIntegrations
	} = useCarbon();


	const [filesTabRefreshes, setFilesTabRefreshes] = useState(0);
	const [integrationData, setIntegrationData] = useState(null)
	const shouldShowFilesTab = showFilesTab || integrationData?.showFilesTab;

	useEffect(() => {
		if (!integrationData) return
		if (!shouldShowFilesTab) {
			setActiveStep("FILE_UPLOAD")
		}
	}, [integrationData])

	useEffect(() => {
		const integrationData = processedIntegrations.find(
			(integration) => integration.id === "LOCAL_FILES"
		);
		setIntegrationData(integrationData);
	}, [processedIntegrations]);

	const [filesLoading, setFilesLoading] = useState(false)

	const [files, setFiles] = useState([]);
	const [sortedFiles, setSortedFiles] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [filteredFiles, setFilteredFiles] = useState([]);

	const [hasMoreFiles, setHasMoreFiles] = useState(true);
	const [offset, setOffset] = useState(0);

	const [sortState, setSortState] = useState({
		sortBy: '',
		sortDirection: 'ASC',
	});

	useEffect(() => {
		if (!files.length) return;
		setSortedFiles(files);
	}, [files]);

	useEffect(() => {
		setFilteredFiles(getFilteredFiles());
	}, [sortedFiles, searchQuery]);

	useEffect(() => {
		if (!integrationData) return
		setOffset(0)
		setFiles([])
		setSortedFiles([])
		setFilteredFiles([])
		setFilesLoading(true)
		loadInitialData().then(() => setFilesLoading(false));
		setHasMoreFiles(true)
	}, [filesTabRefreshes, integrationData]);

	const loadInitialData = async () => {
		if (!shouldShowFilesTab) return
		const userFilesResponse = await getUserFiles({
			accessToken: accessToken,
			environment: environment,
			offset: 0,
			limit: PER_PAGE,
			filters: {
				source: LOCAL_FILE_TYPES,
			},
			order_by: "created_at",
			order_dir: "desc"
		});
		if (userFilesResponse.status === 200) {
			const count = userFilesResponse.data.count;
			const userFiles = userFilesResponse.data.results;
			setFiles([...userFiles]);
			setOffset(offset + userFiles.length);

			if (count > offset + userFiles.length) {
				setHasMoreFiles(true);
			} else {
				setHasMoreFiles(false);
			}
		} else {
			setHasMoreFiles(false);
		}
	}

	const loadMoreRows = async () => {
		if (!shouldShowFilesTab) return
		const userFilesResponse = await getUserFiles({
			accessToken: accessToken,
			environment: environment,
			offset: offset,
			limit: PER_PAGE,
			filters: {
				source: LOCAL_FILE_TYPES
			},
			order_by: "created_at",
			order_dir: "desc"
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
		let value = "NA"
		if (cellData) {
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
			value = `${dateString} ${timeString}`
		}

		return (
			<span className="cc-inline-block cc-mx-0.5 cc-py-1 cc-text-xs cc-font-normal cc-rounded-full cc-text-center ">{value}</span>
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

	const deleteCellRenderer = ({ rowData }) => {
		return (
			<img
				className="cc-w-4 cc-h-4 cc-border-gray-300 cc-focus:cc-ring-0 cc-focus:cc-border-black cc-cursor-pointer cc-flex cc-items-center cc-justify-center cc-mx-auto"
				src={deleteIcon}
				alt="Delete File"
				onClick={() => handleDeleteFile(rowData)}
			/>
		);
	};

	const performFileResync = async (rowData) => {
		const resyncFileResponse = await resyncFile({
			accessToken: accessToken,
			fileId: rowData.id,
			environment: environment,
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


	const handleDeleteFile = async (rowData) => {
		const deleteFileResponse = await deleteFiles({
			accessToken: accessToken,
			environment: environment,
			fileIds: [rowData.id],
		});
		if (deleteFileResponse.status === 200) {
			const newFiles = [...files.filter(file => file.id !== rowData.id)]
			const newSortedFiles = [...sortedFiles.filter(file => file.id !== rowData.id)]

			setFiles(newFiles)
			setSortedFiles(newSortedFiles)

			toast.success("File queued for deletion")
		} else {
			toast.error('Error deleting file');
			console.error('Error deleting file: ', deleteFileResponse.error);
		}
	}

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

	const handleUploadFilesClick = () => {
		setActiveStep("FILE_UPLOAD")
	}

	const handleRefreshList = async () => {
		setFilesTabRefreshes(prev => prev + 1)
	}

	if (!shouldShowFilesTab) return null

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
				<div className="cc-flex cc-flex-row cc-items-center cc-space-x-4 cc-space-y-4 cc-w-full ">
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
								{`Manage your local file uploads`}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="cc-grow cc-flex cc-flex-col cc-py-2 cc-px-4 cc-space-y-4">
				{(
					<div className="cc-flex-col cc-flex md:cc-translate-y-4 cc-text-sm cc-h-full cc-mb-4">
						<div className="cc-flex cc-border-b cc-mb-0">
							<button
								className={`cc-flex cc-py-2 cc-px-2 cc-text-center cc-cursor-pointer cc-border-b-4 cc-font-bold cc-items-left cc-space-x-2 cc-justify-center cc-w-fit-content`}
							>
								Files
							</button>
						</div>

						<div className="cc-w-full cc-flex cc-flex-col cc-space-y-2 cc-border-t cc-h-full cc-py-2">
							{/* Common Action Bar */}
							<div className="cc-flex cc-flex-row cc-h-6 cc-items-center cc-space-x-2 cc-w-full cc-px-2 cc-my-2 cc-justify-between">
								{/* Search Input */}
								<label class="cc-relative cc-block cc-w-64  cc-flex cc-flex-row">
									{/* <span class="sr-only">Search</span> */}
									<span class="cc-absolute cc-inset-y-0 cc-left-0 cc-flex cc-items-center cc-pl-2">
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
								<div className="cc-flex cc-space-x-4">
									<MdRefresh
										onClick={() => handleRefreshList()}
										className={`cc-cursor-pointer cc-text-gray-500 cc-mt-0.5 cc-h-6 cc-w-6`}
									/>
									<div className="cc-flex cc-flex-row cc-space-x-0 cc-border cc-rounded-md">
										<button
											className={`cc-flex cc-p-0.5 cc-text-center cc-cursor-pointer cc-items-center cc-justify-center cc-w-6 cc-text-xs cc-h-6 cc-rounded-l-md cc-text-black cc-bg-gray-300`}
										// onClick={() => setShowFileSelector(false)}
										>
											<CiCircleList className="cc-w-4 cc-h-4" />
										</button>
										{
											<button
												className={`cc-flex cc-p-0.5 cc-text-center cc-cursor-pointer cc-items-center cc-justify-center cc-w-6 cc-text-xs cc-h-6 cc-rounded-r-md`}
												onClick={() => {
													handleUploadFilesClick()
												}}
											>
												<IoCloudUploadOutline className="cc-w-4 cc-h-4" />
											</button>
										}
									</div>
								</div>
							</div>

							{files.length === 0 && !filesLoading ? (
								<div className="cc-flex cc-flex-col cc-items-center cc-justify-center cc-grow">
									<p className="cc-text-gray-500 cc-text-sm">
										No files synced
									</p>
								</div>) : null
							}

							{filesLoading ? (
								<div className="cc-self-center">
									<div role="status">
										<svg aria-hidden="true" class="cc-w-8 cc-h-8 cc-text-gray-200 cc-animate-spin cc-dark:text-gray-600 cc-fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
											<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
										</svg>
										<span class="cc-sr-only">Loading...</span>
									</div>
								</div>
							) : filteredFiles.length > 0 && (
								<div className="cc-flex cc-w-full cc-grow cc-flex-col cc-pb-4">
									<InfiniteLoader
										isRowLoaded={isRowLoaded}
										loadMoreRows={loadMoreRows}
										rowCount={hasMoreFiles ? files.length + 1 : files.length}
										threshold={15}
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
																	width={width / 2.5}
																	className="cc-text-xs"
																	headerRenderer={headerRenderer}
																	sortBy={sortState.sortBy}
																/>
																<Column
																	label="Status"
																	dataKey="sync_status"
																	width={width / 5}
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
																	label="Resync"
																	dataKey="resync"
																	width={25}
																	cellRenderer={resyncCellRenderer}
																	headerRenderer={() => <></>}
																/>
																<Column
																	label="Delete"
																	dataKey="delete"
																	width={25}
																	cellRenderer={deleteCellRenderer}
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
					</div>
				)}
			</div>
		</div>
	);
};

export default LocalFilesScreen;
