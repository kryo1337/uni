import json
import uuid
from flask import Flask, request, jsonify
from kafka import KafkaProducer

app = Flask(__name__)

kafka_producer = KafkaProducer(
    bootstrap_servers=['kafka:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
    key_serializer=lambda k: k.encode('utf-8') if k else None
)

def send_to_kafka(topic, message, key=None):
    try:
        future = kafka_producer.send(topic, value=message, key=key)
        kafka_producer.flush()
        print(f"Message sent to Kafka topic '{topic}': {message}")
        return True
    except Exception as e:
        print(f"Failed to send message to Kafka: {e}")
        return False

@app.route('/process_payment', methods=['POST'])
def process_payment():
    try:
        payment_data = request.get_json()
        
        if not payment_data:
            return jsonify({'error': 'No payment data provided'}), 400
        
        order_id = payment_data.get('order_id')
        amount = payment_data.get('amount')
        
        if not order_id or not amount:
            return jsonify({'error': 'order_id and amount are required'}), 400
        
        payment_id = str(uuid.uuid4())
        payment_status = 'completed'
        
        print(f"Processing payment for order {order_id}, amount: {amount}")
        print(f"Payment {payment_id} status: {payment_status}")
        
        analytics_message = {
            'payment_id': payment_id,
            'order_id': order_id,
            'amount': amount,
            'status': payment_status,
            'event_type': 'payment_processed',
            'timestamp': str(uuid.uuid4())
        }
        
        success = send_to_kafka('analytics_orders', analytics_message, order_id)
        
        if success:
            return jsonify({
                'payment_id': payment_id,
                'order_id': order_id,
                'amount': amount,
                'status': payment_status,
                'message': 'Payment processed successfully'
            }), 200
        else:
            return jsonify({
                'payment_id': payment_id,
                'order_id': order_id,
                'amount': amount,
                'status': payment_status,
                'message': 'Payment processed but failed to send analytics data'
            }), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'payment_service'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
