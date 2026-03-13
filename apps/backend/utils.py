import json
from os import remove, path
import os
import numpy as np
from enum import Enum


def to_jsonable(obj):
    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    if isinstance(obj, np.floating):
        return float(obj)
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, list):
        return [to_jsonable(x) for x in obj]
    if isinstance(obj, dict):
        return {k: to_jsonable(v) for k, v in obj.items()}
    if isinstance(obj, Enum):
        return obj.name
    # fallback: try __dict__, but filter out callables
    if hasattr(obj, "__dict__"):
        return {k: to_jsonable(v) for k, v in obj.__dict__.items() if not callable(v)}
    # fallback: convert to string
    return str(obj)


def abs_path(parent_file_path, target_file_path):
    BASE_PATH = os.path.dirname(os.path.abspath(parent_file_path))
    return os.path.join(BASE_PATH, target_file_path)


def dump_json(filename, data):
    filename = f"tmp_{filename}"
    serializable = to_jsonable(data)
    if path.exists(filename):
        remove(filename)
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(serializable, f, indent=2)
