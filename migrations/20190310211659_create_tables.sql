CREATE TABLE organization (
  id SERIAL PRIMARY KEY,
  name TEXT,
  contact TEXT,
  created DATE,
  site TEXT
);

CREATE TABLE university (
  id SERIAL PRIMARY KEY,
  name TEXT,
  location TEXT,
  created DATE,
  site TEXT
);

CREATE TABLE account (
  id SERIAL PRIMARY KEY,
  username TEXT,
  password TEXT,
  created DATE,
  name TEXT,
  position INT,
  dept TEXT,
  contact TEXT,
  contactEmail TEXT,
  university_id SERIAL REFERENCES university(id) ON DELETE RESTRICT
);

CREATE TABLE course (
  id SERIAL PRIMARY KEY,
  crn TEXT,
  university_id SERIAL REFERENCES university(id) ON DELETE RESTRICT,
  term TEXT,
  title TEXT,
  groupsizelimit INT
);

CREATE TABLE project (
  id SERIAL PRIMARY KEY,
  startdate DATE,
  organization_id SERIAL REFERENCES organization(id) ON DELETE RESTRICT,
  name TEXT,
  description TEXT,
  status INT,
  university_id SERIAL REFERENCES university(id) ON DELETE RESTRICT
);

CREATE TABLE project_group (
  id SERIAL PRIMARY KEY,
  course_id SERIAL REFERENCES course(id) ON DELETE RESTRICT,
  name TEXT
);

CREATE TABLE review (
  id SERIAL PRIMARY KEY,
  project_group_id SERIAL REFERENCES project_group(id) ON DELETE RESTRICT,
  richtext TEXT,
  grade INT
);

CREATE TABLE project_tags (
  project_id SERIAL REFERENCES project(id) ON DELETE RESTRICT,
  tag TEXT
);

CREATE TABLE approved (
  project_id SERIAL REFERENCES project(id) ON DELETE RESTRICT,
  course_id SERIAL REFERENCES course(id) ON DELETE RESTRICT
);

CREATE TABLE enroll (
  account_id SERIAL REFERENCES account(id) ON DELETE RESTRICT,
  course_id SERIAL REFERENCES course(id) ON DELETE RESTRICT,
  university_id SERIAL REFERENCES university(id) ON DELETE RESTRICT
);

CREATE TABLE member (
  account_id SERIAL REFERENCES account(id) ON DELETE RESTRICT,
  project_group_id SERIAL REFERENCES project_group(id) ON DELETE RESTRICT
);

CREATE TABLE instructor (
  account_id SERIAL REFERENCES account(id) ON DELETE RESTRICT,
  course_id SERIAL REFERENCES course(id) ON DELETE RESTRICT
);

CREATE TABLE rep (
  account_id SERIAL REFERENCES account(id) ON DELETE RESTRICT,
  organization_id SERIAL REFERENCES organization(id) ON DELETE RESTRICT
);

CREATE TABLE preference (
  account_id SERIAL REFERENCES account(id) ON DELETE RESTRICT,
  project_id SERIAL REFERENCES project(id) ON DELETE RESTRICT
);
