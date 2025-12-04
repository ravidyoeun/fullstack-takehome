import { memo, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react'
import {
  GetUsersDocument,
  GetUserWithPostsDocument,
  UpdateUserDocument,
  CreateUserDocument,
  CreatePostDocument,
  type GetUsersQuery,
  type GetUsersQueryVariables,
  type GetUserWithPostsQuery,
  type UpdateUserMutation,
  type CreateUserMutation,
  type CreatePostMutation,
} from '../../__generated__/graphql'

import { TableFilters } from './TableFilters'
import { GenericCell } from './cells/GenericCell'
import { LoadingSpinner } from '../LoadingSpinner'

type OrderDirectionType = 'ASC' | 'DESC' | null
type OrderState = { id: OrderDirectionType; name: OrderDirectionType }

type TableContentProps = {
  searchValue: string
  onViewUser: (userId: number) => void
  onHoverPosts: (posts: GetUsersQuery['users'][0]['posts'], pos: { x: number; y: number }) => void
  onLeavePosts: () => void
  orderBy: OrderState
  onSortChange: Dispatch<SetStateAction<OrderState>>
}

const TableContent = memo(({ searchValue, onViewUser, onHoverPosts, onLeavePosts, orderBy, onSortChange }: TableContentProps) => {
  const columnHelper = createColumnHelper<GetUsersQuery['users'][0]>()

  const renderSortIcon = (dir: OrderDirectionType) => {
    if (dir === 'ASC') {
      return <span className="text-blue-700">▲</span>
    }
    if (dir === 'DESC') {
      return <span className="text-blue-700">▼</span>
    }
    return (
      <span className="text-gray-300">
        ▲▼
      </span>
    )
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => (
          <button
            className="flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 hover:text-blue-700"
            onClick={() =>
              onSortChange(prev => ({
                ...prev,
                id: prev.id === 'ASC' ? 'DESC' : 'ASC',
                name: null,
              }))
            }
          >
            ID
            {renderSortIcon(orderBy.id)}
          </button>
        ),
        cell: info => <GenericCell value={info.getValue()} />,
      }),
      columnHelper.accessor('name', {
        header: () => (
          <button
            className="flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 hover:text-blue-700"
            onClick={() =>
              onSortChange(prev => ({
                ...prev,
                name: prev.name === 'ASC' ? 'DESC' : 'ASC',
                id: null,
              }))
            }
          >
            Name
            {renderSortIcon(orderBy.name)}
          </button>
        ),
        cell: info => <GenericCell value={info.getValue()} />,
      }),
      columnHelper.accessor('age', {
        header: 'Age',
        cell: info => <GenericCell value={info.getValue()} />,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: info => <GenericCell value={info.getValue()} />,
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
        cell: info => <GenericCell value={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'posts',
        header: 'Posts',
        cell: info => {
          const posts = info.row.original.posts ?? []
          const hasPosts = posts.length > 0
          return (
            <span
              className={`rounded px-2 py-1 text-xs font-semibold ${
                hasPosts ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
              onMouseEnter={event => {
                if (!hasPosts) return
                onHoverPosts(posts, { x: event.clientX, y: event.clientY })
              }}
              onMouseLeave={onLeavePosts}
            >
              {posts.length}
            </span>
          )
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Profile',
        cell: info => (
          <button
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            onClick={() => onViewUser(info.row.original.id)}
          >
            View
          </button>
        ),
      }),
    ],
    [columnHelper, onHoverPosts, onLeavePosts, onViewUser, orderBy.id, orderBy.name, onSortChange]
  )

  const trimmedSearch = searchValue.trim()
  const filters = useMemo<GetUsersQueryVariables['filters']>(() => {
    if (!trimmedSearch) return {}
    return { search: trimmedSearch }
  }, [trimmedSearch])

  const { data: usersData, loading, error } = useQuery(GetUsersDocument, {
    variables: {
      filters,
      orderBy,
    },
  })
  
  const data: GetUsersQuery['users'] = usersData?.users ?? []
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  
  if (loading) return (
    <div className="p-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <LoadingSpinner label="Loading users..." />
      </div>
    </div>
  )
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto" onMouseLeave={onLeavePosts}>
        <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  )
})

export const Table = () => {
  const [searchValue, setSearchValue] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [hoverPosts, setHoverPosts] = useState<{
    posts: GetUsersQuery['users'][0]['posts']
    x: number
    y: number
  } | null>(null)
  const [createUserErrors, setCreateUserErrors] = useState<string[]>([])
  const [createUserFieldErrors, setCreateUserFieldErrors] = useState<Record<string, string>>({})
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
  })
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [createPostForm, setCreatePostForm] = useState({
    title: '',
    content: '',
  })
  const [postError, setPostError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editErrors, setEditErrors] = useState<string[]>([])
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({})
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
  })
  const [orderBy, setOrderBy] = useState<OrderState>({ id: null, name: null })
  const [getUserWithPosts, { data: userDetail, loading: detailLoading, error: detailError }] =
    useLazyQuery<GetUserWithPostsQuery>(GetUserWithPostsDocument)
  const [updateUser, { loading: updateLoading }] = useMutation<UpdateUserMutation>(UpdateUserDocument, {
    refetchQueries: [GetUsersDocument, GetUserWithPostsDocument],
  })
  const [createUser, { loading: createUserLoading }] = useMutation<CreateUserMutation>(CreateUserDocument, {
    refetchQueries: [GetUsersDocument],
  })
  const [createPost, { loading: createPostLoading }] = useMutation<CreatePostMutation>(CreatePostDocument, {
    refetchQueries: [GetUsersDocument, GetUserWithPostsDocument],
  })

  const handleViewUser = (id: number) => {
    setSelectedUserId(id)
    getUserWithPosts({ variables: { id } })
    setIsEditing(false)
  }

  const selectedUser = userDetail?.users?.[0]

  useEffect(() => {
    if (isEditing && selectedUser) {
      setEditForm({
        name: selectedUser.name ?? '',
        email: selectedUser.email ?? '',
        phone: selectedUser.phone ?? '',
        age: selectedUser.age ? String(selectedUser.age) : '',
      })
    }
  }, [isEditing, selectedUser])

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  const validatePhone = (value: string) => /^\d{3}-\d{3}-\d{4}$/.test(value)
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  useEffect(() => {
    const clearHover = () => setHoverPosts(null)
    window.addEventListener('mousedown', clearHover)
    return () => window.removeEventListener('mousedown', clearHover)
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex flex-col gap-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Users</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold text-slate-900">Directory</div>
            <p className="text-sm text-gray-600">
              Search, inspect profiles, and hover posts for quick context.
            </p>
          </div>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            onClick={() => {
              setCreateUserErrors([])
              setShowCreateUserModal(true)
            }}
          >
            + New User
          </button>
        </div>
      </div>

      <TableFilters searchValue={searchValue} setSearchValue={setSearchValue} />
      <TableContent
        searchValue={searchValue}
        onViewUser={handleViewUser}
        onHoverPosts={(posts, pos) => setHoverPosts({ posts, ...pos })}
        onLeavePosts={() => setHoverPosts(null)}
        orderBy={orderBy}
        onSortChange={setOrderBy}
      />

      {hoverPosts && (
        <div
          className="pointer-events-none fixed z-50 w-80 max-w-[90vw] -translate-y-2 rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-800 shadow-xl"
          style={{ left: hoverPosts.x + 12, top: hoverPosts.y + 12 }}
        >
          <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Posts</div>
          <div className="space-y-2">
            {hoverPosts.posts.map(post => (
              <div key={post.id} className="rounded border border-gray-100 bg-gray-50 p-2">
                <div className="font-medium text-gray-900">{post.title ?? 'Untitled'}</div>
                {post.content && <div className="text-gray-700">{post.content}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedUserId !== null && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          {detailLoading && <LoadingSpinner label="Loading profile..." size="sm" />}
          {detailError && (
            <div className="text-sm text-red-500">Error loading profile: {detailError.message}</div>
          )}
          {selectedUser && (
            <>
              <div className="mb-4 flex items-start justify-between">
                <div>
                <div className="text-xl font-semibold text-slate-900">
                    {selectedUser.name ?? 'Unknown user'}
                  </div>
                  <div className="text-sm text-gray-500">ID: {selectedUser.id}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow"
                    onClick={() => {
                      setEditErrors([])
                      setIsEditing(editing => !editing)
                    }}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                  <button
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow"
                    onClick={() => setSelectedUserId(null)}
                  >
                    Close
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-3 space-y-3">
                  {editErrors.length > 0 && (
                    <ul className="space-y-1 text-sm text-red-600">
                      {editErrors.map(err => (
                        <li key={err}>• {err}</li>
                      ))}
                    </ul>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium text-gray-700">
                      Name
                      <input
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                      <input
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={editForm.email}
                        onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                      />
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      Phone
                      <input
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm outline-none ${
                          editFieldErrors.phone
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                        placeholder="123-456-7890"
                        value={editForm.phone}
                        onChange={e => {
                          const formatted = formatPhone(e.target.value)
                          setEditForm(f => ({ ...f, phone: formatted }))
                          if (editFieldErrors.phone) setEditFieldErrors(errs => ({ ...errs, phone: '' }))
                        }}
                      />
                      {editFieldErrors.phone && (
                        <div className="mt-1 text-xs text-red-600">{editFieldErrors.phone}</div>
                      )}
                    </label>
                    <label className="text-sm font-medium text-gray-700">
                      Age
                      <input
                        className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm outline-none ${
                          editFieldErrors.age
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                        }`}
                        value={editForm.age}
                        onChange={e => {
                          const val = e.target.value.replace(/[^\d]/g, '')
                          setEditForm(f => ({ ...f, age: val }))
                          if (editFieldErrors.age) setEditFieldErrors(errs => ({ ...errs, age: '' }))
                        }}
                      />
                      {editFieldErrors.age && (
                        <div className="mt-1 text-xs text-red-600">{editFieldErrors.age}</div>
                      )}
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <button
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      onClick={async () => {
                        if (!selectedUserId) return
                        const errors: string[] = []
                        const ageNumber = editForm.age ? Number.parseInt(editForm.age, 10) : undefined
                        if (editForm.email && !validateEmail(editForm.email.trim())) {
                          errors.push('Valid email is required.')
                          editFieldErrors.email = 'Enter a valid email.'
                        }
                        if (editForm.phone && !validatePhone(editForm.phone.trim())) {
                          errors.push('Phone must be ###-###-####.')
                          editFieldErrors.phone = 'Format phone as ###-###-####.'
                        }
                        if (editForm.age && (ageNumber === undefined || Number.isNaN(ageNumber) || ageNumber <= 0)) {
                          errors.push('Age must be a positive number.')
                          editFieldErrors.age = 'Enter a positive number.'
                        }
                        if (errors.length > 0) {
                          setEditErrors(errors)
                          setEditFieldErrors({ ...editFieldErrors })
                          return
                        }
                        setEditErrors([])
                        setEditFieldErrors({})
                        await updateUser({
                          variables: {
                            input: {
                              id: selectedUserId,
                              name: editForm.name || null,
                              email: editForm.email ? editForm.email.trim() : null,
                              phone: editForm.phone ? editForm.phone.trim() : null,
                              age: Number.isNaN(ageNumber) ? null : ageNumber ?? null,
                            },
                          },
                        })
                        await getUserWithPosts({ variables: { id: selectedUserId } })
                        setIsEditing(false)
                      }}
                    >
                      {updateLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="text-xs font-semibold uppercase text-gray-500">Email</div>
                      <div className="text-sm text-gray-800">{selectedUser.email ?? '—'}</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="text-xs font-semibold uppercase text-gray-500">Phone</div>
                      <div className="text-sm text-gray-800">{selectedUser.phone ?? '—'}</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="text-xs font-semibold uppercase text-gray-500">Age</div>
                      <div className="text-sm text-gray-800">{selectedUser.age ?? '—'}</div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 text-sm font-semibold text-gray-800">Add Post</div>
                    {postError && <div className="mb-2 text-sm text-red-600">{postError}</div>}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="text-sm font-medium text-gray-700">
                        Title
                        <input
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          value={createPostForm.title}
                          onChange={e => setCreatePostForm(f => ({ ...f, title: e.target.value }))}
                        />
                      </label>
                      <label className="text-sm font-medium text-gray-700">
                        Content
                        <input
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          value={createPostForm.content}
                          onChange={e => setCreatePostForm(f => ({ ...f, content: e.target.value }))}
                        />
                      </label>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                        disabled={createPostLoading}
                        onClick={async () => {
                          setPostError(null)
                          if (!createPostForm.title.trim()) {
                            setPostError('Title is required.')
                            return
                          }
                          if (!selectedUserId) return
                          await createPost({
                            variables: {
                              input: {
                                userId: selectedUserId,
                                title: createPostForm.title.trim(),
                                content: createPostForm.content.trim() || null,
                              },
                            },
                          })
                          setCreatePostForm({ title: '', content: '' })
                          await getUserWithPosts({ variables: { id: selectedUserId } })
                        }}
                      >
                        {createPostLoading ? 'Saving...' : 'Add Post'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 text-sm font-semibold text-gray-800">Posts</div>
                    <div className="space-y-2">
                      {selectedUser.posts.length === 0 && (
                        <div className="text-sm text-gray-600">No posts found.</div>
                      )}
                      {selectedUser.posts.map(post => (
                        <div key={post.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {post.title ?? 'Untitled'}
                          </div>
                          {post.content && <div className="mt-1 text-sm text-gray-700">{post.content}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold text-slate-900">Create User</div>
                <p className="text-sm text-gray-600">
                  Enter basic details. Email must be valid; phone accepts digits plus + ( ) - . and spaces.
                </p>
              </div>
              <button
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow"
                onClick={() => setShowCreateUserModal(false)}
              >
                Close
              </button>
            </div>

            {createUserErrors.length > 0 && (
              <ul className="mb-3 space-y-1 text-sm text-red-600">
                {createUserErrors.map(err => (
                  <li key={err}>• {err}</li>
                ))}
              </ul>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Name
                <input
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={createUserForm.name}
                  onChange={e => {
                    const val = e.target.value
                    setCreateUserForm(f => ({ ...f, name: val }))
                    if (createUserFieldErrors.name) {
                      setCreateUserFieldErrors(errs => ({ ...errs, name: '' }))
                    }
                  }}
                />
                {createUserFieldErrors.name && (
                  <div className="mt-1 text-xs text-red-600">{createUserFieldErrors.name}</div>
                )}
              </label>
              <label className="text-sm font-medium text-gray-700">
                Email
                <input
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm outline-none ${
                    createUserFieldErrors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                  value={createUserForm.email}
                  onChange={e => {
                    const val = e.target.value
                    setCreateUserForm(f => ({ ...f, email: val }))
                    if (createUserFieldErrors.email) {
                      setCreateUserFieldErrors(errs => ({ ...errs, email: '' }))
                    }
                  }}
                />
                {createUserFieldErrors.email && (
                  <div className="mt-1 text-xs text-red-600">{createUserFieldErrors.email}</div>
                )}
              </label>
              <label className="text-sm font-medium text-gray-700">
                Phone
                <input
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm outline-none ${
                    createUserFieldErrors.phone
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                  placeholder="123-456-7890"
                  value={createUserForm.phone}
                  onChange={e => {
                    const formatted = formatPhone(e.target.value)
                    setCreateUserForm(f => ({ ...f, phone: formatted }))
                    if (createUserFieldErrors.phone) {
                      setCreateUserFieldErrors(errs => ({ ...errs, phone: '' }))
                    }
                  }}
                />
                {createUserFieldErrors.phone && (
                  <div className="mt-1 text-xs text-red-600">{createUserFieldErrors.phone}</div>
                )}
              </label>
              <label className="text-sm font-medium text-gray-700">
                Age
                <input
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-gray-900 shadow-sm outline-none ${
                    createUserFieldErrors.age
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`}
                  value={createUserForm.age}
                  onChange={e => {
                    const val = e.target.value.replace(/[^\d]/g, '')
                    setCreateUserForm(f => ({ ...f, age: val }))
                    if (createUserFieldErrors.age) {
                      setCreateUserFieldErrors(errs => ({ ...errs, age: '' }))
                    }
                  }}
                />
                {createUserFieldErrors.age && (
                  <div className="mt-1 text-xs text-red-600">{createUserFieldErrors.age}</div>
                )}
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow"
                onClick={() => {
                  setShowCreateUserModal(false)
                  setCreateUserErrors([])
                }}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
                disabled={createUserLoading}
                onClick={async () => {
                  const errors: string[] = []
                  const fieldErrors: Record<string, string> = {}
                  const ageNumber = createUserForm.age ? Number.parseInt(createUserForm.age, 10) : NaN
                  if (!createUserForm.name.trim()) errors.push('Name is required.')
                  if (!createUserForm.email.trim() || !validateEmail(createUserForm.email.trim())) {
                    errors.push('Valid email is required.')
                    fieldErrors.email = 'Enter a valid email address.'
                  }
                  if (!createUserForm.phone.trim() || !validatePhone(createUserForm.phone.trim())) {
                    errors.push('Phone must be formatted as ###-###-####.')
                    fieldErrors.phone = 'Format phone as ###-###-####.'
                  }
                  if (Number.isNaN(ageNumber) || ageNumber <= 0) {
                    errors.push('Age must be a positive number.')
                    fieldErrors.age = 'Enter a positive number.'
                  }
                  if (!createUserForm.name.trim()) {
                    fieldErrors.name = 'Name is required.'
                  }

                  if (errors.length > 0) {
                    setCreateUserErrors(errors)
                    setCreateUserFieldErrors(fieldErrors)
                    return
                  }

                  setCreateUserErrors([])
                  setCreateUserFieldErrors({})
                  await createUser({
                    variables: {
                      input: {
                        name: createUserForm.name.trim(),
                        email: createUserForm.email.trim(),
                        phone: createUserForm.phone.trim(),
                        age: ageNumber,
                      },
                    },
                  })
                  setCreateUserForm({ name: '', email: '', phone: '', age: '' })
                  setShowCreateUserModal(false)
                }}
              >
                {createUserLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
