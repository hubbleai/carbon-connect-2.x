import React from 'react'
import { BsGoogle, BsCloudUpload, BsDropbox } from 'react-icons/bs';
import { RxNotionLogo } from 'react-icons/rx';
import { CgWebsite } from 'react-icons/cg';
import { FaIntercom } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { GrOnedrive } from 'react-icons/gr';
import {
    SiBox,
    SiConfluence,
    SiMicrosoftsharepoint,
    SiZendesk,
} from 'react-icons/si';

import zoteroLogoPng from '../zotero.png';

import BoxLogo from '../logos/box.svg';
import ConfluenceLogo from '../logos/confluence.svg';
import DropboxLogo from '../logos/dropbox.svg';
// import GmailLogo from '../logos/gmail.svg';
import GoogleDriveLogo from '../logos/google_drive.svg';
import IntercomLogo from '../logos/intercom.svg';
import NotionLogo from '../logos/notion.svg';
import OneDriveLogo from '../logos/onedrive.svg';
import SharePointLogo from '../logos/sharepoint.svg';
import FileUploadIcon from '../logos/file_upload.svg';
import WebScraperIcon from '../logos/web_scraper.svg';
// import SlackLogo from '../logos/slack.svg';
import ZendeskLogo from '../logos/zendesk.svg';
import ZoteroLogo from '../logos/zotero.svg';
import S3Logo from '../logos/s3.svg';
import FreshdeskLogo from '../logos/freshdesk.svg';
import GmailLogo from '../logos/gmail.svg';
import GitbookLogo from '../logos/gitbook.svg'
import SalesforceLogo from '../logos/salesforce.svg'

