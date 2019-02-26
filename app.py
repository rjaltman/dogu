from flask import Flask, jsonify
import json
from os import environ, path
import psycopg2
app = Flask(__name__, static_folder="frontend/build")

if "DATABASE_URL" in environ:
    conn = psycopg2.connect(environ["DATABASE_URL"], sslmode="require")
else:
    conn = psycopg2.connect("host=localhost dbname=dogu user=dogu password=password")

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
    with conn.cursor() as c:
        c.execute("SELECT * FROM people")
        return jsonify({name: age for (name, age) in c})

@app.route('/api/insert')
def add_stuff():
    with conn.cursor as c:
        cursor.execute("INSERT INTO people (name, age) VALUES ('Melvyn', 35)")
        cursor.commit()
        return "DONE"
