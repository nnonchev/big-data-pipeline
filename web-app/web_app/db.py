import os
from typing import List
from pymongo import MongoClient
from web_app.schemas import Row

DB_URL = os.getenv("DB_URL")

def insert_row(row: Row) -> bool:
    """ Used to submit student data """"
    client = MongoClient(DB_URL)

    db = client["data"]
    collection = db["raw"]

    collection.insert_one(row)

    return True


def read_all_rows() -> List[Row]:
    """ Used to show the results data """
    client = MongoClient(DB_URL)

    db = client["data"]
    collection = db["processed"]

    cursor = collection.find()

    return cursor