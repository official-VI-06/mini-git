import { useState, useEffect } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { initRepo } from '../api/api'
import Navbar from '../components/Navbar'
import './Login.css';

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
    <div className="min-h-screen w-full bg-gray-950 text-white">
      <Navbar session={session} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white!">My Repositories</h1>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? 'Loading…' : `${repos.length} repositor${repos.length === 1 ? 'y' : 'ies'}`}
            </p>
          </div>
        </div>

        {/* Create repo form */}
        <form onSubmit={handleCreateRepo} className="mb-10 flex gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3">
          <input
            type="text"
            id="repo-name"
            name="repo-name"
            placeholder="New repository name"
            value={newRepoName}
            onChange={(e) => setNewRepoName(e.target.value)}
            className="bg-gray-800 text-white p-3 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 text-white font-medium px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
          >
            + Create Repository
          </button>
        </form>

        {/* Error display */}
        {error && (
          <p className="text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-4 py-3 mb-6">{error}</p>
        )}

        {/* Loading state */}
        {loading && <p className="text-gray-400">Loading repositories...</p>}

        {/* Repo cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => navigate(`/repo/${repo.id}`)}
              className="group bg-gray-900 border border-gray-800 p-6 rounded-xl cursor-pointer hover:bg-gray-800 hover:border-gray-700 transition"
            >
              <h2 className="login-heading text-xl font-bold mb-2 truncate">{repo.name}</h2>
              <p className="text-gray-500 text-sm">
                Created {new Date(repo.created_at).toLocaleDateString()}
              </p>
              <span className="inline-block mt-4 text-blue-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Open repository →
              </span>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && repos.length === 0 && (
          <div className="text-center mt-16 border border-dashed border-gray-800 rounded-xl py-16 px-6">
            <p className="text-gray-400">No repositories yet — create your first one above!</p>
          </div>
        )}
      </div>
    </div>
  )
}