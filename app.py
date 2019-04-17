from flask import Flask, jsonify, request, session
from backend.database import conn
from backend import utils
from psycopg2.extras import RealDictCursor
from binascii import hexlify
from hashlib import scrypt
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
        c.execute("INSERT INTO account (username, password, university_id) VALUES (%s, %s, (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)'))", (username, hashedPassword))
        out = jsonify({"success": True})
        conn.commit()
    return out


@app.route("/api/auth/registerStudent", methods=["POST"])
def registerStudent():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    name = request.json.get("name", None)
    dept = request.json.get("dept", None)
    contactemail = request.json.get("contactemail", None)
    position = request.json.get("position", None)
    university_id = request.json.get("university_id", None)
    avatar = request.json.get("avatar", None)

    if not (username and password):
        return jsonify({"success": False, "error": "You must give username, password, and email"})

    with conn.cursor() as c:
        c.execute("SELECT count(*) FROM account WHERE username = %s", (username, ))
        if c.fetchone()[0] != 0:
            return jsonify({"success": False, "error": "That username is already taken"})

        hashedPassword = hashPassword(password)
        c.execute("INSERT INTO account (username, password, name, dept, contactemail, position, university_id, avatar) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)", (username, hashedPassword,name,dept,contactemail,position,university_id,avatar))
        out = jsonify({"success": True})
        # This sets the cookie that keeps the user logged in for the rest of the session
        # You can read the username out of this session variable whenever you want
        session["username"] = username
        conn.commit()
    return out

@app.route("/api/auth/registerRep", methods=["POST"])
def registerRep():
    username = request.json.get("username", None)
    password = request.json.get("password", None)
    name = request.json.get("name", None)
    dept = request.json.get("dept", None)
    contactemail = request.json.get("contactemail", None)
    position = request.json.get("position", None)
    university_id = request.json.get("university_id", None)
    avatar = request.json.get("avatar", None)

    if not (username and password):
        return jsonify({"success": False, "error": "You must give username, password, and email"})

    with conn.cursor() as c:
        c.execute("SELECT count(*) FROM account WHERE username = %s", (username, ))
        if c.fetchone()[0] != 0:
            return jsonify({"success": False, "error": "That username is already taken"})

        hashedPassword = hashPassword(password)
        c.execute("INSERT INTO account (username, password, name, dept, contactemail, position, avatar) VALUES (%s, %s, %s, %s, %s, %s, %s)", (username, hashedPassword,name,dept,contactemail,position,avatar))
        out = jsonify({"success": True})
        # This sets the cookie that keeps the user logged in for the rest of the session
        # You can read the username out of this session variable whenever you want
        session["username"] = username
        conn.commit()

    # Commit the account first before going and updating with the ID of the organizer just formed here
    with conn.cursor() as c:
        c.execute("SELECT id FROM account WHERE username = %s", (username, ))
        id = list(c.fetchone())[0]
        c.execute("INSERT INTO rep (account_id, organization_id) VALUES (%s, %s)", (id, university_id));
        conn.commit()

    return out

@app.route('/api/getProfileInfo', methods=["POST"])
def getProfileInfo():
    username = request.json.get("username", None)
    if not (username):
        return jsonify({"success": False, "error": "You didn't pass a username."})

    with conn.cursor() as c:
        c.execute("SELECT username, name, position, avatar FROM account")

        c.execute("SELECT username, name, position, avatar FROM account WHERE username = %s", (username, ))
        result = c.fetchone()
        if not result:
            return jsonify({"success": False, "error": "There is no account by that username"})
        print(result)
        # result = list(result)

        if not result.name:
            result.name = result.username
        if not result.avatar:
            result.avatar = "https://www.gravatar.com/avatar/?default=mm&size=160"
        out = jsonify({"success": True, "name": result.name, "position": result.position, "avatar": result.avatar})
        conn.commit()
    return out

@app.route("/api/createproject", methods=["POST"])
def createproject():
    name = request.json.get("name", None)
    description = request.json.get("description", None)
    tags = request.json.get("tags", None)

    if not (name and description and isinstance(tags, list)):
        return jsonify({"success": False, "error": "You must give a name, a description, and a list of tags"})


    with conn.cursor(cursor_factory=RealDictCursor) as c:
        c.execute(("INSERT INTO project (name, description) VALUES (%s, %s) "
                   "RETURNING *"), (name, description))
        newProject = c.fetchone()
        if not newProject:
            raise Exception("Well I have no idea what to do with this")
        newProjectId = newProject["id"]
        c.executemany("INSERT INTO project_tags (tag, project_id) VALUES (%s, %s)", [(t, newProjectId) for t in tags])
        out = jsonify({"success": True, "project": newProject})
        conn.commit()
    return out

