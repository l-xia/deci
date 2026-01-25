import { createContext, useContext } from 'react';
import { useFirebase } from '../hooks/useFirebase';
import { useDataSync } from '../hooks/useDataSync';

type FirebaseState = ReturnType<typeof useFirebase>;
type DataSyncState = ReturnType<typeof useDataSync>;

export interface SyncContextValue {
  firebase: FirebaseState;
  sync: DataSyncState;
}

export const SyncContext = createContext<SyncContextValue | null>(null);

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return context;
}
