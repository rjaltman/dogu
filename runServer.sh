#! /bin/bash
set -e
export FLASK_ENV=development
export PGHOST="localhost"
source secrets.sh
flask run
