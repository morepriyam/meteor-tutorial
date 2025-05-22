import React from "react";
import { TaskType } from "../api/TasksCollection";

interface TaskProps {
  task: TaskType;
  onCheckboxClick: (task: TaskType) => void;
  onDeleteClick: (task: TaskType) => void;
}
export const Task = ({ task, onCheckboxClick, onDeleteClick }: TaskProps) => {
  return (
    <li>
      <input
        type="checkbox"
        checked={!!task.isChecked}
        onClick={() => onCheckboxClick(task)}
        readOnly
      />
      {task.text}
      <button onClick={() => onDeleteClick(task)}>&times;</button>
    </li>
  );
};
