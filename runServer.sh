#! /bin/bash
set -e
if ! (which flask > /dev/null); then
    echo Flask isn\'t installed
    exit 1
fi
trap "exit" INT TERM ERR
trap "kill 0" EXIT
export FLASK_ENV=development
export PGHOST="localhost"
export PGPASSWORD="password"
export BROWSER="none"
flask run &
cd frontend && npm start
