# Lab1

### Development Environment

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

**Access:**
- Web App: http://localhost:5000
- pgAdmin: http://localhost:5050 (admin@counter.com / admin123)

### Production Environment

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

**Access:**
- Web App: http://localhost:80

## API Endpoints

- `GET /health` - Health check
- `GET /get-count` - Get current counter value
- `POST /increment` - Increment counter by 1

## Running Tests

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

python3 tests/test_live.py
```