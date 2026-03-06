from fastapi import FastAPI, Request
from starlette.responses import HTMLResponse
from models.department import Department
from models.query_request import QueryRequest
from services import query as queryService
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()


templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="./static/"), name="static")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    departments = [d.value for d in Department]
    return templates.TemplateResponse(
        "query.html",
        {"request": request, "departments": departments},
    )


@app.post("/query")
async def Query(payload: QueryRequest):
    return queryService.query(payload.query, user_filters=payload.filters)
