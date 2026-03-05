// components/LogDownloaderWithUseQuery.tsx
import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchClient } from '../lib/api'; // export your fetchClient alongside $api
import { filenameFromContentDisposition, saveBlob } from '../utils/download';

export const LogDownloaderWithUseQuery: React.FC = () => {
  const [log, setLog] = React.useState<'errors.log' | 'celery-worker.log' | 'celery-phenomate.log'>('errors.log');

  const download = useMutation({
    mutationFn: async (selected: typeof log) => {
      const res = await fetchClient.GET('/api/logs/download', {
        params: { query: { log: selected } },
        parseAs: 'blob',
      });

      if (res.error) throw new Error('Download failed');
      const filename = filenameFromContentDisposition(res.response, selected);
      saveBlob(res.data as Blob, filename);
      return filename;
    },
  });

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select value={log} onChange={(e) => setLog(e.target.value as any)} disabled={download.isLoading}>
        <option value="errors.log">errors.log</option>
        <option value="celery-worker.log">celery-worker.log</option>
        <option value="celery-phenomate.log">celery-phenomate.log</option>
      </select>
      <button 
         className="w-full px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition"
         onClick={() => download.mutate(log)} disabled={download.isLoading}>
        {download.isLoading ? 'Downloading…' : 'Download'}
      </button>
    </div>
  );
};