@app.route("/api/editProject", methods=["POST"])
def editProject():
    id = request.json.get("id", None)
    description = request.json.get("description", None)
    tags = request.json.get("tags", None)

    if not id:
        return jsonify({"success": False, "error": "You must specify project id"})

    if not getProjectById(id):
        return jsonify({"success": False, "error": "There is no project with that id"})

    if not description:
        return jsonify({"success": False, "error": "You must give a new description"})

    with conn.cursor() as c:
        c.execute("UPDATE project SET description = %s WHERE id = %s", (description, id))
        if tags != None:
            c.execute("DELETE FROM project_tags WHERE project_id = %s", (id, ))
            c.executemany("INSERT INTO project_tags (tag, project_id) VALUES (%s, %s)", [(t, id) for t in tags])
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

@app.route("/api/listUniversities", methods=["GET"])
def listUniversities():
    with conn.cursor(cursor_factory=RealDictCursor) as c:

        c.execute("SELECT * FROM university")
        key_val = {}
        projectsToShow = list(c)
        for i in projectsToShow:
            key_val[i['id']] = i['name']
        conn.commit()

    return jsonify({"success": True, "universities": key_val})

@app.route("/api/listOrgs", methods=["GET"])
def listOrganizations():
    with conn.cursor(cursor_factory=RealDictCursor) as c:

        c.execute("SELECT * FROM organization")
        key_val = {}
        projectsToShow = list(c)
        for i in projectsToShow:
            key_val[i['id']] = i['name']
        conn.commit()

    return jsonify({"success": True, "organizations": key_val})

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
                       "SELECT * FROM project WHERE "
                       "(university_id IS NULL OR (SELECT * FROM myUniversityId) IS NULL OR university_id = (select * from myUniversityId)) AND "
                       "(concat_ws(' ', name, description) SIMILAR TO %(re)s "
                       "OR EXISTS (SELECT 1 FROM project_tags pt where pt.project_id = id AND pt.tag SIMILAR TO %(re)s))"),
                      {"username": username, "re": searchRe})
            projectsToShow = list(c)

    return jsonify({"success": True, "projects": projectsToShow})

@app.route("/api/recommendations", methods=["GET"])
def getRecommendations():
    username = session.get('username', None)
    with conn.cursor(cursor_factory=RealDictCursor) as c:
        if not username:
            c.execute("WITH proj_pref_ct AS ("
                        "SELECT project_id, count(*) AS ct "
                        "FROM preferences "
                        "GROUP BY project_id "
                        "ORDER BY ct DESC "
                        "LIMIT 20"
                    ") "
                    "SELECT * "
                    "FROM project "
                    "WHERE id IN ( "
                        "SELECT project_id "
                        "FROM proj_pref_ct "
                    ")")
            projectsToShow = list(c)
        else:
            #c.execute("SELECT EXISTS (SELECT 1 FROM account WHERE username = %s)", (username, ))
            #if not all(c.fetchone().values()):
            #    raise Exception("You have a cookie from a user who doesn't exist!")
            c.execute(("WITH my_account_id AS ("
                "SELECT account.id "
                "FROM account "
                "WHERE username = %(username)s"
                "), my_preferences AS ("
                "SELECT project_id "
                "FROM preference "
                "WHERE preference.account_id IN (SELECT * FROM my_account_id)"
                "), related_tags AS ("
                "SELECT project_tags.tag "
                "FROM my_preferences, preference "
                "INNER JOIN project_tags ON preference.project_id=project_tags.project_id"
                "), projects_same_tag AS ("
                "SELECT project_id "
                "FROM project_tags "
                "WHERE project_tags.tag IN (SELECT tag FROM related_tags) "
                "ORDER BY RANDOM() "
                "LIMIT 20"
                ")"
                "SELECT * "
                "FROM project "
                "WHERE (status='New') AND id IN ("
                    "SELECT project_id "
                    "FROM projects_same_tag "
                    "EXCEPT "
                        "(SELECT project_id "
                        "FROM preference "
                        "WHERE preference.account_id IN (SELECT * FROM my_account_id)))"),
                {"username": username})
            projectsToShow = list(c)
            if not(projectsToShow):
                c.execute("WITH proj_pref_ct AS ("
                        "SELECT project_id, count(*) AS ct "
                        "FROM preference "
                        "GROUP BY project_id "
                        "ORDER BY ct DESC "
                        "LIMIT 20"
                    ") "
                    "SELECT * "
                    "FROM project "
                    "WHERE id IN ( "
                        "SELECT project_id "
                        "FROM proj_pref_ct "
                    ")")
                projectsToShow = list(c)

    return jsonify({"success": True, "projects": projectsToShow})

@app.route("/api/project/<int:id>", methods=["GET"])
def getProject(id):
    return jsonify({"project": getProjectById(id), "success": True})

