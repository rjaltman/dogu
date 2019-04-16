/* This changes are necessary for the grouping algorithm */
ALTER TABLE course DROP COLUMN groupsizelimit;
ALTER TABLE course ADD COLUMN groupsizemax INT;
ALTER TABLE course ADD COLUMN groupsizemin INT;
ALTER TABLE course ADD COLUMN maxrankings INT;
