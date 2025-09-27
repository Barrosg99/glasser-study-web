import { gql } from "@apollo/client";

const GET_MY_GOALS = gql`
  query MyGoals {
    myGoals {
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

export { GET_MY_GOALS };
