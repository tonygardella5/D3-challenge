// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
var labelArea = 110;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";
var xMin;
var xMax;
var yMin;
var yMax;
function xBounds(data, chosenXAxis) {
  // min will grab the smallest datum from the selected column.
  xMin = d3.min(data, function(d) {
    return parseFloat(d[chosenXAxis]) * 0.90;
  });
  
  // .max will grab the largest datum from the selected column.
  xMax = d3.max(data, function(d) {
    return parseFloat(d[chosenXAxis]) * 1.10;
  });
}
function yBounds(data, chosenYAxis) {
  // min will grab the smallest datum from the selected column.
  yMin = d3.min(data, function(d) {
    return parseFloat(d[chosenYAxis]) * 0.90;
  });
  
  // .max will grab the largest datum from the selected column.
  yMax = d3.max(data, function(d) {
    return parseFloat(d[chosenYAxis]) * 1.10;
  });
}
// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales

  var xMin = d3.min(data, d => parseInt(d[chosenXAxis]) * .8);
  var xMax = d3.max(data, d => parseInt(d[chosenXAxis]) * 1.2);
  xBounds(chosenXAxis);
  console.log(xMin);
  console.log(xMax);
  var xLinearScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([0, width]);

  return xLinearScale;

}
function yScale(data, chosenYAxis) {
  // create scales

  var yMin = d3.min(data, d => parseInt(d[chosenYAxis]) * .8);
  var yMax = d3.max(data, d => parseInt(d[chosenYAxis]) * 1.2);
  xBounds(chosenYAxis);
  console.log(yMin);
  console.log(yMax);
  var yLinearScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);

  return yLinearScale;

}
// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]))
    ;

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateXToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var labelX;

  if (chosenXAxis === "poverty") {
    labelX = "In Poverty";
  }
  else if (chosenXAxis === "age") {
    labelX = "Age";
  }
  else {
    labelX = "Household Income";
  }


  var labelY;

  if (chosenYAxis === "obesity") {
    labelY = "Obesity";
  }
  else if (chosenYAxis === "smokes") {
    labelY = "Smokes";
  }
  else {
    labelY = "Healthcare";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data) {
  
  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);
  
  // Create y scale function
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "red")
    .attr("opacity", ".5")
    ;
  
  // Create group for three x-axis labels
  var labelsXGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

 var incomeLabel = labelsXGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household income (median)");

      // append y axis
var labelsYGroup = chartGroup.append("g")
    .attr("transform", `translate(${-100}, ${height/2})rotate(${-90})`);
var obesityLabel = labelsYGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");
var smokesLabel = labelsYGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

var healthcareLabel = labelsYGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");



  // updateToolTip function above csv import
  var circlesGroup = updateXToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsXGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis);
        console.log(chosenYAxis);


        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateXToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
  labelsYGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        console.log(chosenXAxis);
        console.log(chosenYAxis);

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateXToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
