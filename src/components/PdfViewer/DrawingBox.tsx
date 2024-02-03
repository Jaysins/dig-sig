// DrawingBox.tsx
import React, { useRef } from 'react';
import { useDrag, DragSourceMonitor } from 'react-dnd';

interface DragItem {
    type: string;
}

const DrawingBox: React.FC = () => {
    const boxRef = useRef<HTMLDivElement>(null);

    // Use a library like react-dnd for drag-and-drop functionality
    const [{ isDragging }, drag] = useDrag<DragItem, any, { isDragging: boolean }>({
        type: 'drawingBox',
        collect: (monitor: DragSourceMonitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={boxRef}
            style={{
                width: '100px',
                height: '100px',
                backgroundColor: 'lightblue',
                position: 'absolute',
                cursor: 'move',
                opacity: isDragging ? 0.5 : 1,
            }}
            // Call the drag function with the element to make draggable
            {...drag(boxRef.current)}
        >
            {/* Your drawing logic or modification controls go here */}
        </div>
    );
};

export default DrawingBox;
