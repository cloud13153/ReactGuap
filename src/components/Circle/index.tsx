import React from "react";

import { Circle } from "../../types";

interface ICircle {
    circle: Circle;
    isSelected: boolean;
    handleMouseDown: (
      e: React.MouseEvent<HTMLElement>,
      circle: Circle
    ) => void;
}

const Circle: React.FC<ICircle> = ({
    circle,
    isSelected,
    handleMouseDown
}) => {
    const borderColor = parseInt(circle.color.substring(1), 16) < 0x808080 ?
      '#ffffff' :
      '#000000';
    const styles = `
        absolute rounded-full cursor-mov
        ${isSelected &&'shadow-md' }
    `;

    return(
        <div
        key={circle.id}
        className={styles}
        style={{
          width: circle.radius * 2,
          height: circle.radius * 2,
          left: circle.x,
          top: circle.y,
          backgroundColor: circle.color,
          ...isSelected && {
            border: borderColor
          }
        }}
        onMouseDown={(e) => handleMouseDown(e, circle)}
      />
    );
  }

export default Circle;