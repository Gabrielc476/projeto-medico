import json
import os
from pathlib import Path
from confluent_kafka import Producer
import sys

# Add src to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

def delivery_report(err, msg):
    """ Called once for each message produced to indicate delivery result.
        Triggered by poll() or flush(). """
    if err is not None:
        print(f'Message delivery failed: {err}')
    else:
        print(f'Message delivered to {msg.topic()} [{msg.partition()}]')

def seed():
    # Kafka configuration
    conf = {
        'bootstrap.servers': os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
        'client.id': 'seed-producer'
    }
    producer = Producer(conf)

    data_dir = Path(__file__).resolve().parent.parent / "data"
    
    # 1. Seed Diseases
    with open(data_dir / "diseases.json", encoding="utf-8") as f:
        diseases = json.load(f)
        for d in diseases:
            producer.produce(
                'medical.knowledge.diseases', 
                key=d['disease_id'], 
                value=json.dumps(d).encode('utf-8'),
                callback=delivery_report
            )

    # 2. Seed Symptoms
    with open(data_dir / "symptoms.json", encoding="utf-8") as f:
        symptoms = json.load(f)
        for s in symptoms:
            producer.produce(
                'medical.knowledge.symptoms', 
                key=s['symptom_id'], 
                value=json.dumps(s).encode('utf-8'),
                callback=delivery_report
            )

    # 3. Seed Links
    with open(data_dir / "disease_symptom_links.json", encoding="utf-8") as f:
        links = json.load(f)
        for l in links:
            key = f"{l['disease_id']}::{l['symptom_id']}"
            producer.produce(
                'medical.knowledge.links', 
                key=key, 
                value=json.dumps(l).encode('utf-8'),
                callback=delivery_report
            )

    # Wait for any outstanding messages to be delivered and delivery report
    # callbacks to be triggered.
    producer.flush()

if __name__ == "__main__":
    print("Starting Kafka Seeding...")
    seed()
    print("Seeding complete.")
