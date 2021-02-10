from pyspark.sql import SparkSession, Row
from pyspark.sql import types as T


def process(spark, rows):
    # Load Data
    df = spark.createDataFrame(Row(**row) for row in rows)

    rows = []

    # Who are the most successful students, depending on the region/institution of origin?
    data = [
        {
            "x": row["country"],
            "y": row["count"],
        }
        for row in df.groupby("country").count().collect()
    ]

    rows.append(
        {
            "title": "Who are the most successful students, depending on the region/institution of origin?",
            "plot_type": "bar",
            "data": data,
        }
    )

    return rows