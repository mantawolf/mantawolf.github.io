---
layout: post
title: Agile Thoughts
desc: "Some general thoughts on agile programming, slicing and spiking"
keywords: "agile,slicing,spiking,work planning"
---

The team I work with has certainly learned a lot since we started working under agile.  Most of this is all documented elsewhere and all I offer is another "opinion" in the sea of other opinions.

#### Slicing

This is certainly the MOST important thing we have learned, and it has been a hard learned lesson.  Slice all your work items into the smallest, most granular work item you can.  This takes a lot of practice and it is certainly easy to not want to or even say it is sliced as small as it makes sense.  Until you release a bunch of bugs related to one big change you did.  Small sliced work items make for more accurate testing and smaller testing efforts.  The more work items you compound into a single work item, the exponentially higher the testing becomes and the higher the risk of the change resulting in an error becomes.

We refactored a chunk of code to make it secure and perform better.  In doing so, we decided to do it all in one fell swoop.  This code probably had a hundred code paths.  In doing so, we shorted our testing efforts as "acceptable risks" and as a result had errors reported from clients from untested paths.  Some of them were paths we didn't know existed, some were paths we just didn't document to test.  Lesson learned for us is to go through the code and identify the paths to test in full and to slice those work items smaller so that there are less paths to test.

#### Path Identification for Testing

This is covered above but certainly deserves a call-out on its own.  What has worked best so far for us is as follows:

+ Design the change
+ Document the test cases based on the code paths available
+ Write the code
+ Developer follow test cases
+ Tester test in code branch
+ Code flows to release branch
+ Code is tested in release environments

#### Work Planning

Lastly, planning your work for a sprint cycle is important.  It is also very important to include the tasks that your team dislikes in smaller pieces lest you wind up in our situation.  We ignored a large number of spikes (agile spike: research to understand a problem before determining work) in order to accomplish things we prefer to do.  This results in a bad backlog of work where things are unknown.  In this case, management decided they needed to "know" things that we could not answer because we had not done any spikes.  Now we are headed into sprint 3 or 4 or 5, I don't remember anymore, where all we have done is research to identify how much work is left to be done on this project.  So take it from me, do those spikes during your result sprint work in smaller chunks lest you spend months doing nothing but research...

Ick.

### Things I like
+ Writing code when I get to
