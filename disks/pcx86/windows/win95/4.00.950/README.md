---
layout: page
title: Microsoft Windows 95 (First Retail Release)
permalink: /disks/pcx86/windows/win95/4.00.950/
machines:
  - id: deskpro386
    type: pcx86
    state: deskpro386.json
    config: /devices/pcx86/machine/compaq/deskpro386/vga/4096kb/machine.xml
    drives: '[{name:"68Mb Hard Disk",type:4,path:"http://archive.pcjs.org/disks/pcx86/fixed/68mb/win95.json"}]'
    autoMount:
      A:
        name: None
      B:
        name: None
---

Microsoft Windows 95 (First Retail Release)
-------------------------------------------

Windows 95 was the successor to Windows 3.1 and included a number of important new features:

 * Support for 32-bit Windows applications
 * Long mixed-case filenames (up to 255 characters)
 * GUI improvements (e.g., Explorer, **Start** button, Taskbar, shortcuts) 

It was also first version of Windows that *required* an 80386 CPU (preferably a D-stepping or later).

Windows 95 was released to manufacturing on July 14, 1995 and went on sale at midnight on August 24, 1995.

It is shown running below, following a "Compact Installation" on a 68Mb hard disk.  Before the machine can
start, it must download the disk image, which may take a minute or two, depending on the speed of your
internet connection.  You can also run Windows 95 with the [PCjs Debugger](debugger/).

More information about this Windows 95 demo is available in the [PCjs Blog](/blog/2015/09/21/).

{% include machine.html id="deskpro386" %}
