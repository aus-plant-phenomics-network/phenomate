// utils/download.tsx
export function filenameFromContentDisposition(res: Response, fallback: string) {
  const cd = res.headers.get('Content-Disposition') || '';
  // Handles: attachment; filename="errors.log" OR filename*=UTF-8''errors_tail.log
  const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd);
  if (star?.[1]) return decodeURIComponent(star[1].replace(/["']/g, ''));
  const plain = /filename\s*=\s*["']?([^"';]+)["']?/i.exec(cd);
  return (plain && plain[1]) || fallback;
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
