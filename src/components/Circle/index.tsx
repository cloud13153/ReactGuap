import React from "react";
import { Circle } from "../../types";

// Интерфейс для пропсов компонента
interface ICircle {
    circle: Circle;          // Объект круга с его параметрами
    isSelected: boolean;     // Флаг выбранного состояния
    handleMouseDown: (      // Обработчик нажатия мыши
      e: React.MouseEvent<HTMLElement>,
      circle: Circle
    ) => void;
}

const Circle: React.FC<ICircle> = ({
    circle,
    isSelected,
    handleMouseDown
}) => {
    // Определяем цвет границы в зависимости от цвета круга
    // Если круг темный - граница белая, если светлый - черная
    const borderColor = parseInt(circle.color.substring(1), 16) < 0x808080 ?
      '#ffffff' :
      '#000000';

    // Базовые стили с условным добавлением тени для выбранного состояния
    const styles = `
        absolute rounded-full cursor-mov
        ${isSelected &&'shadow-md' }
    `;

    return(
        <div
        key={circle.id}
        className={styles}
        style={{
          width: circle.radius * 2,    // Диаметр круга
          height: circle.radius * 2,
          left: circle.x,              // Позиционирование
          top: circle.y,
          backgroundColor: circle.color,
          ...isSelected && {           // Добавляем границу если круг выбран
            border: borderColor
          }
        }}
        onMouseDown={(e) => handleMouseDown(e, circle)}
      />
    );
  }

export default Circle;