from backend.database import conn
from psycopg2.extras import execute_batch
from flask import session
def getLowestRankedProject(username):
    with conn:
        with conn.cursor() as c:
            c.execute("SELECT MAX(ranking) from preference p INNER JOIN account a ON p.account_id = a.id WHERE a.username = %s", (username, ))
            tup = c.fetchone()
            if tup:
                return tup[0]
            else:
                return None

def compressRankings(username = None):
    """
    This makes sure that all of `username`'s rankings (or the owner of the calling session's) 
    are as tight as possible. Specifically, that means that, if our user has ranked N projects, 
    the multiset of project rankings is EXACTLY {1,2,..,N}.
    """
    with conn: 
        with conn.cursor() as c:
            if username == None:
                username = session["username"]
            c.execute("SELECT ranking, project_id FROM preference p INNER JOIN account a ON a.id = p.account_id WHERE a.username = %s ORDER BY ranking ASC",
                      (username, ))
            rows = c.fetchall()
            dataTuples = [(idx + 1, r.project_id, username) for (idx, r) in enumerate(rows)]
            execute_batch(c, "UPDATE preference SET ranking = %s WHERE project_id = %s AND account_id = (SELECT id FROM account WHERE username = %s)",
                          dataTuples)
