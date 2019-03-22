from ..database import conn
from datetime import date

class Project:
    __slots__ = ["id", "startDate", "organization_id", "name", "description", "status", "university_id"]
    columns = __slots__
    def __init__(self, *, id=None, startDate=None, organization_id=None, name=None, description=None, status=None, university_id=None):
        self.id = id
        if not isinstance(startDate, date):
            raise Exception("You have to pass in the date as a python date object")
        self.startDate = startDate
        self.organization_id = organization_id
        self.name = name
        self.description = description
        self.status = status
        self.university_id = university_id

    @classmethod
    def getById(cls, id):
        with conn.cursor() as c:
            c.execute(f"SELECT {', '.join(cls.columns)} FROM project WHERE id = %s", (id, ))
            out = c.fetchone()
            if not out:
                return None
            out = Project(*{col: val for (col, val) in zip(columns, out)})
            return out

    @classmethod
    def getAll(cls):
        with conn.cursor() as c:
            c.execute(f"SELECT {', '.join(cls.columns)} FROM project")
            curr = c.fetchone()
            while curr:
                out = Project(**{col: val for (col, val) in zip(cls.columns, curr)})
                yield out
                curr = c.fetchone()

    @classmethod
    def getByUniversity(cls, university_id):
        with conn.cursor() as c:
            c.execute(f"SELECT {', '.join(columns)} FROM project where university_id=%s", (university_id, ))
            curr = c.fetchone()
            while curr:
                out = Project(*{col: val for (col, val) in zip(columns, curr)})
                yield out
                curr = c.fetchone()

    def save(self):
        with conn.cursor() as c:
            c.execute((f"INSERT INTO project ({', '.join(columns)}) "
                       f"VALUES ({', '.join('%({col})s' for col in columns)}) WHERE id = %(id)s "
                       f"ON CONFLICT UPDATE project SET {''.join(col + '=%({col})s' for col in columns if col != 'id')} where id = %(id)s"), self.__dict__())
            conn.commit()
