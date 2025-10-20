import json
import pika
import sys

def connect_to_rabbitmq():
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host='rabbitmq', port=5672)
            pika.ConnectionParameters(host='rabbitmq', port=5672)
        )
        return connection
    except Exception as e:
        print(f"Failed to connect to RabbitMQ: {e}")
        sys.exit(1)

def callback(ch, method, properties, body):
    try:
        message = json.loads(body)
        order_id = message.get('order_id', 'Unknown')
        event_type = message.get('event_type', 'Unknown')
        
        print(f"[Powiadomienie] Otrzymano nowe zamówienie: {order_id}. Rozpoczynam wysyłkę e-mail.")
        print(f"[Powiadomienie] Typ zdarzenia: {event_type}")
        print(f"[Powiadomienie] E-mail wysłany na adres klienta dla zamówienia {order_id}")
        print(f"[Powiadomienie] SMS wysłany na numer klienta dla zamówienia {order_id}")
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f"[Powiadomienie] Potwierdzenie wysłane dla zamówienia {order_id}")
        
    except json.JSONDecodeError as e:
        print(f"Error parsing message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as e:
        print(f"Error processing message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def main():
    print("Starting notification service...")
    
    connection = connect_to_rabbitmq()
    channel = connection.channel()
    
    channel.queue_declare(queue='order_events', durable=True)
    
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(
        queue='order_events',
        on_message_callback=callback
    )
    
    print("Notification service is waiting for messages. To exit press CTRL+C")
    
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("Stopping notification service...")
        channel.stop_consuming()
        connection.close()
        print("Notification service stopped.")

if __name__ == '__main__':
    main()
