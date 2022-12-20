import styles from "./tooltip.module.scss";

function Tooltip({ hoveredBar, cooridnates }) {
    return (
        <>
            {hoveredBar && (
                <div
                    className={styles.tooptip}
                    style={{
                        position: "absolute",
                        top: cooridnates.x,
                        // top: 0,
                        // left: 0,
                        left: cooridnates.y,
                    }}
                >
                    The Exact Value is {hoveredBar.sales}
                </div>
            )}
        </>
    );
    return <circle cx={50} cy={50} r={50} fill="orange"></circle>;
}

export default Tooltip;
