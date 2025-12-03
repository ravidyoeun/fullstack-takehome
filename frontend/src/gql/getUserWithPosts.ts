import { gql } from '@apollo/client'

export const GET_USER_WITH_POSTS = gql`
  query GetUserWithPosts($id: Int!) {
    users(filters: { id: { equals: $id } }) {
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
