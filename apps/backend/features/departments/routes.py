from fastapi import APIRouter, Depends, HTTPException, status
import sqlite3
from deps import get_db
from features.departments.models import DepartmentModel
from features.departments.dto import CreateDepartment, UpdateDepartment
from features.departments import repository as departments_repo
from features.auth.service import require_admin

router = APIRouter(prefix="/departments")

@router.get("/", response_model=list[DepartmentModel])
async def get_departments(db: sqlite3.Connection = Depends(get_db)):
    """Public endpoint to get all departments."""
    return departments_repo.get_departments(db)

@router.get("/{id}", response_model=DepartmentModel, dependencies=[Depends(require_admin)])
async def get_department(id: int, db: sqlite3.Connection = Depends(get_db)):
    """Admin-only endpoint to get a specific department."""
    department = departments_repo.get_department_by_id(db, id)
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return department

@router.post("/", response_model=DepartmentModel, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_department(payload: CreateDepartment, db: sqlite3.Connection = Depends(get_db)):
    """Admin-only endpoint to create a new department."""
    try:
        department = departments_repo.create_department(db, payload.name)
        if not department:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create department")
        return department
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department with this name already exists")

@router.put("/{id}", response_model=DepartmentModel, dependencies=[Depends(require_admin)])
async def update_department(id: int, payload: UpdateDepartment, db: sqlite3.Connection = Depends(get_db)):
    """Admin-only endpoint to update an existing department."""
    department = departments_repo.get_department_by_id(db, id)
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    
    try:
        updated = departments_repo.update_department(db, id, payload.name)
        if not updated:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update department")
        return updated
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department with this name already exists")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_department(id: int, db: sqlite3.Connection = Depends(get_db)):
    """Admin-only endpoint to delete a department."""
    department = departments_repo.get_department_by_id(db, id)
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    
    success = departments_repo.delete_department(db, id)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete department")
    return None
