from pathlib import Path

from backend.url.dto import DirFileItem


def list_dir(src: str, dirOnly: bool = False) -> list[DirFileItem]:
    psrc = Path(src)
    if not psrc.exists():
        raise ValueError(f"Path {src} does not exist")
    if not psrc.is_dir():
        raise ValueError(f"Path {src} is not a directory.")
    result: list[DirFileItem] = []
    for child in psrc.iterdir():
        if not dirOnly or (dirOnly and child.is_dir()):
            result.append(DirFileItem.from_path(child))
    return result
