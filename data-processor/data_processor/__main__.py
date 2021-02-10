from pyspark.sql import SparkSession
from pyspark.sql import types as T
from pyspark.sql.types import StructType, StructField
from data_processor.grpc_client import get_stub, db_pb2
from data_processor.data_cleaner import clean
from data_processor.data_processor import process

def main():
    """ Start the data pipeline """
    stub = get_stub()

    # Create spark session
    spark = SparkSession.builder.appName("DataProcessing").getOrCreate()

    # Read raw data
    print("Reading raw data...")

    res = stub.ReadCollection(
        db_pb2.ReadCollectionReq(collection=db_pb2.Collection.RAW, length=-1)
    )

    # If there is no raw data, there is noting to process
    if len(res.rows) == 0:
        print("There is no raw data, nothing to process.")
        return

    rows = [
        {
            "country": row.country,
            "campus": row.campus,
            "mobility": row.mobility,
            "contracts": row.contracts,
            "alternative_choice": row.alternative_choice,
            "distance": row.distance,
            "pro_contract": row.pro_contract,
        }
        for row in res.rows
    ]

    # Clean raw data
    print("Cleaning raw data...")
    df = clean(spark, rows)

    # Insert cleaned data
    print("Inserting cleaned data...")
    res = stub.InsertMany(
        db_pb2.InsertManyCollectionReq(
            collection=db_pb2.Collection.CLEANED,
            rows=[row.asDict() for row in df.collect()],
        )
    )

    res = stub.InsertMany(
        db_pb2.InsertManyCollectionReq(
            collection=db_pb2.Collection.CLEANED,
            rows=[
                {
                    "country": "A",
                    "campus": "a",
                    "mobility": "car",
                    "contracts": 2,
                    "alternative_choice": "epitech",
                    "distance": 20,
                    "pro_contract": True,
                }
            ],
        )
    )

    # Delete raw data (after it's been cleaned and inserted)
    print("Deleting raw data...")
    res = stub.DeleteAll(
        db_pb2.DeleteCollectionReq(
            collection=db_pb2.Collection.RAW,
        )
    )

    # Read cleaned data
    print("Reading clean data...")
    res = stub.ReadCollection(
        db_pb2.ReadCollectionReq(collection=db_pb2.Collection.CLEANED, length=-1)
    )

    rows = [
        {
            "country": row.country,
            "campus": row.campus,
            "mobility": row.mobility,
            "contracts": row.contracts,
            "alternative_choice": row.alternative_choice,
            "distance": row.distance,
            "pro_contract": row.pro_contract,
        }
        for row in res.rows
    ]

    # Process cleaned data
    print("Processing cleaned data...")
    rows = process(spark, rows)

    # Upsert processed data
    req = db_pb2.UpsertManyReq(
        collection=db_pb2.Collection.PROCESSED,
        rows=[
            db_pb2.ProcessedRow(
                title=row.get("title"),
                plot_type=row.get("plot_type"),
                points=[
                    db_pb2.PlotPoint(x=str(obj.get("x")), y=str(obj.get("y")))
                    for obj in row.get("data")
                ],
            )
            for row in rows
        ],
    )

    res = stub.UpsertMany(req)

    if not res:
        print("Something went wrong :/")

if __name__ == "__main__":
    main()