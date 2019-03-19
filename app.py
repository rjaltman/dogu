from flask import Flask, jsonify, request
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
        out = jsonify({"data": [(name, age) for (name, age) in c]})
        conn.commit()
    return out

@app.route('/api/insert', methods=["POST"])
def add_stuff():
    with conn.cursor() as c:
        name = request.json["name"]
        age = request.json["age"]
        c.execute("INSERT INTO people (name, age) VALUES (%s, %s)", (name, age))
        conn.commit()
    return jsonify({"status":"success"})

@app.route('/api/delete', methods=["POST"])
def delete_thing():
    with conn.cursor() as c:
        name = request.json["name"]
        c.execute("DELETE FROM people WHERE name = %s", (name, ))
        conn.commit()
    return jsonify({"status":"success"})

@app.route('/api/auth/login', methods=["POST"])
def login():
    if request.json.get("username", "") == "rick" and request.json.get("password", "") == "morty":
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": "Eeyore didn't like that response"})
