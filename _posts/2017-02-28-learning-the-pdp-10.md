---
layout: post
title: Learning the PDP-10
date: 2017-02-28 22:00:00
permalink: /blog/2017/02/28/
---

Since I've more or less achieved all my goals for the PCjs [PDP-11 Emulator](/devices/pdp11/machine/),
I've decided to turn my attention to an even older historically important DEC computer:
the [PDP-10](https://en.wikipedia.org/wiki/PDP-10#Cancellation_and_influence).  

Having never used a real DEC PDP-10, I've had a steep learning curve creating a [PDP-10 Emulator](/modules/pdp10/).
So far, the only [PDP-10 Hardware Documentation](/pubs/dec/pdp10/) I've read (or rather, skimmed) is the
[PDP-10 System Reference Manual (1968)](https://s3-us-west-2.amazonaws.com/archive.pcjs.org/pubs/dec/pdp10/ka10/DEC-10-HGAA-D_PDP-10_System_Reference_Manual_May1968.pdf).

To make it easier to create and run some simple [PDP-10 Opcode Tests](/apps/pdp10/tests/opcodes/), most of my initial development
efforts have centered on the built-in PDP-10 Debugger.  In addition to the usual disassembler capabilities, I've also included
an assembler, so that I can easily enter instruction sequences like this:

	a 100;
	hrli 1,111111;
	hrri 1,444444;
	hlr 2,1;
	hrl 2,1;
	end

and immediately see the corresponding opcodes:

	>> u 100 l4
	000100: 505040 111111  HRLI    1,111111
	000101: 541040 444444  HRRI    1,444444
	000102: 544100 000001  HLR     2,1
	000103: 504100 000001  HRL     2,1

It's not a full-featured assembler; it's little more than a brute-force reverse look-up through the disassembler's
opcode-to-mnemonic tables.  But it gets the job done.

Next, I've written an initial set of [PDP-10 Opcode Tests](/apps/pdp10/tests/opcodes/) and compared the results to those produced
by [SIMH](https://github.com/simh/simh), and so far, so good.  More than anything else, that's just a testament to DEC's
excellent documentation.

One of the challenges in creating a JavaScript-based [PDP-10 Emulator](/modules/pdp10/) involves 36-bit arithmetic, because
JavaScript bit-wise operators maintain only 32 bits.  Extreme care must be taken to use only *arithmetic* operators whenever
accessing and/or preserving the 4 most-significant bits in any 36-bit value.

So, before I started this project, I wrote a proof-of-concept [Int36 Class](/modules/shared/lib/int36.js) that supports 36-bit
addition, subtraction, multiplication, and division, as well as a number of helper functions (e.g., *toString()*).  Further
adaptation will be required, however, because **Int36** multiplication produces 72-bit results and **Int36** division uses 72-bit
dividends, whereas the PDP-10 uses "double length fixed point" values that contain only 70 bits of magnitude with two matching
sign bits.

I just finished writing opcode handlers for all the PDP-10 "Half Word" instructions (i.e., *HLL*, *HRL*, *HRR*, *HLR*, with all
mode variations and bit extension options), but that's just the tip of the iceberg.  Hopefully within another month or
so I'll be able to find the time to finish the rest of the PDP-10 opcode handlers.

And then maybe we'll be able to run some *real* PDP-10 software in our browsers.

*[@jeffpar](http://twitter.com/jeffpar)*  
*Feb 28, 2017*
