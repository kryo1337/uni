from flask import Flask, jsonify, request
from datetime import datetime
import logging
import os
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

tasks = []
request_count = 0

logger.info('========== Aplikacja Task Manager uruchomiona ==========')

@app.route('/health', methods=['GET'])
def health_check():
    logger.info('✓ Health check')
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'environment': os.environ.get('FLASK_ENV', 'production')
    }), 200


@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    global request_count
    request_count += 1
    logger.info(f'✓ GET /api/tasks - Request #{request_count}')
    return jsonify({
        'tasks': tasks,
        'count': len(tasks),
        'total_requests': request_count
    }), 200


@app.route('/api/tasks', methods=['POST'])
def create_task():
    global request_count
    request_count += 1
    
    data = request.get_json()
    
    if not data or 'title' not in data or not data['title'].strip():
        logger.warning(f'✗ POST /api/tasks - Błąd: Brak tytułu (Request #{request_count})')
        return jsonify({'error': 'Title is required and cannot be empty'}), 400
    
    task = {
        'id': len(tasks) + 1,
        'title': data['title'].strip(),
        'description': data.get('description', '').strip(),
        'completed': False,
        'created_at': datetime.now().isoformat()
    }
    
    tasks.append(task)
    logger.info(f'✓ POST /api/tasks - Utworzono zadanie #{task["id"]}: {task["title"]} (Request #{request_count})')
    
    return jsonify(task), 201


@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    global request_count
    request_count += 1
    
    task = next((t for t in tasks if t['id'] == task_id), None)
    
    if not task:
        logger.warning(f'✗ GET /api/tasks/{task_id} - Zadanie nie znalezione (Request #{request_count})')
        return jsonify({'error': 'Task not found'}), 404
    
    logger.info(f'✓ GET /api/tasks/{task_id} - {task["title"]} (Request #{request_count})')
    return jsonify(task), 200


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    global request_count
    request_count += 1
    
    task = next((t for t in tasks if t['id'] == task_id), None)
    
    if not task:
        logger.warning(f'✗ PUT /api/tasks/{task_id} - Zadanie nie znalezione (Request #{request_count})')
        return jsonify({'error': 'Task not found'}), 404
    
    data = request.get_json()
    if 'title' in data:
        task['title'] = data['title'].strip()
    if 'description' in data:
        task['description'] = data['description'].strip()
    if 'completed' in data:
        task['completed'] = data['completed']
    
    logger.info(f'✓ PUT /api/tasks/{task_id} - Zaktualizowano (Request #{request_count})')
    return jsonify(task), 200


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    global request_count
    request_count += 1
    
    global tasks
    original_count = len(tasks)
    tasks = [t for t in tasks if t['id'] != task_id]
    
    if len(tasks) == original_count:
        logger.warning(f'✗ DELETE /api/tasks/{task_id} - Zadanie nie znalezione (Request #{request_count})')
        return jsonify({'error': 'Task not found'}), 404
    
    logger.info(f'✓ DELETE /api/tasks/{task_id} - Usunięto (Request #{request_count})')
    return jsonify({'message': 'Task deleted successfully', 'id': task_id}), 200


@app.route('/api/stats', methods=['GET'])
def get_stats():
    logger.info('✓ GET /api/stats')
    return jsonify({
        'total_tasks': len(tasks),
        'completed_tasks': len([t for t in tasks if t['completed']]),
        'pending_tasks': len([t for t in tasks if not t['completed']]),
        'total_requests': request_count
    }), 200


@app.errorhandler(404)
def not_found(error):
    logger.error(f'✗ 404 Error: {error}')
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f'✗ 500 Error: {error}')
    return jsonify({'error': 'Internal server error'}), 500


@app.errorhandler(400)
def bad_request(error):
    logger.error(f'✗ 400 Error: {error}')
    return jsonify({'error': 'Bad request'}), 400


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    flask_env = os.environ.get('FLASK_ENV', 'production')
    debug = flask_env == 'development'
    
    logger.info(f'Uruchamianie Flask na porcie {port} (środowisko: {flask_env})')
    app.run(host='0.0.0.0', port=port, debug=debug)
