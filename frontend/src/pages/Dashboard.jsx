import { useState, useEffect } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { initRepo } from '../api/api'

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const [repos, setRepos] = useState([])
  const [newRepoName, setNewRepoName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchRepos = async () => {
    const { data, error } = await supabase
      .from('repos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setRepos(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchRepos()
  }, [])

  const handleCreateRepo = async (e) => {
    e.preventDefault()
    const result = await initRepo(newRepoName, session.user.id)
    if (result.success) {
      setNewRepoName('')
      fetchRepos() // refresh the list
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Repositories</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-gray-400 hover:text-white"
        >
          Sign out
        </button>
      </div>

      {/* Create repo form */}
      <form onSubmit={handleCreateRepo} className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="New repository name"
          value={newRepoName}
          onChange={(e) => setNewRepoName(e.target.value)}
          className="bg-gray-800 text-white p-3 rounded-lg flex-1 outline-none"
          required
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg"
        >
          Create Repository
        </button>
      </form>

      {/* Error display */}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* Loading state */}
      {loading && <p className="text-gray-400">Loading repositories...</p>}

      {/* Repo cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            onClick={() => navigate(`/repo/${repo.id}`)}
            className="bg-gray-900 p-6 rounded-lg cursor-pointer hover:bg-gray-800 transition"
          >
            <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>
            <p className="text-gray-400 text-sm">
              {new Date(repo.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!loading && repos.length === 0 && (
        <p className="text-gray-400 text-center mt-16">
          No repositories yet — create your first one above!
        </p>
      )}
    </div>
  )
}