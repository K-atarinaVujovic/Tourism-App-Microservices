import sys
sys.path.append("proto")

from concurrent import futures

import grpc
import uvicorn
import logging

from app.api.grpc.profile import ProfileServicer
import proto.profile_pb2_grpc as profile_pb2_grpc
from app.repositories.profile import ProfileRepository
from app.models.profile import Profile
import app.core.database as database
from app.schemas.profile import ProfileCreate, ProfileUpdate
from app.services.profile import ProfileService
from app.services.upload import Uploader


GRPC_PORT = "50051"
LISTEN_ADDR = "[::]:" + GRPC_PORT
FASTAPI_PORT = 8000

def serve_fastapi():
    uvicorn.run("app.api.routes.profile:app", host="0.0.0.0", port=FASTAPI_PORT, reload=True)

def serve_grpc():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    profile_service = ProfileService()
    upload_service = Uploader()
    profile_pb2_grpc.add_ProfileServiceServicer_to_server(ProfileServicer(profile_service, upload_service), server)
    server.add_insecure_port(LISTEN_ADDR)
    server.start()
    print("Server started, listening on " + GRPC_PORT)
    server.wait_for_termination()
    return server

if __name__ == "__main__":
    # logging.basicConfig()
    database.init_db()
    serve_fastapi()
    # serve_grpc()


