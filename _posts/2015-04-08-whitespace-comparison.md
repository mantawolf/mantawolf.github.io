---
layout: post
title: SQLServer String Comparisons
desc: "A brief conversation on comparing strings in SQLServer"
keywords: "sqlserver,string,compare"
---

I would like to take this opportunity to point out a slight problem with the [SQL-92](http://www.contrib.andrew.cmu.edu/~shadow/sql/sql1992.txt) that some of you may not be aware of.

> SQL Server follows the ANSI/ISO SQL-92 specification (Section 8.2, <Comparison Predicate>, General rules #3) on how to compare strings with spaces. The ANSI standard requires padding for the character strings used in comparisons so that their lengths match before comparing them. The padding directly affects the semantics of WHERE and HAVING clause predicates and other Transact-SQL string comparisons. For example, Transact-SQL considers the strings ‘abc‘ and ‘abc ‘ to be equivalent for most comparison operations

So what exactly does that all mean?  It means that a string is padded with whitespace at the end in order to facilitate comparison of strings.  So if your existing string ends with whitespace, it will not have the expected outcome during a comparison.  Let's have an example.

{%highlight sql %}

SELECT
    CASE WHEN '' = '     ' 
      THEN 'EQUAL' 
      ELSE 'NEQ' 
      END AS 'SpaceCompare'
  , CASE WHEN 'abc' = 'abc     ' 
      THEN 'EQUAL' 
      ELSE 'NEQ' 
      END AS 'TrailingSpaces'
  , CASE WHEN 'abs' = '     abc' 
      THEN 'EQUAL' 
      ELSE 'NEQ' 
      END AS 'LeadingSpaces'

{% endhighlight %}

I would **expect** that none of the above string comparisons would be equal, but look at the result set below.


|SpaceCompare|TrailingSpaces|LeadingSpaces|
|------------|--------------|-------------|
|EQUAL       |EQUAL         |NEQ          |

Am I the only one that thinks something is wrong here?
