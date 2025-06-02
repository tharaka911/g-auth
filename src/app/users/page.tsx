'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ email: '', name: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to create user')
      
      setFormData({ email: '', name: '' })
      fetchUsers() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Users Management</h1>
      
      {/* Create User Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={createUser} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email (required)
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name (optional)
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Users ({users.length})</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">No users found. Create your first user above!</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{user.name || 'No name'}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">ID: {user.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}