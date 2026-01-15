# Docker PostgreSQL Database Setup

## Quick Start

**Windows:**
```batch
docker-run-db.bat
```

**Linux/Mac:**
```bash
chmod +x docker-run-db.sh
./docker-run-db.sh
```

## Manual Docker Run Command

```bash
docker run -d \
  --name carbnb-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=carrental \
  -p 5432:5432 \
  -v carbnb-postgres-data:/var/lib/postgresql/data \
  postgres:14-alpine
```

## Connection String

After running the container, use:
```
DATABASE_URL=postgresql://user:password@localhost:5432/carrental
```

Or:
```
postgresql://user:password@localhost/carrental
```

## Useful Commands

**Check if container is running:**
```bash
docker ps | grep carbnb-postgres
```

**View logs:**
```bash
docker logs carbnb-postgres
```

**Stop the container:**
```bash
docker stop carbnb-postgres
```

**Start the container (if stopped):**
```bash
docker start carbnb-postgres
```

**Remove the container:**
```bash
docker rm carbnb-postgres
```

**Remove container and volume (deletes all data):**
```bash
docker rm -v carbnb-postgres
```

**Connect to database via psql:**
```bash
docker exec -it carbnb-postgres psql -U user -d carrental
```

## Environment Variables

- `POSTGRES_USER=user` - Database username
- `POSTGRES_PASSWORD=password` - Database password
- `POSTGRES_DB=carrental` - Database name
- `-p 5432:5432` - Maps container port 5432 to host port 5432
- `-v carbnb-postgres-data:/var/lib/postgresql/data` - Persistent data storage

## Troubleshooting

**Port 5432 already in use:**
- Change the port mapping: `-p 5433:5432` (then use `localhost:5433` in connection string)
- Or stop the existing PostgreSQL service

**Container won't start:**
- Check logs: `docker logs carbnb-postgres`
- Check if container already exists: `docker ps -a | grep carbnb-postgres`
- Remove old container: `docker rm carbnb-postgres`
























