// LogDownloader.tsx
import React, { useState } from "react";

const LOG_OPTIONS = [
  { label: "errors.log", value: "errors.log" },
  { label: "django.log", value: "django.log" },
  { label: "celery-worker.log", value: "celery-worker.log" },
  { label: "celery-phenomate.log", value: "celery-phenomate.log" },
];

type Props = {
  downloadEndpoint?: string; // e.g., "/api/logs/download"
  tailEndpoint?: string;     // e.g., "/api/logs/tail"
  defaultBytes?: number;
};

const LogDownloader: React.FC<Props> = ({
  downloadEndpoint = "/api/logs/download",
  tailEndpoint = "/api/logs/tail",
  defaultBytes = 256 * 1024,
}) => {
  const [selectedLog, setSelectedLog] = useState(LOG_OPTIONS[0].value);
  const [nBytes, setNBytes] = useState(defaultBytes);
  const [loading, setLoading] = useState<null | "download" | "tail">(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchAndSave = async (url: URL, fallbackFilename: string) => {
    const resp = await fetch(url.toString(), {
      method: "GET",
      // credentials: "include", // enable if you use cookie-based auth
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Request failed (${resp.status}): ${text || resp.statusText}`);
    }
    const cd = resp.headers.get("Content-Disposition");
    let filename = fallbackFilename;
    if (cd) {
      const match = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
      const extracted = match?.[1] || match?.[2];
      if (extracted) {
        try { filename = decodeURIComponent(extracted); } catch { filename = extracted; }
      }
    }
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const handleDownload = async () => {
    setErr(null);
    setLoading("download");
    try {
      const url = new URL(downloadEndpoint, window.location.origin);
      url.searchParams.set("log", selectedLog);
      await fetchAndSave(url, selectedLog);
    } catch (e: any) {
      setErr(e.message || "Failed to download log.");
    } finally {
      setLoading(null);
    }
  };

  const handleTail = async () => {
    setErr(null);
    setLoading("tail");
    try {
      const url = new URL(tailEndpoint, window.location.origin);
      url.searchParams.set("log", selectedLog);
      url.searchParams.set("bytes", String(nBytes));
      await fetchAndSave(url, `${selectedLog.replace("/", "_")}_tail_${nBytes}.log`);
    } catch (e: any) {
      setErr(e.message || "Failed to download tail.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
      <label>
        Choose log file:
        <select value={selectedLog} onChange={(e) => setSelectedLog(e.target.value)}>
          {LOG_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={handleDownload} disabled={loading !== null}>
          {loading === "download" ? "Downloading…" : "Download full"}
        </button>
        <span>or</span>
        <label>
          Tail last (bytes):{" "}
          <input
            type="number"
            min={1}
            step={1024}
            value={nBytes}
            onChange={(e) => setNBytes(Math.max(1, Number(e.target.value || 0)))}
            style={{ width: 140 }}
          />
        </label>
        <button onClick={handleTail} disabled={loading !== null}>
          {loading === "tail" ? "Downloading…" : "Download tail"}
        </button>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}
    </div>
  );
};

export default LogDownloader;
