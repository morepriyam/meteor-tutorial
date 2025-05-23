import React, { Fragment, useState } from "react";
import { TasksCollection, TaskType } from "../api/TasksCollection";
import { Task } from "./Task";

// @ts-ignore
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { TaskForm } from "./TaskForm";
import { Meteor } from "meteor/meteor";
import { LoginForm } from "./LoginForm";
import { CameraView } from "./CameraView";

export const App = () => {
  const user = useTracker(() => Meteor.user());
  const [hideCompleted, setHideCompleted] = useState(false);

  const hideCompletedFilter = { isChecked: { $ne: true } };

  const tasks: TaskType[] = useTracker(() => {
    if (!user) {
      return [];
    }

    return TasksCollection.find(hideCompleted ? hideCompletedFilter : {}, {
      sort: { createdAt: -1 },
    }).fetch();
  });
  const pendingTasksCount = useTracker(() => {
    if (!user) {
      return 0;
    }
    return TasksCollection.find(hideCompletedFilter).count();
  });

  const logout = () => Meteor.logout();

  const pendingTasksTitle = `${
    pendingTasksCount ? ` (${pendingTasksCount})` : ""
  }`;

  const handleToggleChecked = async (task: TaskType) => {
    await Meteor.callAsync("tasks.toggleChecked", {
      _id: task._id,
      isChecked: task.isChecked,
    });
  };

  const handleDeleteClick = async (task: TaskType) => {
    await Meteor.callAsync("tasks.delete", { _id: task._id });
  };

  const isLoading = useSubscribe("tasks");
  if (isLoading()) {
    return <div>Loading...</div>;
  }
  return (
    <div className="app">
      {user ? (
        <>
          <header>
            <div className="app-bar">
              <div className="app-header">
                <h1>📝️ To Do List</h1>
                <h2>
                  {pendingTasksCount
                    ? `You have ${pendingTasksTitle} pending tasks`
                    : "No pending tasks"}
                </h2>
              </div>
            </div>
          </header>
          <div className="main">
            <Fragment>
              <div className="user" onClick={logout}>
                {user.username} 🚪
              </div>
              <CameraView />
              <TaskForm />

              <div className="filter">
                <button onClick={() => setHideCompleted(!hideCompleted)}>
                  {hideCompleted ? "Show All" : "Hide Completed"}
                </button>
              </div>

              <ul className="tasks">
                {tasks.map((task) => (
                  <Task
                    key={task._id}
                    task={task}
                    onCheckboxClick={handleToggleChecked}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </ul>
            </Fragment>
          </div>
        </>
      ) : (
        <LoginForm />
      )}
    </div>
  );
};
