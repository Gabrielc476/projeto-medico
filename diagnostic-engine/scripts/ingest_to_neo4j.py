import json
import os
from pathlib import Path
from confluent_kafka import Consumer, KafkaError
from neo4j import GraphDatabase
import sys

# Add src to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

def ingest():
    # Kafka configuration
    kafka_conf = {
        'bootstrap.servers': os.environ.get("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
        'group.id': 'neo4j-ingestor-v2',
        'auto.offset.reset': 'earliest'
    }
    consumer = Consumer(kafka_conf)
    consumer.subscribe(['medical.knowledge.diseases', 'medical.knowledge.symptoms', 'medical.knowledge.links'])

    # Neo4j configuration
    uri = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
    user = os.environ.get("NEO4J_USER", "neo4j")
    password = os.environ.get("NEO4J_PASSWORD", "medical123")
    driver = GraphDatabase.driver(uri, auth=(user, password))

    print("Starting Ingestion from Kafka to Neo4j...")
    
    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    print(msg.error())
                    break

            topic = msg.topic()
            data = json.loads(msg.value().decode('utf-8'))
            
            with driver.session() as session:
                if topic == 'medical.knowledge.diseases':
                    session.run(
                        "MERGE (d:Disease {disease_id: $disease_id}) SET d += $props",
                        disease_id=data['disease_id'], props=data
                    )
                    print(f"Ingested Disease: {data['disease_id']}")
                
                elif topic == 'medical.knowledge.symptoms':
                    session.run(
                        "MERGE (s:Symptom {symptom_id: $symptom_id}) SET s += $props",
                        symptom_id=data['symptom_id'], props=data
                    )
                    print(f"Ingested Symptom: {data['symptom_id']}")
                
                elif topic == 'medical.knowledge.links':
                    session.run(
                        """
                        MERGE (d:Disease {disease_id: $disease_id})
                        MERGE (s:Symptom {symptom_id: $symptom_id})
                        MERGE (d)-[r:HAS_SYMPTOM]->(s)
                        SET r += $props
                        """,
                        disease_id=data['disease_id'],
                        symptom_id=data['symptom_id'],
                        props={
                            'sensitivity': data['sensitivity'],
                            'specificity': data['specificity'],
                            'link_probability': data['link_probability']
                        }
                    )
                    print(f"Ingested Link: {data['disease_id']} -> {data['symptom_id']}")

    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()
        driver.close()

if __name__ == "__main__":
    ingest()
