import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const KanbanColumn = ({ title, tasks, onTaskClick }) => {
  const { setNodeRef } = useDroppable({
    id: title,
    data: {
      type: 'column',
    },
  });

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {title} ({tasks.length})
      </h3>
      <div
        ref={setNodeRef}
        className="space-y-3 min-h-[200px]"
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn; 