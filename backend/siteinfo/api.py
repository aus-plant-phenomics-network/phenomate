# filename: siteinfo/api.py
import os
from typing import Optional
from pathlib import Path

from django.conf import settings
from django.http import HttpRequest, JsonResponse
from ninja import Router

from appm.utils import get_task_logger
shared_logger = get_task_logger(__name__)

import json


router = Router()

# HTTP_API_KEY is from backend/settings.py
# Could also use SECRET_KEY
# HTTP_API_KEY = settings.INTERNAL_API_KEY
HTTP_API_KEY = 'my-secret-key'

from django.http import JsonResponse, HttpRequest
import json
from pathlib import Path
import os
from typing import Optional


from .dto import SaveSiteInfoRequest, SaveSiteInfoResponse

@router.put("/savesiteinfo", response=SaveSiteInfoResponse)
def save_site_info(request, data: SaveSiteInfoRequest):
    try:
        if request.headers.get("X-API-Key") != HTTP_API_KEY:
            return {"success": False, "error": "Unauthorized"}

        safe_path = Path(data.filename)
        os.makedirs(safe_path.parent, exist_ok=True)

        with open(safe_path, "w", encoding="utf-8") as f:
            f.write(data.content)

        return {
            "success": True,
            "message": f"File saved: {safe_path}"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

        