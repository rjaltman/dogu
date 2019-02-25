#! /bin/bash
set -e
trap "exit" INT TERM ERR
trap "kill 0" EXIT
export FLASK_ENV=development
export PGHOST="localhost"
source secrets.sh
flask run &
cd dogu && npm start
