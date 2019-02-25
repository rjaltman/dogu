from flask import Flask
import json
from os import environ
import psycopg2
app = Flask(__name__)

password = environ["UNIVERSAL_PASSWORD"]
conn = psycopg2.connect("dbname=dogu user=dogu password={}".format(password))

@app.route('/api/')
def hello_world():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM people")
    return json.dumps({name: age for (name, age) in cursor})

@app.route('/api/insert')
def add_stuff():
    cursor = conn.cursor()
    cursor.execute("INSERT INTO people (name, age) VALUES ('Melvyn', 35)")
    cursor.execute("COMMIT")
    return "DONE"
