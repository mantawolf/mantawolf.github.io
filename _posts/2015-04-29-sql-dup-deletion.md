---
layout: post
title: SQLServer Delete Duplicate Rows
desc: "We have all seen it before, duplicate rows in a table and we need to get rid of some."
keywords: "SQLServer,Duplicate,Delete"
---

As a "high level DBA type", I do get to see strange things occasionally.  On a previous occasion it was the duplication of records in a database.  Let's talk about how to get rid of those records.

The first type of duplicated record we will work on is one where the primary key is duplicated, whether by import or you are trying to create a unique key against existing data.

```sql

-- Lets create some test data
CREATE TABLE #table1 (
	  Id INT
	, text1 VARCHAR(50)
	, dtc DATETIME2(0)
);
INSERT INTO #table1 (
	  Id
	, text1
	, dtc
)
VALUES 
	  (1, 'test1', DATEADD(d, -10, GETDATE()))
	, (1, 'test1', DATEADD(d, -7, GETDATE()))
	, (2, 'test2', DATEADD(d, -7, GETDATE()))
	, (2, 'test2', DATEADD(d, -10, GETDATE()))

SELECT text1
FROM #table1
GROUP BY text1
HAVING COUNT(*) > 1

```

When executing this, you can see that 2 of our records have the same text.  If you delete by ID, you will lose both records.  Sadly, this is an occasion where the recommended practice is to set the **ROWCOUNT** to 1 and delete by ID.  You will find that you can not use an **ORDER BY** on a **DELETE** statement either.

```sql

SET ROWCOUNT 1
DELETE FROM #table1 WHERE Id = 1 
DELETE FROM #table1 WHERE Id = 2
SET ROWCOUNT 0

SELECT * FROM #table1

```

The bad part of this is that I can not reliably control which record gets deleted based on the data.

Id|text1|dtc
--|-----|---
1 |test1|2015-04-22 12:42:15
2 |test2|2015-04-19 12:42:15

The more likely scenario is you have imported data and you already have a column with an auto-increment integer for the primary key.  You have duplicate records but at least you have a unique identifier.

```sql

CREATE TABLE #table2 (
	  Id INT
	, text1 VARCHAR(50)
	, dtc DATETIME2(0)
);
INSERT INTO #table2 (
	  Id
	, text1
	, dtc
)
VALUES 
	  (1, 'test1.1', DATEADD(d, -10, GETDATE()))
	, (2, 'test1.2', DATEADD(d, -7, GETDATE()))
	, (3, 'test1.1', DATEADD(d, -7, GETDATE()))
	, (4, 'test1.2', DATEADD(d, -10, GETDATE()))

SELECT text1
FROM #table2
GROUP BY text1
HAVING COUNT(*) > 1

SELECT * FROM #table2

```

Executing that shows the data scenario we are dealing with now.  In this case we want to keep the records that were created last.

```sql

DELETE FROM #table2
WHERE Id IN(
	SELECT DISTINCT m1.Id
	FROM #table2 m1 
		LEFT JOIN #table2 m2 ON m1.text1 = m2.text1 AND m1.dtc < m2.dtc
	WHERE m2.Id IS NOT NULL
)

SELECT * FROM #table2

```

The above shows we can select the IDs of the records in a subquery that have the lower create date and delete those.  This gives us that small amount of control over which duplicate record we want to delete.

Id|text1  |dtc
--|-------|---
2 |test1.2|2015-04-22 12:52:14
3 |test1.1|2015-04-22 12:52:14

And if we decide we want the first record created instead of the last, we can switch the *<* to *>*.

But wait, our data is even more messed up than normal!  We have records with the same primary key but different data and we want to keep it ALL!!!

```sql

CREATE TABLE #table3 (
	  Id INT
	, text1 VARCHAR(50)
	, dtc DATETIME2(0)
);
INSERT INTO #table3 (
	  Id
	, text1
	, dtc
)
VALUES 
	  (1, 'test1.1', DATEADD(d, -10, GETDATE()))
	, (1, 'test1.2', DATEADD(d, -7, GETDATE()))
	, (2, 'test2.1', DATEADD(d, -10, GETDATE()))
	, (2, 'test2.2', DATEADD(d, -7, GETDATE()))

SELECT * FROM #table3

```

