from flask import Flask, jsonify, request, session
from backend.database import conn
from backend import utils
from psycopg2.extras import RealDictCursor
from binascii import hexlify
from hashlib import scrypt
import secrets
import json
from os import environ, path
from random import shuffle
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
        c.execute("INSERT INTO rep (account_id, organization_id) VALUES (%s, %s)", (id, university_id))
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

        if not result.name:
            result.name = result.username
        if not result.avatar:
            result.avatar = "https://www.gravatar.com/avatar/?default=mm&size=160"
        out = jsonify({"success": True, "name": result.name, "position": result.position, "avatar": result.avatar})
        conn.commit()
    return out

@app.route("/api/createcourse", methods=["POST"])
def createcourse():
    name = request.json.get("name", None)
    description = request.json.get("description", None)
    term = request.json.get("semester", None)
    crn = request.json.get("crn", None)
    groupsizemax = request.json.get("groupsizemax", None)
    groupsizemin = request.json.get("groupsizemin", None)
    maxrankings = request.json.get("maxrankings", None)

    s_username = session.get('username', None)

    if not (name and term and crn):
        return jsonify({"success": False, "error": "You must give a name, term, and course code."})

    with conn.cursor(cursor_factory=RealDictCursor) as c:
        c.execute(("SELECT university_id FROM account WHERE username = %(username)s"), {"username": s_username})
        university_id = c.fetchone()["university_id"]
        c.execute(("INSERT INTO course (crn, term, title, university_id, groupsizemax, groupsizemin, maxrankings) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s) "
                    "RETURNING *"), (crn, term, name, university_id, groupsizemax, groupsizemin, maxrankings))
        cid = c.fetchone()["id"]
        print (cid)
        print (s_username)

        c.execute(("INSERT INTO instructor (account_id, course_id) VALUES ((SELECT id FROM account WHERE username = %(username)s), %(cid)s)"), {"username": s_username, "cid": cid})
        out = jsonify({"success": True})
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

@app.route("/api/deleteproject", methods=["POST"])
def deleteproject():
    id = request.json.get("id", None)

    if not (id):
        return jsonify({"success": False, "error": "You must specify project id"})

    with conn.cursor() as c:
        c.execute("SELECT * FROM preference WHERE project_id = %s", (id, ))
        preference = c.fetchone()
        c.execute("SELECT * FROM approved WHERE project_id = %s", (id, ))
        approved = c.fetchone()
        c.execute("SELECT * FROM project_group WHERE project_id = %s", (id, ))
        group = c.fetchone()

        if preference or approved or group:
            return jsonify({"success": False, "error": "This project has an attached group or preference that prevent deletion"})

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

# this is a copy paste job and needs to be improved to detail crn, term, instructor, and other distinguishing features
@app.route("/api/listCourses", methods=["GET"])
def listCourses():
    with conn.cursor(cursor_factory=RealDictCursor) as c:

        c.execute("SELECT * FROM course")
        key_val = {}
        coursesToShow = list(c)
        for i in coursesToShow:
            key_val[i['id']] = i['title']
        conn.commit()

    return jsonify({"success": True, "courses": key_val})

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

@app.route("/api/courses_to_drop", methods=["GET"])
def getCoursesToDrop():
    username = session.get('username', None)
    with conn.cursor(cursor_factory=RealDictCursor) as c:
        c.execute(("WITH my_acct AS ("
                "SELECT id, university_id "
                "FROM account "
                "WHERE username = %(username)s"
                ") "
                "SELECT course.id, course.crn, course.university_id, course.term, course.title, course.groupsizemin "
                "FROM course "
                "INNER JOIN my_acct ON my_acct.university_id = course.university_id "
                "INNER JOIN enroll ON (enroll.course_id = course.id AND enroll.university_id = course.university_id AND enroll.account_id = my_acct.id) "), {"username": username})
        coursesToShow = list(c)
    return jsonify({"success": True, "courses": coursesToShow})

