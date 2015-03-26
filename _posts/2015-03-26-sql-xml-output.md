---
layout: post
title: SQLServer XML Output
desc: "A brief conversation with some examples of outputting XML from SQLServer"
keywords: "sqlserver,xml,FOR XML,output"
---

My latest adventures with SQLServer have been with being able to create some structured XML output from a query.  I figured I might as well present some sample code and output in case it helps someone else.

Let us start with building some sample data...

{%highlight sql %}

-- create some users
CREATE TABLE ##users (Id INT, firstName VARCHAR(50), lastName VARCHAR(50), residentState VARCHAR(2), userName VARCHAR(25));
INSERT INTO ##users (Id, firstName, lastName, residentState, userName)
VALUES
	(1, 'Jack', 'Smith', 'TX', 'jjSmith')
	, (2, 'Elvis', 'Presley', 'LA', 'the_king')
	, (3, 'Jack', 'Johnson', 'FL', 'some_dude')
	, (4, 'Bruce', 'Willis', 'NC', 'actionMan')
	, (5, 'Arnold', 'Kinston', 'ND', 'whos_this')

-- create some phone numbers for the users
CREATE TABLE ##phone (phoneId INT, userId INT, phoneType VARCHAR(10), phoneNumber VARCHAR(15));
INSERT INTO ##phone (phoneId, userId, phoneType, phoneNumber)
VALUES
	(1, 1, 'home', '111-222-3333')
	, (2, 1, 'cell', '222-333-4444')
	, (3, 1, 'work', '333-444-5555')
	, (4, 2, 'home', '444-555-6666')
	, (5, 2, 'work', '555-666-7777')
	, (6, 4, 'home', '666-777-8888')
	, (7, 5, 'home', '777-888-9999')

-- create some email addresses for the users
CREATE TABLE ##email (emailId INT, userId INT, emailType VARCHAR(10), emailAddress VARCHAR(100));
INSERT INTO ##email (emailId, userId, emailType, emailAddress)
VALUES
	(1, 2, 'home', 'elvis.presley@test.com')
	, (2, 2, 'work', 'elvis@test.com')
	, (3, 3, 'home', 'jack.johnson@test.com')
	, (4, 4, 'home', 'bruce.willis@test.com')
	, (5, 5, 'home', 'arnold.kinston@test.com')
	, (6, 5, 'work', 'arnold@test.com')
	, (7, 5, 'disposable', 'kinston@test.com')

{% endhighlight %}

The most basic example is using *FOR XML RAW* which will output every row in your query as an XML record with attributes for every column in the query.  The default name of the element is **row** but below we are specifying that we want the record to be named **user**.

{%highlight sql %}

-- raw example where everything in the row goes in as attributes with a default name of ROW, you can specify the name though
SELECT
	u.Id
	, u.firstName
	, u.lastName
	, u.residentState
	, u.userName
FROM ##users u
FOR XML RAW('user')

{% endhighlight %}

{%highlight xml %}

<user Id="1" firstName="Jack" lastName="Smith" residentState="TX" userName="jjSmith" />
<user Id="2" firstName="Elvis" lastName="Presley" residentState="LA" userName="the_king" />
<user Id="3" firstName="Jack" lastName="Johnson" residentState="FL" userName="some_dude" />
<user Id="4" firstName="Bruce" lastName="Willis" residentState="NC" userName="actionMan" />
<user Id="5" firstName="Arnold" lastName="Kinston" residentState="ND" userName="whos_this" />

{% endhighlight %}

The same example except this time we are defining that we want a root element of **users**.

{%highlight sql %}

-- you can also give it a root element
SELECT
	u.Id
	, u.firstName
	, u.lastName
	, u.residentState
	, u.userName
FROM ##users u
FOR XML RAW, ROOT('users')

{% endhighlight %}

{%highlight xml %}

<users>
  <row Id="1" firstName="Jack" lastName="Smith" residentState="TX" userName="jjSmith" />
  <row Id="2" firstName="Elvis" lastName="Presley" residentState="LA" userName="the_king" />
  <row Id="3" firstName="Jack" lastName="Johnson" residentState="FL" userName="some_dude" />
  <row Id="4" firstName="Bruce" lastName="Willis" residentState="NC" userName="actionMan" />
  <row Id="5" firstName="Arnold" lastName="Kinston" residentState="ND" userName="whos_this" />
</users>

{% endhighlight %}

To get a little more complicated, we are switching from *FOR XML RAW* to *FOR XML PATH* instead.  The difference is that we can specify attributes and nested elements now.  If we alias our columns using XPATH style names, we can define attributes.  Items without an alias will be output as a new element nested under the current element.  Important thing to note is that anything that is going to be an attribute has to come first before elements.

{%highlight sql %}

-- basic example with attributes, '@varchar' alias declaration with @ makes the column an attribute, all attributes declarations must come before data elements
SELECT
	u.Id AS '@userId'
	, u.firstName AS '@firstName'
	, u.lastName  AS '@lastName'
	, u.residentState
	, u.userName
