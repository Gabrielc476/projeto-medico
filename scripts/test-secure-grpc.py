import grpc
import sys
import os
from pathlib import Path

# Ensure generated stubs are importable
if os.path.exists("/app/src/api_grpc/generated"):
    sys.path.insert(0, "/app/src/api_grpc/generated")
else:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "diagnostic-engine" / "src" / "api_grpc" / "generated"))

import diagnostic_pb2

import diagnostic_pb2_grpc
from google.protobuf import empty_pb2

def test_secure_connection():
    if os.path.exists("/shared/certs"):
        certs_path = Path("/shared/certs")
    else:
        certs_path = Path(__file__).resolve().parent.parent / "shared" / "certs"
    
    print(f"Using certs from: {certs_path}")
    
    with open(certs_path / "ca.crt", "rb") as f:

        root_certs = f.read()
    with open(certs_path / "client.key", "rb") as f:
        client_key = f.read()
    with open(certs_path / "client.crt", "rb") as f:
        client_cert = f.read()

    credentials = grpc.ssl_channel_credentials(
        root_certificates=root_certs,
        private_key=client_key,
        certificate_chain=client_cert
    )

    # Override the target name to match the certificate's Common Name (CN=localhost)
    options = (('grpc.ssl_target_name_override', 'localhost'),)
    
    channel = grpc.secure_channel("0.0.0.0:50051", credentials, options=options)
    stub = diagnostic_pb2_grpc.DiagnosticServiceStub(channel)


    try:
        print("Attempting to connect to gRPC securely (0.0.0.0:50051)...")
        # Increased timeout because LLM translation is slow (~60s)
        response = stub.GetAppSymptoms(empty_pb2.Empty(), timeout=90)
        print(f"Success! Received {len(response.symptoms)} symptoms.")
    except Exception as e:
        print(f"Failed to connect securely: {e}")

if __name__ == "__main__":
    test_secure_connection()