@app.route("/api/courses_of_instructors", methods=["GET"])
def getCoursesOfInstructors():
    username = session.get('username', None)
    with conn.cursor(cursor_factory=RealDictCursor) as c:
        c.execute(("WITH my_acct AS ("
                "SELECT id, university_id "
                "FROM account "
                "WHERE username = %(username)s"
                ") "
                "SELECT course.id, course.crn, course.university_id, course.term, course.title, course.groupsizemin "
                "FROM course "
                "INNER JOIN my_acct ON my_acct.university_id = course.university_id "
                "INNER JOIN instructor ON (instructor.course_id = course.id AND instructor.account_id = my_acct.id) "), {"username": username})
        coursesToShow = list(c)

    return jsonify({"success": True, "courses": coursesToShow})

@app.route("/api/courses_to_add", methods=["GET"])
def getCoursesToAdd():
    username = session.get('username', None)
    with conn.cursor(cursor_factory=RealDictCursor) as c:
        c.execute(("WITH my_acct AS ("
                "SELECT id, university_id "
                "FROM account "
                "WHERE username = %(username)s"
                "), ctd AS ("
                "SELECT course.id AS id, course.crn AS crn, course.university_id AS university_id, course.term AS term, course.title AS title, course.groupsizemin AS groupsizemin "
                "FROM course "
                "INNER JOIN my_acct ON my_acct.university_id = course.university_id "
                "INNER JOIN enroll ON (enroll.course_id = course.id AND enroll.university_id = course.university_id AND enroll.account_id = my_acct.id) "
                ") "
                "SELECT course.id AS id, course.crn AS crn, course.university_id AS university_id, course.term AS term, course.title AS title, course.groupsizemin AS groupsizemin "
                "FROM course "
                "INNER JOIN my_acct ON my_acct.university_id = course.university_id "
                "EXCEPT (SELECT * FROM ctd)"), {"username": username})
        coursesToShow = list(c)
    return jsonify({"success": True, "courses": coursesToShow})

@app.route("/api/add_course", methods=["POST"])
def addCourse():
    cid = request.json.get("cid", None)
    username = session.get('username', None)
    with conn.cursor(cursor_factory=RealDictCursor) as c:
        c.execute(("SELECT account.id, university_id "
                "FROM account "
                "WHERE username = %(username)s"
                ), {"username": username})

        d = c.fetchone()
        acct_id = d["id"]
        uid = d["university_id"]

        c.execute("SELECT * "
                "FROM enroll "
                "WHERE account_id = %(acct_id)s "
                "AND course_id = %(cid)s "
                "AND university_id = %(uid)s",
                {"acct_id":acct_id, "cid":cid, "uid":uid})

        if not (c.fetchone()):
            c.execute("INSERT INTO enroll (account_id, course_id, university_id) VALUES (%(acct_id)s, %(cid)s, %(uid)s)", {"acct_id":acct_id, "cid":cid, "uid":uid})
            conn.commit()
            return jsonify({"success": True})

    return jsonify({"success": False})

@app.route("/api/drop_course", methods=["POST"])
def dropCourse():
    cid = request.json.get("cid", None)
    username = session.get('username', None)
    with conn.cursor(cursor_factory=RealDictCursor) as c:
        c.execute(("SELECT account.id, university_id "
                "FROM account "
                "WHERE username = %(username)s"
                ), {"username": username})

        d = c.fetchone()
        acct_id = d["id"]
        uid = d["university_id"]

        c.execute("DELETE FROM enroll WHERE ((account_id = %(acct_id)s) AND (course_id = %(cid)s) AND (university_id = %(uid)s))", {"acct_id":acct_id, "cid":cid, "uid":uid})
        conn.commit()

    return jsonify({"success": True})

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

