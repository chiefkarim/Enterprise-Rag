from datetime import datetime, timezone
import os
from typing import Any, TypedDict

from models.department import Department


class FileMetadata(TypedDict):
    department: Department
    created_at: str | None


def serialize_metadata(md: FileMetadata) -> dict[str, Any]:
    return {
        "department": md["department"].value,
        "created_at": md["created_at"],
    }


def file_metadata(file_path: str) -> dict[str, Any]:
    result = department_extractor(file_path)
    result = fille_metadata_extractor(file_path, result)
    result = serialize_metadata(result)

    print(result)
    return result


def fille_metadata_extractor(file_path: str, metadata: FileMetadata) -> FileMetadata:
    result: FileMetadata = metadata.copy()
    result["created_at"] = get_created_at(file_path)
    return result


def department_extractor(file_path: str) -> FileMetadata:
    parent_dir = file_path.split(os.sep)[-2]

    result: FileMetadata = {
        "department": Department(parent_dir),
        "created_at": None,
    }

    return result


def get_created_at(file_path: str) -> str:
    stat = os.stat(file_path)
    created_timestamp = stat.st_atime
    created_date = datetime.fromtimestamp(created_timestamp).replace(
        tzinfo=timezone.utc
    )
    return created_date.isoformat().replace("+00:00", "Z")
