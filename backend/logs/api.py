import os
from typing import Optional
from django.conf import settings
from django.http import HttpResponse, HttpResponseNotFound, StreamingHttpResponse
from ninja import Router, Query

logs_router = Router(tags=["logs"])

def _resolve_log_path(log_key: str) -> Optional[str]:
    """
    Returns absolute path for an allowed log key, or None if invalid.
    """
    allowed = getattr(settings, "ALLOWED_LOG_FILES", {})
    path = allowed.get(log_key)
    if not path:
        return None
    # Extra hygiene: force absolute and ensure it's a file that exists
    path = os.path.abspath(path)
    if not os.path.exists(path) or not os.path.isfile(path):
        return None
    return path

@logs_router.get("/logs/download", auth=None)
def download_log(request, log: str = Query(..., description="One of: errors.log, django.log, celery-worker.log, celery-phenomate.log")):
    """
    Download the entire log file as an attachment.
    If the file is larger than MAX_TAIL_BYTES, we return only the last MAX_TAIL_BYTES to avoid huge transfers.
    """
    log_path = _resolve_log_path(log)
    if not log_path:
        return HttpResponseNotFound("Log file not found or not allowed.")

    max_tail = getattr(settings, "MAX_TAIL_BYTES", 10 * 1024 * 1024)
    file_size = os.path.getsize(log_path)

    # If the file is too large, return a tail to prevent massive response sizes.
    if file_size > max_tail:
        start_offset = max(file_size - max_tail, 0)
        with open(log_path, "rb") as f:
            f.seek(start_offset, os.SEEK_SET)
            content = f.read()
        resp = HttpResponse(content, content_type="text/plain; charset=utf-8")
        resp["Content-Disposition"] = f'attachment; filename="{os.path.basename(log).replace("/", "_")}_tail.log"'
        resp["Cache-Control"] = "no-store"
        return resp

    # Otherwise return entire file (streaming optional for very large files)
    def file_iter(path, chunk_size=64 * 1024):
        with open(path, "rb") as f:
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                yield chunk

    resp = StreamingHttpResponse(file_iter(log_path), content_type="text/plain; charset=utf-8")
    resp["Content-Disposition"] = f'attachment; filename="{os.path.basename(log).replace("/", "_")}"'
    resp["Cache-Control"] = "no-store"
    return resp


@logs_router.get("/logs/tail", auth=None)
def tail_log(
    request,
    log: str = Query(..., description="One of: errors.log, django.log, celery-worker.log, celery-phenomate.log"),
    bytes: Optional[int] = Query(None, description="Number of bytes from end of file"),
):
    """
    Download the last N bytes of the chosen log (default: DEFAULT_TAIL_BYTES), clamped to MAX_TAIL_BYTES.
    """
    log_path = _resolve_log_path(log)
    if not log_path:
        return HttpResponseNotFound("Log file not found or not allowed.")

    max_tail = getattr(settings, "MAX_TAIL_BYTES", 10 * 1024 * 1024)
    default_tail = getattr(settings, "DEFAULT_TAIL_BYTES", 256 * 1024)

    n = default_tail if (bytes is None) else bytes
    try:
        n = int(n)
    except (TypeError, ValueError):
        n = default_tail
    if n <= 0:
        n = default_tail
    if n > max_tail:
        n = max_tail

    file_size = os.path.getsize(log_path)
    start_offset = max(file_size - n, 0)

    # Stream the tail for memory efficiency
    def tail_iter(path, start, chunk_size=64 * 1024):
        with open(path, "rb") as f:
            f.seek(start, os.SEEK_SET)
            while True:
                chunk = f.read(chunk_size)
                if not chunk:
                    break
                yield chunk

    resp = StreamingHttpResponse(tail_iter(log_path, start_offset), content_type="text/plain; charset=utf-8")
    resp["Content-Disposition"] = f'attachment; filename="{os.path.basename(log).replace("/", "_").rsplit(".", 1)[0]}_tail_{min(n, file_size)}.log"'
    resp["Cache-Control"] = "no-store"
    return resp