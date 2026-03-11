// components/LogDownloaderWithUseQuery.tsx
import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchClient } from '../lib/api';
import { filenameFromContentDisposition, saveBlob } from '../utils/download';

type LogName = 'errors.log' | 'celery-worker.log' | 'celery-phenomate.log' | 'django.log';

export const LogDownloaderWithUseQuery: React.FC = () => {
  const [log, setLog] = React.useState<LogName>('errors.log');

  const download = useMutation<string, Error, LogName>({
    // v5 signature: useMutation({ mutationFn, ... })
    mutationFn: async (selected: LogName) => {
      const res = await fetchClient.GET('/api/logs/download', {
        params: { query: { log: selected } },
        parseAs: 'blob',
        headers: { Accept: 'text/plain' },
      });
      if (res.error) throw new Error('Download failed');

      const filename = filenameFromContentDisposition(res.response, selected);
      saveBlob(res.data as Blob, filename);
      return filename;
    },
  });

  const busy = download.isPending;            // <-- v5
  // or: const busy = download.status === 'pending';

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select value={log} onChange={(e) => setLog(e.target.value as LogName)} disabled={busy}>
        <option value="errors.log">errors.log</option>
        <option value="celery-phenomate.log">celery-phenomate.log</option>
        <option value="celery-worker.log">celery-worker.log</option>
        <option value="django.log">django.log</option>        
      </select>

      <button 
        className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition"
        onClick={() => download.mutate(log)} disabled={busy}>
        {busy ? 'Downloading…' : 'Download'}
      </button>
    </div>
  );
};