import React, { useState, useRef } from 'react';
import {Circle, History} from './types'

function App() {
  // Основное состояние приложения
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [groupDragging, setGroupDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [color, setColor] = useState('#3f83f8');
  
  // Состояние для функционала undo
  const [history, setHistory] = useState<History[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);

  // Добавление нового круга со случайными координатами
  const handleAddCircle = () => {
    const MIN_PX: number = 0.05; // минимальный % = 5
    const MAX_PX: number = 0.2; // максимальный % = 20

    if (!slideRef.current) {
      return;
    }

    const {
      offsetWidth: width,
      offsetHeight: height
    } = slideRef.current;

    const [minWidth, maxWidth] = [width * MIN_PX, width * MAX_PX]

    // Генерация случайных параметров для нового круга
    const radius = Math.floor(Math.random() * (maxWidth - minWidth)) + minWidth;
    const x = Math.floor(Math.random() * (width - radius * 2));
    const y = Math.floor(Math.random() * (height - radius * 2));
    const newCircle = { id: Date.now(), x, y, radius, color };
    
    // Обновление истории и состояния
    const newHistory = [
      ...history.slice(0, historyIndex + 1),
      {
        circles: [...circles, newCircle],
        selected
      }
    ];
    setHistory(newHistory);
    setHistoryIndex(historyIndex + 1);
    setCircles([...circles, newCircle]);
  };

  // Обработка перемещения кругов
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (groupDragging) {
      // Перемещение группы выделенных кругов
      const rect = slideRef.current?.getBoundingClientRect();
      const x = e.clientX - (rect?.left ?? 0);
      const y = e.clientY - (rect?.top ?? 0);
      const dx = x - startX;
      const dy = y - startY;
      const newCircles = circles.map((c) => 
        selected.includes(c.id) ? { ...c, x: c.x + dx, y: c.y + dy } : c
      );
      
      // Обновление истории и состояния
      const newHistory = [
        ...history.slice(0, historyIndex + 1),
        {
          circles: newCircles,
          selected 
        }
      ];

      setHistory(newHistory);
      setHistoryIndex(historyIndex + 1);
      setCircles(newCircles);
      setStartX(x);
      setStartY(y);
    } else if (dragging !== null) {
      // Перемещение одного круга
      const rect = slideRef.current?.getBoundingClientRect();
      const x = e.clientX - (rect?.left ?? 0) - (circles.find(c => c.id === dragging)?.radius ?? 0);
      const y = e.clientY - (rect?.top ?? 0) - (circles.find(c => c.id === dragging)?.radius ?? 0);
      const newCircles = circles.map((c) => 
        c.id === dragging ? { ...c, x, y } : c
      );
      
      // Обновление истории и состояния
      const newHistory = [
        ...history.slice(0, historyIndex + 1),
        {
          circles: newCircles,
          selected
        }
      ];

      setHistory(newHistory);
      setHistoryIndex(historyIndex + 1);
      setCircles(newCircles);
    }
  };

  // Обработка выделения и начала перетаскивания
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, circle: Circle) => {
    e.preventDefault();
    if (e.ctrlKey) {
      // Множественное выделение с Ctrl
      const newSelected = selected.includes(circle.id) ?
        selected.filter((id) => id !== circle.id) :
        [...selected, circle.id];
      const newHistory = [
        ...history.slice(0, historyIndex + 1),
        {
          circles,
          selected: newSelected
        }
      ];

      setHistory(newHistory);
      setHistoryIndex(historyIndex + 1);
      setSelected(newSelected);
    } else if (!selected.includes(circle.id)) {
      // Одиночное выделение
      const newHistory = [
        ...history.slice(0, historyIndex + 1),
        {
          circles,
          selected: [circle.id]
        }
      ];

      setHistory(newHistory);
      setHistoryIndex(historyIndex + 1);
      setSelected([circle.id]);
    }

    // Настройка перетаскивания
    if (selected.length > 1) {
      setGroupDragging(true);
      const rect = slideRef.current?.getBoundingClientRect();
      const x = e.clientX - (rect?.left ?? 0);
      const y = e.clientY - (rect?.top ?? 0);
      setStartX(x);
      setStartY(y);
    } else {
      setDragging(circle.id);
    }

    // Обработчики событий мыши для document
    const mouseMoveHandler = (e: MouseEvent) => {
      if (slideRef.current) {
        const mouseEvent = {
          clientX: e.clientX,
          clientY: e.clientY,
        } as React.MouseEvent<HTMLDivElement>;
        handleMouseMove(mouseEvent);
      }
    };
  
    document.addEventListener('mousemove', mouseMoveHandler);

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      setDragging(null);
      setGroupDragging(false);
    };

    document.addEventListener('mouseup', mouseUpHandler, { once: true });
  };

  // Обработка клавиатурных команд (удаление и отмена)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace') {
      // Удаление выделенных кругов
      const newCircles = circles.filter((c) => !selected.includes(c.id));
      const newHistory = [
        ...history.slice(0, historyIndex + 1),
        {
          circles: newCircles,
          selected: []
        }
      ];

      setHistory(newHistory);
      setHistoryIndex(historyIndex + 1);
      setCircles(newCircles);
      setSelected([]);
    } else if (e.ctrlKey && e.key === 'z') {
      // Отмена последнего действия
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        const { circles, selected } = history[historyIndex - 1];
        setCircles(circles);
        setSelected(selected);
      }
    }
  };

  return (
    // Основной интерфейс приложения
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden">
      {/* Панель инструментов */}
      <div className="flex mb-4">
        <button
          className="shadow-custom py-2 px-4 bg-blue-500 text-white rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-700 hover:shadow-md"
          style={{
            fontFamily: 'Arial, sans-serif',
            fontWeight: 600,
            fontSize: 16,
          }}
          onClick={handleAddCircle}
        >
          Добавить круг
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="shadow-custom ml-4 bg-blue-500 p-2 rounded-lg"
          style={{
            height: '2.5rem',
          }}
        />
      </div>

      {/* Рабочая область с кругами */}
      <div
        ref={slideRef}
        className="w-2/3 h-2/3 shadow-md bg-gray-200 border-2 border-dashed rounded-xl relative overflow-hidden"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseMove={handleMouseMove}
      >
        {/* Отрисовка кругов */}
        {circles.map((circle) => (
          <div
            key={circle.id}
            className={`absolute rounded-full cursor-move ${selected.includes(circle.id) ? 'shadow-md' : ''}`}
            style={{
              width: circle.radius * 2,
              height: circle.radius * 2,
              left: circle.x,
              top: circle.y,
              backgroundColor: circle.color,
              border: selected.includes(circle.id) ? `4px solid ${parseInt(circle.color.substring(1), 16) < 0x808080 ? '#ffffff' : '#000000'}` : '',
              boxShadow: selected.includes(circle.id) ? `0 0 0 4px ${circle.color}` : '',
            }}
            onMouseDown={(e) => handleMouseDown(e, circle)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;