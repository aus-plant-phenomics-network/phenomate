import shutil
from pathlib import Path

PROJECT_PATH = Path("project")


def rm_project(location: str) -> None:
    shutil.rmtree(location)
