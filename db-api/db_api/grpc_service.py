from db_api.generated import db_pb2
from db_api.generated import db_pb2_grpc
from db_api import db


def get_collection_name(collection):
    collection_name = ""

    if collection == db_pb2.Collection.RAW:
        collection_name = "raw"
    elif collection == db_pb2.Collection.CLEANED:
        collection_name = "cleaned"
    elif collection == db_pb2.Collection.PROCESSED:
        collection_name = "processed"

    return collection_name


class Apier(db_pb2_grpc.ApiServicer):
    def ReadCollection(self, req, ctx):
        collection_name = get_collection_name(req.collection)
        length = req.length

        rows = db.read_all(collection_name, length)
        return db_pb2.ReadCollectionRes(rows=rows)

    def ReadProcessedCollection(self, req, ctx):
        length = req.length

        rows = db.read_processed_all(length)

        return db_pb2.ReadProcessedCollectionRes(rows=rows)

    def InsertOne(self, req, ctx):
        collection_name = get_collection_name(req.collection)
        row = req.row

        ack = db.insert_one(
            collection_name,
            {
                "country": row.country,
                "campus": row.campus,
                "mobility": row.mobility,
                "contracts": row.contracts,
                "alternative_choice": row.alternative_choice,
                "distance": row.distance,
                "pro_contract": row.pro_contract,
            },
        )

        return db_pb2.InsertCollectionRes(acknowledged=ack)

    def InsertMany(self, req, ctx):
        collection_name = get_collection_name(req.collection)
        rows = req.rows

        ack = db.insert_many(
            collection_name,
            [
                {
                    "country": row.country,
                    "campus": row.campus,
                    "mobility": row.mobility,
                    "contracts": row.contracts,
                    "alternative_choice": row.alternative_choice,
                    "distance": row.distance,
                    "pro_contract": row.pro_contract,
                }
                for row in rows
            ],
        )

        return db_pb2.InsertCollectionRes(acknowledged=ack)

    def UpsertMany(self, req, ctx):
        collection_name = get_collection_name(req.collection)
        rows = req.rows

        rows = [
            {
                "title": row.title,
                "plot_type": row.plot_type,
                "points": [(point.x, point.y) for point in row.points],
            }
            for row in rows
        ]

        db.upsert_many(collection_name, rows)

        return db_pb2.InsertCollectionRes(acknowledged=True)

    def DeleteAll(self, req, ctx):
        collection_name = get_collection_name(req.collection)

        ack = db.delete_all(collection_name)

        return db_pb2.InsertCollectionRes(acknowledged=ack)