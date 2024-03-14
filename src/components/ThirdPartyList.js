import '../index.css';

import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { HiArrowLeft, HiX, HiSearch } from 'react-icons/hi';
import { useCarbon } from '../contexts/CarbonContext';

const ThirdPartyListItem = ({
  integration,
  integrationStatus,
  setActiveStep,
}) => {
  return (
    <div
      key={integration.id}
      className="cc-rounded-md cc-items-center cc-p-4 cc-w-full cc-bg-white cc-cursor-pointer hover:cc-bg-gray-100 cc-shadow-md cc-border cc-border-gray-200 cc-flex cc-flex-col cc-space-y-2 cc-justify-center"
      onClick={() => {
        try {
          setActiveStep(integration.data_source_type);
        } catch (err) {
          console.log(
            '[ThirdPartyList.js] Error in thirdpartylist onClick ',
            err
          );
        }
      }}
    >
      <span className="cc-flex cc-items-center cc-justify-center cc-w-full">
        <img
          src={integration.logo}
          alt={`${integration.name} Logo`}
          className={
            (integration.id === 'WEB_SCRAPER' && 'cc-h-8 cc-w-8 cc-mt-2') ||
            (integration.id === 'LOCAL_FILES' && 'cc-h-8 cc-w-8 cc-mt-2') ||
            'cc-h-10 cc-w-10'
          }
        />
      </span>

      <div className="cc-flex cc-flex-row cc-items-center cc-justify-center cc-w-full cc-text-center">
        <h1 className="cc-text-sm cc-font-roboto cc-font-medium cc-truncate">
          {integration.name}
        </h1>
        {integrationStatus && (
          <div className="cc-ml-1 cc-w-2 cc-h-2 cc-bg-green-500 cc-rounded-full cc-animate-pulse" />
        )}
      </div>
    </div>
  );
};

const ThirdPartyList = ({ setActiveStep, activeIntegrations }) => {
  const [searchTerm, setSearchTerm] = useState(null);
  const [filteredIntegrations, setFilteredIntegrations] = useState([]);

  useEffect(() => {
    if (searchTerm === '' || searchTerm === null) {
      setFilteredIntegrations(processedIntegrations);
    } else {
      const filteredIntegrations = processedIntegrations.filter(
        (i) =>
          i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.id.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setFilteredIntegrations(filteredIntegrations);
    }
  }, [searchTerm, processedIntegrations]);

  const { processedIntegrations, manageModalOpenState, primaryTextColor } =
    useCarbon();

  console.log(processedIntegrations)

  return (
    <div className="cc-flex cc-flex-col cc-h-full cc-items-center cc-px-4 cc-py-6">
      <Dialog.Title className="cc-text-lg cc-font-medium cc-w-full">
        <div className="cc-w-full cc-flex cc-items-center cc-space-x-4">
          <HiArrowLeft
            onClick={() => setActiveStep(0)}
            className="cc-cursor-pointer cc-h-6 cc-w-6 cc-text-gray-400"
          />
          <h1 className="cc-grow">Integrations</h1>
          <HiX
            onClick={() => manageModalOpenState(false)}
            className="cc-cursor-pointer cc-h-5 cc-w-5"
            style={{
              color: primaryTextColor,
            }}
          />
        </div>
      </Dialog.Title>

      <label class="relative block cc-w-full cc-my-4 cc-border-gray-500 cc-bg-gray-100 cc-py-1 cc-px-2 cc-flex cc-flex-row">
        {/* <span class="sr-only">Search</span> */}
        <span class="absolute inset-y-0 left-0 flex items-center pl-2">
          <HiSearch className="cc-w-4 cc-h-4" />
        </span>
        <input
          class="placeholder:italic placeholder:text-slate-400 block bg-white w-full rounded-md py-1 pl-9 pr-3  focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-0 sm:text-sm"
          style={{
            backgroundColor: 'transparent',
            borderWidth: '0',
            borderRadius: '0.375rem',
          }}
          placeholder="Search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </label>

      <div className="cc-grid cc-grid-cols-1 xs:cc-grid-cols-2 md:cc-grid-cols-3 lg:cc-grid-cols-4 cc-w-full cc-gap-y-3 cc-gap-x-3 cc-auto-rows-min cc-overflow-y-auto cc-h-full">
        {filteredIntegrations.map((integration) => {
          const activeIntegrationsList = activeIntegrations.map(
            (i) => i.data_source_type
          );

          const integrationStatus = activeIntegrationsList.includes(
            integration.data_source_type
          );

          return (
            <ThirdPartyListItem
              integration={integration}
              integrationStatus={integrationStatus}
              setActiveStep={setActiveStep}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ThirdPartyList;
