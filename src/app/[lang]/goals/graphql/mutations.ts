import { gql } from "@apollo/client";

const SAVE_GOAL_MUTATION = gql`
  mutation SaveGoal($saveGoalDto: SaveGoalDto!, $id: ID) {
    saveGoal(saveGoalDto: $saveGoalDto, id: $id) {
      id
      name
      description
      tasks {
        name
        link
        completed
      }
    }
  }
`;

const DELETE_GOAL_MUTATION = gql`
  mutation DeleteGoal($id: ID!) {
    deleteGoal(id: $id)
  }
`;

const TOGGLE_TASK_MUTATION = gql`
  mutation ToggleTask($goalId: ID!, $taskId: Int!) {
    toggleTask(goalId: $goalId, taskId: $taskId) {
      goalId
      taskId
      completed
    }
  }
`;

export { SAVE_GOAL_MUTATION, TOGGLE_TASK_MUTATION, DELETE_GOAL_MUTATION };
