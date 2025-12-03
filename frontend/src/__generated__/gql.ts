/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreatePost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      id\n      userId\n      title\n      content\n    }\n  }\n": typeof types.CreatePostDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      name\n      age\n      email\n      phone\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  query GetUserWithPosts($id: Int!) {\n    users(filters: { id: { equals: $id } }) {\n      id\n      name\n      age\n      email\n      phone\n      posts {\n        id\n        title\n        content\n      }\n    }\n  }\n": typeof types.GetUserWithPostsDocument,
    "\n  query GetUsers($filters: UserFilters) {\n    users(filters: $filters) {\n      id\n      name\n      age\n      email\n      phone\n      posts {\n        id\n        title\n        content\n      }\n    }\n  }\n": typeof types.GetUsersDocument,
    "\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      name\n      age\n      email\n      phone\n      updatedAt\n    }\n  }\n": typeof types.UpdateUserDocument,
};
const documents: Documents = {
    "\n  mutation CreatePost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      id\n      userId\n      title\n      content\n    }\n  }\n": types.CreatePostDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      name\n      age\n      email\n      phone\n    }\n  }\n": types.CreateUserDocument,
    "\n  query GetUserWithPosts($id: Int!) {\n    users(filters: { id: { equals: $id } }) {\n      id\n      name\n      age\n      email\n      phone\n      posts {\n        id\n        title\n        content\n      }\n    }\n  }\n": types.GetUserWithPostsDocument,
    "\n  query GetUsers($filters: UserFilters) {\n    users(filters: $filters) {\n      id\n      name\n      age\n      email\n      phone\n      posts {\n        id\n        title\n        content\n      }\n    }\n  }\n": types.GetUsersDocument,
    "\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      name\n      age\n      email\n      phone\n      updatedAt\n    }\n  }\n": types.UpdateUserDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      id\n      userId\n      title\n      content\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePost($input: CreatePostInput!) {\n    createPost(input: $input) {\n      id\n      userId\n      title\n      content\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      name\n      age\n      email\n      phone\n    }\n  }\n"): (typeof documents)["\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      id\n      name\n      age\n      email\n      phone\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUserWithPosts($id: Int!) {\n    users(filters: { id: { equals: $id } }) {\n      id\n      name\n      age\n      email\n      phone\n      posts {\n        id\n        title\n        content\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetUserWithPosts($id: Int!) {\n    users(filters: { id: { equals: $id } }) {\n      id\n      name\n      age\n      email\n      phone\n      posts {\n        id\n        title\n        content\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUsers($filters: UserFilters) {\n    users(filters: $filters) {\n      id\n      name\n      age\n      email\n      phone\n      posts {\n        id\n        title\n        content\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetUsers($filters: UserFilters) {\n    users(filters: $filters) {\n      id\n      name\n      age\n      email\n      phone\n      posts {\n        id\n        title\n        content\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      name\n      age\n      email\n      phone\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      name\n      age\n      email\n      phone\n      updatedAt\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;