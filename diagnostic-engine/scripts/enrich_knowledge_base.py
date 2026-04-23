import json
import os
import requests
import csv
from pathlib import Path
from confluent_kafka import Producer
import sys

# Add src to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Dataset URLs
HSDN_URL = "https://raw.githubusercontent.com/dhimmel/hsdn/gh-pages/data/symptoms-DO.tsv"
MONDO_MESH_URL = "https://raw.githubusercontent.com/monarch-initiative/mondo/master/src/ontology/mappings/mondo_exactmatch_mesh.sssom.tsv"

def delivery_report(err, msg):
    if err is not None:
        print(f'Message delivery failed: {err}')

def download_file(url, filename):
    print(f"Downloading {url}...")
    r = requests.get(url)
    r.raise_for_status()
    with open(filename, 'wb') as f:
        f.write(r.content)
    print(f"Saved to {filename}")

def enrich():
    # Kafka configuration
    conf = {
        'bootstrap.servers': os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "kafka:29092"),
        'client.id': 'enrich-producer',
        'queue.buffering.max.messages': 100000
    }
    producer = Producer(conf)

    raw_dir = Path(__file__).resolve().parent.parent / "data" / "raw_datasets"
    raw_dir.mkdir(parents=True, exist_ok=True)

    # ... (HSDN processing omitted for brevity in this replace_file_content, 
    # but I'll ensure the whole enrich function is updated if needed)
    # Wait, I'll just update the Mondo part.

    hsdn_file = raw_dir / "hsdn_symptoms.tsv"
    if not hsdn_file.exists():
        download_file(HSDN_URL, hsdn_file)

    # 1. Process HSDN (Disease-Symptom Links)
    print("Processing HSDN data...")
    with open(hsdn_file, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter='\t')
        for i, row in enumerate(reader):
            # Row structure: symptom_name, disease_name, tfidf_score, disease_id, symptom_id
            symptom_name = row['symptom_name']
            disease_name = row['disease_name']
            tfidf = float(row['tfidf_score'])
            
            disease_id = row['disease_id']
            symptom_id = row['symptom_id']

            # Create Disease Node Message
            producer.produce(
                'medical.knowledge.diseases',
                key=disease_id,
                value=json.dumps({
                    'disease_id': disease_id,
                    'name': disease_name,
                    'prevalence': 0.001 # Default prevalence if unknown
                }).encode('utf-8'),
                callback=delivery_report
            )

            # Create Symptom Node Message
            producer.produce(
                'medical.knowledge.symptoms',
                key=symptom_id,
                value=json.dumps({
                    'symptom_id': symptom_id,
                    'name': symptom_name,
                    'cui': row.get('mesh_id', '') # Use MeSH ID as fallback for CUI
                }).encode('utf-8'),
                callback=delivery_report
            )

            # Create Link Message
            producer.produce(
                'medical.knowledge.links',
                key=f"{disease_id}::{symptom_id}",
                value=json.dumps({
                    'disease_id': disease_id,
                    'symptom_id': symptom_id,
                    'sensitivity': min(tfidf / 15.0, 0.95), # Normalized proxy
                    'specificity': 0.5,
                    'link_probability': min(tfidf / 20.0, 0.99) # Scaled to probability
                }).encode('utf-8'),
                callback=delivery_report
            )

            if i % 500 == 0:
                print(f"Published {i} HSDN records...")
                producer.flush()

    # 2. Process Mondo mappings (MeSH to MONDO)
    print("Processing Mondo mappings...")
    mondo_mesh_file = raw_dir / "mondo_mesh.tsv"
    if not mondo_mesh_file.exists():
        download_file(MONDO_MESH_URL, mondo_mesh_file)

    with open(mondo_mesh_file, encoding="utf-8") as f:
        lines = [line for line in f if not line.startswith('#')]
        reader = csv.DictReader(lines, delimiter='\t')
        for i, row in enumerate(reader):
            # Row structure: subject_id (MONDO), object_id (mesh)
            mesh_id = row['object_id'].replace('mesh:', '')
            mondo_id = row['subject_id']

            # Update Disease Nodes with Mondo cross-refs
            producer.produce(
                'medical.knowledge.diseases',
                key=mesh_id,
                value=json.dumps({
                    'disease_id': mesh_id,
                    'mondo_id': mondo_id
                }).encode('utf-8'),
                callback=delivery_report
            )
            
            if i % 2000 == 0:
                print(f"Published {i} MeSH-Mondo mappings...")
                producer.flush()

    producer.flush()
    print("Enrichment complete.")

if __name__ == "__main__":
    enrich()
