// A lightweight signature SVG motif: nodes connected in a mesh, used across
// the dashboard hero and empty states to visually tie back to "networking".
export default function NetworkMesh({ className = "", nodeCount = 7 }) {
  const nodes = [
    [40, 60], [140, 30], [230, 80], [90, 140], [200, 160], [280, 40], [310, 130],
  ].slice(0, nodeCount);

  const edges = [
    [0, 1], [1, 2], [0, 3], [1, 3], [2, 4], [3, 4], [2, 5], [4, 6], [5, 6],
  ].filter(([a, b]) => a < nodes.length && b < nodes.length);

  return (
    <svg viewBox="0 0 340 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="var(--color-signal-500)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
      ))}
      {edges.slice(0, 3).map(([a, b], i) => (
        <circle key={`p-${i}`} r="3" fill="var(--color-amber-500)">
          <animateMotion
            dur={`${3 + i}s`}
            repeatCount="indefinite"
            path={`M${nodes[a][0]},${nodes[a][1]} L${nodes[b][0]},${nodes[b][1]}`}
          />
        </circle>
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="14" fill="var(--color-signal-500)" fillOpacity="0.12" />
          <circle cx={x} cy={y} r="5" fill="var(--color-signal-500)" />
        </g>
      ))}
    </svg>
  );
}
