from datetime import datetime
import os


def file_metadata(file_path: str) -> dict[str, str | None]:
    result: dict[str, str | None]
    result = department_extractor(file_path)
    result = fille_metadata_extractor(file_path, result)
    print(result)
    return result


def fille_metadata_extractor(
    file_path: str, metadata: dict[str, str | None]
) -> dict[str, str | None]:
    result: dict[str, str | None] = metadata.copy()
    result["created_at"] = get_created_at(file_path)
    return result


def get_created_at(file_path: str) -> str:
    stat = os.stat(file_path)
    created_timestamp = stat.st_atime
    created_date = datetime.fromtimestamp(created_timestamp)
    return created_date.isoformat()


def department_extractor(file_path: str) -> dict[str, str | None]:
    result: dict[str, str | None] = {"department": None}
    if "consulting" in file_path:
        result["department"] = "consulting"
    elif "engineering" in file_path:
        result["department"] = "engineering"
    elif "finance" in file_path:
        result["department"] = "finance"
    elif "general" in file_path:
        result["department"] = "general"
    elif "hr" in file_path:
        result["department"] = "hr"
    elif "rnd" in file_path:
        result["department"] = "rnd"
    return result