Oh god, it's horrible!  Fix it please!  And we can.  We will dump the distinct records into a holding table of sorts, **TRUNCATE** the messed up table, and reinsert the records with new, distinct IDs.

```sql

SELECT DISTINCT text1, dtc
INTO #holdingTable
FROM #table3

TRUNCATE TABLE #table3

INSERT INTO #table3 (Id, text1, dtc)
SELECT ROW_NUMBER() OVER(ORDER BY text1, dtc), text1, dtc
FROM #holdingTable

SELECT * FROM #table3

```

Id|text1  |tc
--|-------|--
1 |test1.1|2015-04-19 12:55:55
2 |test1.2|2015-04-22 12:55:55
3 |test2.1|2015-04-19 12:55:55
4 |test2.2|2015-04-22 12:55:55

How much more messed up can we let our data get?

```sql

CREATE TABLE #table4(
      Id INT
    , firstName VARCHAR(20)
    , lastName VARCHAR(20)
    , email VARCHAR(50)
    , phone VARCHAR(10)
    , dateOfBirth DATE
	, rating INT
) 
 
INSERT INTO #table4 (Id, firstName, lastName, email, phone, dateOfBirth, rating) 
VALUES 
	  (1, 'Jack', 'Smith', NULL, NULL, DATEADD(yy, -30, GETDATE()), 5)
	, (2, 'Jack', 'Smith', 'jack.smith@email.com', NULL, NULL, 6)
	, (3, 'Jack', 'Smith', NULL, '2145556666', NULL, 2)
	, (4, 'Jill', 'Jones', NULL, NULL, DATEADD(yy, -25, GETDATE()), 1)
	, (5, 'Jill', 'Jones', 'jill.jones@email.com', NULL, NULL, 10)
	, (6, 'Jill', 'Jones', NULL, '2145557777', NULL, 0)
	, (7, 'Jimmy', 'Jackson', NULL, '2146668877', DATEADD(yy, -45, GETDATE()), 6)
	, (8, 'Jimmy', 'Jackson', 'jimmmy.jackson@email.com', NULL, NULL, 6)
	, (9, 'Jimmy', 'Jackson', 'jimmy@email.com', '2145558888', DATEADD(yy, -15, GETDATE()), 5);

SELECT * FROM #table4;

```

Don't ask questions you don't want to know the answer too.  Now we have data that we want to consolidate to fill in the **NULL** values.

```sql

WITH cte AS (
	SELECT
		  Id
		, firstName
		, lastName
		, MAX(email) OVER (PARTITION BY firstName, lastName) AS emailUpdated
		, MAX(phone) OVER (PARTITION BY firstName, lastName) AS phoneUpdated
		, MAX(dateOfBirth) OVER (PARTITION BY firstName, lastName) AS dateOfBirthUpdated
		, ROW_NUMBER() OVER (PARTITION BY firstName, lastName ORDER BY firstName, lastName) AS Rn
		, MIN(rating) OVER (PARTITION BY firstName, lastName) AS ratingUpdated
	FROM #table4
) 
SELECT
	  Id
	, firstName
	, lastName
	, emailUpdated
	, phoneUpdated
	, dateOfBirthUpdated
	, ratingUpdated
	, Rn
INTO #noDups 
FROM cte 
WHERE Rn = 1

SELECT * 
FROM #noDups 

```

Id|firstName|lastName|emailUpdated        |phoneUpdated|dateOfBirthUpdated|ratingUpdated|Rn
--|---------|--------|--------------------|------------|------------------|-------------|--
1 |Jack     |Smith   |jack.smith@email.com|2145556666  |1985-04-29        |2            |1
4 |Jill     |Jones   |jill.jones@email.com|2145557777  |1990-04-29        |0            |1
7 |Jimmy    |Jackson |jimmy@email.com     |2146668877  |2000-04-29        |5            |1

Isn't that cool?

As always if you want the full script, here is the link to [pastebin.com](http://pastebin.com/6uwPMxJ6).

For the record, Avengers Age of Ultron comes out tomorrow!
