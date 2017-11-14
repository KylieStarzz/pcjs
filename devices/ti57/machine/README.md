---
layout: page
title: TI-57 Programmable Calculator
permalink: /devices/ti57/machine/
machines:
  - id: ti57
    type: ti57
    name: TI-57 Programmable Calculator
    uncompiled: true
    config: |
      {
        "ti57": {
          "class": "Machine",
          "type": "TI57",
          "name": "TI-57 Emulator",
          "version": 1.03,
          "bindings": {
            "print": "printTI57"
          }
        },
        "chip": {
          "class": "Chip",
          "type": "TMS-1500",
          "input": "buttons",
          "output": "display",
          "bindings": {
            "2nd": "ind2nd",
            "INV": "indINV",
            "Deg": "indDeg",
            "Rad": "indRad",
            "Grad": "indGrad"
          }
        },
        "clock": {
          "class": "Time",
          "cyclesPerSecond": 650000,
          "bindings": {
            "run": "runTI57",
            "speed": "speedTI57",
            "step": "stepTI57"
          },
          "overrides": ["cyclesPerSecond","yieldsPerSecond","yieldsPerUpdate"]
        },
        "display": {
          "class": "LED",
          "type": 3,
          "cols": 12,
          "rows": 1,
          "color": "red",
          "bindings": {
            "container": "displayTI57"
          },
          "overrides": ["color","backgroundColor"]
        },
        "buttons": {
          "class": "Input",
          "map": [
            ["2nd",  "inv",  "lnx",  "\\b",  "clr"],
            ["lrn",  "xchg", "sq",   "sqrt", "rcp"],
            ["sst",  "sto",  "rcl",  "sum",  "exp"],
            ["bst",  "ee",   "(",    ")",    "/"],
            ["gto",  "7",    "8",    "9",    "*"],
            ["sbr",  "4",    "5",    "6",    "-"],
            ["rst",  "1",    "2",    "3",    "+"],
            ["r/s",  "0",    ".",    "+/-",  "=|\\r"]
          ],
          "location": [45, 316, 372, 478, 0.34, 0.5, 459, 832, 322, 168, 75, 38],
          "bindings": {
            "surface": "imageTI57",
            "power": "powerTI57",
            "reset": "resetTI57",
            "clear": "clearTI57"
          }
        },
        "rom": {
          "class": "ROM",
          "wordSize": 13,
          "valueSize": 16,
          "valueTotal": 2048,
          "littleEndian": true,
          "file": "ti57le.bin",
          "reference": "",
          "chipID": "TMC1501NC DI 7741",
          "revision": "0",
          "bindings": {
          	"array": "romArrayTI57",
          	"cellDesc": "romCellTI57"
          },
          "overrides": ["colorROM","backgroundColorROM"],
          "values": [
            4623,4386,5106,7051,3246,6152,5813,5628,5805,7051,4386,3246,7911,5132,1822,6798,
            2600,1497,6539,6471,6642,6462,6899,6939,6660,3246,7587,4388,6648,4386,5634,7051,
            4386,5692,7051,6154,6392,3246,7434,4388,3186,3197,7755,3194,8074,3495,3184,6731,
            4065,6775,6300,6893,6327,3246,7273,4386,6768,4388,3246,8118,3186,7719,3879,6686,
            2087,6236,6266,6890,6328,4386,3246,7317,6208,4388,3246,8140,3186,7761,3219,6743,
            3261,6799,6679,6896,6755,3288,6240,3288,6311,4386,3246,8141,3238,6801,3188,6782,
            3112,3246,6762,3290,3296,6314,4386,3217,7050,3250,6253,3194,6565,4386,6393,2079,
            2241,5133,2079,1879,3588,1806,7051,5090,3329,7051,4388,3246,7300,3189,3186,7710,
            3250,3237,7055,3587,5132,1793,3194,6325,5112,2272,2272,3310,6288,3584,1793,3590,
            2273,3594,3310,7703,6277,5551,5511,3194,8075,1887,5587,7051,4386,3194,7172,5736,
            3246,7051,804,8075,5813,5635,7051,3108,3246,6762,3359,4388,5132,3129,3133,3298,
            7349,3128,3290,7349,3132,5234,7055,3308,3250,7590,4386,5426,3246,6335,3232,3194,
            6342,3304,3298,6342,3246,7279,2271,3583,5276,3592,3551,2303,3877,6775,3298,6354,
            3234,7280,3118,7799,2080,3114,6365,3118,7389,3110,3108,6367,3107,3115,3300,2055,
            3594,5138,1815,1991,3298,7414,3310,6380,3234,6261,5230,6261,3306,3129,6384,3128,
            3234,6388,5636,6389,5585,5138,5229,6799,3246,3296,6327,4224,5120,5136,2573,6406,
            2657,5142,2656,5155,2657,6397,2777,5155,6475,5217,4224,5123,2599,3120,3124,2629,
            6406,2656,5142,2657,5155,2656,6412,3186,3592,6427,5186,3225,1815,5537,3919,3587,
            3246,6455,3250,6423,3250,3237,6431,3233,1505,2623,3194,6445,3116,3246,6450,3943,
            3192,3848,2759,5123,5155,3234,7499,3233,5120,5136,2573,6678,2592,6469,4224,3246,
            7463,5136,3233,2593,7499,3588,6475,3246,8095,3250,7702,3592,3248,5123,2593,7506,
            544,6478,813,1028,808,6489,3589,2561,6469,5826,1991,3593,5142,3877,7184,3118,
            6500,3117,3309,1255,3943,3192,3849,3877,6523,3292,3848,5255,3877,6526,1823,1061,
            1281,557,2247,3232,3236,7660,3294,6633,6117,6045,6542,3849,3877,7530,2591,6056,
            1535,1512,3134,6539,3130,3126,6539,3130,3122,7623,3841,5488,1528,1823,5416,616,
            616,872,872,1061,7574,1127,2377,5826,872,872,5561,3234,7055,1384,3238,7055,
            3233,5221,6706,4224,3308,3256,3237,3232,145,3194,6572,167,3495,3228,3220,3246,
            6578,3488,3298,7608,3310,7464,3488,3488,3224,6440,3234,6450,3233,3258,7645,3118,
            7474,3479,3903,165,7474,3116,6450,2599,2592,3124,3314,7631,4065,3128,3872,3318,
            7635,3872,3321,3322,7638,3872,3232,3236,3310,3309,6527,1255,6527,1503,2623,3257,
            3226,6447,3222,6630,3116,6447,3218,7621,6450,6118,6090,6542,3294,1312,6520,6115,
            6096,6542,3250,7456,3246,7433,3252,6658,3262,7680,1999,5416,3591,3591,7676,1887,
            3254,8079,3263,7055,3246,3296,7963,4388,5135,2561,3588,5133,3121,3125,6325,401,
            257,3594,3588,2208,3590,6673,3249,4388,257,2193,329,473,3594,3588,1793,5416,
            3184,1038,616,1038,3473,3877,7736,3218,7726,3216,679,672,680,592,3221,7055,
            1320,5110,1328,7055,3250,7610,3186,6686,3222,7728,549,6718,3218,6727,719,744,
            2024,2024,3282,7055,1038,616,1038,2055,1087,552,7055,3194,7726,3196,3220,1353,
            7055,3222,6743,3308,5221,1144,5007,2121,2144,1896,79,3895,3122,7768,3167,2145,
            8079,5492,6751,4386,3246,7287,3116,3194,6762,3288,4386,6019,3238,7799,3236,6801,
            5127,3236,3872,3134,6777,3126,6777,3188,7050,5234,7054,5636,2079,6019,4065,6801,
            4057,3594,2081,2085,2561,7815,2079,1815,3588,7054,3877,7843,3873,2277,3588,287,
            7051,5127,2151,3877,2085,6807,2119,2149,7839,2141,6794,4064,3594,3322,7216,287,
            3841,3105,6792,1887,1806,3162,6824,3128,2120,7854,2120,7803,5585,6780,2079,3588,
            1999,1806,549,7870,5537,5736,1806,3589,5636,5805,5213,1999,2247,6780,3154,6849,
            6124,613,6842,6137,5552,5537,6842,5132,3919,3090,2303,6861,3232,1887,5635,5112,
            3189,5628,1822,5628,5691,3190,6872,3300,5112,3841,5857,1863,5133,613,7908,5628,
            5112,1815,5627,7051,5485,1806,6260,3194,7879,3240,3120,3246,6176,3124,3246,6145,
            3246,6173,5855,3250,6903,3246,6565,4386,3246,6973,5135,549,3094,7941,5108,3399,
            3157,5583,3195,3588,6924,1793,6914,5132,5582,3298,6924,3090,549,7951,3232,3194,
            6930,3235,1951,3234,7050,3262,3254,7050,5136,2592,7049,3250,6944,3246,3194,6564,
            4386,3246,7943,5132,3194,8060,3262,3254,7980,3121,3125,6967,3126,7799,3872,3588,
            3697,5211,3697,3588,5136,1807,3681,5234,3254,8026,3240,3262,8026,5426,5276,3877,
            7034,3246,7002,2349,3527,5276,3877,3551,1535,1512,2055,3592,1528,7034,5136,2561,
            3242,6996,3241,3260,1500,7799,1505,8073,2592,6998,2413,2413,1503,2687,2009,2265,
            3551,5183,2629,2573,1504,7029,3593,296,296,3592,2272,3310,7010,3552,3294,8056,
            3290,7007,3286,8032,7007,2408,2408,6990,2408,2408,2193,6775,3122,3123,3126,3125,
            6224,3588,3665,5211,3665,3588,3697,5214,3681,3588,1815,3242,2193,7899,5426,3254,
            7061,3262,3261,8085,3253,5276,3593,3877,2265,7732,3289,2305,1504,1508,3586,4386,
            3194,8101,5426,5186,5253,3090,7080,2279,3089,5238,3194,7086,5253,7087,5574,5238,
            3194,7091,5574,5221,3376,7051,4386,3300,5132,5627,3633,5213,5226,3681,5223,5106,
            3697,5223,5133,3302,3303,8125,5552,3649,5223,3665,5223,7050,3296,4386,3194,8145,
            3300,3681,5138,5136,3298,7333,1991,1807,5628,1806,5635,3697,1863,5138,5587,1806,
            6309,1927,769,6093,6090,6099,6104,6112,6090,6045,6103,6101,5826,967,768,839,
            768,3587,1991,5627,1865,103,2055,3587,5213,3588,1807,3587,0,0,0,0,
            2663,3936,7164,5136,2631,1793,3587,3871,3594,455,3589,3587,1991,3649,6154,1991,
            3665,6154,3302,7262,3584,6239,3293,6180,3294,6177,2591,3429,6187,3590,591,2687,
            3587,2759,6174,3292,2639,639,3401,2575,5170,2145,7192,5488,1399,296,3424,1288,
            7197,6185,2560,3130,6205,3126,6205,2085,7229,3114,8188,3872,2049,2119,3847,3594,
            3584,3587,1100,3237,3185,3329,7241,3092,5570,621,1127,1120,616,97,7254,76,
            7252,97,6561,3088,552,6220,616,5567,101,7254,6561,3589,3681,1863,3589,1806,
            3587,5423,2592,3134,6241,2271,3587,1991,5138,1823,3855,5585,5138,1815,3302,7282,
            3590,6259,3588,1823,2567,3587,5537,5551,5511,1822,5582,1822,1865,3156,3160,1901,
            3156,1383,3855,3131,6826,5567,6591,3114,6293,3126,7309,3122,7317,3873,2080,3118,
            6333,3126,7317,3841,2605,3587,2561,3588,3188,3261,3253,799,3192,3245,3195,3262,
            3254,7364,975,3591,3591,7331,5411,3591,3591,6310,2623,3130,6318,3125,5420,5236,
            1535,5255,3130,3877,7473,2085,6449,3122,6302,3126,7473,3247,6303,2080,3118,7316,
            3872,3872,3872,6333,967,3593,3190,7321,3254,7389,3591,3591,6365,2623,3126,3130,
            7389,2080,3118,6358,2081,6395,2080,3106,3110,7389,3114,6365,5217,5136,2592,3588,
            2593,5170,3190,7318,2145,7400,296,6372,3877,7419,3118,6382,3117,3192,5488,3391,
            3431,3160,3337,3365,3335,7419,3895,3337,3365,6417,3244,5235,1535,3877,7473,5255,
            3877,6449,3246,3194,7430,5007,4375,3194,7435,799,4899,3246,7438,4954,2279,3308,
            4208,2265,2193,3090,7447,3361,2215,3098,6426,3296,3094,7453,3308,3194,6432,3304,
            1823,4375,4306,3190,6447,2592,3122,6444,841,3592,865,7471,3593,863,3592,3591,
            3591,3587,3592,5537,3649,5213,1865,3156,5492,2009,3090,6461,3431,2119,3198,7494,
            1479,992,992,1005,1509,7549,3284,2081,5490,5490,3118,6473,1028,6495,5491,711,
            544,1252,6485,749,6481,741,6496,545,967,1815,5565,804,6452,799,6496,5491,
            2149,6502,1061,6502,1125,7519,552,616,3286,6520,3094,6521,1120,3282,6513,3091,
            3847,3587,2081,557,1901,3152,3164,3587,1377,1121,3587,5567,557,3094,7547,1317,
            7495,621,5575,2081,6527,2049,6527,1814,841,3169,3094,7585,941,5575,3094,7580,
            872,613,7572,3168,5527,552,6541,533,7629,529,864,6551,5567,936,3094,7585,
            5527,3129,6567,37,6570,552,5575,549,6563,1793,3130,3129,8105,1927,6594,2007,
            5108,783,3329,1281,3128,6563,1351,2121,1281,1377,8105,813,6585,513,39,3094,
            7145,1313,1317,6597,3093,3587,5575,3094,8169,1313,6597,1319,3092,3587,1887,3128,
            1806,3130,6612,3091,1423,3129,3158,7665,3094,1299,7670,1445,6608,1937,3090,6631,
            3154,7657,525,7632,521,1887,6561,3154,7650,520,6687,557,877,5566,804,7653,
            6687,3094,6608,1299,7632,1445,613,7645,557,5567,6612,1887,3129,6665,5553,1303,
            3154,6561,5108,3128,3130,6652,549,8179,3095,1935,583,3338,3089,3154,6672,3088,
            3217,3346,3222,7721,1288,8171,513,1425,1353,5570,677,7653,3130,7729,557,1185,
            6633,685,677,7653,101,6686,872,5575,6687,1293,6701,3095,1294,1289,6678,905,
            544,909,6703,37,6629,877,552,549,6705,5575,6705,5588,6138,1793,677,7585,
            5108,1441,7755,1441,7751,1312,6721,3222,6730,1312,621,3217,2121,1287,2424,1281,
            1425,6753,877,813,6752,897,897,776,901,6741,777,786,6749,165,6738,936,
            877,869,6742,5554,3351,2383,1343,6629,3841,6138,1281,3088,549,8172,5558,841,
            3122,6773,103,549,7678,798,769,2063,2081,7877,2081,7887,2081,7894,2081,7899,
            39,6052,798,3122,6800,797,7829,793,655,534,6052,534,592,6789,535,856,
            647,6052,534,530,6798,2144,749,741,6773,3122,7678,5814,1991,521,5554,1822,
            3222,6819,3088,1895,1431,127,1453,621,1431,127,1806,5636,6612,3120,5813,5511,
            3328,3170,8171,1423,6766,1863,1793,6106,6104,808,6106,6099,6090,6099,808,6112,
            6104,808,808,808,3587,6098,6104,6045,808,6045,6093,6112,6090,5826,6786,6111,
            6099,808,6104,6104,808,6860,6110,6099,5826,6106,6861,6109,6099,5825,6786,4386,
            2303,3189,5537,3194,8019,3128,6058,5090,3189,768,5511,6005,5558,5089,768,3090,
            6898,787,3329,5090,909,853,7930,3235,3126,6920,901,7936,897,3126,6912,3091,
            3122,3877,6990,909,7944,787,3091,3235,925,7948,851,3128,791,3527,798,841,
            913,167,3194,7958,6024,6935,6051,965,7976,963,798,3194,6946,6052,786,6024,
            778,6930,6051,776,782,6052,897,6930,2144,741,6930,783,3130,6963,3194,6962,
            5089,851,790,5554,5485,3194,8037,1814,5554,1879,5635,3089,5485,3126,6983,5106,
            3125,5691,5634,5485,3190,6983,5545,3281,3234,6987,3280,2271,3967,5003,909,8017,
            787,851,6920,6005,3527,3126,7005,5106,5587,5692,3190,8036,5635,3094,549,8034,
            5634,3128,5558,6926,4751,3122,7020,5089,5553,1879,5587,3089,1927,3234,7027,5090,
            3329,1879,5588,6058,6987,657,936,912,677,7597,3094,6573,3194,8037,3122,6987,
            1991,5552,6987,3097,3290,6573,3096,6573,769,2063,2081,8085,2081,8095,39,2081,
            7076,6108,6112,6095,7117,6111,6095,6090,6096,6099,6106,6101,6112,808,7145,6109,
            6095,6095,7068,791,2063,813,2081,7077,2080,3587,5488,2175,5132,2349,2062,2600,
            3182,8129,3178,7283,6099,6093,6106,6098,6092,6098,6045,6104,3329,808,6045,1879,
            6660,6103,6095,6045,6112,6092,6106,6104,6093,7100,808,7138,6093,808,7139,6096,
            808,7140,6112,808,7141,808,7142,6096,808,7143,808,7144,6112,6112,6112,6112,
            808,800,800,800,800,800,800,800,800,1312,6597,3094,769,8177,801,3093,
            8183,1313,8182,613,3343,7148,39,3188,6561,3130,3090,7165,3188,3587,0,0
          ]
        }
      }
