---
title: Home Boards
date: 2022-12-07
tags:
- homelab
- iot
---

In the last 2 or 3 years, I have bought several cool displays and peripherals of computers(and computers) but most of them have been set aside and collected the dust, no matter how they have been desired before the purchase. Recently we had a baby boy, and we have some requirements to record his feeding time and amount, we need a display to indicate the last feeding time so we know what time to feed next(usually every 3 hours). For the display, I already have an option: [Pixoo64], which is large enough to see it clearly at a long distance(3m, from my sofa to the TV wall). For the backend there are so many more options, I am familiar with Django but keeping only such simple records will be too much to use Django, same to Javascript backends and full-stack frameworks. Good that I remembered the recent very popular single file Firestore replacement: [Pocketbase], I will give it a try.

## The first stage: Baby feedings tracker system

It's very easy to start with Pocketbase, you even don't need any docs or quick starts:

1. Start the service and create a init account
1. Create Collections(as Table of SQL DB)
1. Create Records(as Rows)

That's it!

Next, connect the Pixoo64 board. First thing is to search for it on GitHub, I know that there must be a lot of wheels that have been invented there :). I only see some Python packages, and no for Golang. Because I don't want it to be complex, so I don't want another Language to be involved, either using Pocketbase and other go packages or using Python, if it is possible. After a little more research, I found that a client library is optional because the Pixoo64 already has rest API and (poor but enough) [documentation].

[Pixoo64]: https://divoom.com/products/pixoo-64
[Pocketbase]: https://github.com/pocketbase/pocketbase
[documentation]: http://doc.divoom-gz.com/web/#/12?page_id=93
