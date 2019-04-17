UPDATE account 
SET university_id = (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)') 
WHERE university_id = (SELECT id FROM university WHERE name = 'NOT REAL SCHOOL');

UPDATE course 
SET university_id = (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)') 
WHERE university_id = (SELECT id FROM university WHERE name = 'NOT REAL SCHOOL');

UPDATE project 
SET university_id = (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)') 
WHERE university_id = (SELECT id FROM university WHERE name = 'NOT REAL SCHOOL');

UPDATE enroll 
SET university_id = (SELECT id FROM university WHERE name = 'University of Illinois (Urbana-Champaign)') 
WHERE university_id = (SELECT id FROM university WHERE name = 'NOT REAL SCHOOL');

DELETE FROM university WHERE name = 'NOT REAL SCHOOL';

DELETE FROM organization WHERE name = 'A FAKE ORGANIZATION';
INSERT INTO organization (name, contact, created, site) VALUES ('Women in Computer Science', '(523) 555-0204', now(), 'www.wcs.illinois.edu');
