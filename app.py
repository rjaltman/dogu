from flask import Flask, jsonify, request, session
from backend.database import conn
from psycopg2.extras import RealDictCursor
from binascii import hexlify
# from hashlib import scrypt
import secrets
import json
from os import environ, path
app = Flask(__name__, static_folder="frontend/build")


Flask.secret_key = environ["SECRET_KEY"]

@app.route('/')
def reactIndex():
    # DON'T CHANGE THIS
    return app.send_static_file("index.html")

@app.route("/static/<path:subpath>")
def reactStatic(subpath):
    # OR THIS
    return app.send_static_file(path.join("static", subpath))

# @app.route('/api/auth/login', methods=["POST"])
# def login():
#     username = request.json.get("username", None)
#     password = request.json.get("password", None)
#     if not (username and password):
#         return jsonify({"success": False, "error": "You didn't pass a username and a password"})
#
#     with conn.cursor() as c:
#         c.execute("SELECT username, password FROM account WHERE username = %s", (username, ))
#         result = c.fetchone()
#         if not result:
#             return jsonify({"success": False, "error": "There is no account by that username"})
#
#         if checkPasswordCorrect(password, result[1]):
#             # This sets the cookie that keeps the user logged in for the rest of the session
#             # You can read the username out of this session variable whenever you want
#             session["username"] = username
#             out = jsonify({"success": True})
#         else:
#             out = jsonify({"success": False, "error": "That's the wrong password!"})
#         conn.commit()
#     return out
#
#
# @app.route("/api/auth/register", methods=["POST"])
# def register():
#     username = request.json.get("username", None)
#     password = request.json.get("password", None)
#
#     if not (username and password):
#         return jsonify({"success": False, "error": "You must give username, password, and email"})
#
#     with conn.cursor() as c:
#         c.execute("SELECT count(*) FROM account WHERE username = %s", (username, ))
#         if c.fetchone()[0] != 0:
#             return jsonify({"success": False, "error": "That username is already taken"})
#
#         hashedPassword = hashPassword(password)
#         # TODO: When you change the registration form to actually ask for the university, you had better change this, otherwise things will
#         # act very strange. Also you should remove the fake university I added in migrations/20190319231235_make_fake_university_for_testing_purposes.sql.
#         c.execute("INSERT INTO account (username, password, university_id) VALUES (%s, %s, (SELECT id FROM university LIMIT 1))", (username, hashedPassword))
#         out = jsonify({"success": True})
#         conn.commit()
#     return out

@app.route("/api/createproject", methods=["POST"])
def createproject():
    name = request.json.get("name", None)
    description = request.json.get("description", None)

    if not (name and description):
        return jsonify({"success": False, "error": "You must give a name and a description"})

    with conn.cursor() as c:
        c.execute("INSERT INTO project (name, description) VALUES (%s, %s)", (name, description))
        out = jsonify({"success": True})
        conn.commit()
    return out

@app.route("/api/editproject", methods=["POST"])
def editproject():
    id = request.json.get("id", None)
    description = request.json.get("description", None)

    if not (id):
        return jsonify({"success": False, "error": "You must specify project id"})

    if not (description):
        return jsonify({"success": False, "error": "You must give a new description"})

    with conn.cursor() as c:
        c.execute("UPDATE project SET description = %s WHERE id = %s", (description, id))
        out = jsonify({"success": True})
        conn.commit()
    return out

#this should probably do something is this project is a foreign key for something other than tags...
@app.route("/api/deleteproject", methods=["POST"])
def deleteproject():
    id = request.json.get("id", None)

    if not (id):
        return jsonify({"success": False, "error": "You must specify project id"})

    with conn.cursor() as c:
        c.execute("DELETE FROM project_tags WHERE project_id = %s", (id, ))
        c.execute("DELETE FROM project WHERE id = %s", (id, ))
        out = jsonify({"success": True})
        conn.commit()
    return out

@app.route("/api/search", methods=["GET"])
def search():
    searchTerms = request.args.getlist('q')
    searchRe = '%(' + "|".join(searchTerms) + ')%' if searchTerms else '%'
    username = session.get('username', None)
    with conn.cursor(cursor_factory=RealDictCursor) as c:
        if not username:
            # This person is a looky-loo; I guess they get to see everything?
            c.execute(("SELECT * FROM project p WHERE concat_ws(' ', p.name, p.description) SIMILAR TO %(re)s "
                       "OR EXISTS (SELECT 1 FROM project_tags pt where pt.project_id = p.id AND pt.tag SIMILAR TO %(re)s)"), {"re": searchRe})
            projectsToShow = list(c)
        else:
            c.execute("SELECT EXISTS (SELECT 1 FROM account WHERE username = %s)", (username, ))
            if not all(c.fetchone().values()):
                raise Exception("You have a cookie from a user who doesn't exist!")
            c.execute(("WITH myUniversityId AS ("
                       "SELECT university_id FROM account "
                       "WHERE username = %(username)s) "
                       "SELECT * FROM project "
                       "WHERE (university_id IS NULL OR (SELECT * FROM myUniversityId) IS NULL OR university_id = (select * from myUniversityId)) AND (concat_ws(' ', name, description) SIMILAR TO %(re)s "
                       "OR EXISTS (SELECT 1 FROM project_tags pt where pt.project_id = id AND pt.tag SIMILAR TO %(re)s))"),
                      {"username": username, "re": searchRe})
            projectsToShow = list(c)

    return jsonify({"success": True, "projects": projectsToShow})

