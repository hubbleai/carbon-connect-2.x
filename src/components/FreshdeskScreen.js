import React, { useEffect, useState } from 'react';
import { darkenColor, generateRequestId } from '../utils/helpers';
import { HiUpload, HiInformationCircle } from 'react-icons/hi';
import { toast } from 'react-toastify';

import '../index.css';
import { BASE_URL, onSuccessEvents, SYNC_FILES_ON_CONNECT, SYNC_SOURCE_ITEMS } from '../constants';
import { LuLoader2 } from 'react-icons/lu';
import { useCarbon } from '../contexts/CarbonContext';

function FreshdeskScreen({ buttonColor, labelColor }) {
	const [freshdeskdomain, setFreshdeskdomain] = useState('');
	const [apiKey, setApiKey] = useState('');

	const [submitButtonHoveredState, setSubmitButtonHoveredState] =
		useState(false);

	const [isLoading, setIsLoading] = useState(false);
	const [service, setService] = useState(null);

	useEffect(() => {
		setService(
			processedIntegrations.find((integration) => integration.id === 'FRESHDESK')
		);
	}, [processedIntegrations]);

	const {
		accessToken,
		processedIntegrations,
		topLevelChunkSize,
		topLevelOverlapSize,
		defaultChunkSize,
		defaultOverlapSize,
		authenticatedFetch,
		secondaryBackgroundColor,
		secondaryTextColor,
		environment,
		onSuccess,
		onError,
		embeddingModel,
		generateSparseVectors,
		prependFilenameToChunks,
		tags,
		useRequestIds,
		requestIds,
		setRequestIds
	} = useCarbon();

	const connectFreshdesk = async () => {
		try {
			if (!freshdeskdomain) {
				toast.error('Please enter a subdomain.');
				return;
			}
			if (!apiKey) {
				toast.error('Please enter an API key.');
				return;
			}

			setIsLoading(true);

			onSuccess({
				status: 200,
				data: null,
				action: onSuccessEvents.INITIATE,
				event: onSuccessEvents.INITIATE,
				integration: 'FRESHDESK',
			});
			setIsLoading(true);

			const chunkSize =
				service?.chunkSize || topLevelChunkSize || defaultChunkSize;
			const overlapSize =
				service?.overlapSize || topLevelOverlapSize || defaultOverlapSize;
			const skipEmbeddingGeneration = service?.skipEmbeddingGeneration || false;
			const embeddingModelValue =
				service?.embeddingModel || embeddingModel || null;
			const generateSparseVectorsValue =
				service?.generateSparseVectors || generateSparseVectors || false;
			const prependFilenameToChunksValue =
				service?.prependFilenameToChunks || prependFilenameToChunks || false;
			const syncFilesOnConnection = service?.syncFilesOnConnection ?? SYNC_FILES_ON_CONNECT;
			const syncSourceItems = service?.syncSourceItems ?? SYNC_SOURCE_ITEMS;

			let requestId = null
			if (useRequestIds) {
				requestId = generateRequestId(20)
				setRequestIds({ ...requestIds, [service?.data_source_type]: requestId })
			}

			const domain = freshdeskdomain
				.replace('https://www.', '')
				.replace('http://www.', '')
				.replace('https://', '')
				.replace('http://', '')
				.replace(/\/$/, '')
				.trim();

			const requestObject = {
				domain: domain,
				api_key: apiKey,
				tags: tags,
				chunk_size: chunkSize,
				chunk_overlap: overlapSize,
				skip_embedding_generation: skipEmbeddingGeneration,
				embedding_model: embeddingModelValue,
				generate_sparse_vectors: generateSparseVectorsValue,
				prepend_filename_to_chunks: prependFilenameToChunksValue,
				sync_files_on_connection: syncFilesOnConnection,
				...(requestId && { request_id: requestId }),
				sync_source_items: syncSourceItems
			};

			const response = await authenticatedFetch(
				`${BASE_URL[environment]}/integrations/freshdesk`,
				{
					method: 'POST',
					headers: {
						Authorization: `Token ${accessToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(requestObject),
				}
			);

			const responseData = await response.json();

			if (response.status === 200) {
				toast.info('Freshdesk sync initiated.');
				setApiKey('')
				setFreshdeskdomain('')
			} else {
				toast.error(responseData.detail);
				onError({
					status: 400,
					data: [{ message: responseData.detail }],
					action: onSuccessEvents.ERROR,
					event: onSuccessEvents.ERROR,
					integration: 'FRESHDESK',
				});
			}
			setIsLoading(false)
		} catch (error) {
			console.error(error)
			toast.error('Error connecting your Freshdesk. Please try again.');
			setIsLoading(false);
			onError({
				status: 400,
				data: [{ message: 'Error connecting your Freshdesk. Please try again.' }],
				action: onSuccessEvents.ERROR,
				event: onSuccessEvents.ERROR,
				integration: 'FRESHDESK',
			});
		}
	};

	return (
		<div className="cc-flex cc-flex-col  cc-py-4 cc-justify-between cc-h-full">
			<div className="py-4 cc-flex cc-grow cc-w-full">
				<div className="cc-flex cc-flex-col cc-justify-start cc-h-full cc-items-start cc-w-full cc-space-y-4">
					<span className="cc-text-sm">
						Please enter the Freshdesk{' '}
						<span className="cc-bg-gray-200 cc-px-1 cc-py-0.5 cc-rounded cc-font-mono cc-text-red-400">
							domain
						</span>{' '}
						and{' '}
						<span className="cc-bg-gray-200 cc-px-1 cc-py-0.5 cc-rounded cc-font-mono cc-text-red-400">
							API key
						</span>{' '}
						of the account you wish to connect.
					</span>

					<div className="cc-flex cc-space-x-2 cc-items-center cc-w-full cc-h-10">
						<input
							type="text"
							className="cc-p-2 cc-flex-grow cc-text-gray-700 cc-text-sm cc-border-4 cc-border-gray-400"
							style={{ borderRadius: '0.375rem' }}
							placeholder="domain.freshdesk.com"
							value={freshdeskdomain}
							onChange={(e) => setFreshdeskdomain(e.target.value)}
						/>
					</div>
					<div className="cc-flex cc-space-x-2 cc-items-center cc-w-full cc-h-10">
						<input
							type="password"
							className="cc-p-2 cc-flex-grow cc-text-gray-700 cc-text-sm cc-border-4 cc-border-gray-400"
							style={{ borderRadius: '0.375rem' }}
							placeholder="API key"
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
						/>
					</div>
				</div>
			</div>
			<>
				<p
					className="cc-flex cc-text-gray-500 cc-p-2 cc-space-x-2 cc-bg-gray-100 cc-rounded-md cc-mb-2 cc-items-center"
					style={{
						color: secondaryTextColor,
						backgroundColor: secondaryBackgroundColor,
					}}
				>
					<HiInformationCircle className="cc-w-8 cc-h-8" />
					<span className="text-xs">
						By connecting to Freshdesk, you are providing us with access to your
						Freshdesk account. We will use this access to import your data into
						Carbon. We will not modify your data in any way.
					</span>
				</p>

				<button
					className={`cc-w-full cc-h-12 cc-flex cc-flex-row cc-items-center cc-justify-center cc-rounded-md cc-cursor-pointer cc-space-x-2`}
					style={{
						backgroundColor: submitButtonHoveredState
							? darkenColor(buttonColor, -10)
							: buttonColor,
						color: labelColor,
					}}
					onClick={connectFreshdesk}
					onMouseEnter={() => setSubmitButtonHoveredState(true)}
					onMouseLeave={() => setSubmitButtonHoveredState(false)}
				>
					{isLoading ? (
						<LuLoader2 className={`cc-animate-spin`} />
					) : (
						<HiUpload />
					)}
					<p>Connect</p>
				</button>
			</>
		</div>
	);
}

export default FreshdeskScreen;
