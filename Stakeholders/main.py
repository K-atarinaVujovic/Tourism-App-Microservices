from concurrent import futures

import grpc
import uvicorn
import logging

from api.grpc.profile import ProfileServicer
import profile_pb2_grpc
from repositories.profile import ProfileRepository
from models.profile import Profile
import core.database as database
from schemas.profile import ProfileCreate, ProfileUpdate
from services.profile import ProfileService


GRPC_PORT = "50051"
LISTEN_ADDR = "[::]:" + GRPC_PORT
FASTAPI_PORT = 8000

def serve_fastapi():
    uvicorn.run("api.routes.profile:app", host="0.0.0.0", port=FASTAPI_PORT, reload=True)

def serve_grpc():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    profile_service = ProfileService()
    profile_pb2_grpc.add_ProfileServiceServicer_to_server(ProfileServicer(profile_service), server)
    server.add_insecure_port(LISTEN_ADDR)
    server.start()
    print("Server started, listening on " + GRPC_PORT)
    server.wait_for_termination()
    return server

if __name__ == "__main__":
    logging.basicConfig()
    database.init_db()
    # serve_fastapi()
    serve_grpc()
    serve_fastapi()
    print("eyo")


