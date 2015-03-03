---
layout: post
title: SQLServer VARCHAR Concatenation
desc: "This is a discussion of some of the finer points that happen during concatenation of VARCHAR data types in SQLServer"
keywords: "sqlserver,varchar,nvarchar,concatenation"
---

SQLServer 2008 and greater has some behaviors for handling strings and concatenation that a programmer should be aware of.  To start with, you have a data type of *VARCHAR* and *NVARCHAR*.  The difference between the two is unicode support.  You will find a number of character data types with an *N* variant.  The *N* type supports unicode and requires twice as much space to store.  When you declare these data types, you can declare them as *VARCHAR[(N|MAX)]* where *N* is the number of characters to allocate.  For a *VARCHAR*, this is 1-8000, for a *NVARCHAR* this is 1-4000.  Remember a unicode character takes twice as much space to store.  Also note that if you do not specify the length, the default is 1.

The *MAX* piece however is interesting.  For all purposes, this causes the *VARCHAR* to be treated like *TEXT* and allows for the storage of 2GB of data.  The real limit is the maximum size of your *TEMPDB*.  Remember that for a *NVARCHAR* the number of characters is half because this is a data type that stores unicode.

Something important to note when you concatenate strings in SQLServer, the first value in your concatenation is used to determine the datatype of the resulting string.  If you need a *MAX* length *VARCHAR* as the resulting because you resulting string is greater than 8,000 characters, you can either *CAST* the first string in your concatenation operation to a *VARCHAR(MAX)* or use your declared variable as the first value to concatenate together.  Do make sure your variable has been initialized to something or else your resulting string will be *NULL*.

{%highlight sql %}

-- results in a 16,000 character string because the first string is CAST to a VARCHAR(MAX)
DECLARE @concat VARCHAR(MAX);
SET @concat = CAST(REPLICATE('-', 8000) AS VARCHAR(MAX)) + REPLICATE('-', 8000);
SELECT @concat;

-- results in a 8,000 character string because the first string in the evaluation is used to determine the data type
DECLARE @concat2 VARCHAR(MAX);
SET @concat2 = REPLICATE('-', 8000) + REPLICATE('-', 8000);
SELECT @concat2;

-- results in a 0 character string... WAIT, what???  @concat3 is declared NULL and when you concatenate a NULL string the result is NULL
DECLARE @concat3 VARCHAR(MAX);
SET @concat3 = @concat3 + REPLICATE('-', 8000) + REPLICATE('-', 8000);
SELECT @concat3;

-- results in a 16,000 character string because the declared variable used to determine the data type
DECLARE @concat4 VARCHAR(MAX) = '';
SET @concat4 = @concat4 + REPLICATE('-', 8000) + REPLICATE('-', 8000);
SELECT @concat4;

{% endhighlight %}

Keep in mind that the above examples get muddy when you start mixing in *NVARCHAR* values instead.  *NVARCHAR* has a numeric limit of 4,000 instead of 8,000.

For the final note, SSMS limits text size in the results window to 4,000 characters by default.  You can go into Tools.Options.Query Execution and up the *SET_TEXTSIZE* limit higher.  If you *PRINT* your variables, they will still limit to 4,000 characters, however you can *SELECT* the variable instead and it adheres to the textsize limit you set.