import sys
sys.path.append("proto")

from concurrent import futures

import grpc
import uvicorn
import logging
import os

from app.api.grpc.profile import ProfileServicer
import proto.profile_pb2_grpc as profile_pb2_grpc
from app.repositories.profile import ProfileRepository
from app.models.profile import Profile
import app.core.database as database
from app.schemas.profile import ProfileCreate, ProfileUpdate
from app.services.profile import ProfileService
from app.services.upload import Uploader


GRPC_PORT = int(os.getenv("STAKEHOLDERS_GRPC_PORT", 50051))
FASTAPI_PORT = int(os.getenv("STAKEHOLDERS_FASTAPI_PORT", 8000))
LISTEN_ADDR = "[::]:" + str(GRPC_PORT)

def serve_fastapi():
    print(f"Swagger UI: http://127.0.0.1:{FASTAPI_PORT}/docs")
    uvicorn.run("app.api.routes.profile:app", host="0.0.0.0", port=FASTAPI_PORT, reload=True)

def serve_grpc():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    profile_service = ProfileService()
    upload_service = Uploader()
    profile_pb2_grpc.add_ProfileServiceServicer_to_server(ProfileServicer(profile_service, upload_service), server)
    server.add_insecure_port(LISTEN_ADDR)
    server.start()
    print("Server started, listening on " + str(GRPC_PORT))
    server.wait_for_termination()
    return server

if __name__ == "__main__":
    # logging.basicConfig()
    database.init_db()
    serve_fastapi()
    # serve_grpc()


