import os
import json
import inspect
from typing import Optional, Type
from pydantic import BaseModel
from pydantic.fields import ModelField
from fastapi import FastAPI, Request, Form, Depends, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from web_app.grpc_client import get_stub, db_pb2
from web_app.schemas import Row

app = FastAPI()
app.mount(
    "/static", StaticFiles(directory=os.path.join("web_app", "static")), name="static"
)

templates = Jinja2Templates(directory=os.path.join("web_app", "templates"))


@app.get("/", response_class=HTMLResponse)
async def index(req: Request):
    return templates.TemplateResponse("form.html", {"request": req})


@app.post("/")
async def create_row(form: Row = Depends(Row.as_form)):
    row = form.dict()
    row.pop("consent")

    stub = get_stub()
    res = stub.InsertOne(
        db_pb2.InsertOneCollectionReq(collection=db_pb2.Collection.RAW, row=row)
    )

    if res.acknowledged:
        return RedirectResponse("/results", status_code=status.HTTP_302_FOUND)
    return RedirectResponse("/", status_code=status.HTTP_302_FOUND)


@app.get("/results", response_class=HTMLResponse)
async def index(req: Request):
    stub = get_stub()

    grpc_res = stub.ReadProcessedCollection(
        db_pb2.ReadProcessedCollectionReq(length=-1)
    )

    charts = [
        {
            "title": chart.title,
            "plot_type": chart.plot_type,
            "points": [[point.x, point.y] for point in chart.points],
        }
        for chart in grpc_res.rows
    ]

    return templates.TemplateResponse(
        "results.html", {"request": req, "charts": charts}
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("web_app.main:app", host="0.0.0.0", port=8000, reload=True)