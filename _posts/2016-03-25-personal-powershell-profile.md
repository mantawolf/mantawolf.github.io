---
layout: post
title: Personal Powershell Profile
keywords: "powershell,profile"
---
Just thought I would share my Powershell profile I use.  Anyone have anything they would add?

```powershell
# home path used by various commands within this
$homePath = "c:\code\"
Set-Location $homePath

# up one directory
function .. { Push-Location ..}

# up two directories
function ... { Push-Location ..\..}

# up three directories
function .... { Push-Location ..\..\..}

# execute specific cmd on current folder and children : walk { ls }
# can nest : walk { walk { walk { ls } } }
Function Walk-ChildDirectory {
	Param(
		[Parameter(Mandatory=$true,ValueFromPipeline=$true)][ScriptBlock]$Task
	)
	ls -Directory | %{
		pushd $_
		& $Task
		popd
	}
}
Set-Alias walk Walk-ChildDirectory

# ternary operator : (?: {1 -le 0} {"true"} {"false"})
Set-Alias ?: Invoke-Ternary -Option AllScope
filter Invoke-Ternary ([scriptblock]$decider, [scriptblock]$ifTrue, [scriptblock]$ifFalse) {
	if (&$decider) {
		&$ifTrue
	} else {
		&$ifFalse
	}
}

# writes XML object to screen in a pretty way
# writeXmlToScreen($xml = [xml]"<note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Don't forget me this weekend!</body></note>")
function writeXmlToScreen ($xml){
	$StringWriter = New-Object System.IO.StringWriter
	$XmlWriter = New-Object System.Xml.XmlTextWriter $StringWriter
	$XmlWriter.Formatting = "indented"
	$xml.WriteTo($XmlWriter)
	$XmlWriter.Flush()
	$StringWriter.Flush()
	Write-Output $StringWriter.ToString()
}

# executes Sql
# executeSQL($params = @{database = "localDB"; sql = "SELECT * FROM customers WHERE id = 1"; dbUser = "sa"; dbPass = "password"; dbHost = "localhost"})
# executeSQL($params = @{database = "localDB"; sql = "SELECT * FROM customers WHERE id = 1"; dbUser = "sa"; dbPass = "password"})
# executeSQL($params = @{database = "localDB"; sql = "SELECT * FROM customers WHERE id = 1"})
function executeSQL($params){
	$dbUser = (?: {[bool]($params.dbUser -ne $null)} {$params.dbUser} {"sa"})
	$dbPass = (?: {[bool]($params.dbPass -ne $null)} {$params.dbPass} {"password"})
	$dbHost = (?: {[bool]($params.dbHost -ne $null)} {$params.dbHost} {"localhost"})
	$database = $params.database

	$connectionString = "Server=$dbHost;uid=$dbUser;pwd=$dbPass;Database=$database;Integrated Security=False;"

	$DB = New-Object System.Data.SqlClient.SqlConnection
	$DB.ConnectionString = $connectionString
	$DB.Open()

	$CMD = $DB.CreateCommand()
	$CMD.CommandText = $params.sql

	$queryDataTable = New-Object System.Data.DataTable
	$queryDataTable.Load($CMD.ExecuteReader())

	$DB.Close();

	return ,$queryDataTable
}

# inform("this is informational.")
function inform($message){
	Write-Host $message -foregroundcolor "Blue" -backgroundcolor "White"
}

# warn("this is a warning!")
function warn($message){
	Write-Host $message -foregroundcolor "Red" -backgroundcolor "White"
}

# powershell version
function version(){
	$PSVersionTable.PSVersion
}

# get-time
function Get-Time{
	return $(get-date | foreach { $_.ToLongTimeString() } )
}

# just sets up custom prompt
function prompt{
	# Write the time
	write-host "[" -noNewLine
	write-host $(Get-Time) -foreground yellow -noNewLine
	write-host "] " -noNewLine
	# Write the path
	write-host $($(Get-Location).Path.replace($home,"~").replace("\","/")) -foreground green -noNewLine
	write-host $(if ($nestedpromptlevel -ge 1) { '>>' }) -noNewLine
	return "> "
}

# opens Windows explorer at current directory
function explore {
	explorer .
}

Set-Alias gs Get-Service
```
