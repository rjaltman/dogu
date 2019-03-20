#! /usr/bin/env python3
import re
from sys import argv
from os import path, environ, scandir
import psycopg2
from datetime import datetime
from itertools import chain

if "DATABASE_URL" in environ:
    conn = psycopg2.connect(environ["DATABASE_URL"], sslmode="require")
else:
    conn = psycopg2.connect("host=localhost dbname=dogu user=dogu password=password")

TABLE_NAME = "migrations"
DATE_FORMAT_STRING = "%Y%m%d%H%M%S"
DIRECTORY_NAME = "migrations"

def searchFile(path, s):
    with open(path) as f:
        return any(s.upper() in l.upper() for l in f)

def ensureMigrationsTableExists():
    with conn.cursor() as c:
        c.execute("CREATE TABLE IF NOT EXISTS {} (time timestamp)".format(TABLE_NAME))
        conn.commit()

def printHelp():
    print("To create new migration, run")
    print("\tpython3 migrate.py new <migration_message>")
    print("To run migrations, run")
    print("\tpython3 migrate.py migrate")

def getDateString():
    rightNow = datetime.now()
    return rightNow.strftime(DATE_FORMAT_STRING)

def dateFromPath(pathStr):
    name = path.basename(pathStr)
    date, _ = name.split("_", 1)
    return datetime.strptime(date, DATE_FORMAT_STRING)

def runMigration(path):
    SQL_COMMENT = re.compile(r"--.*?\n|\/\*.*?\*\/", re.DOTALL)
    d = dateFromPath(path)
    with conn.cursor() as c:
        c.execute("INSERT INTO {} VALUES (%s)".format(TABLE_NAME), (d, ))
        with open(path) as f:
            c.execute(re.sub(SQL_COMMENT, "", f.read()))
        conn.commit()


def runMigrations():
    ensureMigrationsTableExists()
    with conn.cursor() as c:
        c.execute("SELECT time FROM {}".format(TABLE_NAME))
        previousMigrations = frozenset(chain.from_iterable(c))

    migrationsToDo = sorted((dent.path for dent in scandir(DIRECTORY_NAME) if dent.name.endswith('.sql') and dateFromPath(dent.path) not in previousMigrations))
    if any(searchFile(path, "commit") or searchFile(path, "transaction") for path in migrationsToDo):
        print("Don't include any transactions in your migrations. Each one will automatically be run in a transaction.")
        return
        
    for path in migrationsToDo:
        print("Running {}".format(path))
        runMigration(path)
    
    print("Ran {} migrations successfully".format(len(migrationsToDo)))


if len(argv) >= 3 and argv[1] == "new":
    name = "_".join(argv[2:])
    filename = "{}_{}.sql".format(getDateString(), name)
    fullPath = path.join(DIRECTORY_NAME, filename)
    try:
        open(fullPath, 'w')
        print("Created migration file at {}".format(fullPath))
    except FileNotFoundError:
        print("You probably need to make a \"migrations\" directory")
        exit(1)

elif len(argv) == 2 and argv[1] == "migrate":
    runMigrations()
else:
    printHelp()
