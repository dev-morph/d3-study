import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import dummies from "./xyz.json";

// type PropTypes = {
//     datas: any,
// };

const margin = 200;
// const margin = { top: 20, right: 5, bottom: 20, left: 35 };
const red = "#eb6a5b";
const blue = "#52b6ca";

function LineChart({ datas }) {
    const canvasElement = useRef();
    const timeFormat = d3.timeFormat("%B %d, %Y");

    useEffect(() => {
        // ####################### ref를 이용하여, svgElement 선택 #######################
        const currentElement = canvasElement.current;
        const svg = d3.select(currentElement);

        const width = svg.attr("width") - margin;
        const height = svg.attr("height") - margin;

        const xScale = d3.scaleBand().range([0, width]).padding(0.4),
            yScale = d3.scaleLinear().range([height, 0]);

        const g = svg
            .append("g")
            .attr("fill", "white")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");

        if (!dummies) return;
        xScale.domain(
            dummies.map(function (d) {
                console.log("what is ", d.year);
                return d.year;
            })
        );

        yScale.domain([
            0,
            d3.max(dummies, function (d) {
                return d.value;
            }),
        ]);

        // ####################### add x axis #######################

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        // ####################### add y axis #######################

        g.append("g")
            .call(
                d3
                    .axisLeft(yScale)
                    .tickFormat(function (d) {
                        return "$" + d;
                    })
                    .ticks(10)
            )
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-5.1em")
            .attr("stroke", "white")
            .attr("text-anchor", "end")
            .text("value");

        // ####################### add bar and mapping with datas #######################

        g.selectAll(".bar")
            .data(dummies)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("width", xScale.bandwidth)
            .attr("height", function (d) {
                return height - yScale(d.value);
            })
            .attr("fill", "steelblue")
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut)
            .attr("x", function (d) {
                return xScale(d.year);
            })
            .attr("y", function (d) {
                return yScale(d.value);
            });

        // ####################### add label - Title #######################
        svg.append("text")
            .attr("transform", `translate(100, 0)`)
            .attr("x", 50)
            .attr("y", 50)
            .attr("font-size", "24px")
            .text("XYZ STOCK Prices");

        // ####################### add label - x-axis #######################
        console.log("height would be", height);
        g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .append("text")
            .attr("x", width)
            .attr("y", height - 250)
            .attr("text-anchor", "end")
            .text("Year");

        //####################### mouseover event handler function #######################
        function onMouseOver(d, i) {
            d3.select(this).attr("class", "highlight");
            d3.select(this)
                .transition() // adds animation
                .duration(400)
                .attr("width", xScale.bandwidth() + 5)
                .attr("y", function (d) {
                    return yScale(d.value) - 10;
                })
                .attr("fill", "orange")
                .attr("height", function (d) {
                    return height - yScale(d.value) + 10;
                });

            g.append("text")
                .attr("class", "val")
                .attr("x", function () {
                    return xScale(i.year);
                })
                .attr("y", function () {
                    return yScale(i.value) - 15;
                })
                .attr("stroke", "white")
                .text(function () {
                    return ["$" + i.value]; // Value of the text
                });
        }

        //####################### mouseout event handler function #######################
        function onMouseOut(d, i) {
            d3.select(this).attr("class", "bar");
            d3.select(this)
                .transition()
                .duration(400)
                .attr("width", xScale.bandwidth())
                .attr("y", function (d) {
                    return yScale(d.value);
                })
                .attr("fill", "steelblue")
                .attr("height", function (d) {
                    return height - yScale(d.value);
                });

            d3.selectAll(".val").remove();
        }
    }, [datas]);
    return (
        <>
            <h2>This is Line Chart Component</h2>
            <svg ref={canvasElement} width="600" height="500"></svg>
        </>
    );
}

export default LineChart;
