---
layout: page
title: "VisiCalc (1981)"
permalink: /apps/pcx86/1981/visicalc/
machines:
  - id: ibm5150-visicalc
    type: pcx86
    config: /devices/pcx86/machine/5150/mda/64kb/debugger/machine.xml
    resume: 1
    state: /apps/pcx86/1981/visicalc/state.json
    autoMount:
      A:
        path: /disks/pcx86/dos/ibm/1.00/PCDOS100.json
      B:
        path: /apps/pcx86/1981/visicalc/VISICALC1981.json
    autoType: $date\rb:\rvc\r
---

VisiCalc (1981)
---------------

{% include machine.html id="ibm5150-visicalc" %}

For more classic PC software experiences, see the PCjs collection of [IBM PC Application Demos](/apps/pcx86/).

VisiCalc Reference
------------------

[From the [website](http://www.bricklin.com/history/refcard1.htm) of Dan Bricklin, co-author of VisiCalc]

![Reference Card 1-2](visicalc-refcard1-2.gif)

![Reference Card 3-4](visicalc-refcard3-4.gif)

![Reference Card 5-6](visicalc-refcard5-6.gif)

![Reference Card 7-8](visicalc-refcard7-8.gif)

![Reference Card 9-10](visicalc-refcard9-10.gif)

VisiCalc History
----------------
See [http://www.bricklin.com/history/vcexecutable.htm](http://www.bricklin.com/history/vcexecutable.htm)

VisiCalc License
----------------
See [http://www.bricklin.com/history/vclicense.htm](http://www.bricklin.com/history/vclicense.htm)
