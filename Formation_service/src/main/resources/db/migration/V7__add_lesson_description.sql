-- Simply add description field to lessons table
ALTER TABLE lessons 
ADD COLUMN description TEXT AFTER title;
