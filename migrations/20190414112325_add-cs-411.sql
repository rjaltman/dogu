INSERT INTO course (crn, term, title, university_id, groupsizemax, groupsizemin, maxrankings)
VALUES ('CS411', 'FA18', 'Database Systems', (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)'), 4, 3, 3);

INSERT INTO account (username, password, name, dept, contactemail, position, university_id)
VALUES ('alawini', '1234', 'Abdu Alawini', 'CS', 'alawini@illinois.edu', 'Instructor', (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)'));

INSERT INTO instructor (account_id, course_id)
VALUES ((SELECT id FROM account WHERE username = 'alawini'), (SELECT id FROM course WHERE (crn = 'CS411' AND term = 'FA18')));