@app.route("/api/project/studentassigned", methods=["GET"])
def getProjectsAssignedToStudents():
    if not "username" in session:
        return error("You must be logged in!")
    with conn:
        with conn.cursor(cursor_factory=RealDictCursor) as c:
            c.execute("SELECT DISTINCT project.* FROM project_group INNER JOIN project ON project_group.project_id = project.id "
                "INNER JOIN member ON project_group.id = member.project_group_id INNER JOIN account a "
                "ON a.id = member.account_id WHERE a.username = %s", (session["username"], ))
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

@app.route("/api/group/studentGroupListing/<int:courseid>", methods=["GET"])
def getGroupListing(courseid):
    with conn.cursor(cursor_factory=RealDictCursor) as c:
        c.execute("SELECT account.name AS studentname, account.id AS studentid, project.name AS projectname, project.id AS projectid "
        "FROM project, member, project_group, account "
        "WHERE (project_group.course_id = %s AND project_group.project_id = project.id AND member.project_group_id = project_group.id AND member.account_id = account.id)", (courseid, ))
        students = list(c)

        return jsonify({"success": True, "listing": students})

@app.route("/api/group/runGroupMatch", methods=["POST"])
def runGroupMatch():
    courseid = request.json.get("courseid", None)
    success = createGroups(courseid)

    if success:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "error": "Something went wrong"})

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

# calculates single group satisfaction score based on formula in Freiheit & Wood
# arguments: dictionary of students to preferences, id of group, members of group, max allowed rankings
# return: score
def calculateSatisfaction(prefs, projectid, groupmembers, maxrankings):
    maxpossible = len(groupmembers) * (maxrankings + 1)

    score = 0
    for m in groupmembers:
        if projectid in prefs.get(m):
            rank = prefs.get(m).index(projectid) + 1
            score += ((((maxrankings - rank) + 1) * (maxrankings - rank)) / 2) + 1
        else:
            score += (maxrankings / 2) + 1

    score = score / maxpossible
    return score

# matches groups for a course.
# arguments: a list of students, dictionary of students to preferences,
    # minimum group size, maximum group size, maximum rankings per student
