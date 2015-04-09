---
layout: post
title: More SQLServer String Comparisons
desc: "A less brief conversation on comparing strings in SQLServer"
keywords: "sqlserver,string,compare,soundex,difference,operators"
---

There are a few methods of comparing strings in SQLServer.  To start with, you can use normal comparison operators such as **<** and **>** and even **=**.  I can not think of many useful reasons for doing this but let's talk about what the results are of doing so.  The exact results you will get are determined by the character set and collation you are using.  There is also a dependency on the server you are using since some servers are case-sensitive.  SQLServer however is not case-sensitive.

To be honest, the best thing to do is run the example provided and see how it behaves in whatever character set and collation you are using.  I use the default collation *SQL_Latin1_General_CP1_CI_AS* and the results table I show reflects that.

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
	  (1, 'This is a string to test against another string', 'This is a second string')
	, (2, 'a', 'b')
	, (3, 'b', 'a')
	, (4, 'abc', 'cba')
	, (5, 'abc', 'xyz')
	, (6, '', '123')
	, (7, '321', '')
	, (8, '', '')
	, (9, 'Twinkies', 'Twinkies')
	, (10, 'DingDongs', 'dingdongs')
	, (11, 'Smith', 'Smyth')
	, (12,'John', 'Patrick')
	, (13,'John', 'Johnathon')

SELECT
	text1 
	, CASE
		WHEN text1 = text2 THEN 'MATCH'
		WHEN text1 < text2 THEN 'LT'
		WHEN text1 > text2 THEN 'GT'
		ELSE NULL
		END
	, text2
	, SOUNDEX(text1) AS soundex1
	, SOUNDEX(text2) AS soundex2
	, DIFFERENCE(text1, text2) AS difference1and2
FROM ##table1

{% endhighlight %}

|Text1|Equality|Text2|Soundex1|Soundex2|Difference|
|-----|--------|-----|--------|--------|----------|
|This is a string to test against another string|GT|This is a second string|T200|T200|4|
|a|LT|b|A000|B000|3|
|b|GT|a|B000|A000|3|
|abc|LT|cba|A120|C100|2|
|abc|LT|xyz|A120|X200|2|
||LT|123|0000|0000|4|
|321|GT||0000|0000|4|
||MATCH||0000|0000|4|
|Twinkies|MATCH|Twinkies|T522|T522|4|
|DingDongs|MATCH|dingdongs|D523|D523|4|
|Smith|LT|Smyth|S530|S530|4|
|John|LT|Patrick|J500|P362|0|
|John|LT|Johnathon|J500|J535|2|

You will notice that I included columns for **SOUNDEX** and **DIFFERENCE**.  Both of these are something I had never used before so I spent some time trying to understand them.  Simple explanation on **SOUNDEX** is that it is an algorithm that a string is passed into and returns a character + 3 number respresentation of that string.  The complicated answer is the algorithm itself.

> Retain the first letter of the name and drop all other 
	occurrences of a, e, i, o, u, y, h, w.
	Replace consonants with digits as follows (after the first letter):
		b, f, p, v → 1
		c, g, j, k, q, s, x, z → 2
		d, t → 3
		l → 4
		m, n → 5
		r → 6
	If two or more letters with the same number are adjacent 
	in the original name (before step 1), only retain the 
	first letter; also two letters with the same number 
	separated by 'h' or 'w' are coded as a single number, 
	whereas such letters separated by a vowel are coded 
	twice. This rule also applies to the first letter
	Iterate the previous step until you have one letter and 
	three numbers. If you have too few letters in your word 
	that you can't assign three numbers, append with zeros 
	until there are three numbers. If you have more than 3 
	letters, just retain the first 3 numbers.

I will refer to a (wiki article )[http://en.wikipedia.org/wiki/Soundex] if you want the history and variants of **SOUNDEX**. 

The second function, **DIFFERENCE**, is a count of how many of the **SOUNDEX** values match each other.  It takes 2 strings and returns a value 0-4.

Where these methods come in handy is trying to provide similiar matches to a simple search string.  For example, someone searches for the last name *smith* but you also want to return names that sound like *smith*.  Such as smyth, smithey, or smythe.  You will also get values such as shinoda, sneed, sandu, sandy, smith-mcneal, and sante-hunter.
