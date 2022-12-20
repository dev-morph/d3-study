import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import styles from './newbarchart.module.scss'
import Tooltip from './utils/tooltip'

function NewBarChart({ data }) {
  const xAixsGenerator = useRef()
  const xAxisRef = useRef()
  const yAxisRef = useRef()
  const barAreaRef = useRef()
  const xGridLineRef = useRef()
  const yGridLineRef = useRef()
  const svgRef = useRef()

  const [gridLineVisible, setGridLineVisible] = useState({
    x: false,
    y: false,
  })
  const [scaleFunction, setScaleFunction] = useState({
    xScale: null,
    yScale: null,
  })
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [hoveredBar, setHoveredBar] = useState(null)
  const [hoverCoordinate, sethoverCoordinate] = useState(null)

  const width = 1400,
    height = 600
  const margin = { top: 100, right: 100, bottom: 50, left: 100 }

  const svg = d3.select(svgRef.current)

  useEffect(() => {
    // ####################### x축 설정 #######################
    const xScale = d3
      .scaleBand()
      .range([margin.left, width - margin.right])
      .padding(0.3)

    xScale.domain(data.map((d) => d.year))

    const xAxis = (g) =>
      g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0))

    // ####################### y축 설정 #######################
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top])
    yScale.domain([0, d3.max(data, (d) => d.sales)])

    const yAxis = (g) =>
      g
        .attr('transform', `translate(${margin.left}, 0)`)
        .style('color', 'steelblue')
        .call(d3.axisLeft(yScale).tickSizeOuter(0))

    // ####################### x, y 축 생성 #######################

    d3.select(xAxisRef.current).call(xAxis)
    d3.select(yAxisRef.current).call(yAxis)
    setScaleFunction(() => {
      return { xScale: xScale, yScale: yScale }
    })

    // ####################### 바 차트 생성 #######################

    const bars = d3
      .select(barAreaRef.current)
      .selectAll(`${styles.bar}`)
      .data(data)
      .enter()
      .append('rect')
      .attr('class', `${styles.bar}`)
      .attr('x', (d) => xScale(d.year))
      .attr('width', xScale.bandwidth())
      .attr('y', (d) => yScale(0))
      .attr('height', (d) => {
        console.log(yScale(0))
        return 0
      })

    bars
      .on('mouseover', onMouseOver)
      .on('mouseout', onMouseOut)
      .on('mousemove', onMouseMove)

    // ####################### 바 Animation #######################
    bars
      .transition()
      .duration(1500)
      .attr('y', (d) => yScale(d.sales))
      .attr('height', (d) => yScale(0) - yScale(d.sales))

    // ####################### mouseover event handler #######################
    function onMouseOver(event, data) {
      event.stopPropagation()
      setHoveredBar(data)
      sethoverCoordinate({ x: event.pageY, y: event.pageX })
      d3.select(this).classed(`${styles.hover}`, true)
      d3.select(this).transition().duration(400)
    }

    function onMouseOut(event) {
      event.stopPropagation()
      setHoveredBar(null)
      sethoverCoordinate(null)
    }

    function onMouseMove(event, data) {
      event.stopPropagation()
      sethoverCoordinate({ x: event.pageY, y: event.pageX })
    }
  }, [data.length])

  //gridLine useEffect

  useEffect(() => {
    console.log('hmm', scaleFunction)

    console.log('scaleFunction', scaleFunction)
    // // ####################### X축 gridline 그리기 #######################
    const xAxisGrid = d3
      .axisBottom(scaleFunction.xScale)
      .tickSize(height - margin.bottom - margin.top)
      .tickFormat('')

    d3.select(xGridLineRef.current)
      .attr('class', `${styles.gridline}`)
      .attr('transform', `translate(${0}, ${margin.top})`)
      .call(xAxisGrid)

    // // ####################### Y축 gridline 그리기 #######################
    const yAxisGrid = d3
      .axisLeft(scaleFunction.yScale)
      .tickSize(width - margin.left - margin.right)
      .tickFormat('')

    d3.select(yGridLineRef.current)
      .attr('transform', `translate(${width - margin.left}, ${0})`)
      .attr('class', `${styles.gridline}`)
      .call(yAxisGrid)
  }, [gridLineVisible.x, gridLineVisible.y, hoveredBar])

  function gridLineHandler(event) {
    const { target } = event
    const id = target.id

    setGridLineVisible((prev) => {
      return { ...prev, [id]: target.checked }
    })
  }

  function tooltipHandler(event) {
    const { target } = event
    setTooltipVisible(target.checked)
  }

  // ############################################## JSX 파트 ##############################################

  return (
    <>
      {tooltipVisible && (
        <Tooltip hoveredBar={hoveredBar} cooridnates={hoverCoordinate} />
      )}
      <svg
        ref={svgRef}
        style={{
          height: 600,
          width: '100%',
          marginRight: '0px',
          marginLeft: '0px',
        }}
      >
        <g ref={barAreaRef} className="plot-area">
          {/* {data.map((d, i) => {
                    return (
                        <rect
                            key={i}
                            x={50}
                            y={50}
                            height={100}
                            width={100}
                        ></rect>
                    );
                })} */}
        </g>
        <g>
          <g className="x-axis" ref={xAxisRef} />
          <g className="y-axis" ref={yAxisRef} />
          {gridLineVisible.x && <g ref={xGridLineRef}></g>}
          {gridLineVisible.y && <g ref={yGridLineRef}></g>}
        </g>
      </svg>
      <div>
        <input
          type="checkbox"
          id="x"
          value={gridLineVisible.x}
          onChange={gridLineHandler}
        />
        <label htmlFor="x">x축 GridLine 추가</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="y"
          value={gridLineVisible.y}
          onChange={gridLineHandler}
        />
        <label htmlFor="y">y축 GridLine 추가</label>
      </div>
      <div>
        <input
          type="checkbox"
          id="tooltip"
          value={tooltipVisible}
          onChange={tooltipHandler}
        />
        <label htmlFor="tooltip">ToolTip 추가</label>
      </div>
    </>
  )
}

export default NewBarChart
