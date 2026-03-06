from qdrant_client.http.models import FieldCondition, MatchValue
from typing import Any, Callable, List

from models.query_request import QueryFilters


class FilterHandler:
    def __init__(self):
        self._registry = {}

    def register_handler(self, name: str, handler: Callable[[Any], FieldCondition]):
        self._registry[name] = handler

    def get_filed_condition(self, filter_name, filter_value):
        if filter_name not in self._registry:
            raise ValueError(f"Uknown filter: {filter_name}")
        return self._registry[filter_name](filter_value)

    def apply_filters(self, user_filters: QueryFilters) -> List:
        conditions = []
        for field_name in dir(user_filters):
            if field_name.startswith("_"):
                continue
            field_value = getattr(user_filters, field_name)
            if field_value is not None:
                try:
                    condition = self.get_filed_condition(field_name, field_value)
                    conditions.append(condition)
                except ValueError:
                    continue
        return conditions


def department_filter_handler(department_value):
    return FieldCondition(
        key="department", match=MatchValue(value=department_value.value)
    )


def created_at_filter_handler(created_at_value):
    return FieldCondition(key="created_at", range=created_at_value)


class FilterHandlerFactory:
    def __init__(self):
        self.filter_handler = FilterHandler()
        self.filter_handler.register_handler("department", department_filter_handler)
        self.filter_handler.register_handler("created_at", created_at_filter_handler)
