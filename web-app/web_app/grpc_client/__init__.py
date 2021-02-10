import os
import grpc
from web_app.generated import db_pb2
from web_app.generated import db_pb2_grpc


GRPC_URL_CLIENT = os.getenv("GRPC_URL_CLIENT")
GRPC_PORT = os.getenv("GRPC_PORT")

def get_stub():
    channel = grpc.insecure_channel(f"{GRPC_URL_CLIENT}:{GRPC_PORT}")
    return db_pb2_grpc.ApiStub(channel)
