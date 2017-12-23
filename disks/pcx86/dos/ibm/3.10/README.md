---
layout: page
title: PC-DOS 3.10
permalink: /disks/pcx86/dos/ibm/3.10/
machines:
  - id: ibm5170-pcdos310
    type: pcx86
    config: /devices/pcx86/machine/5170/ega/640kb/rev1/machine.xml
    resume: 1
    autoMount:
      A:
        path: /disks/pcx86/dos/ibm/3.10/PCDOS310-DISK1.json
      B:
        path: /disks/pcx86/dos/ibm/3.10/PCDOS310-DISK2.json
    autoType: $date\r$time\r
---

PC-DOS 3.10
-----------

PC-DOS 3.10 was announced on August 14, 1984 (along with [PC-DOS 3.00](/disks/pcx86/dos/ibm/3.00/)) and released
on April 2, 1985.

[Directory Listings](#directory-of-pc-dos-310-disk-1) of the two 360Kb distribution diskettes are provided below.
Another variation of the first disk has been found, which I've called [Patched Disk 1](#directory-of-pc-dos-310-patched-disk-1).
It contains a modified IBMDOS.COM, along with updated `KEYBxx` "Load Keyboard" programs.  The modified IBMDOS.COM was patched
with 4 NOP (0x90) bytes as follows:

    298,299c298,299
    < 00001cb0  43 3c 7f 74 36 3c 08 74  32 3c 17 74 5e 3c 15 74  |C<.t6<.t2<.t^<.t|
    < 00001cc0  51 3c 0d 74 32 3c 0a 74  44 36 3a 06 11 11 74 6b  |Q<.t2<.tD6:...tk|
    ---
    > 00001cb0  43 3c 7f 74 36 3c 08 74  32 3c 17 90 90 3c 15 90  |C<.t6<.t2<...<..|
    > 00001cc0  90 3c 0d 74 32 3c 0a 74  44 36 3a 06 11 11 74 6b  |.<.t2<.tD6:...tk|

Different websites (e.g.,
[16BitOS](http://16bitos.com/310ibm.htm),
[PC DOS Retro](https://sites.google.com/site/pcdosretro/disklistings#TOC-PCDOS310))
list different "authoritative" directory listings for PC-DOS 3.10, which helps confirm that both variations of Disk 1
are authentic (as opposed to someone's random changes) and that IBM quietly slipped in these last-minute changes during
the first month of its release.  And "quietly" seems to be a fair assessment, since I've so far been unable to locate
any contemporary reports (e.g., press releases or magazine articles) regarding these PC-DOS 3.10 variations.

Also, a note of thanks to [Jeff Duntemann](https://www.contrapositivediary.com/?p=2107) for sharing his collection
of old diskettes with PCjs, which included, among other things, IBM's "patched" copy of PC-DOS 3.10.

{% include machine.html id="ibm5170-pcdos310" %}

### Directory of PC-DOS 3.10 (Disk 1)

	 Volume in drive A has no label
	 Directory of  A:\
	
	IBMBIO   COM     9564   3-07-85   1:43p
	IBMDOS   COM    27760   3-07-85   1:43p
	ANSI     SYS     1651   3-07-85   1:43p
	ASSIGN   COM     1509   3-07-85   1:43p
	ATTRIB   EXE    15091   3-07-85   1:43p
	BACKUP   COM     5577   3-07-85   1:43p
	BASIC    COM    17792   3-07-85   1:43p
	BASICA   COM    27520   3-07-85   1:43p
	CHKDSK   COM     9435   3-07-85   1:43p
	COMMAND  COM    23210   3-07-85   1:43p
	COMP     COM     3664   3-07-85   1:43p
	DISKCOMP COM     4073   3-07-85   1:43p
	DISKCOPY COM     4329   3-07-85   1:43p
	EDLIN    COM     7261   3-07-85   1:43p
	FDISK    COM     8173   3-07-85   1:43p
	FIND     EXE     6403   3-07-85   1:43p
	FORMAT   COM     9398   3-07-85   1:43p
	GRAFTABL COM     1169   3-07-85   1:43p
	GRAPHICS COM     3111   3-07-85   1:43p
	JOIN     EXE    15971   3-07-85   1:43p
	KEYBFR   COM     2289   3-07-85   1:43p
	KEYBGR   COM     2234   3-07-85   1:43p
	KEYBIT   COM     2177   3-07-85   1:43p
	KEYBSP   COM     2267   3-07-85   1:43p
	KEYBUK   COM     2164   3-07-85   1:43p
	LABEL    COM     1826   3-07-85   1:43p
	MODE     COM     5295   3-07-85   1:43p
	MORE     COM      282   3-07-85   1:43p
	PRINT    COM     8291   3-07-85   1:43p
	RECOVER  COM     4050   3-07-85   1:43p
	RESTORE  COM     5410   3-07-85   1:43p
	SELECT   COM     2084   3-07-85   1:43p
	SHARE    EXE     8304   3-07-85   1:43p
	SORT     EXE     1664   3-07-85   1:43p
	SUBST    EXE    16611   3-07-85   1:43p
	SYS      COM     3727   3-07-85   1:43p
	TREE     COM     2831   3-07-85   1:43p
	VDISK    SYS     3307   3-07-85   1:43p
	       38 File(s)     61440 bytes free

### Directory of PC-DOS 3.10 (Disk 2)

	 Volume in drive A has no label
	 Directory of  A:\
	
	ART      BAS     1879   3-07-85   1:43p
	BALL     BAS     1966   3-07-85   1:43p
	BASIC    PIF      369   3-07-85   1:43p
	BASICA   PIF      369   3-07-85   1:43p
	CIRCLE   BAS     1647   3-07-85   1:43p
	COLORBAR BAS     1427   3-07-85   1:43p
	COMM     BAS     4254   3-07-85   1:43p
	DEBUG    COM    15552   3-07-85   1:43p
	DONKEY   BAS     3572   3-07-85   1:43p
	EXE2BIN  EXE     2816   3-07-85   1:43p
	LINK     EXE    38144   3-07-85   1:43p
	MORTGAGE BAS     6178   3-07-85   1:43p
	MUSIC    BAS     8575   3-07-85   1:43p
	MUSICA   BAS    13431   3-07-85   1:43p
	PIECHART BAS     2184   3-07-85   1:43p
	SAMPLES  BAS     2363   3-07-85   1:43p
	SPACE    BAS     1851   3-07-85   1:43p
	VDISK    LST   136313   3-07-85   1:43p
	       18 File(s)    108544 bytes free

### Directory of PC-DOS 3.10 (Patched Disk 1)

     Volume in drive A has no label
     Directory of A:\

    IBMBIO   COM      9564 03-07-85   1:43p
    IBMDOS   COM     27760 04-22-85  12:09p
    ANSI     SYS      1651 03-07-85   1:43p
    ASSIGN   COM      1509 03-07-85   1:43p
    ATTRIB   EXE     15091 03-07-85   1:43p
    BACKUP   COM      5577 03-07-85   1:43p
    BASIC    COM     17792 03-07-85   1:43p
    BASICA   COM     27520 03-07-85   1:43p
    CHKDSK   COM      9435 03-07-85   1:43p
    COMMAND  COM     23210 03-07-85   1:43p
    COMP     COM      3664 03-07-85   1:43p
    DISKCOMP COM      4073 03-07-85   1:43p
    DISKCOPY COM      4329 03-07-85   1:43p
    EDLIN    COM      7261 03-07-85   1:43p
    FDISK    COM      8173 03-07-85   1:43p
    FIND     EXE      6403 03-07-85   1:43p
    FORMAT   COM      9398 03-07-85   1:43p
    GRAFTABL COM      1169 03-07-85   1:43p
    GRAPHICS COM      3111 03-07-85   1:43p
    JOIN     EXE     15971 03-07-85   1:43p
    KEYBFR   COM      2473 04-12-85   4:22p
    KEYBGR   COM      2418 04-12-85   4:23p
    KEYBIT   COM      2361 04-12-85   4:25p
    KEYBSP   COM      2451 04-12-85   4:24p
    KEYBUK   COM      2348 04-12-85   4:26p
    LABEL    COM      1826 03-07-85   1:43p
    MODE     COM      5295 03-07-85   1:43p
    MORE     COM       282 03-07-85   1:43p
    PRINT    COM      8291 03-07-85   1:43p
    RECOVER  COM      4050 03-07-85   1:43p
    RESTORE  COM      5410 03-07-85   1:43p
    SELECT   COM      2084 03-07-85   1:43p
    SHARE    EXE      8304 03-07-85   1:43p
    SORT     EXE      1664 03-07-85   1:43p
    SUBST    EXE     16611 03-07-85   1:43p
    SYS      COM      3727 03-07-85   1:43p
    TREE     COM      2831 03-07-85   1:43p
    VDISK    SYS      3307 03-07-85   1:43p
    VENDOR-# DO1         0 07-04-83  12:00a
           39 file(s)     278394 bytes
                           61440 bytes free
