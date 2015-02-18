---
layout: post
title: Lookup Tables
desc: "This is a use case for tables that store data only used for reporting purposes."
keywords: "sqlserver,lookup table,reporting,big data"
---
### A case for lookup tables

As we have established already, I work in development.  I happen to be pretty good with data and getting it how I want it (which isn't always right) and performance tuning.  We will now establish that I work with a large, old application.  We do very little greenfield work and large amounts of that revolve around reporting.  Which brings us to a report being designed for a customer we intend to use for many customers.  This customer happens to have large amounts of data and within the bounds of our present application, the report as it was written was not a performer.  I mean we are executing common table expressions to get a MIN() on a date field on a table containing 36 million records and joining to it against a table with 9 million records.

So our existing schema:

{%highlight sql %}
-- contains roughly 9 millions records
CREATE TABLE customerData
	recordId INT NOT NULL
	, customerName VARCHAR(50) NOT NULL
	, customerAddress VARCHAR(50) NOT NULL

-- contains roughly 36 million records
CREATE TABLE customerNotes
	recordId INT NOT NULL
	, noteText VARCHAR(250) NULL
	, dateTimeCreated DATETIME NULL

{% endhighlight %}

So the proposed solution.  We create a table as such:

{% highlight sql %} 

CREATE TABLE activityDates
	recordId INT NOT NULL
	, dateOne DATETIME NULL
	, dateTwo DATETIME NULL
	, dateThree DATETIME NULL

{% endhighlight %}

We then insert every record id from the table we want to store this data against.  Any action that would impact these dates, in this case notes, we update this table.  Then when we do reporting, instead of writing CTEs to get MIN() or MAX() dates from table1, we join to table activityDates istead.

This is of course a very simplified version of what I spent all day today and part of yesterday doing.  I first had to spend time trying to optimize it as it was so we could "hotfix" it, which means no schema changes.

### Things I like

+ Nothing, I spent all day trying to optimize queries for someone else!