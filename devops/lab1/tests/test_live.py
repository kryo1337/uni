#!/usr/bin/env python3
import requests
import time
import json

BASE_URL = "http://localhost:5000"

def test_health_endpoint():
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'status' in data, "Missing 'status' field"
        assert data['status'] == 'healthy', f"Expected 'healthy', got {data['status']}"
        assert 'database' in data, "Missing 'database' field"
        assert data['database'] == 'connected', f"Expected 'connected', got {data['database']}"
        
        print("Health endpoint test passed")
        return True
    except Exception as e:
        print(f"Health endpoint test failed: {e}")
        return False

def test_get_count():
    print("Testing get count endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/get-count", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'count' in data, "Missing 'count' field"
        assert isinstance(data['count'], int), "Count should be integer"
        
        print(f"Get count test passed (count: {data['count']})")
        return True
    except Exception as e:
        print(f"Get count test failed: {e}")
        return False

def test_increment_counter():
    print("Testing counter increment...")
    try:
        response = requests.get(f"{BASE_URL}/get-count", timeout=10)
        assert response.status_code == 200
        initial_count = response.json()['count']
        
        response = requests.post(f"{BASE_URL}/increment", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert 'count' in data, "Missing 'count' field"
        new_count = data['count']
        assert new_count == initial_count + 1, f"Expected {initial_count + 1}, got {new_count}"
        
        print(f"Increment test passed ({initial_count} -> {new_count})")
        return True
    except Exception as e:
        print(f"Increment test failed: {e}")
        return False

def test_multiple_increments():
    print("Testing multiple increments...")
    try:
        response = requests.get(f"{BASE_URL}/get-count", timeout=10)
        initial_count = response.json()['count']
        
        for i in range(3):
            response = requests.post(f"{BASE_URL}/increment", timeout=10)
            assert response.status_code == 200
            count = response.json()['count']
            assert count == initial_count + i + 1, f"Expected {initial_count + i + 1}, got {count}"
        
        response = requests.get(f"{BASE_URL}/get-count", timeout=10)
        final_count = response.json()['count']
        assert final_count == initial_count + 3, f"Expected {initial_count + 3}, got {final_count}"
        
        print(f"Multiple increments test passed ({initial_count} -> {final_count})")
        return True
    except Exception as e:
        print(f"Multiple increments test failed: {e}")
        return False

def test_web_interface():
    print("Testing web interface...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        content = response.text
        assert "Counter App" in content, "Missing 'Counter App' title"
        assert "increment" in content.lower(), "Missing increment button"
        assert "style.css" in content, "Missing CSS reference"
        
        print("Web interface test passed")
        return True
    except Exception as e:
        print(f"Web interface test failed: {e}")
        return False

def test_database_persistence():
    print("Testing database persistence...")
    try:
        response = requests.get(f"{BASE_URL}/get-count", timeout=10)
        count1 = response.json()['count']
        
        response = requests.post(f"{BASE_URL}/increment", timeout=10)
        count2 = response.json()['count']
        
        response = requests.get(f"{BASE_URL}/get-count", timeout=10)
        count3 = response.json()['count']
        
        assert count2 == count3, f"Count not persistent: {count2} != {count3}"
        assert count2 == count1 + 1, f"Count not incremented: {count2} != {count1 + 1}"
        
        print(f"Database persistence test passed ({count1} -> {count2})")
        return True
    except Exception as e:
        print(f"Database persistence test failed: {e}")
        return False

def test_error_handling():
    print("Testing error handling...")
    try:
        response = requests.get(f"{BASE_URL}/invalid-endpoint", timeout=10)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        
        response = requests.get(f"{BASE_URL}/increment", timeout=10)
        assert response.status_code == 405, f"Expected 405, got {response.status_code}"
        
        print("Error handling test passed")
        return True
    except Exception as e:
        print(f"Error handling test failed: {e}")
        return False

def main():
    print("Starting Flask Counter App Live Tests")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print("=" * 60)
    
    tests = [
        test_health_endpoint,
        test_get_count,
        test_increment_counter,
        test_multiple_increments,
        test_web_interface,
        test_database_persistence,
        test_error_handling
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 60)
    print(f"Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("All tests passed! Application is working correctly.")
        return 0
    else:
        print("Some tests failed. Check the application.")
        return 1

if __name__ == "__main__":
    exit(main())
