from __future__ import annotations

from typing import Any, Callable

from qdrant_client.http.models import (
    Condition,
    FieldCondition,
    Filter,
    IsEmptyCondition,
    MatchValue,
    PayloadField,
)

from features.query.models import QueryFields, QueryFilters


class FilterHandler:
    def __init__(self) -> None:
        self._registry: dict[str, Callable[[Any], list[Condition]]] = {}

    def register_handler(
        self,
        name: str,
        handler: Callable[[Any], list[Condition]],
    ) -> None:
        self._registry[name] = handler

    def get_conditions(
        self,
        filter_name: str,
        filter_value: Any,
    ) -> list[Condition]:
        if filter_name not in self._registry:
            raise ValueError(f"Unknown filter: {filter_name}")
        return self._registry[filter_name](filter_value)

    def build_conditions_from_fields(self, fields: QueryFields) -> list[Condition]:
        conditions: list[Condition] = []

        for field_name in fields.__class__.model_fields:
            field_value = getattr(fields, field_name)

            if field_value is None:
                continue

            # skip empty list fields
            if isinstance(field_value, list) and not field_value:
                continue

            try:
                conditions.extend(self.get_conditions(field_name, field_value))
            except ValueError:
                continue

        return conditions

    def build_clause(self, node: QueryFields | QueryFilters) -> list[Condition]:
        if isinstance(node, QueryFields):
            return self.build_conditions_from_fields(node)

        if isinstance(node, QueryFilters):
            return [self.build_filter(node)]

        raise TypeError(f"Unsupported node type: {type(node)!r}")

    def build_filter(self, filters: QueryFilters) -> Filter:
        must: list[Condition] = []
        should: list[Condition] = []
        must_not: list[Condition] = []

        for node in filters.must:
            must.extend(self.build_clause(node))

        for node in filters.should:
            should.extend(self.build_clause(node))

        for node in filters.must_not:
            must_not.extend(self.build_clause(node))

        return Filter(
            must=must or None,
            should=should or None,
            must_not=must_not or None,
        )

    def apply_filters(self, user_filters: QueryFilters) -> Filter:
        return self.build_filter(user_filters)


def department_filter_handler(department_value: Any) -> list[Condition]:
    return [
        FieldCondition(
            key="department",
            match=MatchValue(value=department_value.value),
        )
    ]


def created_at_filter_handler(created_at_value: Any) -> list[Condition]:
    return [
        FieldCondition(
            key="created_at",
            range=created_at_value,
        )
    ]


def project_id_handler(id_value: int) -> list[Condition]:
    return [
        FieldCondition(
            key="project_id",
            match=MatchValue(value=id_value),
        )
    ]


def is_empty_handler(keys: list[str]) -> list[Condition]:
    return [IsEmptyCondition(is_empty=PayloadField(key=key)) for key in keys]


class FilterHandlerFactory:
    def __init__(self) -> None:
        self.filter_handler = FilterHandler()
        self.filter_handler.register_handler("department", department_filter_handler)
        self.filter_handler.register_handler("created_at", created_at_filter_handler)
        self.filter_handler.register_handler("project_id", project_id_handler)
        self.filter_handler.register_handler("is_empty", is_empty_handler)
