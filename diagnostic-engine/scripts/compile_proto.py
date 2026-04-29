"""Script to compile .proto files into Python gRPC stubs.

Usage:
    python scripts/compile_proto.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> None:
    project_root = Path(__file__).resolve().parent.parent
    proto_dir = project_root.parent / "shared" / "proto"
    output_dir = project_root / "src" / "api_grpc" / "generated"

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    # Ensure __init__.py exists
    init_file = output_dir / "__init__.py"
    if not init_file.exists():
        init_file.write_text('"""Generated protobuf and gRPC stubs."""\n')

    proto_file = proto_dir / "diagnostic.proto"
    if not proto_file.exists():
        print(f"ERROR: Proto file not found: {proto_file}")
        sys.exit(1)

    cmd = [
        sys.executable,
        "-m",
        "grpc_tools.protoc",
        f"-I{proto_dir}",
        f"--python_out={output_dir}",
        f"--grpc_python_out={output_dir}",
        str(proto_file),
    ]

    print(f"Compiling: {proto_file.name}")
    print(f"Output:    {output_dir}")

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"ERROR: {result.stderr}")
        sys.exit(1)

    print("✅ Proto compilation successful")
    print(f"   Generated: diagnostic_pb2.py, diagnostic_pb2_grpc.py")


if __name__ == "__main__":
    main()