styles:
  ti57:
    position: relative;
    display: inline-block;
    float: left;
    padding-right: 32px;
  displayTI57:
    position: absolute; left: 16%; top: 7%; width: 70%; height: 4%;
  .indTI57:
    font-size: 11px;
    font-family: Monaco,"Lucida Console",monospace;
    color: red;
  ind2nd:
    position: absolute; left: 17%; top: 12%; width: 7%; height: 2%; opacity: 0;
  indINV:
    position: absolute; left: 25%; top: 12%; width: 7%; height: 2%; opacity: 0;
  indDeg:
    position: absolute; left: 33%; top: 12%; width: 7%; height: 2%; opacity: 0;
  indRad:
    position: absolute; left: 41%; top: 12%; width: 7%; height: 2%; opacity: 0;
  indGrad:
    position: absolute; left: 49%; top: 12%; width: 7%; height: 2%; opacity: 0;
  powerTI57:
    position: absolute; left: 70%; top: 20%; width: 16%; height: 5%; opacity: 0;
  .diagsTI57:
    float: left;
  printTI57:
    font-family: Monaco,"Lucida Console",monospace;
  romArrayTI57:
    display: inline-block;
  romCellTI57:
    font-family: Monaco,"Lucida Console",monospace;
  .regRow:
    padding-left: 1em;
    font-family: Monaco,"Lucida Console",monospace;
  .regLabel:
    padding-left: 1em;
  .regDigit:
    border: 1px solid;