# return values: a dictionary of projects to a list of assigned students, average satisfaction score
# this will modify the student list, but as we're just randomizing every time it doesn't really matter
# TODO: HEAVY EDGE CASE TESTING. Some cases have been noted in TODOs throughout this function. Others probably have yet to be found.
# This could also be cleaned up a lot.
def matchGroups(students, prefs, groupsizemin, groupsizemax, maxrankings):
    # create dictionary of project ids to an empty list
    # I know there's probably a cleaner way to make this dictionary, but I couldn't figure it out
    groups = {}
    for val in prefs.values():
        for pr in val:
            if not pr in groups:
                groups[pr] = []

    # create a shuffled copy of students who are not yet assigned
    unassigned = students.copy()
    shuffle(unassigned)

    # initial loop: assign choice if possible, (assigning all to 1st, then to 2nd, etc...)
    # if not possible (i.e. group is full) keep in unassigned
    for m in range (0, maxrankings):
        for i in range (0, len(unassigned)):
            if len(prefs.get(unassigned[i])) > m:
                if len(groups.get(prefs.get(unassigned[i])[m])) < groupsizemax:
                    # there is space, assign student
                    groups.get(prefs.get(unassigned[i])[m]).append(unassigned[i])
                    unassigned[i] = -1 # turns out deleting from python lists while iterating sucks, this is my solution
        unassigned = list(filter(lambda x: x != -1, unassigned))

    # calculate number of remaining spots
    spotsRemaining = 0
    for members in groups.values():
        spotsRemaining += (groupsizemax - len(members))

    # TODO: honestly this is a really big bug that I don't know how to deal with.
    # basically means that everyone preferenced the same projects.
    # This should be rare, but needs to be dealt with somehow.
    # Right now, this will just assign extra students to a non-existent project, give this run a low score, and bail
    if spotsRemaining < len(unassigned):
        groups[-1] = unassigned
        score = 0
        return groups, score

    # remove underassigned projects, starting with smallest groups and making sure there are enough spots
    # TODO: order by popularity. Since popularity is not implemented, this could delete projects that maybe shouldn't be.
    if spotsRemaining > len(unassigned):
        # don't sue me for this
        toRemove = []
        for i in range(0, groupsizemax):
            if (spotsRemaining - groupsizemax) < len(unassigned):
                break
            else:
                groupsOfSize = {k: v for k, v in groups.items() if len(v) == i}
                for g in groupsOfSize:
                    if (spotsRemaining - groupsizemin) < len(unassigned):
                        break
                    else:
                        toRemove.append(g)
                        for s in groups.get(g):
                            # TODO: attempt to put student in a different choice
                            unassigned.append(s)

        for r in toRemove:
            if r in groups:
                del groups[r]

    # start the bumping routine with unassigned students
    # this should also take care of the case where there are full groups,
    # but to fit all students properly none should be full (such as 6 students to 2 groups of 3-4 members)
    # for u in unassigned:
        # TODO

    # randomly assign any remaining unassigned to fill groups
    # there might be a more student friendly way to do this, but that's going to take some thinking
    shuffle(unassigned)

    # fill groups to groupsizemin
    underassignedGroups = {k: v for k, v in groups.items() if len(v) < groupsizemin}
    for ug in underassignedGroups:
        spots = groupsizemin - len(groups.get(ug))
        for i in range(0, spots):
            if len(unassigned) > 0:
                groups.get(ug).append(unassigned.pop())
            else:
                break
        if len(unassigned) == 0:
            break

    # if there are still unassigned students, fill to groupsizemax
    # this makes sure no groups are huge while others are small
    if len(unassigned) > 0:
        while len(unassigned) > 0:
            openGroups = {k: v for k, v in groups.items() if len(v) < groupsizemax}
            for og in openGroups:
                if len(unassigned) > 0:
                    groups.get(og).append(unassigned.pop())
                else:
                    break

    # calculate average satisfaction score
    # if group is somehow still too small, give it a bad score
    score = 0
    for g in groups:
        if (len(groups.get(g)) >= groupsizemin):
            score += calculateSatisfaction(prefs, g, groups.get(g), maxrankings)
    score = (score / len(groups))

    return groups, score

def createGroups(course_id):
    with conn:
        with conn.cursor() as c:
            c.execute("SELECT groupsizemin, groupsizemax, maxrankings FROM course WHERE id = %s", (course_id, ))
            (groupsizemin, groupsizemax, maxrankings) = c.fetchone()

            if not groupsizemin or not groupsizemax or not maxrankings:
                return False

            # list of students (the distinct probably isn't strictly necessary, but lets just make sure)
            c.execute("SELECT DISTINCT account_id FROM enroll WHERE course_id = %s", (course_id, ))
            students = list(c)

            if len(students) == 0:
                return False

            # dictionary of students to preferenced projects
            # the keys are student ids, with the value containing an ordered list
            # of their prefered project ids, from first to last choice
            prefs = {}
            for s in students:
                c.execute("SELECT project_id FROM preference WHERE account_id = %s ORDER BY ranking ASC", (s, ))
                prefs[s] = list(c)

            # run matching algorithm to find best satisfaction
            bestscore = 0
            finalgroups = {}
            for i in range (0, 30):
                (groups, score) = matchGroups(students, prefs, groupsizemin, groupsizemax, maxrankings)

                if score > bestscore:
                    finalgroups = groups

            # insert finalized groups
            for g in finalgroups:
                c.execute("INSERT INTO project_group (project_id, course_id) VALUES (%s, %s) RETURNING id", (g, course_id))
                (projectgroupid, ) = c.fetchone()
                for s in finalgroups.get(g):
                    c.execute("INSERT INTO member (account_id, project_group_id) VALUES (%s, %s)", (s, projectgroupid))

    return True
