---
layout: page
title: Microsoft Windows 1.01 with CGA Display
permalink: /disks/pcx86/windows/1.01/cga/
redirect_from:
  - /configs/pc/machines/5160/cga/win101/
  - /configs/pc/machines/5160/cga/256kb/win101/
  - /configs/pc/machines/5160/cga/256kb/win101/machine.xml/
  - /demos/pc/cga-win101/xt-cga-win101.xml/
  - /demos/pc/cga-win101/
  - /devices/pc/machine/5160/cga/256kb/win101/
  - /devices/pc/machine/5160/cga/256kb/win101/machine.xml/
  - /devices/pcx86/machine/5160/cga/256kb/win101/
machines:
  - id: ibm5160-cga-win101
    type: pcx86
    state: /disks/pcx86/windows/1.01/cga/state.json
    config: /devices/pcx86/machine/5160/cga/256kb/machine.xml
    drives: '[{name:"10Mb Hard Disk",type:3,path:"/disks/pcx86/fixed/10mb/PCDOS200-WIN101-CGA.json"}]'
---

Microsoft Windows 1.01 with CGA Display
---------------------------------------

[Microsoft Windows 1.01](/disks/pcx86/windows/1.01/), the first public version of Windows, was released on
November 20, 1985.  It is shown here running on an IBM PC XT (Model 5160) with a CGA Display.  You can also run
Windows 1.01 with a [Debugger](debugger/), [Soft Keyboard](softkbd/), or [EGA Display](/disks/pcx86/windows/1.01/).

{% include machine.html id="ibm5160-cga-win101" %}

The above simulation is configured for a clock speed of 4.77Mhz, with 256Kb of RAM and a CGA Display,
using the original IBM PC Model 5160 ROM BIOS and CGA font ROM.  Even though the CGA was a "Color Graphics Adapter,"
the only CGA mode that Windows supported was the 640x200 2-color mode, hence its black-and-white appearance.

This PC XT configuration also includes a 10Mb hard disk with Windows 1.01 pre-installed.
This particular configuration will NOT save any changes when your browser exits, since it has
been pre-configured to always start Windows 1.01 in the same state.

NOTE: The Windows 1.01 mouse pointer can be controlled with your mouse, but only when your mouse is
within the "CGA Display" window. This is a restriction imposed by your web browser, not PCjs.

For more control over this machine, try the [Control Panel](debugger/) or [Soft Keyboard](softkbd/) configurations,
both of which feature the built-in PCjs Debugger, with save/restore enabled.
