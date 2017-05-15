---
layout: post
title: SQLServer Filtering on JOIN vs WHERE
desc: "What happens when filtering on a JOIN instead of the WHERE clause"
keywords: "sqlserver,null,join,where,filtering"
---

To start off, my apoligies for not having those lovely images resized yet for WWW consumption. I am hoping to spend some time on that this weekend.

And now for something completely different... I lied, this post is about SQL again. This post will be about the difference between filtering your queries in the JOIN clause instead of a WHERE clause. Is there even a difference? Turns out that yes, in some conditions, there is a difference. 

Full disclosure, I executed all these in a transaction that I could rollback in order to see execution plans in context with each other.

So given the following data...

{% highlight sql linenos %}
CREATE TABLE people (id INT, name VARCHAR(10), personType INT);
INSERT INTO  people (id, name, personType)
VALUES
	(1, 'Test 1', 1),
	(2, 'Test 2', 1),
	(3, 'Test 3', 2),
	(4, 'Test 4', 2),
	(5, 'Test 5', 3),
	(6, 'Test 6', 3),
	(7, 'Test 7', NULL),
	(8, 'Test 8', NULL),
	(9, 'Test 9', NULL)

CREATE TABLE personTypes (personTypeID INT, typeName VARCHAR(10));
INSERT INTO personTypes (personTypeID, typeName)
VALUES
	(1, 'Sleepy'),
	(2, 'Grumpy'),
	(3, 'Sneezy')
{% endhighlight %}

![alt text](../images/2016-09-19/executionPlan1.PNG "Execution plan to create tables")

Our first query is going to inner join the two tables together. This action alone takes 29% of our batch. This also returns the dataset you would expect, the people and what type they are but only for the people that have a type.

{% highlight sql linenos %}
SELECT *
FROM people p
	JOIN personTypes pt ON p.personType = pt.personTypeID
{% endhighlight %}

|id|name  |personType|personTypeID|typeName|
|--|------|----------|------------|--------|
|1 |Test 1|1         |1           |Sleepy  |
|2 |Test 2|1         |1           |Sleepy  |
|3 |Test 3|2         |2           |Grumpy  |
|4 |Test 4|2         |2           |Grumpy  |
|5 |Test 5|3         |3           |Sneezy  |
|6 |Test 6|3         |3           |Sneezy  |

![alt text](../images/2016-09-19/executionPlan2.PNG "Execution plan to just join tables")

Our second query is going to outer join the two tables together and filter the resulting data set. This returns the same dataset as above. This also takes 29% of our batch.

{% highlight sql linenos %}
SELECT *
FROM people p
	LEFT JOIN personTypes pt ON p.personType = pt.personTypeID
WHERE pt.typeName IS NOT NULL
{% endhighlight %}

|id|name  |personType|personTypeID|typeName|
|--|------|----------|------------|--------|
|1 |Test 1|1         |1           |Sleepy  |
|2 |Test 2|1         |1           |Sleepy  |
|3 |Test 3|2         |2           |Grumpy  |
|4 |Test 4|2         |2           |Grumpy  |
|5 |Test 5|3         |3           |Sneezy  |
|6 |Test 6|3         |3           |Sneezy  |

![alt text](../images/2016-09-19/executionPlan3.PNG "Execution plan to join tables and filter nulls in WHERE clause")

And our third query is going to outer join the two tables together but we will filter the first table in the JOIN clause instead of creating a WHERE clause. This is where someone could get unexpected results. This query will return exactly what an OUTER LEFT JOIN would return anyways. The filter is almost useless in this scenario. However, it only took 9% of the batch to execute.

{% highlight sql linenos %}
SELECT *
FROM people p
	LEFT JOIN personTypes pt ON p.personType = pt.personTypeID 
		AND pt.typeName IS NOT NULL
{% endhighlight %}

|id|name  |personType|personTypeID|typeName|
|--|------|----------|------------|--------|
|1 |Test 1|1         |1           |Sleepy  |
|2 |Test 2|1         |1           |Sleepy  |
|3 |Test 3|2         |2           |Grumpy  |
|4 |Test 4|2         |2           |Grumpy  |
|5 |Test 5|3         |3           |Sneezy  |
|6 |Test 6|3         |3           |Sneezy  |
|7 |Test 7|NULL      |NULL        |NULL    |
|8 |Test 8|NULL      |NULL        |NULL    |

![alt text](../images/2016-09-19/executionPlan4.PNG "Execution plan to join tables and filter nulls in JOIN clause")

And just for fun, a fourth to show performance...

The below query uses a subquery to filter out the null personType values in the people table then joins to the personTypes table. This returns the same dataset as scenario 1 and 2 above but only took 8% of the batch to execute.

{% highlight sql linenos %}
SELECT *
FROM (
	SELECT id, name, personType 
	FROM people 
	WHERE personType IS NOT NULL
	) p
	LEFT JOIN personTypes pt ON p.personType = pt.personTypeID
{% endhighlight %}

|id|name  |personType|personTypeID|typeName|
|--|------|----------|------------|--------|
|1 |Test 1|1         |1           |Sleepy  |
|2 |Test 2|1         |1           |Sleepy  |
|3 |Test 3|2         |2           |Grumpy  |
|4 |Test 4|2         |2           |Grumpy  |
|5 |Test 5|3         |3           |Sneezy  |
|6 |Test 6|3         |3           |Sneezy  |

![alt text](../images/2016-09-19/executionPlan5.PNG "Execution plan to filter nulls in subquery and join tables")
