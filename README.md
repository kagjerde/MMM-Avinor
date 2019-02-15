# MMM-Avinor
This a module for Magic Mirror² to show fight schedules data from airports in Norway.

The module uses XML data format from Avinor in Norway. The URL has to be updated based on airport name.
Please see [Avinor data format](https://avinor.no/konsern/tjenester/flydata/flydata-i-xml-format) for details.

It is basically a modified version of the [MMM-Tabulator](https://github.com/E3V3A/MMM-Tabulator=), original idea comes from E3V3A.
However it uses https and node_helper.js to send the querry.

## Installation

Clone this repository in your `modules` folder, and install dependencies:
```bash
cd ~/MagicMirror/modules # adapt directory if you are using a different one
git clone https://github.com/kagjerde/MMM-Avinor.git
cd MMM-Avinor
npm install # this can take a while
```
## Screenshot

[Avinor.PNG](https://github.com/kagjerde/MMM-Avinor/blob/master/MMM-Avinor-screenshot.png)

## Configuration

Add the module to your modules array in your `config.js`.
```
{
               module: "MMM-Avinor",
               position: "middle_center", //top_bar, top_left, top_center, top_right, upper_third, middle_center, lower_third, bottom_left, bottom_center, bottom_right, bottom_bar, fullscreen_above, and fullscreen_below
               config: {
                                refreshInterval: 5 * 60 * 1000, // every 5 minutes
                                httpRequestURL: "https://flydata.avinor.no/XmlFeed.asp?TimeFrom=1&TimeTo=12&airport=BGO&lastUpdate=",
                                tableLength: 10,
                                minTimeDiff: 2,
                                timeZone: 1,
                        }
},
```

## License

### The MIT License (MIT)

Copyright © 2019 KAG

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

**The software is provided “as is”, without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.**
