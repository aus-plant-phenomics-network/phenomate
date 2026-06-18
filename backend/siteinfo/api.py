# filename: siteinfo/api.py
import os
from typing import Optional
from pathlib import Path

from django.conf import settings
from django.http import HttpRequest, HttpResponse, JsonResponse
from ninja import Router

from appm.utils import get_task_logger
shared_logger = get_task_logger(__name__)

import json


router = Router()

# HTTP_API_KEY is from backend/settings.py
# Could also use SECRET_KEY
# HTTP_API_KEY = settings.INTERNAL_API_KEY
HTTP_API_KEY = 'my-secret-key'

@router.put("/savesiteinfo")
def save_site_info(request: HttpRequest):
    """
    Saves site information text to a file.
    Expects JSON body:
    {
        "filename": "path/to/file.txt",
        "content": "text..."
    }
    """
    
    try:
        # ---- Auth check ----
        if request.headers.get("X-API-Key") != HTTP_API_KEY:
            return HttpResponse("Unauthorized", status=401)

        # body = request.json()
        body = json.loads(request.body)

        fullpathandfilename: Optional[str] = body.get("filename")
        content: Optional[str] = body.get("content")

        if not fullpathandfilename:
            return HttpResponse("Missing filename", status=400)

        if content is None:
            return HttpResponse("Missing content", status=400)

        # # ---- Safer base directory (recommended) ----
        # # You can change this to something appropriate in your settings
        # base_dir = Path(getattr(settings, "PROJECT_DATA_DIR", settings.BASE_DIR)).resolve()
        # # Construct safe path inside base_dir
        # safe_path = (base_dir / filename).resolve()
        # # Prevent directory traversal
        # if not str(safe_path).startswith(str(base_dir)):
            # return HttpResponse("Invalid path", status=400)
            
        safe_path = Path(fullpathandfilename)
        # Ensure directory exists
        os.makedirs(safe_path.parent, exist_ok=True)

        # Write file
        with open(safe_path, "w", encoding="utf-8") as f:
            f.write(content)

        return HttpResponse(
            JsonResponse({"message": f"File saved: {safe_path}"}),
            status=200,
            content_type="text/plain"
        )

    except Exception as e:
        return HttpResponse(
            f"Error saving file: {str(e)}",
            status=500,
            content_type="text/plain"
        )