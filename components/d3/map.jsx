import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import SeoulGeoJson from "../../public/datas/seoul_geo.json";
import styles from "./map.module.scss";

function Map() {
    const svgRef = useRef();
    const mapRef = useRef();
    const titleRef = useRef();
    const mapWrapperRef = useRef();

    const hoverClass = `${styles.hovered}`;
    const width = 1000,
        height = 750;

    const [zoomInitHandler, setZoomInitHandler] = useState(null);

    useEffect(() => {
        // 지도 바깥쪽을 클릭한 경우, zoom level을 원상복귀 시키기 위함
        const svg = d3
            .select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .attr("preserveAspectRatio", "xMaxYMax slice")
            .on("click", zoomResetHandler);

        //projection (지도 투영법) 타입을 정한다.
        const projection = d3
            .geoMercator()
            // .geoEquirectangular()
            .scale(100000)
            .center([127, 37.6]);
        const geoGenerator = d3.geoPath().projection(projection);

        // geoGenerator(SeoulGeoJson);

        const map = d3
            .select(mapRef.current)
            .selectAll("path")
            .data(SeoulGeoJson.features);

        map.enter()
            .append("path")
            .attr("stroke", "white")
            .attr("fill", "#F0EEEF")
            .classed(`${styles.hovered}`, false)
            .classed(`${styles.district}`, true)
            .attr("d", (d) => geoGenerator(d))
            .on("mouseover", mouseoverHandler)
            .on("mouseout", mouseoutHandler)
            .on("click", clickHandler)
            .transition()
            .duration(400);

        // ######################### mouseover 이벤트 Handler #########################
        function mouseoverHandler(e, d) {
            const center = geoGenerator.centroid(d);

            d3.select(this).classed(hoverClass, true);

            // ######################### 지역 타이틀 출력 #########################
            const title = d3
                .select(titleRef.current)
                .attr("x", center[0])
                .attr("y", center[1])
                .attr("text-anchor", "middle")
                // .attr("transform", `translate(${100}, ${100})`)
                // .attr("transform", `translate(${center})`)
                .text(d.properties.name);
        }

        function mouseoutHandler(e, d) {
            d3.select(this).classed(`${styles.hovered}`, false);
            d3.select(`.${styles.district__title}`).select(`text`).text("");
        }

        // ################################################## ZOOM CONTROL ##################################################
        // ######################### 1. ZOOM BEHAVIOUR 함수 생성 #########################
        const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", handleZoom);

        // ######################### 2. zoom event HANDLER 생성 #########################
        // when zoom or pan event occurs, below function will be triggered.
        function handleZoom(e) {
            const mapWrapper = d3.select(mapWrapperRef.current);
            // transform has three properties: x, y, k
            //x and y specify the translate transform and k represents the scale factor
            const { transform } = e;
            mapWrapper.attr("transform", transform);
            mapWrapper.attr("stroke-width", 1 / transform.k);
        }

        // ######################### 3. SVG에 ZOOM 이벤트발생하면 작동하도록 bind #########################
        // 지도 바깥 영역을 클릭하면 zoom level이 reset될 수 있도록, svg전체 영역에 zoom behavior를 등록해준다.
        svg.call(zoom);

        function clickHandler(e, d) {
            const path = d3.geoPath();
            const bounds = path.bounds(d);
            e.stopPropagation();
            const [westSouth, eastNorth] = bounds;
            const [[x0, y0], [x1, y1]] = [
                projection(westSouth),
                projection(eastNorth),
            ];
            const scale = Math.min(
                8,
                0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)
            );

            svg.transition()
                .duration(750)
                .call(
                    zoom.transform,
                    d3.zoomIdentity
                        // .translate(-400, -400)
                        // .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
                        .translate(width / 2, height / 2)
                        .scale(
                            // .scale(
                            Math.min(
                                8,
                                0.9 /
                                    Math.max(
                                        (x1 - x0) / width,
                                        (y1 - y0) / height
                                    )
                            )
                        )
                        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
                    // .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
                    // .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                    // d3.pointer(e, svg.node())
                );

            // svg.transition()
            //     .duration(750)
            //     .call(
            //         zoom.transform,
            //         d3.zoomIdentity
            //             .translate(width / 2, height / 2)
            //             .scale(scale)
            //         // .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
            //     );

            // svg.transition().duration(750).call(zoom.translateBy, 50, 0);
            // svg.transition().duration(750).call(zoom.scaleBy, 4);

            // svg.transition()
            //     .duration(750)
            //     .call(
            //         zoom.transform,
            //         d3.zoomIdentity
            //             .translate(width / 2, height / 2)
            //             .scale(4)
            //             // .scale(scale)
            //             .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
            //         d3.pointer(e, svg.node())
            //     );
        }
        // .on("mousedown.zoom", null)
        // .on("touchstart.zoom", null)
        // .on("touchmove.zoom", null)
        // .on("touchend.zoom", null);

        // ######################### 지도 바깥쪽을 클릭 했을 경우, zoom 초기화 #########################
        function zoomResetHandler() {
            console.log("here");
            svg.transition()
                .duration(750)
                .ease(d3.easeLinear)
                .call(
                    zoom.transform,
                    d3.zoomIdentity,
                    d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
                );
        }

        setZoomInitHandler(() => zoomResetHandler);
    }, []);

    return (
        <>
            <div className={styles.map__wrapper}>
                <svg
                    ref={svgRef}
                    width={width}
                    height={height}
                    className={styles.map}
                >
                    <g ref={mapWrapperRef}>
                        <g className="map" ref={mapRef}></g>
                        <g className={styles.district__title}>
                            <text ref={titleRef}></text>
                        </g>
                    </g>
                    {/* <g className={styles.district__title}></g> */}
                </svg>
                {zoomInitHandler && (
                    <button
                        className={styles.initBtn}
                        onClick={zoomInitHandler}
                    >
                        초기화
                    </button>
                )}
            </div>
        </>
    );
}

export default Map;
