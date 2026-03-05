import os
from typing import Optional
from django.conf import settings
from django.http import FileResponse, HttpRequest, HttpResponse, HttpResponseNotFound, StreamingHttpResponse
from ninja import Router, Query

from appm.utils import get_task_logger

shared_logger = get_task_logger(__name__)

# logs/api.py
router = Router()

def _resolve_log_path(log_key: str) -> Optional[str]:
    allowed = getattr(settings, "ALLOWED_LOG_FILES", {})
    path = allowed.get(log_key)
    if not path:
        return None
    path = os.path.abspath(path)
    if not (os.path.exists(path) and os.path.isfile(path)):
        return None
    return path

# OpenAPI hint for a text file download (string/binary, text/plain)
BIN_TEXT_RESPONSE = {
    "responses": {
        200: {
            "description": "OK",
            "content": {
                "text/plain": {
                    "schema": {"type": "string", "format": "binary"}
                }
            }
        }
    }
}

@router.get(
    "/download",
    auth=None,
    # Either use openapi_extra ...
    openapi_extra=BIN_TEXT_RESPONSE,
    summary="Download specified log file",
    description="Returns text/plain with Content-Disposition attachment; tails if oversized."
    
)
def download_log(
    request,
    log: str = Query(..., description="One of: errors.log, django.log, celery-worker.log, celery-phenomate.log"),
):
    log_path = _resolve_log_path(log)
    if not log_path:
        return HttpResponseNotFound("Log file not found or not allowed.")

    max_tail = getattr(settings, "MAX_TAIL_BYTES", 10 * 1024 * 1024)
    file_size = os.path.getsize(log_path)

    if file_size > max_tail:
        # Tail: return a short in-memory HttpResponse
        start = max(file_size - max_tail, 0)
        with open(log_path, "rb") as f:
            f.seek(start, os.SEEK_SET)
            content = f.read()
        resp = HttpResponse(content, content_type="text/plain; charset=utf-8")
        resp["Content-Disposition"] = f'attachment; filename="{os.path.basename(log).replace("/", "_")}_tail.log"'
        resp["Cache-Control"] = "no-store"
        return resp

    # Full file: use Django's FileResponse (streams efficiently)
    f = open(log_path, "rb")
    resp = FileResponse(f, content_type="text/plain; charset=utf-8")
    # resp = HttpResponse(open(log_path, "rb"), content_type="text/plain; charset=utf-8")
    resp["Content-Disposition"] = f'attachment; filename="{os.path.basename(log).replace("/", "_")}"'
    resp["Cache-Control"] = "no-store"
    return resp
