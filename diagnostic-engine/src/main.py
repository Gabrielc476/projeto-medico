"""Async gRPC server entry point for the Diagnostic Engine.

Starts a high-performance async gRPC server on port 50051 (configurable
via the ``DIAGNOSTIC_PORT`` environment variable).

Usage:
    python -m src.main
    # or
    python src/main.py
"""

from __future__ import annotations

import asyncio
import logging
import os
import sys
from pathlib import Path

import grpc

# ---------------------------------------------------------------------------
# Ensure generated stubs are importable (they use flat ``import diagnostic_pb2``)
# ---------------------------------------------------------------------------
_GENERATED_DIR = str(
    Path(__file__).resolve().parent / "grpc" / "generated"
)
if _GENERATED_DIR not in sys.path:
    sys.path.insert(0, _GENERATED_DIR)

import diagnostic_pb2_grpc  # noqa: E402

from src.grpc.diagnostic_service import DiagnosticServicer  # noqa: E402

logger = logging.getLogger("diagnostic-engine")


async def serve() -> None:
    """Bootstrap and run the async gRPC server."""
    port = os.environ.get("DIAGNOSTIC_PORT", "50051")
    listen_addr = f"[::]:{port}"

    server = grpc.aio.server()

    # Register the servicer
    servicer = DiagnosticServicer()
    diagnostic_pb2_grpc.add_DiagnosticServiceServicer_to_server(
        servicer, server
    )

    server.add_insecure_port(listen_addr)
    logger.info("Starting async gRPC Diagnostic Engine on %s", listen_addr)

    await server.start()
    logger.info("Server started — waiting for requests...")
    await server.wait_for_termination()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    asyncio.run(serve())
