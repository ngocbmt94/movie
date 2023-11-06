import { useState } from "react";
import PropTypes from "prop-types"; // typechecking of proptypes

const containerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
};
const starsContainerStyle = { display: "flex" };

StarsRating.propTypes = {
  maxRating: PropTypes.number,
  colorStar: PropTypes.string,
  sizeStar: PropTypes.number,
  className: PropTypes.string,
  message: PropTypes.array,
  defaulRating: PropTypes.number,
  onSetExternalRating: PropTypes.func,
};

export default function StarsRating({ maxRating = 3, colorStar = "gold", sizeStar = 20, className = "", message = [], defaulRating = 0, onSetExternalRating }) {
  const [rating, setRating] = useState(defaulRating);
  const [hoverRating, setHoverRating] = useState(0);

  function handleClickRating(rate) {
    setRating(rate);
    if (onSetExternalRating) onSetExternalRating(rate); // get state variable rating outside component StarsRating
  }

  return (
    <div style={containerStyle} className={className}>
      <div style={starsContainerStyle}>
        {Array.from({ length: maxRating }, (_, i) => (
          <StarIcon key={i + 1} sizeStar={sizeStar} onClickRating={() => handleClickRating(i + 1)} color={(hoverRating ? hoverRating : rating) >= i + 1 ? colorStar : "lightgray"} onEnterRating={() => setHoverRating(i + 1)} onLeaveRating={() => setHoverRating(0)} />
        ))}
      </div>

      {message.length === maxRating && <b style={{ color: colorStar }}>{message[hoverRating - 1] || message[rating - 1]}</b>}
      {(message.length === 0 || message.length !== maxRating) && <b style={{ color: colorStar }}>{hoverRating || rating || ""}</b>}
    </div>
  );
}

function StarIcon({ onClickRating, color, onEnterRating, onLeaveRating, sizeStar }) {
  const starIconStyle = { height: `${sizeStar}px`, width: `${sizeStar}px`, cursor: "pointer", display: "block" };
  return (
    <span style={starIconStyle} role="button" onClick={onClickRating} onMouseEnter={onEnterRating} onMouseLeave={onLeaveRating}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill={color}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </span>
  );
}
