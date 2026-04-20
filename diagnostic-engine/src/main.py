import asyncio
import logging
from concurrent import futures
import grpc

try:
    import diagnostic_pb2_grpc
    from src.grpc.diagnostic_service import DiagnosticService
    PROTO_COMPILED = True
except ImportError:
    PROTO_COMPILED = False

async def serve():
    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    
    if PROTO_COMPILED:
        diagnostic_pb2_grpc.add_DiagnosticServiceServicer_to_server(
            DiagnosticService(), server
        )
        
    listen_addr = '[::]:50051'
    server.add_insecure_port(listen_addr)
    logging.info(f"Starting async gRPC Diagnostic Engine on {listen_addr}")
    await server.start()
    await server.wait_for_termination()

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    asyncio.run(serve())
