---
title: Moving blog images to GCS
date: "2022-04-24"
updated: "2022-04-24"
tags: 
- security
---

I had previously committed some images into my blog git repository, but recently found that I can't keep adding blog images into the repo, which will cause it bloat.

<!--truncate-->

## Convert images to webp

As all major target of this blog should have visiting with the browser supports webp, so I will convert all non-svg images into webp. I have write a python script to convert all png files to webp, which using [Wand] library, although I can also use ImageMagick directly, but considering later will also use the script to upload to GCS so I decided to use Python, because it more modern, confident and easy for writing test cases.

The ratio of convert, 10 to 20 times small in size!

```console
$ ls -l *png
-rw-r--r--@ 1 taizhang  staff  455183 Mar 26 15:15 casual-life-3d-green-book-with-orange-ribbon.png
-rw-r--r--@ 1 taizhang  staff  414112 Mar 26 15:14 casual-life-3d-lab.png
-rw-r--r--@ 1 taizhang  staff  444124 Mar 26 15:13 casual-life-3d-young-man-and-woman-standing-together.png

$ ls -l *webp
-rw-r--r--  1 taizhang  staff  21920 Apr 24 09:36 casual-life-3d-green-book-with-orange-ribbon.webp
-rw-r--r--  1 taizhang  staff  42284 Apr 24 09:36 casual-life-3d-lab.webp
-rw-r--r--  1 taizhang  staff  46594 Apr 24 09:36 casual-life-3d-young-man-and-woman-standing-together.webp
```

## Upload to GCS

- Upload with file browser
- Upload with `gsutil`
- Upload with python client library

## Delete images in the repository's commitments with bfg

I need to delete the images already in the repo, which is useless and adding extra large size to the repo. I used [bfg].

Result: From `3.7MB` to `356KB`, another 10 times shrink.

```console
$ bfg -D casual-life-3d-lab.png

Using repo : /Users/taizhang/workspace/nodejs/zhangt.ai/.git

Found 44 objects to protect
Found 3 commit-pointing refs : HEAD, refs/heads/main, refs/remotes/origin/main

Protected commits
-----------------

These are your protected commits, and so their contents will NOT be altered:

 * commit a4ba69bf (protected by 'HEAD')

Cleaning
--------

Found 74 commits
Cleaning commits:       100% (74/74)
Cleaning commits completed in 46 ms.

Updating 2 Refs
---------------

        Ref                        Before     After
        ----------------------------------------------
        refs/heads/main          | a4ba69bf | 549243c5
        refs/remotes/origin/main | a4ba69bf | 549243c5

Updating references:    100% (2/2)
...Ref update completed in 26 ms.

Commit Tree-Dirt History
------------------------

        Earliest                                              Latest
        |                                                          |
        ........................................................DDDm

        D = dirty commits (file tree fixed)
        m = modified commits (commit message or parents changed)
        . = clean commits (no changes to file tree)

                                Before     After
        -------------------------------------------
        First modified commit | ad5ff331 | f3fb4eee
        Last dirty commit     | 06e68e4c | 1fd3b496

Deleted files
-------------

        Filename                 Git id
        --------------------------------------------
        casual-life-3d-lab.png | 3817f899 (404.4 KB)


In total, 11 object ids were changed. Full details are logged here:

        /Users/taizhang/workspace/nodejs/zhangt.ai.bfg-report/2022-04-24/09-26-33

BFG run is complete! When ready, run: git reflog expire --expire=now --all && git gc --prune=now --aggressive
$ du -hs .git
3.7M    .git
$ git reflog expire --expire=now --all && git gc --prune=now --aggressive 
Enumerating objects: 408, done.
Counting objects: 100% (408/408), done.
Delta compression using up to 8 threads
Compressing objects: 100% (397/397), done.
Writing objects: 100% (408/408), done.
Total 408 (delta 247), reused 0 (delta 0), pack-reused 0
$ du -hs .git
356K    .git
```

[Wand]: https://docs.wand-py.org/
[bfg]: https://rtyley.github.io/bfg-repo-cleaner/
