---
layout: post
title: SQLServer ISDATE() comparison against a BIT field
desc: "Found my first SQLServer 2014 bug to report."
keywords: "sqlserver,isdate(),bit field,comparison"
---

A few months ago a co-worker and I decided to upgrade our local web development environments from SQLServer 2008 to SQLServer 2014 in order to shake out any major problems.  We used the tools provided by MS to determine if we would have any breaking changes and the prospects were very promising.  Things worked great for months with no sign of any problems

Like most stories that probably start that way, there is an "until today" clause involved.

Today, my co-worker tells me he thinks he found a problem running a report.  It took 5 minutes to find the block of SQL that was causing the issue.  When you compare the return results of ISDATE() against a BIT field, you get a "severe error" and your results, if any, should be discarded.

Go ahead, try it.  The branch below that runs for @fail = 1 will generate an error.  If you change @fail to 0, it works.  The working condition is just ugly.

```sql

DECLARE @fail BIT = 1;

-- create table1
CREATE TABLE ##table1 (Id INT, name VARCHAR(50), someDate DATETIME NULL, table2id INT);
INSERT INTO ##table1 (Id, name, someDate, table2id)
VALUES
        (1, 'Jack', NULL, 1)
        , (2, 'Elvis', getDate(), 2)
        , (3, 'Jack', NULL, 3)
        , (4, 'Bruce', getDate(), 1)
        , (5, 'Arnold', NULL, 3)
 
-- create table2
CREATE TABLE ##table2 (Id INT, sometext VARCHAR(50), isTrue BIT);
INSERT INTO ##table2 (Id, someText, isTrue)
VALUES
        (1, 'home', 1)
        , (2, 'cell', 0)
        , (3, 'work', 1)

IF @fail = 1
	SELECT 
		  t1.Id
		, t1.name
		, t1.someDate
		, t2.isTrue
	FROM ##table1 t1 
		JOIN ##table2 t2 ON t1.table2id = t2.Id
	WHERE ISDATE(t1.someDate) = t2.isTrue
ELSE
	SELECT 
		  t1.Id
		, t1.name
		, t1.someDate
		, t2.isTrue
	FROM ##table1 t1 
		JOIN ##table2 t2 ON t1.table2id = t2.Id
	WHERE (
		(ISDATE(t1.someDate) = 0 AND t2.isTrue = 0)
		OR
		(ISDATE(t1.someDate) = 1 AND t2.isTrue = 1)
	)

DROP TABLE ##table1
DROP TABLE ##table2

```

### [My first MS bug report](https://connect.microsoft.com/SQLServer/feedback/details/1221207)
