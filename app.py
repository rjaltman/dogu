from flask import Flask, jsonify
import json
from os import environ, path
import psycopg2
app = Flask(__name__, static_folder="dogu/build")

if environ.get("FLASK_ENV", None) == "development":
    password = environ["UNIVERSAL_PASSWORD"]
    conn = psycopg2.connect("host=localhost dbname=dogu user=dogu password={}".format(password))
else:
    conn = psycopg2.connect(environ["DATABASE_URL"], sslmode="require")

@app.route('/')
def reactIndex():
    # DON'T CHANGE THIS
    return app.send_static_file("index.html")

@app.route("/static/<path:subpath>")
def reactStatic(subpath):
    # OR THIS
    return app.send_static_file(path.join("static", subpath))

@app.route('/api/')
def hello_world():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM people")
    return jsonify({name: age for (name, age) in cursor})

@app.route('/api/insert')
def add_stuff():
    cursor = conn.cursor()
    cursor.execute("INSERT INTO people (name, age) VALUES ('Melvyn', 35)")
    cursor.execute("COMMIT")
    return "DONE"
