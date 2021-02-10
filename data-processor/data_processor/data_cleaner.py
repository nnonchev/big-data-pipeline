import re

from pyspark.sql import SparkSession, Row
from pyspark.sql import functions as F
from pyspark.sql import types as T


# Define UDF

null_negative_int = F.udf(
    lambda val: T.NullType() if val is None or val < 0 else val, T.IntegerType()
)

null_negative_double = F.udf(
    lambda val: T.NullType() if val is None or val < 0 else val, T.DoubleType()
)

to_float_list = F.udf(
    lambda lst: [float(x_) if is_float(x_) else None for x_ in lst],
    T.ArrayType(T.DoubleType()),
)

is_float = lambda val: re.match(r"^-?\d+(?:\.\d+)?$", val) is not None


def clean(spark, rows):
    # Load Data
    df = spark.createDataFrame(Row(**row) for row in rows)

    # Clean column country
    re_country = "[a-zA-Z][a-zA-Z\s\-]*"

    df = df.withColumn(
        "country",
        (F.lower(F.trim(F.regexp_extract("country", re_country, 0)))),
    )

    # Clean column campus
    re_campus = "([a-zA-Z]+[_\ \-]?)+"

    df = df.withColumn(
        "campus", (F.lower(F.trim(F.regexp_extract("campus", re_campus, 0))))
    )

    # Clean column mobility
    re_mobility = "([a-zA-Z0-9]+[\ \-]?)+"

    df = df.withColumn(
        "mobility", (F.lower(F.trim(F.regexp_extract("mobility", re_mobility, 0))))
    )

    # Clean column contracts
    df = df.withColumn(
        "contracts", null_negative_int(df["contracts"].cast(T.IntegerType()))
    )

    # Clean column alternative_choice
    re_alternative_choice = "([a-zA-Z]+[_\ \-]?)+"

    df = df.withColumn(
        "alternative_choice",
        (
            F.lower(
                F.trim(F.regexp_extract("alternative_choice", re_alternative_choice, 0))
            )
        ),
    )

    # Clean column distance
    re_distance = "[0-9]+"

    df = df.withColumn(
        "distance",
        (
            F.lower(F.trim(F.regexp_extract("distance", re_distance, 0))).cast(
                T.IntegerType()
            )
        ),
    )

    # Clean column pro_contract
    df = df.withColumn("pro_contract", df["pro_contract"].cast(T.BooleanType()))

    return df