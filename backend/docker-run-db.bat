@echo off
REM Docker run command for PostgreSQL database
REM DATABASE_URL=postgresql://user:password@localhost/carrental

docker run -d ^
  --name carbnb-postgres ^
  -e POSTGRES_USER=user ^
  -e POSTGRES_PASSWORD=password ^
  -e POSTGRES_DB=carrental ^
  -p 5432:5432 ^
  -v carbnb-postgres-data:/var/lib/postgresql/data ^
  postgres:14-alpine

echo PostgreSQL container started!
echo Connection string: postgresql://user:password@localhost:5432/carrental
echo.
echo To stop: docker stop carbnb-postgres
echo To remove: docker rm carbnb-postgres
echo To view logs: docker logs carbnb-postgres

pause
