@app.route("/api/project/setTags", methods=["POST"])
def setTags():
    projectId = request.json.get("id", None)
    if projectId == None:
        return jsonify({"success": False, "error": "You didn't pass an id!"})
    elif not getProjectById(projectId):
        return jsonify({"success": False, "error": "There is no project with that id"})

    tags = request.json.get("tags", None)
    if tags == None or not isinstance(tags, list):
        return jsonify({"success": False, "error": "You didn't pass a the tags as a list!"})

    with conn:
        with conn.cursor() as c:
            c.execute("DELETE FROM project_tags WHERE project_id = %s", (projectId, ))
            c.executemany("INSERT INTO project_tags (project_id, tag) VALUES (%s, %s)", [(projectId, t) for t in tags])


    return jsonify({"success": True, "project": getProjectById(projectId)})

@app.route("/api/project/preference/delete", methods=["POST"])
def deleteProjectPreference():
    projectId = request.json.get("id", None)
    if projectId == None:
        return error("You have to pass a project id!")
    if not "username" in session:
        return error("You must be logged in!")
    with conn:
        with conn.cursor() as c:
            c.execute("DELETE FROM preference WHERE project_id = %s AND account_id = (SELECT id FROM account WHERE username = %s)", (projectId, session["username"]))
    utils.compressRankings()
    return jsonify({"success": True})

@app.route("/api/project/preference", methods=["GET"])
def getProjectPreferences():
    if not "username" in session:
        return error("You must be logged in!")
    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as c:
            c.execute("SELECT project.* FROM preference INNER JOIN project ON preference.project_id = project.id INNER JOIN account a ON a.id = preference.account_id WHERE a.username = %s ORDER BY preference.ranking ASC", (session["username"], ))
            projects = c.fetchall()
            return jsonify({"success": True, "projects": projects})

@app.route("/api/project/preference/set", methods=["POST"])
def preferenceProject():
    projectId = request.json.get("id", None)
    if projectId == None:
        return error("You have to pass a project id!")
    if not "username" in session:
        return error("You must be logged in!")
    rank = request.json.get("rank", None)
    if rank == None:
        rankVal = utils.getLowestRankedProject(session["username"])
        if rankVal == None:
            rankVal = 1
        else:
            rankVal += 1
    elif rank <= 0:
        return error("Your rank must be greater than or equal to 1")
    elif rank == 1:
        rankVal = 1
    else:
        with conn:
            with conn.cursor() as c:
                c.execute("DELETE FROM preference WHERE account_id = (SELECT id FROM account WHERE username = %s) AND project_id = %s", (session["username"], projectId))
                c.execute("SELECT MAX(s.ranking) FROM (SELECT ranking FROM preference p INNER JOIN account a ON a.id = p.account_id WHERE a.username = %s ORDER BY ranking ASC LIMIT %s) AS s", (session["username"], rank - 1))
                t = c.fetchone()
                if t == None:
                    rankVal = 1
                else:
                    rankVal = t[0] + 1

    with conn:
        with conn.cursor() as c:
            # Make sure nothing else has this same preference
            c.execute("SELECT EXISTS(SELECT 1 FROM preference p INNER JOIN account a ON a.id = p.account_id WHERE ranking = %s AND a.username = %s)",
                      (rankVal, session["username"]))
            if c.fetchone()[0]:
                # If they do, we're going to slide them all back so we can insert it
                c.execute("UPDATE preference SET ranking = ranking + 1 WHERE ranking >= %s AND account_id = (SELECT id FROM account WHERE username = %s)",
                          (rankVal, session["username"]))
            c.execute(("INSERT INTO preference (ranking, account_id, project_id) "
                       "VALUES (%s, (SELECT id FROM account WHERE username = %s), %s) "
                       "ON CONFLICT ON CONSTRAINT project_id_account_id_key DO UPDATE SET ranking = EXCLUDED.ranking"),
                      (rankVal, session["username"], projectId))
    utils.compressRankings()
    with conn:
        with conn.cursor() as c:
            c.execute("SELECT ranking FROM preference p INNER JOIN account a ON a.id = p.account_id WHERE a.username = %s AND p.project_id = %s",
                      (session["username"], projectId))
            (newRank, ) = c.fetchone()
            return jsonify({"success": True, "newRank": newRank})

def error(s):
    return jsonify({"success": False, "error": s})

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

def getProjectById(id):
    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as c:
            c.execute("SELECT * FROM project WHERE id = %s", (id, ))
            project = c.fetchone()
            if not project:
                return None
            c.execute("SELECT tag FROM project_tags WHERE project_id = %s", (id, ))
            tags = [t["tag"] for t in c]
            project["tags"] = tags
            if "username" in session:
                c.execute("SELECT p.ranking FROM preference p INNER JOIN account a ON a.id = p.account_id WHERE project_id = %s AND a.username = %s",
                          (id, session["username"]))
                rankT = c.fetchone()
                project["ranking"] = rankT["ranking"] if rankT != None else None
            else:
                project["ranking"] = None
            return project
