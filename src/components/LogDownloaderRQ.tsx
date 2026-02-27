// src/components/LogDownloaderRQ.tsx
import React, { useState } from "react";
import { useDownloadLogMutation, useTailLogMutation } from "../hooks/useLogDownloads";
// Or if using axios:
// import { useDownloadLogMutationAxios as useDownloadLogMutation, useTailLogMutationAxios as useTailLogMutation } from "../hooks/useLogDownloadsAxios";

const LOG_OPTIONS = [
  { label: "errors.log", value: "errors.log" as const },
  { label: "django.log", value: "django.log" as const },
  { label: "celery-worker.log", value: "celery-worker.log" as const },
  { label: "celery-phenomate.log", value: "celery-phenomate.log" as const },
];

type Props = {
  endpointBase?: string;   // default "/api" (use Vite proxy or absolute URL)
  authToken?: string;      // if using Bearer
  withCredentials?: boolean; // if using session cookies
  defaultBytes?: number;
};

const LogDownloaderRQ: React.FC<Props> = ({
  endpointBase = "/api",
  authToken,
  withCredentials = false,
  defaultBytes = 256 * 1024,
}) => {
  const [log, setLog] = useState(LOG_OPTIONS[0].value);
  const [bytes, setBytes] = useState(defaultBytes);

  const downloadMutation = useDownloadLogMutation();
  const tailMutation = useTailLogMutation();

  const downloading = downloadMutation.isPending;
  const tailing = tailMutation.isPending;

  const errMsg = downloadMutation.error?.message || tailMutation.error?.message;

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
      <label>
        Choose log file:&nbsp;
        <select value={log} onChange={(e) => setLog(e.target.value as typeof LOG_OPTIONS[number]["value"])}>
          {LOG_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          disabled={downloading || tailing}
          onClick={() =>
            downloadMutation.mutate({ endpointBase, log, authToken, withCredentials })
          }
        >
          {downloading ? "Downloading…" : "Download full"}
        </button>

        <span>or</span>

        <label>
          Tail last (bytes):{" "}
          <input
            type="number"
            min={1}
            step={1024}
            value={bytes}
            onChange={(e) => setBytes(Math.max(1, Number(e.target.value || 0)))}
            style={{ width: 140 }}
          />
        </label>

        <button
          disabled={downloading || tailing}
          onClick={() =>
            tailMutation.mutate({ endpointBase, log, bytes, authToken, withCredentials })
          }
        >
          {tailing ? "Downloading…" : "Download tail"}
        </button>
      </div>

      {errMsg && <div style={{ color: "crimson" }}>{errMsg}</div>}
    </div>
  );
};

export default LogDownloaderRQ;