import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_NOTIFICATION_GRAPHQL_ENDPOINT,
});

let token = "";

if (typeof window !== "undefined") {
  token = JSON.parse(localStorage.getItem("token") || "{}");
}

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_NOTIFICATION_WS_GRAPHQL_ENDPOINT || "",
    connectionParams: {
      Authorization: token,
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const notificationClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default notificationClient;
