---
layout: post
title: First Monday with a Blog
desc: "This is my first Monday with a blog entry talking about hooking up a used Porter Cable compressor to a 220V single phase power connection."
keywords: "Porter Cable compressor,220V Single Phase,breakers,disconnect box"
---
### First Monday with a blog

So I work on an agile team which of course means working close together.  Seems completely contrary to the developer mindset.  Which of course means I spend all day on the headset and never have a "good day" as described by Scott Adams...  And me...

![alt text](images/GoodDay.png "A good day")

```javascript
function qualityOfToday(numberOfMeetingsToday){
	var msg = "";
	if(numberOfMeetingsToday > 0){
		msg = "This day sucks!";
	} else {
		msg = "Stuff is getting done today!";
	}
	return msg;
}

alert(qualityOfToday(numberOfMeetingsToday = 1));
```

On the other hand, garage is a bit cleaner and the air compressor now has power.  Thanks to a friend for showing me how to work inside my breaker box.  Ever since the military, I am extremely hesitant to ever deal with electricity much less inside my breaker box.

So tip 1, do NOT touch your multimeter leads to both wires on a 220V single phase connection.  That will lead to a loud pop, smoke, and blackened connections.  And a dead multimeter.  You touch the leads to one wire and ground, one at a time.

A 220V single phase circuit is completed by having both phases of the AC current hooked up so each line grounded should read 110V.

When buying breakers, you need to check and see what type of breaker you need.  There are different boxes and breakers are installed different ways.  Best bet is to take a picture of your opened up breaker box and the breakers then ask the guy at the store.  When I say opened, I mean you removed the screws and took the cover off the box.  You can't see the breaker connections with the cover on.

![alt text](images/OpenBreakerBox.png "An opened up breaker box")

When buying a disconnect box, you need to know if you want a fusable or non-fusable.  You can't complete a circuit in a fusable box without fuses.  Shocking I know, or non-shocking since you won't get power.

Some notes on my particular compressor.  The wires in the wall are red/green/black/bare while the wires on the compressor were red/blue/black.  On a 220V single phase connection you have 2 hot wires and a common.  In this case the red/black wires were the hot wires and the blue was the common.

![alt text](images/WireConnections.png "Compressor power hookup")

### Things I like

+ [Dilbert](http://dilbert.com/ "Dilbert.com")