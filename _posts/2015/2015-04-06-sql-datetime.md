---
layout: post
title: SQLServer Date Datatypes
desc: "A brief conversation on selecting the correct SQLServer date datatypes"
keywords: "sqlserver,date,datetime,time,datatype,datetime2"
---

This weeks tidbit will be rehashing some things I learned about SQLServer dates.  The biggest point of this conversation is making sure you are selecting the date type you actually need in order to minimize the space you are using.  This is important because smaller data types take less space in memory and in index pages.  Which means you can fit more records into the index pages.

Let us start with building some sample data...

```sql

CREATE TABLE ##table1 (
	Id INT
	, dateOne DATETIME -- will store miliseconds
	, dateTwo DATETIME2 -- will store nanoseconds
	, dateThree DATETIME2(0) -- cuts off past the second
	, dateFour DATETIME2 -- can see getDate() is less precision than sysDateTime()
	, dateFive DATE -- new date type, stores only the date part
	, timeOne TIME -- new time type, stores only the time part down to nanoseconds
	, timeTwo TIME(0) -- time type storing only down to the seconds
);
INSERT INTO ##table1 (
	Id
	, dateOne
	, dateTwo
	, dateThree
	, dateFour
	, dateFive
	, timeOne
	, timeTwo
)
VALUES (
    1
	, sysdatetime() -- DATETIME - 2015-04-03 14:06:46.323
	, sysdatetime() -- DATETIME2 - 2015-04-03 14:06:46.3235366
	, sysdatetime() -- DATETIME2(0) - 2015-04-03 14:06:46
	, getdate() -- DATETIME2 - 2015-04-03 14:06:46.3170000
	, sysdatetime() -- DATE - 2015-04-03
	, sysdatetime() -- TIME - 14:06:46.3235366
	, sysdatetime() -- TIME(0) - 14:06:46
)

```

Pretty simple, we can just select and view the result set.

```sql

SELECT * FROM ##table1

DROP TABLE ##table1

```

As can be seen by running the example, **DATETIME2** is a more accurate data type.  It records down to the nanosecond.  For most purposes of a web app, I dont even need the microseconds.  We have determined we could actually use DATETIME2(0) for all our purposes and shrink our indexes by quite a bit.

|Id|dateOne|dateTwo|dateThree|dateFour|dateFive|timeOne|timeTwo|
|--|-------|-------|---------|--------|--------|-------|-------|
|1|2015-04-06 07:16:21.090|2015-04-06 07:16:21.0911135|2015-04-06 07:16:21|2015-04-06 07:16:21.1000000|2015-04-06|07:16:21.0911135|07:16:21|

Here is a table showing how much space is taken by each date type available in SQLServer 2012+.  A **DATETIME2(0)** data type is 2 bytes smaller than a **DATETIME** data type.  While this may not seem like a lot, in an index that is applied to a table with a million records, it can make a large difference.

|DataType|Minimum Value|Maximum Value|Storage Space|
|--------|-------------|-------------|-------------|
|Datetime|1753-01-01 00:00:00.000|9999-12-31 23:59:59.997|8 bytes|
|Smalldatetime|1900-01-01 00:00|2079-06-06 23:59|
|Date|0001-01-01|9999-12-31|3 bytes|
|Time|00:00:00.0000000|23:59:59.9999999|
|Datetime2|0001-01-01 00:00:00.0000000|9999-12-31 23:59:59.9999999|Precision <=2 = 6 bytes<br />Precision <=4 = 7 bytes<br />Precision <=7 = 8 bytes|

If you want the code samples in full, they are on [pastebin.com](http://pastebin.com/HFnRzKki).

I certainly hope these examples are helpful to someone.  Sometimes just basic things are documented well enough to get at what you want and I like the format of "recipes" for code and such.

### +1 to the good guys
[Store Owner Takes Down Badguy](http://wkrn.com/2015/03/31/la-vergne-store-owner-shoots-kills-man-after-box-cutter-attack/)
