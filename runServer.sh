#! /bin/bash
set -e
trap "exit" INT TERM ERR
trap "kill 0" EXIT
export FLASK_ENV=development
export PGHOST="localhost"
export PGPASSWORD="password"
export BROWSER="none"
flask run &
cd frontend && npm start
