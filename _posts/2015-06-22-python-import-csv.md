---
layout: post
title: Import Excel CSV with Python
desc: "A brief example of how to import Excel CSV data with Python"
keywords: "python,csv,excel,import"
---

This past weeks adventure has been working with Python to import an Excel CSV file.  I like a recipe format when I am looking for how to do things and I was not able to find a lot of "recipes" for importing Excel CSV files into MySQL.  After working through the issues, I decided this would be a fine blog post.  So here you go.

Let us start with some sample CAV data at [Pastebin](http://pastebin.com/fYHiSERS).  Our CSV data contains a few columns of data:

|Column|Datatype|
|------|--------|
|ID|VARCHAR(10)|
|Make|VARCHAR(25)|
|Model|VARCHAR(50)|
|Year|INT(11)|
|VIN|VARCHAR(20)|
|Price|DOUBLE|
|DateAquired|DATE|
|Options|Comma delimited list|
|Image|Comma delimited list|

Then let us create some MySQL tables to import to...

{% highlight sql %}

CREATE TABLE `cardetail` (
  `ID` varchar(10) NOT NULL,
  `Make` varchar(25) DEFAULT NULL,
  `Model` varchar(50) DEFAULT NULL,
  `Year` int(11) DEFAULT NULL,
  `VIN` varchar(20) DEFAULT NULL,
  `Price` double DEFAULT NULL,
  `DateAquired` date DEFAULT NULL,
  PRIMARY KEY (`StockNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `carimage` (
  `ImageId` int(11) NOT NULL AUTO_INCREMENT,
  `CarID` varchar(10) DEFAULT NULL,
  `ImageURL` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`ImageId`),
  UNIQUE KEY `ImageId_UNIQUE` (`ImageId`)
) ENGINE=InnoDB AUTO_INCREMENT=2505 DEFAULT CHARSET=utf8;

CREATE TABLE `caroption` (
  `OptionId` int(11) NOT NULL AUTO_INCREMENT,
  `CarID` varchar(10) DEFAULT NULL,
  `OptionText` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`OptionId`),
  UNIQUE KEY `OptionId_UNIQUE` (`OptionId`)
) ENGINE=InnoDB AUTO_INCREMENT=4056 DEFAULT CHARSET=utf8;

{% endhighlight %}

Now for the fun stuff, how do we get that CSV data into MySQL?  First we need to import modules for csv, MySQLdb, and datetime.  

{% highlight python %}

import csv
import MySQLdb
import datetime

{% endhighlight %}

Then we need to establish the connection to MySQL and create a cursor.  We will also create a variable to use to ignore the first row which in our case is a header.

{% highlight python %}

mydb = MySQLdb.connect(
    host="localhost",
    user="root",
    passwd="somepassword",
    db="autoinventory"
)

cursor = mydb.cursor()
rowOne = 0

{% endhighlight %}

Now we will read in the CSV file and start a loop to go over the dataset.

{% highlight python %}

csv_data = csv.reader(file("autoinventory.csv"))
for row in csv_data:
  if rowOne == 1:

{% endhighlight %}

We will build a SQL string to insert our data.

{% highlight python %}

carDataSql = (
  "INSERT INTO CarDetail ( "
    "  StockNumber"
    ", Make"
    ", Model"
    ", Year"
    ", VIN"
    ", Price"
    ", DateAquired"
  " ) "
  "VALUES( %s, %s, %s, %s, %s, %s, %s )"
)

{% endhighlight %}

And to setup our array of data to insert into those placeholders.  Some things to note below are that we need to cast our integers, floats, and dates correctly.  We are using built in methods to do all of this.  The method strptime() creates a date/time object from a string and a format specifier.  Also note that row is an array and arrays in Python are zero index.

{% highlight python %}

carData = (
    row[0]
  , row[1]
  , row[2]
  , int(row[3])
  , row[4]
  , float(row[5])
  , datetime.datetime.strptime(row[6], "%b %d %Y %I:%M%p").date()
)

{% endhighlight %}

For our base piece of data, we will now execute the cursor to insert this record.

{% highlight python %}

cursor.execute( carDataSql, carData )

{% endhighlight %}

Next we will pull out the options and images into an array.  We use the split() method on the row and split on the comma.

{% highlight python %}

carOptions = row[7].split(",")
carImages = row[8].split(",")

{% endhighlight %}

Lastly we will loop over each array and insert records into the options and images tables.  You can note that our data arrays includes the stock number of the car so that we can match the record back to the CarDetail table.

{% highlight python %}

for option in carOptions:
  optionSql = (
    "INSERT INTO CarOption ( StockNumber, OptionText ) "
    "VALUES ( %s, %s )"
  )

optionData = ( row[0], option )
cursor.execute( optionSql, optionData )

for image in carImages:
  imageSql = (
    "INSERT INTO CarImage ( StockNumber, ImageURL ) "
    "VALUES ( %s, %s )"
  )

imageData = ( row[0], image )
cursor.execute( imageSql, imageData )

{% endhighlight %}

For each record loop, we will set the variable rowOne.  We will also commit our record and close the cursor we created.

{% highlight python %}

rowOne = 1
mydb.commit()
cursor.close()

{% endhighlight %}

The complete source code with correct whitespace is at [Pastebin](http://pastebin.com/MBcSSiKA)