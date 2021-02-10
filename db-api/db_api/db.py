import os
import secrets
from bson.objectid import ObjectId
from pymongo import MongoClient
from db_api.generated import db_pb2


DB_URL = os.getenv("DB_URL")
DB_NAME = os.getenv("DB_NAME")


def get_collection(collection_name):
    client = MongoClient(DB_URL)
    db = client.get_database(DB_NAME)
    collection = db.get_collection(collection_name)

    return collection


def read_all(collection_name, length):
    client = MongoClient(DB_URL)
    db = client.get_database(DB_NAME)
    collection = db.get_collection(collection_name)
    cursor = collection.find()

    if length != -1:
        cursor = cursor.limit(length)

    with client.start_session() as session:
        rows = [
            {
                "country": row.get("country"),
                "campus": row.get("campus"),
                "mobility": row.get("mobility"),
                "contracts": row.get("contracts"),
                "alternative_choice": row.get("alternative_choice"),
                "distance": row.get("distance"),
                "pro_contract": row.get("pro_contract"),
            }
            for row in cursor
        ]

    return rows


def read_processed_all(length):
    client = MongoClient(DB_URL)
    db = client.get_database(DB_NAME)
    collection = db.get_collection("processed")
    cursor = collection.find()

    if length != -1:
        cursor = cursor.limit(length)

    with client.start_session() as session:
        rows = [
            {
                "title": row.get("title"),
                "plot_type": row.get("plot_type"),
                "points": [
                    db_pb2.PlotPoint(x=point[0], y=point[1])
                    for point in row.get("points")
                ],
            }
            for row in cursor
        ]

    return rows


def insert_one(collection_name, row):
    client = MongoClient(DB_URL)
    db = client.get_database(DB_NAME)
    collection = db.get_collection(collection_name)

    with client.start_session() as session:
        row = {
            "_id": ObjectId(secrets.token_bytes(12)),
            **row,
        }

        res = collection.insert_one(row)

    return res.acknowledged


def insert_many(collection_name, rows):
    if len(rows) == 0:
        return False

    client = MongoClient(DB_URL)
    db = client.get_database(DB_NAME)
    collection = db.get_collection(collection_name)

    with client.start_session() as session:
        rows = [{"_id": ObjectId(secrets.token_bytes(12)), **row} for row in rows]
        res = collection.insert_many(rows)

    return res.acknowledged


def upsert_many(collection_name, rows):
    if len(rows) == 0:
        return False

    client = MongoClient(DB_URL)
    db = client.get_database(DB_NAME)
    collection = db.get_collection(collection_name)

    with client.start_session() as session:
        for row in rows:
            res = collection.replace_one({"title": row.get("title")}, row, upsert=True)

    return res.acknowledged


def delete_all(collection_name):
    client = MongoClient(DB_URL)
    db = client.get_database(DB_NAME)
    collection = db.get_collection(collection_name)

    with client.start_session() as session:
        res = collection.delete_many({})

    return res.acknowledged