FROM ##users u
FOR XML PATH('User'), TYPE, ROOT('Users')

{% endhighlight %}

{%highlight xml %}

<Users>
  <User userId="1" firstName="Jack" lastName="Smith">
    <residentState>TX</residentState>
    <userName>jjSmith</userName>
  </User>
  <User userId="2" firstName="Elvis" lastName="Presley">
    <residentState>LA</residentState>
    <userName>the_king</userName>
  </User>
  <User userId="3" firstName="Jack" lastName="Johnson">
    <residentState>FL</residentState>
    <userName>some_dude</userName>
  </User>
  <User userId="4" firstName="Bruce" lastName="Willis">
    <residentState>NC</residentState>
    <userName>actionMan</userName>
  </User>
  <User userId="5" firstName="Arnold" lastName="Kinston">
    <residentState>ND</residentState>
    <userName>whos_this</userName>
  </User>
</Users>

{% endhighlight %}

Lastly a slightly more complicated example involving some subqueries that return multiple records from a 1-many relationship to other tables.

{%highlight sql %}

-- slightly complex nested XML data
SELECT 
	u.Id AS '@userId'
	, u.firstName AS '@firstName'
	, u.lastName  AS '@lastName'
	, u.residentState
	, u.userName
	, (
		SELECT p.phoneType AS 'PhoneNumber/@Type', p.phoneId AS 'PhoneNumber/@PhoneId', p.phoneNumber AS PhoneNumber
		FROM ##phone p
		WHERE p.userId = u.Id
		FOR XML PATH(''), TYPE, ROOT('PhoneNumbers')
	)
	, (
		SELECT e.emailId AS 'Email/@EmailId', e.emailAddress AS 'Email/@EmailAddress'
		FROM ##email e
		WHERE e.userId = u.Id
		FOR XML PATH(''), TYPE
	)
FROM ##users u
FOR XML PATH('User'), TYPE, ROOT('Users')

{% endhighlight %}

{%highlight xml %}

<Users>
  <User userId="1" firstName="Jack" lastName="Smith">
    <residentState>TX</residentState>
    <userName>jjSmith</userName>
    <PhoneNumbers>
      <PhoneNumber Type="home" PhoneId="1">111-222-3333</PhoneNumber>
      <PhoneNumber Type="cell" PhoneId="2">222-333-4444</PhoneNumber>
      <PhoneNumber Type="work" PhoneId="3">333-444-5555</PhoneNumber>
    </PhoneNumbers>
  </User>
  <User userId="2" firstName="Elvis" lastName="Presley">
    <residentState>LA</residentState>
    <userName>the_king</userName>
    <PhoneNumbers>
      <PhoneNumber Type="home" PhoneId="4">444-555-6666</PhoneNumber>
      <PhoneNumber Type="work" PhoneId="5">555-666-7777</PhoneNumber>
    </PhoneNumbers>
    <Email EmailId="1" EmailAddress="elvis.presley@test.com" />
    <Email EmailId="2" EmailAddress="elvis@test.com" />
  </User>
  <User userId="3" firstName="Jack" lastName="Johnson">
    <residentState>FL</residentState>
    <userName>some_dude</userName>
    <Email EmailId="3" EmailAddress="jack.johnson@test.com" />
  </User>
  <User userId="4" firstName="Bruce" lastName="Willis">
    <residentState>NC</residentState>
    <userName>actionMan</userName>
    <PhoneNumbers>
      <PhoneNumber Type="home" PhoneId="6">666-777-8888</PhoneNumber>
    </PhoneNumbers>
    <Email EmailId="4" EmailAddress="bruce.willis@test.com" />
  </User>
  <User userId="5" firstName="Arnold" lastName="Kinston">
    <residentState>ND</residentState>
    <userName>whos_this</userName>
    <PhoneNumbers>
      <PhoneNumber Type="home" PhoneId="7">777-888-9999</PhoneNumber>
    </PhoneNumbers>
    <Email EmailId="5" EmailAddress="arnold.kinston@test.com" />
    <Email EmailId="6" EmailAddress="arnold@test.com" />
    <Email EmailId="7" EmailAddress="kinston@test.com" />
  </User>
</Users>

{% endhighlight %}

And lastly, cleanup our temp tables!

{%highlight sql %}

-- clean up
DROP TABLE ##users
DROP TABLE ##email
DROP TABLE ##phone

{% endhighlight %}

If you want the code samples in full, they are on [pastebin.com](http://pastebin.com/uKHMBkXH).

I certainly hope these examples are helpful to someone.  Sometimes just basic things are documented well enough to get at what you want and I like the format of "recipes" for code and such.

### +1 to the good guys
[Don't mess with an 84yo and his wife](http://dailycaller.com/2015/03/19/surveillance-footage-shows-armed-84-year-old-man-sending-his-attacker-running-for-the-hills-video/)
