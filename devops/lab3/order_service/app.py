import os
import json
import uuid
import redis
import pika
from flask import Flask, request, jsonify

app = Flask(__name__)

db = {}

redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)

def get_rabbitmq_connection():
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host='rabbitmq', port=5672)
        )
        return connection
    except Exception as e:
        print(f"Failed to connect to RabbitMQ: {e}")
        return None

def send_to_rabbitmq(message):
    connection = get_rabbitmq_connection()
    if connection:
        try:
            channel = connection.channel()
            channel.queue_declare(queue='order_events', durable=True)
            channel.basic_publish(
                exchange='',
                routing_key='order_events',
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,
                )
            )
            print(f"Sent message to RabbitMQ: {message}")
        except Exception as e:
            print(f"Failed to send message to RabbitMQ: {e}")
        finally:
            connection.close()

@app.route('/create_order', methods=['POST'])
def create_order():
    try:
        order_id = str(uuid.uuid4())
        
        order_data = {
            'id': order_id,
            'status': 'nowe',
            'created_at': str(uuid.uuid4()),
            'items': request.json.get('items', []) if request.is_json else []
        }
        
        db[order_id] = order_data
        
        message = {
            'order_id': order_id,
            'event_type': 'order_created'
        }
        send_to_rabbitmq(message)
        
        return jsonify({
            'order_id': order_id,
            'status': 'nowe',
            'message': 'Order created successfully'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/order_status/<order_id>', methods=['GET'])
def get_order_status(order_id):
    try:
        cache_key = f"order_status:{order_id}"
        cached_status = redis_client.get(cache_key)
        
        if cached_status:
            print(f"Cache hit for order {order_id}")
            return jsonify({
                'order_id': order_id,
                'status': cached_status,
                'cached': True
            })
        
        print(f"Cache miss for order {order_id}")
        if order_id in db:
            order_data = db[order_id]
            status = order_data['status']
            
            redis_client.setex(cache_key, 300, status)
            
            return jsonify({
                'order_id': order_id,
                'status': status,
                'cached': False
            })
        else:
            return jsonify({
                'error': 'Order not found'
            }), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'order_service'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
