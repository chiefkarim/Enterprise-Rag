from datetime import datetime, timezone
import os
from typing import Any, TypedDict

from features.departments.models import Department


class FileMetadata(TypedDict):
    department: Department
    created_at: str | None
    file_name: str


def serialize_metadata(md: FileMetadata, project_id: str | None) -> dict[str, Any]:
    metadata = {
        "department": md["department"].value,
        "created_at": md["created_at"],
        "file_name": md["file_name"]
    }
    if project_id is not None:
        metadata["project_id"] = project_id

    return metadata


def file_metadata(
    file_path: str, department: Department, project_id: str | None, file_name: str
) -> dict[str, Any]:
    result = department_extractor(department)
    result = file_metadata_extractor(file_path, file_name, result)
    result = serialize_metadata(result, project_id)

    print(result)
    return result


def file_metadata_extractor(file_path: str, file_name: str, metadata: FileMetadata) -> FileMetadata:
    return {
        "department": metadata["department"],
        "created_at": get_created_at(file_path),
        "file_name": file_name,
    }


def department_extractor(department: Department) -> FileMetadata:
    result: FileMetadata = {
        "department": department,
        "created_at": None,
        "file_name": "",
    }

    return result


def get_created_at(file_path: str) -> str:
    stat = os.stat(file_path)
    created_timestamp = stat.st_atime
    created_date = datetime.fromtimestamp(created_timestamp).replace(
        tzinfo=timezone.utc
    )
    return created_date.isoformat().replace("+00:00", "Z")
