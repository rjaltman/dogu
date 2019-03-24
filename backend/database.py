from os import environ
import psycopg2
from psycopg2.extras import NamedTupleCursor
if "DATABASE_URL" in environ:
    conn = psycopg2.connect(environ["DATABASE_URL"], sslmode="require", cursor_factory=NamedTupleCursor)
else:
    conn = psycopg2.connect("host=localhost dbname=dogu user=dogu password=password", cursor_factory=NamedTupleCursor)
