DROP TABLE people; /* we don't need this anymore */

/* the following can be used to clear all accounts, projects, and their corresponding items. (thus far)
This will not delete universities or courses, or do the necessary deletion for groups */
DELETE FROM preference;
DELETE FROM account;
DELETE FROM project_tags;
DELETE FROM project;
