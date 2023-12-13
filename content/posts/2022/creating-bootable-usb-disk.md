---
title: Creating bootable usb disk
date: "2022-02-17"
tags:
- os
---

Occasionally I need to reinstall my desktop or servers, this page will help myself for referring if want to try any new OS.

<!--truncate-->

## Host: macOS

### Create windows image

> I haven't success install Windows via the created usb disk with this method, I always have issue "Windows could not prepare the computer to boot into the next phase of installation", but it works for some others.

I have created this simple script, run it like: `<script>.sh <image_location>`

Before use this script, make sure:

- Only 1 usb disk inserted
- Install wimlib

```shell
IMAGE_FILE=$1
DISK_LABEL="WIN_INSTALL"

usb_disk=$(diskutil list external|head -n1|cut -d ' ' -f1)
diskutil eraseDisk MS-DOS "${DISK_LABEL}" GPT "$usb_disk"

hdiutil mount "$IMAGE_FILE"
rsync -vha --exclude=sources/install.wim /Volumes/CCCOMA_X64FRE_EN-US_DV9/* "/Volumes/${DISK_LABEL}"

mkdir -p "/Volumes/${DISK_LABEL}/sources"
wimlib-imagex split /Volumes/CCCOMA_X64FRE_EN-US_DV9/sources/install.wim "/Volumes/${DISK_LABEL}/sources/install.swm" 3600
```

### Create linux image

Install with [etcher]

## Host: Ubuntu(Linux)

### Create windows image

Download the latest [Ventoy] release, extract the file and open `VentoyGUI.x86_64`(Depends on your system arch), select the target USB disk, and select `Option -> Partition Style -> GPT`, then click `Install`. You will see two mounts: Ventoy and VTOYEFI. Copy the ISO file of Windows installer into `Ventoy`. That's it.

[Ventoy]: https://github.com/ventoy/Ventoy/releases
[etcher]: https://github.com/balena-io/etcher
