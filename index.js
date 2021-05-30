/* map */
var colorScale = {
    'Central Region': '#B6A6CA',
    'East Region': '#6D98BA',
    'North Region': '#FC814A',
    'West Region': '#AF4319',
    'North-East Region': '#64B600'
};

function addMarkers(){
    data.forEach(function(d){
        let marker = L.circleMarker([+d.latitude, +d.longitude]);
        var color = colorScale[d.neighbourhood_group] || '#aaa';
        marker.setStyle({
            radius: 3,
            fillOpacity: 1,
            fillColor: color,
            color: '#ddd',
            weight: 0.25,
        })
        marker.bindTooltip(`Room Type: ${d.room_type}<br>Price: $${d.price}`);
        marker.addTo(map);
    });
};

var map = L.map('map').setView([1.3255,103.825], 11.5);

L.tileLayer('http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=4ed2a3883b4d47538c142623fd66d379', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 16,
}).addTo(map);


d3.csv('http://data.insideairbnb.com/singapore/sg/singapore/2021-03-25/visualisations/listings.csv')
    .then(function(csv){
        data = csv;
        addMarkers();
    });


/* charts */
let svg_1;
let container_1;
let xAxis_1, yAxis_1;
let xScale_1, yScale_1;

let svg_2;
let container_2;
let xAxis_2, yAxis_2;
let xScale_2, yScale_2;

let width = 600;
let height = 200;
let margin = { top: 15, right: 15, bottom: 40, left: 40};
let data;

/* chart: price vs. reviews per month */
function init_chart_reviews(){
    svg_1 = d3.select("#chart_reviews");
    container_1 = svg_1.append("g");
    xAxis_1 = svg_1.append("g");
    yAxis_1 = svg_1.append("g");

    xScale_1 = d3.scaleLinear();
    yScale_1 = d3.scaleLinear();

    svg_1.attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom)

    svg_1.append("text")
       .attr("y", 8)
       .style("font-family", "futura")
       .style("font-size", 12)
       .style("fill", "orange")
       .text("price")
    

    container_1.attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.select("#max-reviews").on("change", update_chart_reviews);
}

function update_chart_reviews(){
    
    let xAxis_max = d3.select("#max-reviews").node().value;

    xScale_1 = d3.scaleLinear().domain([0, xAxis_max]).range([0, width]);
    yScale_1 = d3.scaleLinear().domain(d3.extent(data, d => d["price"])).range([height, 0]);

    container_1.selectAll("rect")
             .data(data)
             .join("rect")
             .attr("x", d => xScale_1(d["reviews_per_month"]))
             .attr("y", d => yScale_1(d["price"]))
             .attr("width", 2)
             .attr("height", d => height - yScale_1(d["price"]))
             .attr("fill", "orange");

    xAxis_1.attr("transform", `translate(${margin.left}, ${margin.top + height})`)
           .transition()
           .call(d3.axisBottom(xScale_1))
           .style("font-family", "futura");
     
    yAxis_1.attr("transform", `translate(${margin.left}, ${margin.top})`)
           .transition()
           .call(d3.axisLeft(yScale_1))
           .style("font-family", "futura");
}

/* chart: price vs. minimum nights */
var rooms = {
    'Private room': 'private',
    'Shared room': 'shared',
    'Entire home/apt': 'entire',
    'Hotel room': 'hotel',
}

var rooms_col = {
    'Private room': 'purple',
    'Shared room': 'blue',
    'Entire home/apt': 'orange',
    'Hotel room': 'green',
}


function init_chart_nights(){
    svg_2 = d3.select("#chart_nights");
    container_2 = svg_2.append("g");
    xAxis_2 = svg_2.append("g");
    yAxis_2 = svg_2.append("g");

    xScale_2 = d3.scaleLinear().domain(d3.extent(data, d => d["minimum_nights"])).range([0, width]);
    yScale_2 = d3.scaleLinear().domain(d3.extent(data, d => d["price"])).range([height, 0]);

    xAxis_2.attr("transform", `translate(${margin.left}, ${margin.top + height})`)
         .transition()
         .call(d3.axisBottom(xScale_2))
         .style("font-family", "futura");
     
    yAxis_2.attr("transform", `translate(${margin.left}, ${margin.top})`)
         .transition()
         .call(d3.axisLeft(yScale_2))
         .style("font-family", "futura");


    svg_2.attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom);

    svg_2.append("text")
         .attr("y", 8)
         .style("font-family", "futura")
         .style("font-size", 12)
         .style("fill", "purple")
         .text("price");
    
    container_2.attr("transform", `translate(${margin.left}, ${margin.top})`);

    container_2.selectAll("circle")
               .data(data)
               .join("circle")
               .attr("class", function(d){return rooms[d["room_type"]]})
               .attr("cx", d => xScale_2(d["minimum_nights"]))
               .attr("cy", d => yScale_2(d["price"]))
               .attr("r", 3)
               .attr("fill", function(d){return rooms_col[d["room_type"]]})
               .attr("opacity", .8)
               .attr("stroke", "black")
               .attr("stroke-width", 0.5);
    
    d3.select("#min_nights").on("change", update_chart_nights);
    d3.selectAll(".roomtype").on("change", update_chart_nights);
}

function update_chart_nights(){

    let min_nights_max = d3.select("#min_nights").node().value;

    xScale_2 = d3.scaleLinear().domain([0, min_nights_max]).range([0, width]);

    xAxis_2.attr("transform", `translate(${margin.left}, ${margin.top + height})`)
         .transition()
         .call(d3.axisBottom(xScale_2))
         .style("font-family", "futura");

    container_2.selectAll("circle")
               .attr("cx", d => xScale_2(d["minimum_nights"]));

    d3.selectAll(".roomtype").each(function(d){
        cb = d3.select(this);
        rt = cb.property("value");

        if (cb.property("checked")){
            container_2.selectAll("."+rt)
                       .transition()
                       .duration(500)
                       .attr("r", 3);
        }

        else{
            container_2.selectAll("."+rt)
                       .transition()
                       .duration(500)
                       .attr("r", 0);
        }
    })
}


d3.csv('http://data.insideairbnb.com/singapore/sg/singapore/2021-03-25/visualisations/listings.csv')
    .then(csvData => {
        csvData.forEach(d => {
            d["price"] = +d["price"];
            d["reviews_per_month"] = +d["reviews_per_month"];
            d["minimum_nights"] = +d["minimum_nights"];
        });

        data = csvData;
        init_chart_reviews();
        init_chart_nights();
        update_chart_reviews();
        update_chart_nights();
    });

    