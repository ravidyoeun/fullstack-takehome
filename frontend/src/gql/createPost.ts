import { gql } from '@apollo/client'

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      userId
      title
      content
    }
  }
`
