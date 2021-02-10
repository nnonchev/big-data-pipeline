import os
from concurrent import futures
import grpc
from db_api.generated import db_pb2_grpc
from db_api.grpc_service import Apier


GRPC_URL = os.getenv("GRPC_URL")
GRPC_PORT = os.getenv("GRPC_PORT")


class Server:
    @staticmethod
    def run():
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        db_pb2_grpc.add_ApiServicer_to_server(Apier(), server)

        server.add_insecure_port(f"{GRPC_URL}:{GRPC_PORT}")

        server.start()
        server.wait_for_termination()