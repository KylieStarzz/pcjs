---
layout: page
title: PC11 High-Speed Paper Tape Reader/Punch
permalink: /devices/pdp11/pc11/
---

PC11 High-Speed Paper Tape Reader/Punch
---------------------------------------

Machines containing the [PC11 Component](/modules/pdp11/lib/pc11.js) include:

- [PDP-11/20 Bootstrap Loader Demo](/devices/pdp11/machine/1120/bootstrap/) (with [Debugger](/devices/pdp11/machine/1120/bootstrap/debugger/))
- [PDP-11/20 BASIC Demo](/devices/pdp11/machine/1120/basic/) (with [Debugger](/devices/pdp11/machine/1120/basic/debugger/))

PCjs has archived a selection of [Paper Tape Images](/apps/pdp11/tapes/) for use by those machines, most of which are
listed in the following PC11 Device XML file:

- [Default](/devices/pdp11/pc11/default.xml)

which is typically referenced by a Machine XML file as:

```xml
<device ref="/devices/pdp11/pc11/default.xml"/>
```
		
Device XML files not only configure a device, but also list all the resource the device will use, and define UI elements
used to control the device, such as choosing which tape should be "loaded" into the PC11 device.  For example:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<device id="pc11" type="pc11" baudReceive="9600" autoMount='{PTR:{path:"/apps/pdp11/boot/bootstrap/BOOTSTRAP-16KB.json"}}' pos="left" width="35%" padLeft="8px" padBottom="8px">
    <name>Paper Tape Controls</name>
    <control type="container">
        <control type="list" binding="listTapes">
            <tape id="tape00" name="Bootstrap Loader (16Kb)" path="/apps/pdp11/boot/bootstrap/BOOTSTRAP-16KB.json"/>
            <tape id="tape01" name="Absolute Loader" path="/apps/pdp11/tapes/absloader/DEC-11-L2PC-PO.json"/>
            <tape id="tape02" name="BASIC (Single User)" path="/apps/pdp11/tapes/basic/DEC-11-AJPB-PB.json"/>
        </control>
        <control type="button" binding="loadTape">Load</control>
        <control type="button" binding="readTape">Read</control>
        <control type="description" binding="descTape" padRight="8px"/>
        <control type="file" binding="mountTape"/>
        <control type="progress" binding="readProgress" pos="default" width="250px" padTop="8px">Tape Progress</control>
    </control>
</device>
```

For details about the PC11 hardware, we relied upon the [PDP-11 Peripherals Handbook (1976)](https://s3-us-west-2.amazonaws.com/archive.pcjs.org/pubs/dec/pdp11/other/PDP11_Peripherals_Handbook_1976.pdf),
p. 4-376 (p. 408 of the PDF).
