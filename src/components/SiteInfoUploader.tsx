// components/SiteInfoUploader.tsx

import * as React from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { fetchClient } from '../lib/api';

// const apiKey = import.meta.env.VITE_API_KEY;

// ---- Helper: format datetime ----
function getFormattedTimestamp(): string {
  const now = new Date();

  const pad = (n: number) => String(n).padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  const offsetMin = now.getTimezoneOffset();
  const sign = offsetMin <= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMin);
  const offsetH = pad(Math.floor(absMin / 60));
  const offsetM = pad(absMin % 60);

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}${sign}${offsetH}${offsetM}`;
}

// ---- Component ----
export const SiteInfoUploader: React.FC = () => {
  // Redux state
  const projectDirectory = useSelector((state: any) => state.form.projectDirectory);
  const siteData = useSelector((state: any) => state.form.siteData);
  const acquisitionData = useSelector((state: any) => state.form.acquisitionData);

  // ---- Initial filename ----
  const initialFilename = React.useMemo(() => {
    return `${getFormattedTimestamp()}_${siteData}-${acquisitionData}_siteinfo.txt`;
  }, [siteData]);

  // ---- Local state ----
  const [siteFilename, setSiteFilename] = React.useState(initialFilename);
  const [siteText, setSiteText] = React.useState('');

  /* // ---- Mutation ----
  const saveMutation = useMutation({
    mutationFn: async () => {
      const fullPath = `${projectDirectory}/${siteFilename}`;

      // Change the header key value to an environment var and match it in backend .env.production
      const res = await fetchClient.PUT('/api/siteinfo/savesiteinfo', {
        body: {
          filename: fullPath,
          content: siteText,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'my-secret-key',
        },
      });

      if (res.error) {
        throw new Error('Upload failed');
      }

      return res;
    },
  }); */
  
  
    const saveMutation = useMutation({
      mutationFn: async () => {
        const fullPath = `${projectDirectory}/${siteFilename}`;

        const res = await fetchClient.PUT('/api/siteinfo/savesiteinfo', {
          body: { 
            filename: fullPath,
            content: siteText,
          },
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'my-secret-key',
          },
        });

        console.log("RES:", res);

        if (res.error) {
          throw new Error('Request failed');
        }

        if (!res.data?.success) {
          throw new Error(res.data?.error || 'Upload failed');
        }


        return res.data;
      },
    });


  const busy = saveMutation.isPending;

  // ---- JSX ----
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* Label */}
      <label htmlFor="siteFilename">Acquisition details filename:</label>

      {/* Filename input */}
      <input
        id="siteFilename"
        name="siteFilename"
        type="text"
        value={siteFilename}
        onChange={(e) => setSiteFilename(e.target.value)}
        disabled={busy}
      />
      
      {/* Button */}
      <button
        className="w-full px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 shadow-sm transition" 
        onClick={() => saveMutation.mutate()}
        disabled={busy}
       >
        {busy ? 'Saving…' : 'Save acquisition details file'}
       </button>

      {/* Rich text area (multiline) */}
      <textarea
        name="siteText"
        rows={12}
        value={siteText}
        onChange={(e) => setSiteText(e.target.value)}
        disabled={busy}
        style={{ border: "1px solid #ccc", borderRadius: "4px", padding: "8px" }}
      />


      {/* Optional status */}
      
        {saveMutation.error && (
          <div style={{ color: 'red' }}>
            {saveMutation.error.message}
          </div>
        )}

      {saveMutation.isSuccess && (
        <div style={{ color: 'green' }}>Saved successfully</div>
      )}

    </div>
  );
};