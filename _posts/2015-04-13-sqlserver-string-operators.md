---
layout: post
title: SQLServer String Operators
desc: "A brief discussion on SQLServer String Operators"
keywords: "sqlserver,string,operators,regex,concat,concatenation,wildcard,wildcards"
---

The last part of this series on working with strings in SQLServer will focus on operators that you can use.  As a developer working in SQLServer, we understand that we do not have access to powerful regex methods.  We instead get access to a few string operators.

+ \+ (String concatenation)
+ += (String concatenation)
+ % (Wilcard)
+ [] (Characters to match)
+ [^] (Characters to not match)
+ _ (Single character Wildcard)

Following how I normally write, we are going to start with setting up some temporary tables with data so we can see each operator in action.

{%highlight sql %}

CREATE TABLE ##table1 (
	  Id INT
	, text1 VARCHAR(50)
	, text2 VARCHAR(50)
);
INSERT INTO ##table1 (
	  Id
	, text1
	, text2
)
VALUES
	  (1, 'This is a string to test against another string', 'Another string to concat')
	, (2, 'This is a second string', '')
	, (3, 'And a third string', '')
	, (4, 'Some random string', '')
	, (5, 'The istring containis the istring is iniside', '')

CREATE TABLE ##table2 (
	  Id INT
	, text1 VARCHAR(50)
);
INSERT INTO ##table2 (
	  Id
	, text1
)
VALUES
	  (1, 'abc')
	, (2, 'acc')
	, (3, 'adc')
	, (4, 'adac')
	, (5, 'adcc')
	, (6, 'cac')
	, (7, 'daz')

{% endhighlight %}

The first operators we will discuss are the concatenation operators.  Concatentation is simply appending a string onto the end of another string.

{%highlight sql %}

-- + operator
SELECT
	text1 + text2 AS textConcatenation1
FROM ##table1
WHERE Id = 1

{% endhighlight %}

Results in...

|textConcatenation1|
|------------------|
|This is a string to test against another stringAnother string to concat|

This can be useful for doing things like creating address strings or firstname and lastname combinations on the database side rather than the client side or the scripting engine side.

The second concatenation operator will be familiar to programmers, **+=**.  This can be used when creating variables in SQLServer but not in queries.

{%highlight sql %}

-- += operator
DECLARE @t1 VARCHAR(50) = '';
SET @t1 += 'Hello';
SET @t1 += ' World';

SELECT @t1;

{% endhighlight %}

This will display **Hello World**.  In the event you don't know it, you can use *PRINT* instead of *SELECT* to print to the Messages console instead of the results window.

Next up are wildcard operators.  The *%* is used for wildcard matching in SQLServer.  There are a few ways you can use this.  Starts with, ends with, and contains.

{%highlight sql %}

-- % operator, starts with
SELECT Id, text1
FROM ##table1
WHERE text1 LIKE('this%')

-- % operator, contains
SELECT Id, text1
FROM ##table1
WHERE text1 LIKE('%is%')

-- % operator, ends with
SELECT Id, text1
FROM ##table1
WHERE text1 LIKE('%string')

{% endhighlight %}

The **starts with** block will return anything starting with *this* and ending with any number of characters.

|Id|text1|
|--|-----|
|1|This is a string to test against another string|
|2|This is a second string|

The **contains** block will return anything that contains the string *is*.  Something to note on these results is that you can get unintended results.  Notice that we retrieved records that contains the string *is* inside another string.

|Id|text1|
|--|-----|
|1|This is a string to test against another string|
|2|This is a second string|
|5|The istring containis the istring is iniside|

The **ends with** block will return anything that contains any number of strings but ends with *string*.

|Id|text1|
|--|-----|
|1|This is a string to test against another string|
|2|This is a second string|
|3|And a third string|
|4|Some random string|

Now if you want to match a single character instead of any amount of characters, you can use the **_** wilcard character.  This says I only want a single character to be a wilcard.

{%highlight sql %}

-- % operator
SELECT *
FROM ##table2
WHERE text1 LIKE('a%c')

-- _ operator
SELECT *
FROM ##table2
WHERE text1 LIKE('a_c')

{% endhighlight %}

As can be seen above above, the **%** will match any number of characters in a string that starts with *a* and ends with *c*.

|Id|text1|
|--|-----|
|1|abc|
|2|acc|
|3|adc|
|4|adac|
|5|adcc|

The **_** will only match strings that start with *a*, contain any single character, and ends with *c*.

|Id|text1|
|--|-----|
|1|abc|
|2|acc|
|3|adc|

The last set of operators to discuss are as close to regex functionality as we get, the ability to do a wildcard match of sorts but with a defined set of characters to match.

In this first example, we are going to specify we want all strings that start with *a* and end with *c* but contain a *c* or a *d* as the middle character.

{%highlight sql %}

-- [] operator
SELECT *
FROM ##table2
WHERE text1 LIKE('a[cd]c')

{% endhighlight %}

This will provide the following results.

|Id|text1|
|--|-----|
|2|acc|
|3|adc|

The second example displays any string that starts with *a* and ends with *c* but contains any character in a range of *b* to *d*, which will include *c*.

{%highlight sql %}

-- [] operator with a range
SELECT *
FROM ##table2
WHERE text1 LIKE('a[b-d]c')

{% endhighlight %}

|Id|text1|
|--|-----|
|1|abc|
|2|acc|
|3|adc|

Last, we want any string that starts with *a* and ends with *c* but does **not** contain *c* or *d* as the middle character.

{%highlight sql %}

-- [^] operator
SELECT *
FROM ##table2
WHERE text1 LIKE('a[^cd]c')

{% endhighlight %}

|Id|text1|
|--|-----|
|1|abc|

The **[]** operator is as close to a regex as we get using native SQLServer.  As always if you want the full script, here is the link to [pastebin.com](http://pastebin.com/1dqf7JGq).

### Things I like
+ [Futurama](http://www.cc.com/shows/futurama)
+ [Monty Pyhon's Flying Circus](http://www.imdb.com/title/tt0063929/)