---

TI-57 Programmable Calculator
-----------------------------

Our TI-57 emulator below is one of the most faithful TI-57 emulations currently available.  It should run at
roughly the same speed as an original device.  That includes calculation speed, display speed, and pause delays.

It is also using an exact copy of an original [TI-57 ROM](/devices/ti57/rom/); no instructions have been patched.
A configuration using a [Revised ROM](rev1/) is also available.

Special attention has been made to the display as well.  The shape of the digits were taken directly from TI patent
drawings, and the digits are drawn/erased with the same frequency as a real device, so when the display goes blank for
brief periods, you know that a lengthy calculation is being performed.

A few display enhancements can be selectively enabled, including
<span class="indTI57">2nd</span>,
<span class="indTI57">INV</span>,
<span class="indTI57">Deg</span>,
<span class="indTI57">Rad</span>, and
<span class="indTI57">Grad</span> indicators.

The TI-57 emulator is also the first PCjs machine to use our newer (late 2017) [PCjs Device Classes](/modules/devices/),
so it requires a modern web browser.  We'll probably add an ES5 fall-back mechanism eventually, but for now, make sure
you're using the latest version of Chrome, Firefox, Safari, Edge, etc.

If any errors occur during operation, the Diagnostics window should display the last instruction decoded.
The window also accepts a few debugging commands.  Use '?' for help.

