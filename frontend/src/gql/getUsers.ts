import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers($filters: UserFilters, $orderBy: UserOrderBy) {
    users(filters: $filters, orderBy: $orderBy) {
      id
      name
      age
      email
      phone
      posts {
        id
        title
        content
      }
    }
  }
`
