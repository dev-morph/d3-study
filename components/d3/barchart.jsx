import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import dummies from "./xyz.json";
import styles from "./barchart.module.scss";

const width = 1200,
    height = 600;
const margin = { top: 100, right: 100, bottom: 50, left: 100 };
const hoverDeltaSize = 10;
const numberOfTicks = 6;
const red = "#eb6a5b";
const blue = "#52b6ca";

function LineChart({ datas }) {
    const svgRef = useRef();
    const rectRef = useRef();
    const gRef = useRef();
    const xAxisRef = useRef();
    const yAxisRef = useRef();
    const timeFormat = d3.timeFormat("%B %d, %Y");

    useEffect(() => {
        // ####################### ref를 이용하여, svgElement 선택 #######################
        const svg = d3.select(svgRef.current);
        const rect = d3.select(rectRef.current);
        const g = d3.select(gRef.current);

        // ####################### X축 그리기 #######################
        const xScale = d3
            .scaleBand()
            .range([margin.left, width - margin.right])
            .padding(0.5);

        const xDomain = d3.map(dummies, (d) => d.year);
        // ** extent로 하게 되면, 최소 최댓값을 제외하고 모두 undefined가 뜨게 된다. **
        // const xDomain = d3.extent(dummies, (d) => d.year);

        xScale.domain(xDomain);

        const xAxis = d3.axisBottom().scale(xScale).tickSizeOuter(0);

        d3.select(xAxisRef.current).call(xAxis);

        // ####################### Y축 그리기 #######################
        const yScale = d3
            .scaleLinear()
            .range([height - margin.bottom, margin.top]);

        const yDomain = [
            0,
            d3.max(dummies, function (d) {
                return d.value;
            }),
        ];

        yScale.domain(yDomain);
        const yAxis = d3.axisLeft().scale(yScale).tickSizeOuter(0);

        d3.select(yAxisRef.current).call(yAxis);

        // ####################### X축 gridline 그리기 #######################
        const xAxisGrid = d3
            .axisBottom(xScale)
            .tickSize(height - margin.bottom)
            .tickFormat("");

        svg.append("g").attr("class", `${styles.gridline}`).call(xAxisGrid);

        // ####################### Y축 gridline 그리기 #######################

        const yAxisGrid = d3
            .axisLeft(yScale)
            .tickSize(width - margin.left - margin.right)
            .tickFormat("");

        svg.append("g")
            .attr("transform", `translate(${width - margin.left}, ${0})`)
            .attr("class", `${styles.gridline}`)
            .call(yAxisGrid);

        // ####################### add y axis #######################

        // g.append("g")
        //     .call(
        //         d3
        //             .axisLeft(yScale)
        //             .tickFormat(function (d) {
        //                 return "$" + d;
        //             })
        //             .ticks(10)
        //     )
        //     .append("text")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", 6)
        //     .attr("dy", "-5.1em")
        //     .attr("stroke", "white")
        //     .attr("text-anchor", "end")
        //     .text("value");

        // ####################### add bar and mapping with datas #######################

        rect.selectAll(".bar")
            .data(dummies)
            .enter()
            .append("rect")
            .attr("class", `${styles.bar}`)
            .attr("width", (d) => xScale.bandwidth())
            .attr("height", function (d) {
                return height - yScale(d.value) - margin.bottom;
            })
            .attr("transform", `translate(${0}, ${margin.top + margin.bottom})`)
            // .attr("fill", "steelblue")
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
            .attr("transform", `translate(${0}, ${0})`)
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
            .attr("fill", "black")
            .attr("text-anchor", "end")
            .text("Year");

        //####################### mouseover event handler function #######################
        function onMouseOver(d, i) {
            d3.select(this).classed(`${styles.hover}`, true);
            d3.select(this)
                .transition() // adds animation
                .duration(400);
            // .attr("width", xScale.bandwidth() + 5)
            // .attr("y", function (d) {
            //     return yScale(d.value) - hoverDeltaSize;
            // })
            // .attr("height", function (d) {
            //     return height - yScale(d.value) + hoverDeltaSize;
            // });

            g.append("text")
                .attr("class", `${styles.bar__text}`)
                .attr("x", function () {
                    return xScale(i.year);
                })
                .attr("y", function () {
                    return yScale(i.value) - margin.bottom;
                })
                .attr("stroke", "black")
                .text(function () {
                    return ["$" + i.value]; // Value of the text
                });
        }

        //####################### mouseout event handler function #######################
        function onMouseOut(d, i) {
            d3.select(this).classed(`${styles.hover}`, true);
            d3.select(this).transition().duration(400);

            d3.selectAll(`.${styles.bar__text}`).remove();
        }
    }, [datas]);
    return (
        <>
            <svg ref={svgRef} width={width} height={height}>
                <g
                    ref={rectRef}
                    transform={`translate(0,${-margin.bottom - margin.top})`}
                ></g>
                <g ref={gRef}>
                    <g
                        ref={xAxisRef}
                        transform={`translate(0,${height - margin.bottom})`}
                    ></g>
                    <g
                        ref={yAxisRef}
                        transform={`translate(${margin.left}, 0)`}
                    ></g>
                </g>
            </svg>
        </>
    );
}

export default LineChart;