{% include machine.html id="ti57" config="json" %}

<div id="ti57">
  <img id="imageTI57" src="../images/TI-57-640.png"/>
  <div id="displayTI57"></div>
  <div id="ind2nd" class="indTI57">2nd</div>
  <div id="indINV" class="indTI57">INV</div>
  <div id="indDeg" class="indTI57">Deg</div>
  <div id="indRad" class="indTI57">Rad</div>
  <div id="indGrad" class="indTI57">Grad</div>
  <button id="powerTI57">Power</button>
</div>
<div class="diagsTI57">
  <div>
    <p>Diagnostics</p>
    <textarea id="printTI57" cols="78" rows="16"></textarea>
  </div>
  <button id="runTI57">Run</button>
  <button id="stepTI57">Step</button><span id="speedTI57">Stopped</span>
  <button id="resetTI57">Reset</button>
  <button id="clearTI57">Clear</button>
  <p>ROM Activity</p>
  <div id="romArrayTI57"></div>
  <p id="romCellTI57">[No ROM address selected]</p>
  <p>Operational Registers</p>
  <div>
  	<div class="regRow">
  	  <span class="regLabel">A</span>
  	  <span class="regDigit" id="regA-15"></span>
  	  <span class="regDigit" id="regA-14"></span>
  	  <span class="regDigit" id="regA-13"></span>
  	  <span class="regDigit" id="regA-12"></span>
  	  <span class="regDigit" id="regA-11"></span>
  	  <span class="regDigit" id="regA-10"></span>
  	  <span class="regDigit" id="regA-09"></span>
  	  <span class="regDigit" id="regA-08"></span>
  	  <span class="regDigit" id="regA-07"></span>
  	  <span class="regDigit" id="regA-06"></span>
  	  <span class="regDigit" id="regA-05"></span>
  	  <span class="regDigit" id="regA-04"></span>
  	  <span class="regDigit" id="regA-03"></span>
  	  <span class="regDigit" id="regA-02"></span>
  	  <span class="regDigit" id="regA-01"></span>
  	  <span class="regDigit" id="regA-00"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">B</span>
  	  <span class="regDigit" id="regB-15"></span>
  	  <span class="regDigit" id="regB-14"></span>
  	  <span class="regDigit" id="regB-13"></span>
  	  <span class="regDigit" id="regB-12"></span>
  	  <span class="regDigit" id="regB-11"></span>
  	  <span class="regDigit" id="regB-10"></span>
  	  <span class="regDigit" id="regB-09"></span>
  	  <span class="regDigit" id="regB-08"></span>
  	  <span class="regDigit" id="regB-07"></span>
  	  <span class="regDigit" id="regB-06"></span>
  	  <span class="regDigit" id="regB-05"></span>
  	  <span class="regDigit" id="regB-04"></span>
  	  <span class="regDigit" id="regB-03"></span>
  	  <span class="regDigit" id="regB-02"></span>
  	  <span class="regDigit" id="regB-01"></span>
  	  <span class="regDigit" id="regB-00"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">C</span>
  	  <span class="regDigit" id="regC-15"></span>
  	  <span class="regDigit" id="regC-14"></span>
  	  <span class="regDigit" id="regC-13"></span>
  	  <span class="regDigit" id="regC-12"></span>
  	  <span class="regDigit" id="regC-11"></span>
  	  <span class="regDigit" id="regC-10"></span>
  	  <span class="regDigit" id="regC-09"></span>
  	  <span class="regDigit" id="regC-08"></span>
  	  <span class="regDigit" id="regC-07"></span>
  	  <span class="regDigit" id="regC-06"></span>
  	  <span class="regDigit" id="regC-05"></span>
  	  <span class="regDigit" id="regC-04"></span>
  	  <span class="regDigit" id="regC-03"></span>
  	  <span class="regDigit" id="regC-02"></span>
  	  <span class="regDigit" id="regC-01"></span>
  	  <span class="regDigit" id="regC-00"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">D</span>
  	  <span class="regDigit" id="regD-15"></span>
  	  <span class="regDigit" id="regD-14"></span>
  	  <span class="regDigit" id="regD-13"></span>
  	  <span class="regDigit" id="regD-12"></span>
  	  <span class="regDigit" id="regD-11"></span>
  	  <span class="regDigit" id="regD-10"></span>
  	  <span class="regDigit" id="regD-09"></span>
  	  <span class="regDigit" id="regD-08"></span>
  	  <span class="regDigit" id="regD-07"></span>
  	  <span class="regDigit" id="regD-06"></span>
  	  <span class="regDigit" id="regD-05"></span>
  	  <span class="regDigit" id="regD-04"></span>
  	  <span class="regDigit" id="regD-03"></span>
  	  <span class="regDigit" id="regD-02"></span>
  	  <span class="regDigit" id="regD-01"></span>
  	  <span class="regDigit" id="regD-00"></span>
  	</div>
  </div>
  <p>Storage Registers</p>
  <div>
  	<div class="regRow">
  	  <span class="regLabel">X0</span>
  	  <span class="regDigit" id="regX0-15" data-value="(0"></span>
  	  <span class="regDigit" id="regX0-14" data-value="O0"></span>
  	  <span class="regDigit" id="regX0-13" data-value="A0 N"></span>
  	  <span class="regDigit" id="regX0-12" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-11" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-10" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-09" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-08" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-07" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-06" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-05" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-04" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-03" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-02" data-value="A0 M"></span>
  	  <span class="regDigit" id="regX0-01" data-value="A0 E"></span>
  	  <span class="regDigit" id="regX0-00" data-value="A0 E"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">X1</span>
  	  <span class="regDigit" id="regX1-15" data-value="(1"></span>
  	  <span class="regDigit" id="regX1-14" data-value="O1"></span>
  	  <span class="regDigit" id="regX1-13" data-value="A1 N"></span>
  	  <span class="regDigit" id="regX1-12" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-11" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-10" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-09" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-08" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-07" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-06" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-05" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-04" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-03" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-02" data-value="A1 M"></span>
  	  <span class="regDigit" id="regX1-01" data-value="A1 E"></span>
  	  <span class="regDigit" id="regX1-00" data-value="A1 E"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">X2</span>
  	  <span class="regDigit" id="regX2-15" data-value="(2"></span>
  	  <span class="regDigit" id="regX2-14" data-value="O2"></span>
  	  <span class="regDigit" id="regX2-13" data-value="R6 N"></span>
  	  <span class="regDigit" id="regX2-12" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-11" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-10" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-09" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-08" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-07" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-06" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-05" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-04" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-03" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-02" data-value="R6 M"></span>
  	  <span class="regDigit" id="regX2-01" data-value="R6 E"></span>
  	  <span class="regDigit" id="regX2-00" data-value="R6 E"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">X3</span>
  	  <span class="regDigit" id="regX3-15" data-value="(3"></span>
  	  <span class="regDigit" id="regX3-14" data-value="O3"></span>
  	  <span class="regDigit" id="regX3-13" data-value="R5 N"></span>
  	  <span class="regDigit" id="regX3-12" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-11" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-10" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-09" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-08" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-07" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-06" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-05" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-04" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-03" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-02" data-value="R5 M"></span>
  	  <span class="regDigit" id="regX3-01" data-value="R5 E"></span>
  	  <span class="regDigit" id="regX3-00" data-value="R5 E"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">X4</span>
  	  <span class="regDigit" id="regX4-15" data-value="SC"></span>
  	  <span class="regDigit" id="regX4-14" data-value="?"></span>
  	  <span class="regDigit" id="regX4-13" data-value="R7 N"></span>
  	  <span class="regDigit" id="regX4-12" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-11" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-10" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-09" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-08" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-07" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-06" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-05" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-04" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-03" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-02" data-value="R7 M"></span>
  	  <span class="regDigit" id="regX4-01" data-value="R7 E"></span>
  	  <span class="regDigit" id="regX4-00" data-value="R7 E"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">X5</span>
  	  <span class="regDigit" id="regX5-15" data-value="PC H"></span>
  	  <span class="regDigit" id="regX5-14" data-value="PC L"></span>
  	  <span class="regDigit" id="regX5-13" data-value="R0 N"></span>
  	  <span class="regDigit" id="regX5-12" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-11" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-10" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-09" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-08" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-07" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-06" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-05" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-04" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-03" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-02" data-value="R0 M"></span>
  	  <span class="regDigit" id="regX5-01" data-value="R0 E"></span>
  	  <span class="regDigit" id="regX5-00" data-value="R0 E"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">X6</span>
  	  <span class="regDigit" id="regX6-15" data-value="S1 H"></span>
  	  <span class="regDigit" id="regX6-14" data-value="S1 L"></span>
  	  <span class="regDigit" id="regX6-13" data-value="R1 N"></span>
  	  <span class="regDigit" id="regX6-12" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-11" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-10" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-09" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-08" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-07" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-06" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-05" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-04" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-03" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-02" data-value="R1 M"></span>
  	  <span class="regDigit" id="regX6-01" data-value="R1 E"></span>
  	  <span class="regDigit" id="regX6-00" data-value="R1 E"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">X7</span>
  	  <span class="regDigit" id="regX7-15" data-value="S2 H"></span>
  	  <span class="regDigit" id="regX7-14" data-value="S2 L"></span>
  	  <span class="regDigit" id="regX7-13" data-value="R2 N"></span>
  	  <span class="regDigit" id="regX7-12" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-11" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-10" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-09" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-08" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-07" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-06" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-05" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-04" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-03" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-02" data-value="R2 M"></span>
  	  <span class="regDigit" id="regX7-01" data-value="R2 E"></span>
  	  <span class="regDigit" id="regX7-00" data-value="R2 E"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">Y0</span>
  	  <span class="regDigit" id="regY0-15" data-value="P00 H"></span>
  	  <span class="regDigit" id="regY0-14" data-value="P00 L"></span>
  	  <span class="regDigit" id="regY0-13" data-value="P01 H"></span>
  	  <span class="regDigit" id="regY0-12" data-value="P01 L"></span>
  	  <span class="regDigit" id="regY0-11" data-value="P02 H"></span>
  	  <span class="regDigit" id="regY0-10" data-value="P02 L"></span>
  	  <span class="regDigit" id="regY0-09" data-value="P03 H"></span>
  	  <span class="regDigit" id="regY0-08" data-value="P03 L"></span>
  	  <span class="regDigit" id="regY0-07" data-value="P04 H"></span>
  	  <span class="regDigit" id="regY0-06" data-value="P04 L"></span>
  	  <span class="regDigit" id="regY0-05" data-value="P05 H"></span>
  	  <span class="regDigit" id="regY0-04" data-value="P05 L"></span>
  	  <span class="regDigit" id="regY0-03" data-value="P06 H"></span>
  	  <span class="regDigit" id="regY0-02" data-value="P06 L"></span>
  	  <span class="regDigit" id="regY0-01" data-value="P07 H"></span>
  	  <span class="regDigit" id="regY0-00" data-value="P07 L"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">Y1</span>
  	  <span class="regDigit" id="regY1-15" data-value="P08 H"></span>
  	  <span class="regDigit" id="regY1-14" data-value="P08 L"></span>
  	  <span class="regDigit" id="regY1-13" data-value="P09 H"></span>
  	  <span class="regDigit" id="regY1-12" data-value="P09 L"></span>
  	  <span class="regDigit" id="regY1-11" data-value="P10 H"></span>
  	  <span class="regDigit" id="regY1-10" data-value="P10 L"></span>
  	  <span class="regDigit" id="regY1-09" data-value="P11 H"></span>
  	  <span class="regDigit" id="regY1-08" data-value="P11 L"></span>
  	  <span class="regDigit" id="regY1-07" data-value="P12 H"></span>
  	  <span class="regDigit" id="regY1-06" data-value="P12 L"></span>
  	  <span class="regDigit" id="regY1-05" data-value="P13 H"></span>
  	  <span class="regDigit" id="regY1-04" data-value="P13 L"></span>
  	  <span class="regDigit" id="regY1-03" data-value="P14 H"></span>
  	  <span class="regDigit" id="regY1-02" data-value="P14 L"></span>
  	  <span class="regDigit" id="regY1-01" data-value="P15 H"></span>
  	  <span class="regDigit" id="regY1-00" data-value="P15 L"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">Y2</span>
  	  <span class="regDigit" id="regY2-15" data-value="P16 H"></span>
  	  <span class="regDigit" id="regY2-14" data-value="P16 L"></span>
  	  <span class="regDigit" id="regY2-13" data-value="P17 H"></span>
  	  <span class="regDigit" id="regY2-12" data-value="P17 L"></span>
  	  <span class="regDigit" id="regY2-11" data-value="P18 H"></span>
  	  <span class="regDigit" id="regY2-10" data-value="P18 L"></span>
  	  <span class="regDigit" id="regY2-09" data-value="P19 H"></span>
  	  <span class="regDigit" id="regY2-08" data-value="P19 L"></span>
  	  <span class="regDigit" id="regY2-07" data-value="P20 H"></span>
  	  <span class="regDigit" id="regY2-06" data-value="P20 L"></span>
  	  <span class="regDigit" id="regY2-05" data-value="P21 H"></span>
  	  <span class="regDigit" id="regY2-04" data-value="P21 L"></span>
  	  <span class="regDigit" id="regY2-03" data-value="P22 H"></span>
  	  <span class="regDigit" id="regY2-02" data-value="P22 L"></span>
  	  <span class="regDigit" id="regY2-01" data-value="P23 H"></span>
  	  <span class="regDigit" id="regY2-00" data-value="P23 L"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">Y3</span>
  	  <span class="regDigit" id="regY3-15" data-value="P24 H"></span>
  	  <span class="regDigit" id="regY3-14" data-value="P24 L"></span>
  	  <span class="regDigit" id="regY3-13" data-value="P25 H"></span>
  	  <span class="regDigit" id="regY3-12" data-value="P25 L"></span>
  	  <span class="regDigit" id="regY3-11" data-value="P26 H"></span>
  	  <span class="regDigit" id="regY3-10" data-value="P26 L"></span>
  	  <span class="regDigit" id="regY3-09" data-value="P27 H"></span>
  	  <span class="regDigit" id="regY3-08" data-value="P27 L"></span>
  	  <span class="regDigit" id="regY3-07" data-value="P28 H"></span>
  	  <span class="regDigit" id="regY3-06" data-value="P28 L"></span>
  	  <span class="regDigit" id="regY3-05" data-value="P29 H"></span>
  	  <span class="regDigit" id="regY3-04" data-value="P29 L"></span>
  	  <span class="regDigit" id="regY3-03" data-value="P30 H"></span>
  	  <span class="regDigit" id="regY3-02" data-value="P30 L"></span>
  	  <span class="regDigit" id="regY3-01" data-value="P31 H"></span>
  	  <span class="regDigit" id="regY3-00" data-value="P31 L"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">Y4</span>
  	  <span class="regDigit" id="regY4-15" data-value="P32 H"></span>
  	  <span class="regDigit" id="regY4-14" data-value="P32 L"></span>
  	  <span class="regDigit" id="regY4-13" data-value="P33 H"></span>
  	  <span class="regDigit" id="regY4-12" data-value="P33 L"></span>
  	  <span class="regDigit" id="regY4-11" data-value="P34 H"></span>
  	  <span class="regDigit" id="regY4-10" data-value="P34 L"></span>
  	  <span class="regDigit" id="regY4-09" data-value="P35 H"></span>
  	  <span class="regDigit" id="regY4-08" data-value="P35 L"></span>
  	  <span class="regDigit" id="regY4-07" data-value="P36 H"></span>
  	  <span class="regDigit" id="regY4-06" data-value="P36 L"></span>
  	  <span class="regDigit" id="regY4-05" data-value="P37 H"></span>
  	  <span class="regDigit" id="regY4-04" data-value="P37 L"></span>
  	  <span class="regDigit" id="regY4-03" data-value="P38 H"></span>
  	  <span class="regDigit" id="regY4-02" data-value="P38 L"></span>
  	  <span class="regDigit" id="regY4-01" data-value="P39 H"></span>
  	  <span class="regDigit" id="regY4-00" data-value="P39 L"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">Y5</span>
  	  <span class="regDigit" id="regY5-15" data-value="P40 H"></span>
  	  <span class="regDigit" id="regY5-14" data-value="P40 L"></span>
  	  <span class="regDigit" id="regY5-13" data-value="P41 H"></span>
  	  <span class="regDigit" id="regY5-12" data-value="P41 L"></span>
  	  <span class="regDigit" id="regY5-11" data-value="P42 H"></span>
  	  <span class="regDigit" id="regY5-10" data-value="P42 L"></span>
  	  <span class="regDigit" id="regY5-09" data-value="P43 H"></span>
  	  <span class="regDigit" id="regY5-08" data-value="P43 L"></span>
  	  <span class="regDigit" id="regY5-07" data-value="P44 H"></span>
  	  <span class="regDigit" id="regY5-06" data-value="P44 L"></span>
  	  <span class="regDigit" id="regY5-05" data-value="P45 H"></span>
  	  <span class="regDigit" id="regY5-04" data-value="P45 L"></span>
  	  <span class="regDigit" id="regY5-03" data-value="P46 H"></span>
  	  <span class="regDigit" id="regY5-02" data-value="P46 L"></span>
  	  <span class="regDigit" id="regY5-01" data-value="P47 H"></span>
  	  <span class="regDigit" id="regY5-00" data-value="P47 L"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">Y6</span>
  	  <span class="regDigit" id="regY6-15" data-value="P48 H"></span>
  	  <span class="regDigit" id="regY6-14" data-value="P48 L"></span>
  	  <span class="regDigit" id="regY6-13" data-value="R3 N"></span>
  	  <span class="regDigit" id="regY6-12" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-11" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-10" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-09" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-08" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-07" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-06" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-05" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-04" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-03" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-02" data-value="R3 M"></span>
  	  <span class="regDigit" id="regY6-01" data-value="R3 E"></span>
  	  <span class="regDigit" id="regY6-00" data-value="R3 E"></span>
  	</div>
  	<div class="regRow">
  	  <span class="regLabel">Y7</span>
  	  <span class="regDigit" id="regY7-15" data-value="P49 H"></span>
  	  <span class="regDigit" id="regY7-14" data-value="P49 L"></span>
  	  <span class="regDigit" id="regY7-13" data-value="R4 N"></span>
  	  <span class="regDigit" id="regY7-12" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-11" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-10" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-09" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-08" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-07" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-06" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-05" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-04" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-03" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-02" data-value="R4 M"></span>
  	  <span class="regDigit" id="regY7-01" data-value="R4 E"></span>
  	  <span class="regDigit" id="regY7-00" data-value="R4 E"></span>
  	</div>
  </div>
</div>
