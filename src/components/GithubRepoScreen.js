import React, { useEffect, useState } from 'react';
import { useCarbon } from "../contexts/CarbonContext";
import GithubAuthScreen from "./GithubAuthScreen";
import { BASE_URL } from '../constants';
import { sleep } from "../utils/helpers";
import {
	Table,
	Column,
	InfiniteLoader,
	AutoSizer,
	SortDirection,
} from 'react-virtualized';
import { toast } from "react-toastify";

const PER_PAGE = 25

function GithubRepoScreen({ username, activeIntegrations, setActiveStep, pauseDataSourceSelection, setPauseDataSourceSelection }) {
	// const [tries, setTries] = useState(0)
	const [repos, setRepos] = useState([])
	const [selectedRepos, setSelectedRepos] = useState([])
	const [attemptsFinished, setAttemptsFinished] = useState(false)
	const [hasMoreFiles, setHasMoreFiles] = useState(true)
	const [dataSource, setDataSource] = useState(null)
	const [page, setPage] = useState(1);
	const ghSources = activeIntegrations
		.filter(i => i.data_source_type == 'GITHUB')
		.sort((a, b) => b.updated_at - a.updated_at)

	const {
		authenticatedFetch,
		environment,
		accessToken,
	} = useCarbon()

	useEffect(() => {
		const fetchRepos = async () => {
			let tries = 0
			while (tries < 4) {
				tries += 1
				try {
					const res = await authenticatedFetch(
						`${BASE_URL[environment]}/integrations/github/repos?username=${username}&page=${page}&per_page=${PER_PAGE}`,
						{
							method: 'GET',
							headers: {
								Authorization: `Token ${accessToken}`,
								'Content-Type': 'application/json',
							},
						}
					)
					const data = await res.json()
					if (!data) {
						await sleep(5000)
					} else {
						setRepos(data)
						// note - this is a temporary solution that assumes that user filled their info again and data source
						// was updated - in case they are coming to the page a second time
						setDataSource(ghSources[0])
						break
					}
				} catch (e) {
					toast.error('Something went wrong fetching repositories')
					console.error(e)
				}
			}
			setAttemptsFinished(true)
		}
		fetchRepos()
		return () => { }
	}, [])


	const onRowSingleClick = ({ rowData }) => {
		// If the user has selected the file, we will deselect it.
		if (selectedRepos.includes(rowData.id)) {
			setSelectedRepos((prev) =>
				prev.filter((id) => id !== rowData.id)
			);
		}
		// If the user has not selected the file, we will select it.
		else {
			setSelectedRepos((prev) => [...prev, rowData.id]);
		}
	};


	const isRowLoaded = ({ index }) => {
		return !!repos[index];
	};

	const loadMoreRows = async () => {
		try {
			const res = await authenticatedFetch(
				`${BASE_URL[environment]}/integrations/github/repos?username=${username}&page=${page + 1}&per_page=${PER_PAGE}`,
				{
					method: 'GET',
					headers: {
						Authorization: `Token ${accessToken}`,
						'Content-Type': 'application/json',
					},
				}
			)
			const data = await res.json()
			if (data.length) {
				setPage((prev) => prev + 1)
				setRepos([...repos, data])
			} else {
				setHasMoreFiles(false)
			}
		} catch (e) {
			console.error(e)
			toast.error('Something went wrong fetching repositories')
		}
	}

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

			{/* {sortState.sortBy === dataKey &&
				(sortState.sortDirection === SortDirection.ASC ? (
					<HiChevronUp className="cc-w-4 cc-h-4" />
				) : (
					<HiChevronDown className="cc-w-4 cc-h-4" />
				))} */}
		</div>
	);


	const fileCellRenderer = ({ cellData, rowData }) => {
		return (
			<div className="cc-flex cc-items-center cc-space-x-2 cc-text-left cc-text-xs cc-font-normal cc-py-1 cc-px-1">
				<span>{cellData}</span>
			</div>
		);
	}

	const urlCellRenderer = ({ cellData }) => {
		return (
			<div className="cc-flex cc-items-center cc-space-x-2 cc-text-left cc-text-xs cc-font-normal cc-py-1 cc-px-1">
				<span>{cellData}</span>
			</div>
		);
	}

	const syncRepos = async () => {
		try {
			const res = await authenticatedFetch(
				`${BASE_URL[environment]}/integrations/github/sync_repos`,
				{
					method: 'POST',
					headers: {
						Authorization: `Token ${accessToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						data_source_id: dataSource?.id,
						repos: selectedRepos
					})
				}
			)
			if (res.status == 200) {
				setSelectedRepos([])
				setPauseDataSourceSelection(false)
				toast.success("We are syncing the content from your repos, please wait.")
			} else {
				toast.error(`Unable to sync your repos, ${res.detail}`)
			}
		} catch (e) {
			console.log(e)
			toast.error("Unable to sync your repos")
		}
	}

	if (!repos.length) {
		if (attemptsFinished) {
			return <div>We could not fetch your repos. Please try again in some time.</div>
		} else {
			return <div className="cc-self-center">
				<div role="status">
					<svg aria-hidden="true" class="cc-w-8 cc-h-8 cc-text-gray-200 cc-animate-spin cc-dark:text-gray-600 cc-fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
						<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
					</svg>
					<span class="cc-sr-only">Loading...</span>
				</div>
			</div>
		}
	} else {

		return (
			<div className="cc-h-full cc-w-full cc-flex cc-flex-col">
				<div className="cc-grow cc-flex cc-flex-col cc-py-2 cc-px-4 cc-space-y-4">
					<div className="cc-w-full cc-flex cc-flex-col cc-space-y-2 cc-h-full cc-py-2">
						<div className="cc-flex cc-w-full cc-grow cc-flex-col cc-pb-8">
							<div className="cc-flex cc-flex-row cc-items-center cc-justify-between">
								<div className="cc-flex cc-items-center cc-space-x-2 cc-text-sm cc-px-2">
									Select repos to sync
								</div>

								<div className="cc-flex cc-flex-row cc-space-x-2">
									<button
										className={`cc-justify-end ${selectedRepos.length == 0 ? 'cc-hidden' : ''
											} cc-flex cc-items-center cc-space-x-2 cc-text-xs cc-font-semibold cc-text-blue-500 cc-py-1 cc-px-2 cc-rounded-full cc-border cc-border-blue-500 cc-bg-blue-50 cc-transition cc-duration-150 cc-ease-in-out hover:cc-bg-blue-100`}
										onClick={syncRepos}
									>
										Sync {selectedRepos.length} Repos
									</button>
									<button
										className={`cc-justify-end ${selectedRepos.length == 0 ? 'cc-hidden' : ''
											} cc-flex cc-items-center cc-space-x-2 cc-text-xs cc-font-semibold cc-text-red-500 cc-py-1 cc-px-2 cc-rounded-full cc-border cc-border-red-500 cc-bg-red-50 cc-transition cc-duration-150 cc-ease-in-out hover:cc-bg-red-100`}
										onClick={() => setSelectedRepos([])}
									>
										Clear Selection
									</button>
								</div>
							</div>

							<InfiniteLoader
								isRowLoaded={isRowLoaded}
								loadMoreRows={loadMoreRows}
								rowCount={
									hasMoreFiles ? repos.length + 1 : repos.length
								}
								threshold={20}
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
														rowCount={repos.length}
														rowGetter={({ index }) => repos[index]}
														onRowsRendered={onRowsRendered}
														ref={registerChild}
														onRowClick={onRowSingleClick}
														// onRowDoubleClick={onRowDoubleClick}
														rowClassName={({ index }) => {
															let className =
																'cc-py-2 cc-pr-2 hover:cc-cursor-pointer cc-border-b cc-border-gray-200 cc-flex cc-flex-row cc-items-center cc-w-full cc-h-20';

															if (
																selectedRepos.includes(repos[index]?.id)
															)
																className += ' cc-bg-blue-100 hover:cc-bg-blue-200';
															else className += ' cc-bg-white hover:cc-bg-gray-50';

															return className;
														}}
													// sort={sort}
													// sortBy={sortState.sortBy}
													// sortDirection={sortState.sortDirection}
													>
														<Column
															label="Name"
															dataKey="name"
															width={width / 3}
															className="cc-text-xs cc-ml-1"
															headerRenderer={headerRenderer}
															cellRenderer={fileCellRenderer}
														// sortBy={sortState.sortBy}
														/>
														<Column
															label="URL"
															dataKey="url"
															width={(2 * width) / 3}
															cellRenderer={urlCellRenderer}
															headerRenderer={headerRenderer}
														/>
													</Table>
												</div>
											);
										}}
									</AutoSizer>
								)
								}
							</InfiniteLoader >
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default GithubRepoScreen