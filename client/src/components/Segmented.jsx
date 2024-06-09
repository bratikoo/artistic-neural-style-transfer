import { useState } from "react";

export const Segmented = ({ segments, onSegmentChange }) => {
  const [activeSegment, setActiveSegment] = useState(segments[0].key);

  const handleSegmentClick = (segment) => {
    setActiveSegment(segment);
    if (onSegmentChange) {
      onSegmentChange(segment);
    }
  };

  return (
    <div className="segmented">
      {segments.map((segment) => (
        <div
          key={segment.key}
          className={`segment ${segment.key === activeSegment ? "active" : ""}`}
          onClick={() => handleSegmentClick(segment.key)}
        >
          {segment.label}
        </div>
      ))}
    </div>
  );
};
