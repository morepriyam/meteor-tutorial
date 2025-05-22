import { Meteor } from "meteor/meteor";
import { TaskType, TasksCollection } from "/imports/api/TasksCollection";
import "../imports/api/TasksPublication";
import "../imports/api/tasksMethods";
import { Accounts } from "meteor/accounts-base";

const insertTask = async (taskText: string , user: Meteor.User): Promise<void> => {
  const task: Omit<TaskType , "_id"> = { text: taskText , createdAt: new Date(), userId: user._id};
  await TasksCollection.insertAsync(task);
};

const SEED_USERNAME = 'admin';
const SEED_PASSWORD = 'admin';

Meteor.startup(async () => {
if (!(await Accounts.findUserByUsername(SEED_USERNAME))) {
    await Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }

  const count = await TasksCollection.find().countAsync();
  const user = await Accounts.findUserByUsername(SEED_USERNAME);

  if (!user) {
    throw new Error(`Seed user '${SEED_USERNAME}' not found.`);
  }

  if (count === 0) {
    const defaultTasks: string[] = [
      "First Task",
      "Second Task",
      "Third Task",
      "Fourth Task",
      "Fifth Task",
      "Sixth Task",
      "Seventh Task",
    ];

    for (const taskText of defaultTasks) {
      await insertTask(taskText , user);
    }
  }
});