@app.route("/api/project/<int:id>", methods=["GET"])
def getProject(id):
    with conn.cursor(cursor_factory=RealDictCursor) as c:
        c.execute("SELECT * FROM project WHERE id = %s", (id, ))
        project = c.fetchone()
        if not project:
            return jsonify({"success": False, "error": "There was no project with that id"})
        c.execute("SELECT tag FROM project_tags WHERE project_id = %s", (id, ))
        tags = [t["tag"] for t in c]
        ret = {"tags": tags, "project": project, "success": True}
        return jsonify(ret)

@app.route("/api/project/deleteTag", methods=["POST"])
def deleteTag():
    projectId = request.json.get("id", None)
    if projectId == None:
        return jsonify({"success": False, "error": "You didn't pass an id!"})

    tag = request.json.get("tag", None)
    if tag == None:
        return jsonify({"success": False, "error": "You didn't pass a tag!"})

    with conn.cursor() as c:
        c.execute("SELECT EXISTS (SELECT 1 FROM project WHERE id = %s)", (projectId, ))
        if not c.fetchone()[0]:
            return jsonify({"success": False, "error": "There was no project with that id"})
        c.execute("SELECT EXISTS (SELECT 1 FROM project_tags WHERE tag = %s AND project_id = %s)", (tag, projectId, ))
        if not c.fetchone()[0]:
            return jsonify({"success": False, "error": "That project doesn't have that tag!"})

        c.execute("DELETE FROM project_tags WHERE project_id = %s AND tag = %s", (projectId, tag))
        conn.commit()
        return jsonify({"success": True})

@app.route("/api/project/addTag", methods=["POST"])
def addTag():
    projectId = request.json.get("id", None)
    if projectId == None:
        return jsonify({"success": False, "error": "You didn't pass an id!"})

    tag = request.json.get("tag", None)
    if tag == None:
        return jsonify({"success": False, "error": "You didn't pass a tag!"})

    with conn.cursor() as c:
        c.execute("SELECT EXISTS (SELECT 1 FROM project WHERE id = %s)", (projectId, ))
        if not c.fetchone()[0]:
            return jsonify({"success": False, "error": "There was no project with that id"})
        c.execute("SELECT EXISTS (SELECT 1 FROM project_tags WHERE tag = %s AND project_id = %s)", (tag, projectId, ))
        if c.fetchone()[0]:
            return jsonify({"success": False, "error": "That project already has that tag!"})

        c.execute("INSERT INTO project_tags (project_id, tag) VALUES (%s, %s)", (projectId, tag))
        conn.commit()
        return jsonify({"success": True})


# These functions should probably be moved into a separate file...
# def generateSalt():
#     """
#     This function generates a cryptographically secure random 2-letter salt
#     for password hashing.
#
#     returns: a string, the hash
#     """
#     import secrets
#     import string
#     alphabet = string.ascii_letters + string.digits
#     salt = ''.join(secrets.choice(alphabet) for i in range(2))
#     return salt
#
# def hashPassword(password, salt = None):
#     """
#     This hashes a password, given as a string or a bytes, with the given
#     salt. If no salt is given, a random one is generated.
#
#     returns: the resulting hash, preceded by the salt, as a string
#     """
#     if salt == None:
#         salt = generateSalt().encode("ASCII")
#     elif isinstance(salt, str):
#         salt = salt.encode("ASCII")
#
#     if isinstance(password, str):
#         password = password.encode("ASCII")
#
#     output = scrypt(password, salt=salt, n=2**8, r=128, p=4)
#     return salt.decode("ASCII") + hexlify(output).decode("ASCII")
#
# def checkPasswordCorrect(testPassword, hashedPassword):
#     """
#     This checks if a given test password is
#     hashes to a given hashed password. The hashed password
#     is assumed to be prededed by a 2-letter salt.
#     This is safe against timing attacks.
#     """
#     salt = hashedPassword[:2]
#     return secrets.compare_digest(hashedPassword, hashPassword(testPassword, salt))
