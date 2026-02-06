from __future__ import annotations

from typing import TYPE_CHECKING

from ninja import Schema

import os
from pathlib import Path


# def get_size(p: Path) -> int:
    # try:
        # if p.is_file():
            # return p.stat().st_size
        # if p.is_dir():
            # return sum([child.stat().st_size for child in p.iterdir() if child.is_file()])
        # return 0
    # except PermissionError:
        # return 0


def get_directory_size_scandir(p: Path) -> int:
    """
    Returns the total size (in bytes) of regular files directly under directory p.
    Robust against WSL/Docker quirks by avoiding symlink following and catching per-file errors.
    """
    total = 0
    # Ensure p is a directory; if not, return 0 (or raise)
    try:
        if not p.is_dir():
            return 0
    except OSError:
        # If the path itself can't be stat'ed (WSL transient), treat as empty
        return 0

    try:
        with os.scandir(p) as it:
            for entry in it:
                try:
                    if entry.is_file(follow_symlinks=False):
                        st = entry.stat(follow_symlinks=False)
                        total += st.st_size
                except (PermissionError, FileNotFoundError):
                    # Skip transient/locked/vanishing entries
                    continue
                except OSError:
                    # Catch NTFS/WSL oddities (stale file handles, network mounts, etc.)
                    continue
    except (PermissionError, FileNotFoundError, NotADirectoryError, OSError):
        # Directory itself might be inaccessible/vanished; return 0 safely
        return 0

    return total


def get_size(p: Path) -> int:
    return (get_directory_size_scandir(p))


class DirFileItem(Schema):
    id: str
    name: str
    isDir: bool
    isHidden: bool
    size: int | float

    @classmethod
    def from_path(cls, path: Path) -> DirFileItem | None:
        try:
            # Skip hidden files and directories
            if path.name.startswith("."):
                return None

            # size = file size or total size of children files in a dir
            size = get_size(path)
            return DirFileItem(
                id=str(path.absolute()),
                name=path.name,
                isDir=path.is_dir(),
                isHidden=path.name.startswith("."),
                size=size,
            )
        except PermissionError:
            return None
