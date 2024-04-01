import React, { useEffect, useState } from 'react';
import { darkenColor } from '../utils/helpers';
import { HiUpload, HiInformationCircle } from 'react-icons/hi';
import { toast } from 'react-toastify';

import '../index.css';
import { BASE_URL, onSuccessEvents } from '../constants';
import { LuLoader2 } from 'react-icons/lu';
import { useCarbon } from '../contexts/CarbonContext';

function S3Screen({ buttonColor, labelColor }) {
  const [accessKey, setAccessKey] = useState('');
  const [accessKeySecret, setAccessKeySecret] = useState('');
  const [submitButtonHoveredState, setSubmitButtonHoveredState] =
    useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [service, setService] = useState(null);

  useEffect(() => {
    setService(
      processedIntegrations.find((integration) => integration.id === 'S3')
    );
  }, [processedIntegrations]);

  const {
    accessToken,
    processedIntegrations,
    authenticatedFetch,
    secondaryBackgroundColor,
    secondaryTextColor,
    environment,
    onSuccess,
    onError,
  } = useCarbon();

  const connectS3 = async () => {
    try {
      if (!accessKey) {
        toast.error('Please provide the access key.');
        return;
      }
      if (!accessKeySecret) {
        toast.error('Please provide the access key secret.');
        return;
      }

      setIsLoading(true);

      onSuccess({
        status: 200,
        data: null,
        action: onSuccessEvents.INITIATE,
        event: onSuccessEvents.INITIATE,
        integration: 'S3',
      });
      setIsLoading(true);

      const requestObject = {
        access_key: accessKey,
        access_key_secret: accessKeySecret,
      };

      const response = await authenticatedFetch(
        `${BASE_URL[environment]}/integrations/s3`,
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
        toast.info('S3 sync initiated.');
        setAccessKey("")
        setAccessKeySecret("")
      } else {
        onError({
          status: 400,
          data: [{ message: responseData.detail }],
          action: onSuccessEvents.ERROR,
          event: onSuccessEvents.ERROR,
          integration: 'S3',
        });
        toast.error(responseData.detail)
      }
      setIsLoading(false)
    } catch (error) {
      toast.error('Error connecting. Please try again.');
      setIsLoading(false);
      onError({
        status: 400,
        data: [{ message: 'Error connecting S3. Please try again.' }],
        action: onSuccessEvents.ERROR,
        event: onSuccessEvents.ERROR,
        integration: 'S3',
      });
    }
  };

  return (
    <div className="cc-flex cc-flex-col  cc-py-4 cc-justify-between cc-h-full">
      <div className="py-4 cc-flex cc-grow cc-w-full">
        <div className="cc-flex cc-flex-col cc-justify-start cc-h-full cc-items-start cc-w-full cc-space-y-4">
          <span className="cc-text-sm">
            Please enter your S3{' '}
            <span className="cc-bg-gray-200 cc-px-1 cc-py-0.5 cc-rounded cc-font-mono cc-text-red-400">
              access key
            </span>{' '}
            and{' '}
            <span className="cc-bg-gray-200 cc-px-1 cc-py-0.5 cc-rounded cc-font-mono cc-text-red-400">
              access key secret
            </span>{' '}
            of the account you wish to connect.
          </span>

          <div className="cc-flex cc-space-x-2 cc-items-center cc-w-full cc-h-10">
            <input
              type="text"
              className="cc-p-2 cc-flex-grow cc-text-gray-700 cc-text-sm cc-border-4 cc-border-gray-400"
              style={{ borderRadius: '0.375rem' }}
              placeholder="Access key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
            />
          </div>
          <div className="cc-flex cc-space-x-2 cc-items-center cc-w-full cc-h-10">
            <input
              type="password"
              className="cc-p-2 cc-flex-grow cc-text-gray-700 cc-text-sm cc-border-4 cc-border-gray-400"
              style={{ borderRadius: '0.375rem' }}
              placeholder="Access key secret"
              value={accessKeySecret}
              onChange={(e) => setAccessKeySecret(e.target.value)}
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
            By connecting to S3, you are providing us with access to your data
            hosted on S3. We do not modify any data.
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
          onClick={connectS3}
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

export default S3Screen;
