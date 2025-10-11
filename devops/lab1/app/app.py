from flask import Flask, render_template, jsonify, request
from models import Counter, get_session, init_db
import os

app = Flask(__name__)

init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    try:
        session = get_session()
        session.query(Counter).first()
        session.close()
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'environment': os.getenv('APP_ENV', 'development')
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'error': str(e)
        }), 500

@app.route('/get-count', methods=['GET'])
def get_count():
    session = get_session()
    try:
        counter = session.query(Counter).first()
        if counter:
            value = counter.value
        else:
            value = 0
        
        return jsonify({'count': value}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

@app.route('/increment', methods=['POST'])
def increment():
    session = get_session()
    try:
        counter = session.query(Counter).first()
        
        if not counter:
            counter = Counter(value=1)
            session.add(counter)
        else:
            counter.value += 1
            
        session.commit()
        current_value = counter.value
        return jsonify({'count': current_value}), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('FLASK_DEBUG', '0') == '1')
