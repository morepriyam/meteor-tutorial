import { Mongo } from "meteor/mongo";

export interface TaskType {
  _id: string | number;
  text: string;
  createdAt: Date;
  isChecked?: boolean;
  userId: string;
}

export const TasksCollection = new Mongo.Collection<TaskType>("tasks");
