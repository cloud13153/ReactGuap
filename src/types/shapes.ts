interface Circle {
    id: number;
    x: number;
    y: number;
    radius: number;
    color: string;
}
  
interface History {
    circles: Circle[];
    selected: number[];
}

export {
    Circle,
    History
}