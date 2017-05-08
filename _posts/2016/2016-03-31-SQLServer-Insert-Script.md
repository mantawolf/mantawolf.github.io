---
layout: post
title: SQL Server INSERT Script
keywords: "sqlserver,ssms,generate,insert statement,backup"
---
Wouldn't it be nice if you would right click a table and generate insert statements for everything in the table?  It seems like this should be a context menu option but it isn't.  There is however a way to do it.

You can right-click the database, select **Tasks** then **Generate Scripts**.  Select the **Select specific database objects** and pick your one table.  Click next, click the **Advanced** button.  In that popup you will see an option for **Types of data to script** and set that value to **Data only**.  I typically **Save to new query window** but you can do it however you want.

One minor note, the **Advanced** button applies to the entire area that is bordered, not just the **Save to file** option.

All that will generate insert statements similar to below...

```sql
USE [tempDatabase]
GO
SET IDENTITY_INSERT [dbo].[tempTable] ON 
GO
INSERT [dbo].[tempTable] ([id], [firstName], [lastName], [address], [city], [state], [zip]) 
VALUES (1, N'Kim', N'Smith', N'100 Main St', N'Dallas', N'TX', N'99999')
GO
INSERT [dbo].[tempTable] ([id], [firstName], [lastName], [address], [city], [state], [zip]) 
VALUES (2, N'John', N'Jacobs', N'101 Main St', N'Dallas', N'TX', N'99999')
GO
INSERT [dbo].[tempTable] ([id], [firstName], [lastName], [address], [city], [state], [zip]) 
VALUES (3, N'Nancy', N'Joseph', N'102 Main St', N'Dallas', N'TX', N'99999')
GO
INSERT [dbo].[tempTable] ([id], [firstName], [lastName], [address], [city], [state], [zip]) 
VALUES (4, N'Mark', N'Jackson', N'103 Main St', N'Dallas', N'TX', N'99999')
GO
SET IDENTITY_INSERT [dbo].[tempTable] OFF
GO
```

Not that I have a loyal following or post often enough to generate one, but I am going to Japan next week and there certainly won't be any posting next week.  I will post some photos when I get back though.
