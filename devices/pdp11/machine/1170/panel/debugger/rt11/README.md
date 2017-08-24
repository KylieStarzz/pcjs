---
layout: page
title: PDP-11/70 with Front Panel and Debugger
permalink: /devices/pdp11/machine/1170/panel/debugger/rt11/
machines:
  - id: test1170
    type: pdp11
    config: /devices/pdp11/machine/1170/panel/debugger/machine.xml
    debugger: true
    autoStart: true
    autoMount:
      RK0:
        path: https://s3-us-west-2.amazonaws.com/archive.pcjs.org/disks/dec/rk03/RK03-RT11-V40.json
      RL0:
        path: https://s3-us-west-2.amazonaws.com/archive.pcjs.org/disks/dec/rl02k/RL02K-XXDP.json
      PTR:
        path: /apps/pdp11/tapes/absloader/DEC-11-L2PC-PO.json
---

This machine is ready to boot [RT-11 v4.0](/disks/dec/rk03/rtl11v4/) ("BOOT RK0").

Alternatively, you can also boot [XXDP+ Diagnostics](/disks/dec/rl02k/xxdp/) ("BOOT RL0") and run
diagnostics (e.g., "R EKBEE1"):

- [EKBAD0: 11/70 CPU DIAGNOSTIC (PART 1)](/disks/dec/rl02k/xxdp/ekbad0/)
- [EKBBF0: 11/70 CPU DIAGNOSTIC (PART 2)](/disks/dec/rl02k/xxdp/ekbbf0/)
- [EKBEE1: 11/70 MEMORY MANAGEMENT DIAGNOSTIC](/disks/dec/rl02k/xxdp/ekbee1/)

For more information about booting and running these diagnostics, see [XXDP+ Diagnostics](/disks/dec/rl02k/xxdp/).

{% include machine.html id="test1170" %}
