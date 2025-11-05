import pytest
import json
from app import app, tasks


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        tasks.clear()
        yield client


class TestHealthCheck:
    def test_health_check_success(self, client):
        response = client.get('/health')
        assert response.status_code == 200
        assert response.json['status'] == 'healthy'
        assert 'version' in response.json
        assert 'timestamp' in response.json


class TestTasksCRUD:
    def test_get_tasks_empty(self, client):
        """Test pobierania zadań z pustą listą"""
        response = client.get('/api/tasks')
        assert response.status_code == 200
        assert response.json['count'] == 0
        assert response.json['tasks'] == []
    
    def test_create_task_success(self, client):
        payload = {
            'title': 'Nowe zadanie',
            'description': 'Opis zadania'
        }
        response = client.post('/api/tasks', json=payload)
        assert response.status_code == 201
        assert response.json['title'] == 'Nowe zadanie'
        assert response.json['completed'] == False
        assert response.json['id'] == 1
    
    def test_create_task_missing_title(self, client):
        payload = {'description': 'Bez tytułu'}
        response = client.post('/api/tasks', json=payload)
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_create_task_empty_title(self, client):
        payload = {'title': '   '}
        response = client.post('/api/tasks', json=payload)
        assert response.status_code == 400
    
    def test_get_single_task(self, client):
        client.post('/api/tasks', json={'title': 'Test task'})
        
        response = client.get('/api/tasks/1')
        assert response.status_code == 200
        assert response.json['title'] == 'Test task'
        assert response.json['id'] == 1
    
    def test_get_nonexistent_task(self, client):
        response = client.get('/api/tasks/999')
        assert response.status_code == 404
    
    def test_update_task_success(self, client):
        client.post('/api/tasks', json={'title': 'Stare zadanie'})
        
        payload = {
            'title': 'Nowe zadanie',
            'completed': True
        }
        response = client.put('/api/tasks/1', json=payload)
        assert response.status_code == 200
        assert response.json['title'] == 'Nowe zadanie'
        assert response.json['completed'] == True
    
    def test_update_nonexistent_task(self, client):
        response = client.put('/api/tasks/999', json={'title': 'Test'})
        assert response.status_code == 404
    
    def test_delete_task_success(self, client):
        client.post('/api/tasks', json={'title': 'Do usunięcia'})
        
        response = client.delete('/api/tasks/1')
        assert response.status_code == 200
        
        response = client.get('/api/tasks')
        assert response.json['count'] == 0
    
    def test_delete_nonexistent_task(self, client):
        response = client.delete('/api/tasks/999')
        assert response.status_code == 404


class TestStats:
    def test_get_stats(self, client):
        client.post('/api/tasks', json={'title': 'Task 1'})
        client.post('/api/tasks', json={'title': 'Task 2'})
        
        client.put('/api/tasks/1', json={'completed': True})
        
        response = client.get('/api/stats')
        assert response.status_code == 200
        assert response.json['total_tasks'] == 2
        assert response.json['completed_tasks'] == 1
        assert response.json['pending_tasks'] == 1


class TestErrors:
    def test_404_endpoint_not_found(self, client):
        response = client.get('/nonexistent')
        assert response.status_code == 404


class TestBranchStrategy:
    def test_task_workflow_complete(self, client):
        create_response = client.post('/api/tasks', 
            json={'title': 'Feature implementation', 'description': 'Implement feature X'})
        assert create_response.status_code == 201
        task_id = create_response.json['id']
        
        get_response = client.get(f'/api/tasks/{task_id}')
        assert get_response.status_code == 200
        
        update_response = client.put(f'/api/tasks/{task_id}', 
            json={'completed': True})
        assert update_response.status_code == 200
        assert update_response.json['completed'] == True
        
        stats_response = client.get('/api/stats')
        assert stats_response.json['completed_tasks'] == 1
