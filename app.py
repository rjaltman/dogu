from flask import Flask, jsonify, request, session
from binascii import hexlify
from hashlib import scrypt
import secrets
import json
from os import environ, path
import psycopg2
app = Flask(__name__, static_folder="frontend/build")

if "DATABASE_URL" in environ:
    conn = psycopg2.connect(environ["DATABASE_URL"], sslmode="require")
else:
    conn = psycopg2.connect("host=localhost dbname=dogu user=dogu password=password")

Flask.secret_key = environ["SECRET_KEY"]

@app.route('/')
def reactIndex():
    # DON'T CHANGE THIS
    return app.send_static_file("index.html")

@app.route("/static/<path:subpath>")
def reactStatic(subpath):
    # OR THIS
    return app.send_static_file(path.join("static", subpath))

@app.route('/api/auth/login', methods=["POST"])
def login():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    if not (username and password):
        return jsonify({"success": False, "error": "You didn't pass a username and a password"})

    with conn.cursor() as c:
        c.execute("SELECT username, password FROM account WHERE username = %s", (username, ))
        result = c.fetchone()
        if not result:
            return jsonify({"success": False, "error": "There is no account by that username"})

        if checkPasswordCorrect(password, result[1]):
            # This sets the cookie that keeps the user logged in for the rest of the session
            # You can read the username out of this session variable whenever you want
            session["username"] = username
            out = jsonify({"success": True})
        else:
            out = jsonify({"success": False, "error": "That's the wrong password!"})
        conn.commit()
    return out


@app.route("/api/auth/register", methods=["POST"])
def register():
    username = request.json.get("username", None)
    password = request.json.get("password", None)

    if not (username and password):
        return jsonify({"success": False, "error": "You must give username, password, and email"})

    with conn.cursor() as c:
        c.execute("SELECT count(*) FROM account WHERE username = %s", (username, ))
        if c.fetchone()[0] != 0:
            return jsonify({"success": False, "error": "That username is already taken"})

        hashedPassword = hashPassword(password)
        # TODO: When you change the registration form to actually ask for the university, you had better change this, otherwise things will
        # act very strange. Also you should remove the fake university I added in migrations/20190319231235_make_fake_university_for_testing_purposes.sql.
        c.execute("INSERT INTO account (username, password, university_id) VALUES (%s, %s, (SELECT id FROM university LIMIT 1))", (username, hashedPassword))
        out = jsonify({"success": True})
        conn.commit()
    return out

@app.route("/api/search", methods=["GET"])
def search():
    searchTerms = request.query.getlist('q')
    username = request.session.get('username', None)
    if not u:
        # This person is a looky-loo; I guess they get to see everything?
        pass

# These functions should probably be moved into a separate file...
def generateSalt():
    """
    This function generates a cryptographically secure random 2-letter salt
    for password hashing.

    returns: a string, the hash
    """
    import secrets
    import string
    alphabet = string.ascii_letters + string.digits
    salt = ''.join(secrets.choice(alphabet) for i in range(2))
    return salt

def hashPassword(password, salt = None):
    """
    This hashes a password, given as a string or a bytes, with the given
    salt. If no salt is given, a random one is generated. 

    returns: the resulting hash, preceded by the salt, as a string
    """
    if salt == None:
        salt = generateSalt().encode("ASCII")
    elif isinstance(salt, str):
        salt = salt.encode("ASCII")

    if isinstance(password, str):
        password = password.encode("ASCII")

    output = scrypt(password, salt=salt, n=2**8, r=128, p=4)
    return salt.decode("ASCII") + hexlify(output).decode("ASCII")

def checkPasswordCorrect(testPassword, hashedPassword):
    """
    This checks if a given test password is 
    hashes to a given hashed password. The hashed password
    is assumed to be prededed by a 2-letter salt.
    This is safe against timing attacks.
    """
    salt = hashedPassword[:2]
    return secrets.compare_digest(hashedPassword, hashPassword(testPassword, salt))