export const INTEGRATIONS_LIST = [
    {
        id: 'BOX',
        subpath: 'box',
        name: 'Box',
        description: 'Connect your Box account',
        announcementName: 'to connect Box',
        icon: <SiBox className="cc-w-7 cc-h-7" />,
        logo: BoxLogo,
        active: true,
        data_source_type: 'BOX',
        requiresOAuth: true,
        multiStep: false,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#d1f2ff',
                primaryButtonColor: '#04adef',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'CONFLUENCE',
        subpath: 'confluence',
        name: 'Confluence',
        description: 'Connect your Confluence account',
        announcementName: 'to connect Confluence',
        icon: <SiConfluence className="cc-w-7 cc-h-7" />,
        logo: ConfluenceLogo,
        active: true,
        data_source_type: 'CONFLUENCE',
        requiresOAuth: true,
        multiStep: true,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#d6e7ff',
                primaryButtonColor: '#2381fc',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'DROPBOX',
        subpath: 'dropbox',
        name: 'Dropbox',
        description: 'Connect your Dropbox account',
        announcementName: 'to connect Dropbox',
        icon: <BsDropbox className="cc-w-7 cc-h-7" />,
        logo: DropboxLogo,
        active: true,
        data_source_type: 'DROPBOX',
        requiresOAuth: true,
        multiStep: false,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#d6ecfc',
                primaryButtonColor: '#007ee5',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'FRESHDESK',
        subpath: 'freshdesk',
        name: 'Freshdesk',
        description: 'Lets your users connect their Freshdesk accounts to Carbon.',
        announcementName: 'to connect Freshdesk',
        icon: <img src={FreshdeskLogo} className="cc-w-7 cc-h-7" />,
        logo: FreshdeskLogo,
        active: true,
        data_source_type: 'FRESHDESK',
        requiresOAuth: true,
        multiStep: true,
        branding: {
            header: {
                primaryBackgroundColor: '#d6ecfc',
                primaryButtonColor: '#007ee5',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'LOCAL_FILES',
        subpath: 'local',
        name: 'File Upload',
        description: 'Upload files from your computer',
        announcementName: 'to upload local files',
        icon: <BsCloudUpload className="cc-w-7 cc-h-7" />,
        logo: FileUploadIcon,
        active: true,
        data_source_type: 'LOCAL_FILES',
        requiresOAuth: false,
        multiStep: false,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#dadfe8',
                primaryButtonColor: '#000000',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',
            },
        },
    },
    {
        id: 'GITBOOK',
        subpath: 'gitbook',
        name: 'Gitbook',
        description: 'Lets your users connect their Gitbook accounts to Carbon.',
        announcementName: 'to connect Gitbook',
        icon: <img src={GitbookLogo} className="cc-w-7 cc-h-7" />,
        logo: GitbookLogo,
        active: true,
        data_source_type: 'GITBOOK',
        requiresOAuth: false,
        multiStep: true,
        branding: {
            header: {
                primaryBackgroundColor: '#dadfe8',
                primaryButtonColor: '#000000',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',
            },
        },
    },
    {
        id: 'GMAIL',
        subpath: 'gmail',
        name: 'Gmail',
        description: 'Lets your users connect their Gmail to Carbon.',
        announcementName: 'to connect Gmail',
        icon: <img src={GmailLogo} className="cc-w-7 cc-h-7" />,
        logo: GmailLogo,
        active: true,
        data_source_type: 'GMAIL',
        requiresOAuth: true,
        integrationsListViewTitle: 'Connect your Gmail',
        branding: {
            header: {
                primaryBackgroundColor: '#dadfe8',
                primaryButtonColor: '#000000',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',
            },
        },
    },
    {
        id: 'GOOGLE_DRIVE',
        subpath: 'google',
        name: 'Google Drive',
        description: 'Connect your Google Drive account',
        announcementName: 'to connect Google Drive',
        icon: <FcGoogle className="cc-w-7 cc-h-7" />,
        logo: GoogleDriveLogo,
        active: true,
        data_source_type: 'GOOGLE_DRIVE',
        requiresOAuth: true,
        multiStep: false,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#c9ddff',
                primaryButtonColor: '#3777e3',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'INTERCOM',
        subpath: 'intercom',
        name: 'Intercom',
        description: 'Connect your Intercom account',
        announcementName: 'to connect Intercom',
        icon: <FaIntercom className="cc-w-7 cc-h-7" />,
        logo: IntercomLogo,
        active: true,
        data_source_type: 'INTERCOM',
        requiresOAuth: true,
        multiStep: false,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#d6ecfc',
                primaryButtonColor: '#007ee5',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'NOTION',
        subpath: 'notion',
        name: 'Notion',
        description: 'Connect your Notion accounts',
        announcementName: 'to connect Notion',
        icon: <RxNotionLogo className="cc-w-7 cc-h-7" />,
        logo: NotionLogo,
        active: true,
        data_source_type: 'NOTION',
        requiresOAuth: true,
        multiStep: false,
        supportsMultipleAccounts: true,
        branding: {
            header: {
                primaryBackgroundColor: '#dadfe8',
                primaryButtonColor: '#000000',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'ONEDRIVE',
        subpath: 'onedrive',
        name: 'OneDrive',
        description: 'Connect your OneDrive account',
        announcementName: 'to connect OneDrive',
        icon: <GrOnedrive className="cc-w-7 cc-h-7" />,
        logo: OneDriveLogo,
        active: true,
        data_source_type: 'ONEDRIVE',
        requiresOAuth: true,
        multiStep: false,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#d6ebff',
                primaryButtonColor: '#0363b8',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'SHAREPOINT',
        subpath: 'sharepoint',
        name: 'Sharepoint',
        description: 'Connect your Sharepoint account',
        announcementName: 'to connect Sharepoint',
        icon: <SiMicrosoftsharepoint className="cc-w-7 cc-h-7" />,
        logo: SharePointLogo,
        active: true,
        data_source_type: 'SHAREPOINT',
        requiresOAuth: true,
        multiStep: true,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#c8f5f7',
                primaryButtonColor: '#036b70',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'WEB_SCRAPER',
        subpath: 'scraper',
        name: 'Web Scraper',
        description: 'Scrape data from any website',
        announcementName: 'for Web Scraping',
        icon: <CgWebsite className="cc-w-7 cc-h-7" />,
        logo: WebScraperIcon,
        active: true,
        data_source_type: 'WEB_SCRAPER',
        requiresOAuth: false,
        multiStep: false,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#dadfe8',
                primaryButtonColor: '#000000',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'ZENDESK',
        subpath: 'zendesk',
        name: 'Zendesk',
        description: 'Connect your Zendesk account',
        announcementName: 'to connect Zendesk',
        icon: <SiZendesk className="cc-w-7 cc-h-7" />,
        logo: ZendeskLogo,
        active: true,
        data_source_type: 'ZENDESK',
        requiresOAuth: true,
        multiStep: true,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#dadfe8',
                primaryButtonColor: '#000000',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
    {
        id: 'ZOTERO',
        subpath: 'zotero',
        name: 'Zotero',
        description: 'Lets your users connect their Zotero accounts to Carbon.',
        announcementName: 'to connect Zotero',
        icon: <img src={zoteroLogoPng} className="cc-w-7 cc-h-7" />, // <SiZotero className="cc-w-7 cc-h-7" />,
        logo: ZoteroLogo,
        active: true,
        data_source_type: 'ZOTERO',
        requiresOAuth: true,
        multiStep: false,
        supportsMultipleAccounts: false,
        branding: {
            header: {
                primaryBackgroundColor: '#ffc4c9',
                primaryButtonColor: '#CC2836',
                primaryLabelColor: '#FFFFFF',
                primaryTextColor: '#000000',
                secondaryTextColor: '#000000',

                // secondaryBackgroundColor: '#0061D5',
                // secondaryButtonColor: '#143B83',
            },
        },
    },
];
