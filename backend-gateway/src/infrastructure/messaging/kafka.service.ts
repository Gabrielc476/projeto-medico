import {
	Injectable,
	OnModuleInit,
	OnModuleDestroy,
	Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Kafka, Producer, Partitioners } from "kafkajs";

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(KafkaService.name);
	private kafka: Kafka;
	private producer: Producer;

	constructor(private configService: ConfigService) {
		const brokers = this.configService
			.get<string>("KAFKA_BROKERS", "kafka:29092")
			.split(",");

		this.kafka = new Kafka({
			clientId: "medical-gateway",
			brokers: brokers,
		});

		this.producer = this.kafka.producer({
			createPartitioner: Partitioners.LegacyPartitioner,
		});
	}

	async onModuleInit() {
		try {
			await this.producer.connect();
			this.logger.log("Kafka Producer connected");
		} catch (error) {
			this.logger.error("Failed to connect Kafka Producer", error);
		}
	}

	async onModuleDestroy() {
		await this.producer.disconnect();
	}

	async emit(topic: string, message: any) {
		try {
			await this.producer.send({
				topic,
				messages: [
					{
						value: JSON.stringify(message),
						timestamp: new Date().getTime().toString(),
					},
				],
			});
			this.logger.debug(`Message sent to topic ${topic}`);
		} catch (error) {
			this.logger.error(`Failed to send message to topic ${topic}`, error);
			throw error;
		}
	}
}
