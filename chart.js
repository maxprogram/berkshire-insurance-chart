(function($,d3){

    // Load functions
    $(function(){

        // Creates the chart given a specific width/margins.
        // This can be used to update chart size dynamically.
        createCharts(820, 40);

    });


    function createCharts(width, margins) {

        $("#insuranceChart").empty();

        // Set all the size vars based on given params
        var years  = insuranceData;
            margin = {top: 40, right: margins, bottom: 20, left: margins},
            height = 1080 - margin.top - margin.bottom,
            yearWidth = 50,
            floatWidth = width * 0.23,
            costChartX = margin.left + floatWidth,
            costChartW = width - floatWidth - yearWidth;

        var format = d3.format("0%"),
            xMin = -0.08,
            xMax = 0.2;

        // Shortcut for creating translate strings
        function translate(a,b) {
            return "translate(" + a + "," + b + ")";
        }

        // Makes sure data is in the correct order
        var top = years.sort(function(a, b) {
            return a.year - b.year;
        });

        // Creates chart canvas
        var svg = d3.select("#insuranceChart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        // Key
        var zeroX = floatWidth + xPort(-xMin);
        var key = svg.append("g")
            .attr("class","bar key")
            .attr("transform", translate(margin.left, 5));
        key.append("text")
            .attr("dy", ".5em")
            .text("Average Float ($mil, log)");
        key.append("rect")
            .attr("class", "cost")
            .attr("width", 25).attr("height", 8)
            .attr("transform", translate(zeroX-25, -1));
        key.append("rect")
            .attr("class", "bond")
            .attr("width", 25).attr("height", 8)
            .attr("transform", translate(zeroX, -1));
        key.append("text")
            .attr("dy", ".5em")
            .attr("x", zeroX - 25 - 5)
            .attr("text-anchor", "end")
            .text("Cost of Float");
        key.append("text")
            .attr("dy", ".5em")
            .attr("x", zeroX + 25 + 5)
            .attr("text-anchor", "start")
            .text("10 Year Govt. Bond Yield");

        // Main chart group
        var table = svg.append("g")
            .attr("transform", translate(0, margin.top));

        // Top x-axis
        function xPort(d) {
            return d / (xMax-xMin) * costChartW;
        }

        var x = d3.scale.linear()
            .range([costChartX, costChartX + costChartW])
            .domain([xMin, xMax]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("top")
            .tickSize(-height) // Creates vertical lines
            .tickFormat(format);
        table.append("g").call(xAxis)
            .attr("class", "x axis")
            .attr("transform", translate(0,3))
          .append("line")
            .attr("class", "line")
            .attr("x1", costChartX).attr("x2", costChartX+costChartW);

        // Bottom x-axis
        xAxis.orient("bottom")
            .tickSize(height);
        table.append("g").call(xAxis)
            .attr("class", "x axis b")
            .attr("transform", translate(0,-3))
          .append("line")
            .attr("class", "line")
            .attr("x1", costChartX).attr("x2", costChartX+costChartW)
            .attr("y1", height).attr("y2", height);

        // Y-axis horizontal bands (span, margins)
        var y = d3.scale.ordinal()
            .rangeRoundBands([0, height])
            .domain(top.map(function(d) { return d.year; }));

        // Load in bar data
        var bar = table.selectAll(".bar")
            .data(top);

        // Creates band groups
        var barEnter = bar.enter().insert("g", ".axis")
            .attr("class", "bar")
            .attr("transform", function(d) { return translate(margin.left, y(d.year)); })
            .style("fill-opacity", 1);

        // Color bands
        barEnter.append("rect")
            .attr("class", function(d) { return (d.year%2===0) ? "even":"odd"; })
            .attr("width", width)
            .attr("height", y.rangeBand());

        // 'Float' bars
        var floatX = d3.scale.log().range([0,0.177*floatWidth]);
        barEnter.append("rect")
            .attr("class", "float")
            .attr("width", function(d) { return floatX(d['float']); })
            .attr("height", y.rangeBand() * 0.7)
            .attr("transform", function(d) { return translate(0, y.rangeBand()*0.15); });

        // 'Cost' bars
        var barSize = 0.35;
        barEnter.append("rect")
            .attr("class", "cost")
            .attr("width", function(d) { return xPort( Math.abs(d.cost) ); })
            .attr("height", y.rangeBand() * barSize)
            .attr("transform", function(d) {
                var m =  parseFloat(d.cost),
                    xpos = (m<0) ? -xMin+m : -xMin;
                return translate(floatWidth+xPort(xpos), y.rangeBand()*(0.5-barSize));
            });

        // 'Bonds' bars
        barEnter.append("rect")
            .attr("class", "bond")
            .attr("width", function(d) { return xPort( Math.abs(d.bonds) ); })
            .attr("height", y.rangeBand() * barSize)
            .attr("transform", function(d) {
                var m =  parseFloat(d.bonds),
                    xpos = (m<0) ? -xMin+m : -xMin;
                return translate(floatWidth+xPort(xpos), y.rangeBand()*0.5);
            });

        // 'Float' labels
        barEnter.append("text")
            .attr("class", "labels")
            .attr("y", y.rangeBand()/2)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("x", function(d) { return floatX(d['float']) - 4; })
            .text(function(d) { return d3.format("0,.0f")(d['float']); });

        // Year (y-axis) labels
        barEnter.append("text")
            .attr("class", "y label")
            .attr("x", width - 4)
            .attr("y", y.rangeBand()/2)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function(d) { return d.year; });


        // Creates band groups
        var notes = svg.append("g")
            .attr("transform", translate(0, margin.top));

        notes = notes.selectAll(".note")
            .data(top).enter().insert("g", ".axis")
            .attr("transform", function(d) { return translate(margin.left, y(d.year)); })
          .append("text")
            .attr("class", "notes")
            .attr("x", width - yearWidth)
            .attr("y", y.rangeBand()/2)
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .text(function(d) { return d.note; });
    }

    // This is the actual data in JSON. Can also be loaded in via
    // d3.json or d3.csv but this data was too simple to need it.
    var insuranceData = [
      {
        "year": "1967",
        "float": "17.3",
        "profit": "0.4",
        "cost": "-0.0231",
        "bonds": "0.0507",
        "note": "National Indemnity acquisition"
      },
      {
        "year": "1968",
        "float": "19.9",
        "profit": "0.6",
        "cost": "-0.0302",
        "bonds": "0.0564",
        "note": ""
      },
      {
        "year": "1969",
        "float": "23.4",
        "profit": "0.1",
        "cost": "-0.0043",
        "bonds": "0.0667",
        "note": ""
      },
      {
        "year": "1970",
        "float": "32.4",
        "profit": "-0.33",
        "cost": "0.0102",
        "bonds": "0.0735",
        "note": ""
      },
      {
        "year": "1971",
        "float": "52.5",
        "profit": "1.41",
        "cost": "-0.0268",
        "bonds": "0.0616",
        "note": ""
      },
      {
        "year": "1972",
        "float": "69.5",
        "profit": "4.28",
        "cost": "-0.0616",
        "bonds": "0.0621",
        "note": ""
      },
      {
        "year": "1973",
        "float": "73.3",
        "profit": "3.32",
        "cost": "-0.0453",
        "bonds": "0.0685",
        "note": ""
      },
      {
        "year": "1974",
        "float": "79.1",
        "profit": "-7.36",
        "cost": "0.093",
        "bonds": "0.0756",
        "note": ""
      },
      {
        "year": "1975",
        "float": "87.6",
        "profit": "-11.35",
        "cost": "0.1296",
        "bonds": "0.0799",
        "note": ""
      },
      {
        "year": "1976",
        "float": "102.6",
        "profit": "0.71",
        "cost": "-0.0069",
        "bonds": "0.0761",
        "note": ""
      },
      {
        "year": "1977",
        "float": "139",
        "profit": "5.8",
        "cost": "-0.0417",
        "bonds": "0.0742",
        "note": ""
      },
      {
        "year": "1978",
        "float": "190.4",
        "profit": "3",
        "cost": "-0.0158",
        "bonds": "0.0841",
        "note": ""
      },
      {
        "year": "1979",
        "float": "227.3",
        "profit": "3.74",
        "cost": "-0.0165",
        "bonds": "0.0943",
        "note": ""
      },
      {
        "year": "1980",
        "float": "237",
        "profit": "6.74",
        "cost": "-0.0284",
        "bonds": "0.1143",
        "note": ""
      },
      {
        "year": "1981",
        "float": "228.4",
        "profit": "1.48",
        "cost": "-0.0065",
        "bonds": "0.1392",
        "note": ""
      },
      {
        "year": "1982",
        "float": "220.3",
        "profit": "-21.56",
        "cost": "0.0979",
        "bonds": "0.1301",
        "note": ""
      },
      {
        "year": "1983",
        "float": "231.3",
        "profit": "-33.87",
        "cost": "0.1464",
        "bonds": "0.111",
        "note": ""
      },
      {
        "year": "1984",
        "float": "253.2",
        "profit": "-48.06",
        "cost": "0.1898",
        "bonds": "0.1246",
        "note": ""
      },
      {
        "year": "1985",
        "float": "390.2",
        "profit": "-44.23",
        "cost": "0.1134",
        "bonds": "0.1062",
        "note": ""
      },
      {
        "year": "1986",
        "float": "797.5",
        "profit": "-55.84",
        "cost": "0.07",
        "bonds": "0.0767",
        "note": "Catastrophe reinsurance started"
      },
      {
        "year": "1987",
        "float": "1266.7",
        "profit": "-55.43",
        "cost": "0.0438",
        "bonds": "0.0839",
        "note": ""
      },
      {
        "year": "1988",
        "float": "1497.7",
        "profit": "-11.08",
        "cost": "0.0074",
        "bonds": "0.0885",
        "note": ""
      },
      {
        "year": "1989",
        "float": "1541.3",
        "profit": "-24.4",
        "cost": "0.0158",
        "bonds": "0.0849",
        "note": ""
      },
      {
        "year": "1990",
        "float": "1637.3",
        "profit": "-26.65",
        "cost": "0.0163",
        "bonds": "0.0855",
        "note": ""
      },
      {
        "year": "1991",
        "float": "1895",
        "profit": "-119.59",
        "cost": "0.0631",
        "bonds": "0.0786",
        "note": ""
      },
      {
        "year": "1992",
        "float": "2290.4",
        "profit": "-108.96",
        "cost": "0.0476",
        "bonds": "0.0701",
        "note": ""
      },
      {
        "year": "1993",
        "float": "2624.7",
        "profit": "30.88",
        "cost": "-0.0118",
        "bonds": "0.0587",
        "note": ""
      },
      {
        "year": "1994",
        "float": "3056.6",
        "profit": "129.9",
        "cost": "-0.0425",
        "bonds": "0.0709",
        "note": ""
      },
      {
        "year": "1995",
        "float": "3607.2",
        "profit": "20.5",
        "cost": "-0.0057",
        "bonds": "0.0657",
        "note": ""
      },
      {
        "year": "1996",
        "float": "3702",
        "profit": "222.1",
        "cost": "-0.06",
        "bonds": "0.0644",
        "note": "GEICO acquisition"
      },
      {
        "year": "1997",
        "float": "7093.1",
        "profit": "389.4",
        "cost": "-0.0549",
        "bonds": "0.0635",
        "note": ""
      },
      {
        "year": "1998",
        "float": "15070",
        "profit": "265",
        "cost": "-0.0176",
        "bonds": "0.0526",
        "note": "General Re acquisition"
      },
      {
        "year": "1999",
        "float": "24026",
        "profit": "-1394",
        "cost": "0.058",
        "bonds": "0.0565",
        "note": ""
      },
      {
        "year": "2000",
        "float": "26584.5",
        "profit": "-1585",
        "cost": "0.0596",
        "bonds": "0.0603",
        "note": ""
      },
      {
        "year": "2001",
        "float": "31689.5",
        "profit": "-4067",
        "cost": "0.1283",
        "bonds": "0.0502",
        "note": "9/11 attacks"
      },
      {
        "year": "2002",
        "float": "38366",
        "profit": "-411",
        "cost": "0.0107",
        "bonds": "0.0461",
        "note": ""
      },
      {
        "year": "2003",
        "float": "42722",
        "profit": "1718",
        "cost": "-0.0402",
        "bonds": "0.0401",
        "note": ""
      },
      {
        "year": "2004",
        "float": "45157",
        "profit": "1551",
        "cost": "-0.0343",
        "bonds": "0.0427",
        "note": ""
      },
      {
        "year": "2005",
        "float": "47690.5",
        "profit": "53",
        "cost": "-0.0011",
        "bonds": "0.0429",
        "note": "Hurricanes Katrina, Rita and Wilma"
      },
      {
        "year": "2006",
        "float": "50087",
        "profit": "3838",
        "cost": "-0.0766",
        "bonds": "0.048",
        "note": ""
      },
      {
        "year": "2007",
        "float": "54792.5",
        "profit": "3374",
        "cost": "-0.0616",
        "bonds": "0.0463",
        "note": ""
      },
      {
        "year": "2008",
        "float": "58593",
        "profit": "2792",
        "cost": "-0.0477",
        "bonds": "0.0366",
        "note": ""
      },
      {
        "year": "2009",
        "float": "60199.5",
        "profit": "1559",
        "cost": "-0.0259",
        "bonds": "0.0326",
        "note": ""
      },
      {
        "year": "2010",
        "float": "63871.5",
        "profit": "2013",
        "cost": "-0.0315",
        "bonds": "0.0322",
        "note": ""
      },
      {
        "year": "2011",
        "float": "68201.5",
        "profit": "248",
        "cost": "-0.0036",
        "bonds": "0.0278",
        "note": ""
      },
      {
        "year": "2012",
        "float": "71848",
        "profit": "1625",
        "cost": "-0.0226",
        "bonds": "0.018",
        "note": ""
      }
    ];

})(jQuery,d3);
