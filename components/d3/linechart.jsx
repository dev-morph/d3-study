import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { svg } from "d3";

function LineChart({
    datas,
    width = 1200,
    height = 600,
    margin = { top: 20, right: 100, bottom: 50, left: 100 },
}) {
    const svgRef = useRef();
    const xAixsRef = useRef();
    const yAixsRef = useRef();

    const [lines, setLines] = useState("");

    useEffect(() => {
        // #######################  #######################
        // const currentElement = ref.current;
        // const svg = d3
        //     .select(currentElement)
        //     .attr("width", width)
        //     .attr("height", height);

        // const g = svg
        //     .append("g")
        //     .attr("transform", `translate(${margin}, ${margin})`);

        // ####################### X축 그리기 #######################
        const xScale = d3
            .scaleTime()
            .range([margin.left, width - margin.right]);
        const timeDomain = d3.extent(datas, (d) => {
            const parsedDate = timeParser(d.date);
            return parsedDate;
        });

        const xAxis = d3
            .axisBottom()
            .scale(xScale)
            .tickFormat(d3.timeFormat("%y-%m"))
            .ticks(12);

        xScale.domain(timeDomain);

        d3.select(xAixsRef.current).call(xAxis);
        // g.append("g")
        //     .attr("transform", `translate(0,${height - 200})`)
        //     .call(xAxis);

        // ####################### y축 그리기 #######################
        const yScale = d3
            .scaleLinear()
            .range([height - margin.bottom, margin.top]);

        yScale.domain([0, d3.max(datas, (d) => d.precipitation)]);
        const yAxis = d3.axisLeft().scale(yScale);

        d3.select(yAixsRef.current).call(yAxis);

        // g.append("g")
        //     .attr("transform", `translate(${margin}, ${-margin})`)
        //     .call(d3.axisLeft().scale(yScale));

        // ####################### 라인 그래프 그리기 #######################
        const lineGenerator = d3.line();
        // .defined((d) => !isNaN(d.precipitation));

        lineGenerator.x((d) => xScale(timeParser(d.date)));
        lineGenerator.y((d) => yScale(d.precipitation));

        setLines(lineGenerator(datas));

        // svg.append("path")
        //     .datum(datas)
        //     .attr("fill", "none")
        //     .attr("stroke", "orange")
        //     .attr("transform", `translate(${margin}, ${0})`)
        //     .attr("d", (d) => lineGenerator(d));

        // ####################### 라인차트에 점 찍어주기 #######################
        // d3.selectAll('.dot').attr('cx', function(d))
        d3.select(svgRef.current)
            .selectAll(".dot")
            .data(datas)
            .enter()
            .append("circle")
            .attr("cx", (d) => {
                const parsedDate = timeParser(d.date);
                return xScale(parsedDate);
                return parsedDate.timeFormat("%Y-%m");
            })
            .attr("cy", (d) => yScale(d.precipitation))
            .attr("r", 5)
            .attr("fill", "orange");
    }, []);
    return (
        <svg ref={svgRef} width={width} height={height}>
            {/* {datas.map((d, i) => (
                <circle className="dot" key={i} ></circle>
            ))} */}
            <path
                d={lines}
                fill="none"
                stroke="orange"
                strokeWidth="2"
                transform={`translate(${margin}, ${0})`}
            ></path>
            <g transform={`translate(${margin}, ${margin})`}>
                <g
                    ref={xAixsRef}
                    transform={`translate(0,${height - margin.bottom})`}
                ></g>
                <g
                    ref={yAixsRef}
                    transform={`translate(${margin.left}, 0)`}
                ></g>
            </g>
        </svg>
    );
}

//string Type의 날짜를 Date Object로 변환
const timeParser = d3.timeParse("%Y-%m");

export default LineChart;

//   const [val, setVal] = useState("");
// const svgRef = useRef();
// const rainSvgRef = useRef();
// const width = 1000,
//     height = 600,
//     margin = 100;

// useEffect(() => {
//     const currentElement = svgRef.current;
//     const svg = d3
//         .select(currentElement)
//         .attr("width", width)
//         .attr("height", height);

//     //graph가 그려질 group 선언
//     const g = svg
//         .append("g")
//         .attr("fill", "white")
//         .attr("transform", `translate(${margin}, ${margin})`);

//     // ####################### X축 그리기 #######################
//     //x축 conversion 함수 만들기
//     const xScale = d3.scaleTime().range([100, width - 200]);
//     //x축 Domain 설정
//     const timeDomain = d3.extent(datas, (d) => new Date(d.d));
//     xScale.domain(timeDomain);

//     //xaxis 그리기
//     g.append("g")
//         .attr("transform", `translate(0,${height - 200})`)
//         .call(d3.axisBottom(xScale));

//     // ####################### Y축 그리기 #######################
//     //y축 conversion 함수 만들기
//     const yScale = d3.scaleLinear().range([height - margin, margin]);
//     //y축 domain설정
//     yScale.domain([0, d3.max(datas, (d) => d.v)]);

//     //y축 그리기
//     g.append("g")
//         .attr("transform", `translate(${margin}, ${0 - margin})`)
//         .call(d3.axisLeft(yScale));

//     // ####################### 라인 그래프 그리기 #######################
//     const lineGenerator = d3.line().defined((d) => !isNaN(d.v));

//     lineGenerator.x((d) => xScale(new Date(d.d)));
//     lineGenerator.y((d) => yScale(d.v));

//     svg.append("path")
//         .datum(datas)
//         .attr("fill", "none")
//         .attr("stroke", "steelblue")
//         .attr("transform", `translate(${margin}, 0)`)
//         .attr("d", (data) => lineGenerator(data));
// }, [datas]);
