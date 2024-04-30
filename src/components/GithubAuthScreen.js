import React, { useEffect, useState } from 'react';
import { darkenColor, generateRequestId } from '../utils/helpers';
import { HiUpload, HiInformationCircle } from 'react-icons/hi';
import { toast } from 'react-toastify';

import '../index.css';
import { BASE_URL, onSuccessEvents } from '../constants';
import { LuLoader2 } from 'react-icons/lu';
import { useCarbon } from '../contexts/CarbonContext';

function GithubAuthScreen({ buttonColor, labelColor, username, setUsername, setStep }) {
    const [ghToken, setGHToken] = useState('');

    const [submitButtonHoveredState, setSubmitButtonHoveredState] =
        useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [service, setService] = useState(null);

    useEffect(() => {
        setService(
            processedIntegrations.find((integration) => integration.id === 'GITHUB')
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

    const connectGithub = async () => {
        try {
            if (!username) {
                toast.error("Please enter your Github username.");
                return;
            }
            if (!ghToken) {
                toast.error('Please enter your access token.');
                return;
            }
            onSuccess({
                status: 200,
                data: null,
                action: onSuccessEvents.INITIATE,
                event: onSuccessEvents.INITIATE,
                integration: 'GITHUB',
            });
            setIsLoading(true);
            // we do not sync GH source items by default
            const requestObject = {
                username: username,
                access_token: ghToken,
                sync_source_items: service?.syncSourceItems || false
            };

            const response = await authenticatedFetch(
                `${BASE_URL[environment]}/integrations/github`,
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
                toast.info('Github sync initiated.');
                setGHToken('')
            } else {
                toast.error(responseData.detail);
                onError({
                    status: 400,
                    data: [{ message: responseData.detail }],
                    action: onSuccessEvents.ERROR,
                    event: onSuccessEvents.ERROR,
                    integration: 'GITHUB',
                });
            }
            setIsLoading(false)
            if (service?.syncSourceItems) {
                setUsername('')
            } else {
                setStep("repo_sync")
            }
        } catch (error) {
            toast.error('Error connecting your Github account. Please try again.');
            setIsLoading(false);
            onError({
                status: 400,
                data: [
                    { message: 'Error connecting your Github account. Please try again.' },
                ],
                action: onSuccessEvents.ERROR,
                event: onSuccessEvents.ERROR,
                integration: 'Github',
            });
        }
    };

    return (
        <div className="cc-flex cc-flex-col  cc-py-4 cc-justify-between cc-h-full">
            <div className="py-4 cc-flex cc-grow cc-w-full">
                <div className="cc-flex cc-flex-col cc-justify-start cc-h-full cc-items-start cc-w-full cc-space-y-4">
                    <span className="cc-text-sm">
                        Please enter your Github{' '}
                        <span className="cc-bg-gray-200 cc-px-1 cc-py-0.5 cc-rounded cc-font-mono cc-text-red-400">
                            username
                        </span>{' '}
                        and{' '}
                        <span className="cc-bg-gray-200 cc-px-1 cc-py-0.5 cc-rounded cc-font-mono cc-text-red-400">
                            access token
                        </span>{' '}
                        of the account you wish to connect.
                    </span>

                    <div className="cc-flex cc-space-x-2 cc-items-center cc-w-full cc-h-10">
                        <input
                            type="text"
                            className="cc-p-2 cc-flex-grow cc-text-gray-700 cc-text-sm cc-border-4 cc-border-gray-400"
                            style={{ borderRadius: '0.375rem' }}
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="cc-flex cc-space-x-2 cc-items-center cc-w-full cc-h-10">
                        <input
                            type="text"
                            className="cc-p-2 cc-flex-grow cc-text-gray-700 cc-text-sm cc-border-4 cc-border-gray-400"
                            style={{ borderRadius: '0.375rem' }}
                            placeholder="Token"
                            value={ghToken}
                            onChange={(e) => setGHToken(e.target.value)}
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
                        By connecting to Github, you are providing us with access to your
                        Github account with the level of permissions your access token has.
                        We will use this access to import your data into Carbon. We will not modify your data in any way.
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
                    onClick={connectGithub}
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

export default GithubAuthScreen;
