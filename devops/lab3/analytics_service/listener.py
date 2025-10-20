import json
import sys
from kafka import KafkaConsumer


def main():
    print("Starting analytics service...")

    try:
        consumer = KafkaConsumer(
            'analytics_orders',
            bootstrap_servers=['kafka:9092'],
            group_id='analytics-group',
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            key_deserializer=lambda k: k.decode('utf-8') if k else None,
        )
    except Exception as e:
        print(f"Failed to create Kafka consumer: {e}")
        sys.exit(1)

    print("Analytics service is consuming messages from 'analytics_orders'...")

    try:
        for message in consumer:
            event = message.value
            print(f"[Analityka] Otrzymano zdarzenie płatności: {json.dumps(event, ensure_ascii=False)}")
    except KeyboardInterrupt:
        print("Stopping analytics service...")
    finally:
        try:
            consumer.close()
        except Exception:
            pass


if __name__ == '__main__':
    main()
