---
layout: post
title: Powershell Finally Weirdness
desc: "Strange issue with Powershell finally code blocks not executing"
keywords: "powershell,finally,not executing,console"
---

As a developer, I run most of my local development environment from a console and I use Powershell scripts to start up that environment. Not so recently I ran into an issue with how my scripts were setup and it took forever to figure out why something was happening. Well, maybe not why but sorta why.

Jumping right in, if you have this script below and execute it with the *nofinal* flag, then cntl+c to terminate the script, the finally block will not execute. If you start it without the *nofinal* flag and terminate with cntl+c, the finally block will execute.

```powershell
param([switch]$nofinal)

Try{
    Write-Output "Trying stuff!"
    Write-Output "Press any key to continue ..."

    $x = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyUp")
}
Catch{
    Write-Output $_.Exception.Message
}
Finally{
    if($nofinal){
        Write-Output "Finally executed using write output"
    }
    Write-Host "Finally executed using write host."
}
```

The only difference is the use of the **Write-Output** when you include the *nofinal* flag to the start-up of the script.  Now I know the difference between **Write-Output** and **Write-Host** is that the first one writes to the pipeline so it can be piped into another command and the second one writes to the console itself.  I think that has to have something to do with this but I do not know the specifics.

I would love any input anyone has into this if you just happen to come across this article.
