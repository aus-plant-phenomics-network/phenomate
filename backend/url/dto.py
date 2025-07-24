import datetime
from pathlib import Path

from ninja import Schema


def get_size(p: Path) -> int:
    if p.is_file():
        return p.stat().st_size
    if p.is_dir():
        return sum([child.stat().st_size for child in p.iterdir() if child.is_file()])
    return 0


class DirFileItem(Schema):
    id: str
    name: str
    isDir: bool
    isHidden: bool
    size: int | float
    modDate: datetime.datetime

    @classmethod
    def from_path(cls, path: Path) -> "DirFileItem":
        # size = file size or total size of children files in a dir
        size = get_size(path)
        return DirFileItem(
            id=str(path.absolute()),
            name=path.name,
            isDir=path.is_dir(),
            isHidden=path.name.startswith("."),
            size=size,
            modDate=datetime.datetime.fromtimestamp(path.stat().st_mtime),  # noqa: DTZ006
        )
