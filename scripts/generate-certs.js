const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certsDir = path.join(__dirname, '../shared/certs');

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

console.log('Generating certificates in:', certsDir);

// Since openssl is not available in PATH, we'll try to find it in common locations 
// or use a different approach. On Windows, it often comes with Git.
const opensslPath = 'openssl'; // We'll try just 'openssl' first, but it failed in shell.

// Let's try to use a node-native way or a small python script if openssl fails.
// Actually, I'll use a Python script because it's more reliable for cert generation without openssl binary if we use 'cryptography' library.
// But let's check if 'node-forge' is available? Probably not.

// Plan B: Create a python script that uses 'cryptography' library.
const pythonScript = `
import os
from datetime import datetime, timedelta
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa

def generate_self_signed_cert(name, cert_path, key_path, ca_cert=None, ca_key=None):
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COMMON_NAME, name),
    ])
    
    if ca_cert:
        issuer = ca_cert.subject

    builder = x509.CertificateBuilder()
    builder = builder.subject_name(subject)
    builder = builder.issuer_name(issuer)
    builder = builder.public_key(key.public_key())
    builder = builder.serial_number(x509.random_serial_number())
    builder = builder.not_valid_before(datetime.utcnow())
    builder = builder.not_valid_after(datetime.utcnow() + timedelta(days=365))
    
    if name == 'localhost':
        builder = builder.add_extension(
            x509.SubjectAlternativeName([x509.DNSName("localhost"), x509.DNSName("diagnostic-engine")]),
            critical=False,
        )

    if ca_key:
        cert = builder.sign(ca_key, hashes.SHA256())
    else:
        cert = builder.sign(key, hashes.SHA256())

    with open(cert_path, "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))
    
    with open(key_path, "wb") as f:
        f.write(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        ))
    
    return cert, key

os.makedirs('${certsDir.replace(/\\/g, '\\\\')}', exist_ok=True)

ca_cert, ca_key = generate_self_signed_cert("DiagnosticCA", 
                                          os.path.join('${certsDir.replace(/\\/g, '\\\\')}', "ca.crt"), 
                                          os.path.join('${certsDir.replace(/\\/g, '\\\\')}', "ca.key"))

generate_self_signed_cert("localhost", 
                         os.path.join('${certsDir.replace(/\\/g, '\\\\')}', "server.crt"), 
                         os.path.join('${certsDir.replace(/\\/g, '\\\\')}', "server.key"), 
                         ca_cert, ca_key)

generate_self_signed_cert("gateway-client", 
                         os.path.join('${certsDir.replace(/\\/g, '\\\\')}', "client.crt"), 
                         os.path.join('${certsDir.replace(/\\/g, '\\\\')}', "client.key"), 
                         ca_cert, ca_key)

print("Certificates generated successfully!")
`;

fs.writeFileSync(path.join(__dirname, 'temp_gen_certs.py'), pythonScript);
try {
  execSync(`python "${path.join(__dirname, 'temp_gen_certs.py')}"`);
  console.log('Success!');
} catch (e) {
  console.error('Failed to generate certs via Python:', e.message);
} finally {
  fs.unlinkSync(path.join(__dirname, 'temp_gen_certs.py'));
}
