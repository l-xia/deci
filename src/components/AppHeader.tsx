import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import deciLogo from '../assets/deci_logo.svg';
import LoadingSpinner from './LoadingSpinner';
import { GlobalTimer } from './GlobalTimer/GlobalTimer';
import type { SaveStatus } from '../types/common';
import { saveStatusVariants, saveStatusTextVariants } from '../utils/variants';

interface AppHeaderProps {
  userEmail: string;
  isUsingFirebase: boolean;
  saveStatus: SaveStatus;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  onRetrySave: () => void;
}

const getSaveStatusKey = (
  status: SaveStatus
): 'saving' | 'saved' | 'error' | 'idle' => {
  if (status === 'saving') return 'saving';
  if (status === 'saved') return 'saved';
  if (status === 'error') return 'error';
  return 'idle';
};

export const AppHeader = ({
  userEmail,
  isUsingFirebase,
  saveStatus,
  isRefreshing,
  onRefresh,
  onLogout,
  onRetrySave,
}: AppHeaderProps) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const statusKey = getSaveStatusKey(saveStatus);

  return (
    <header className="mb-6 flex-shrink-0 space-y-2">
      <div className="flex items-center justify-between">
        <img src={deciLogo} alt="Deci" className="h-12" />

        <div className="flex items-center gap-1 md:gap-3">
          <div className="hidden md:block">
            <GlobalTimer />
          </div>

          {isUsingFirebase && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing || saveStatus === 'saving'}
              className={saveStatusVariants({ status: statusKey })}
              title={isRefreshing ? 'Refreshing...' : 'Refresh data from cloud'}
            >
              {saveStatus === 'saving' && (
                <LoadingSpinner size="xs" className="text-blue-500" />
              )}
              {saveStatus === 'saved' && (
                <CheckCircleIcon className="w-3 h-3 text-green-600" />
              )}
              {saveStatus === 'error' && (
                <XCircleIcon className="w-3 h-3 text-red-600" />
              )}
              {!saveStatus && (
                <ArrowPathIcon
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              )}
              <span className={saveStatusTextVariants({ status: statusKey })}>
                {isRefreshing
                  ? 'Refreshing...'
                  : saveStatus === 'saving'
                    ? 'Syncing...'
                    : saveStatus === 'saved'
                      ? 'Synced'
                      : saveStatus === 'error'
                        ? 'Sync error'
                        : 'Cloud'}
              </span>
              {saveStatus === 'error' && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetrySave();
                  }}
                  className="text-red-600 hover:underline"
                  aria-label="Retry saving data"
                >
                  (retry)
                </span>
              )}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <span>{userEmail}</span>
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-30 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                  <Link
                    to="/analytics"
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <ChartBarIcon className="w-4 h-4 inline-block mr-2" />
                    Analytics
                  </Link>
                  <Link
                    to="/archive"
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <ArchiveBoxIcon className="w-4 h-4 inline-block mr-2" />
                    Archive
                  </Link>
                  <button
                    onClick={() => {
                      onLogout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 inline-block mr-2" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden">
        <GlobalTimer fullWidth />
      </div>
    </header>
  );
};
