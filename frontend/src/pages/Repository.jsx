import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { addFile, commitFiles, createBranch, checkoutBranch } from '../api/api'
import FileEditor from '../components/FileEditor'
import Navbar from '../components/Navbar'
import './Login.css';

export default function Repository({ session }) {
  const { repoId } = useParams()
  const navigate = useNavigate()

  const [repoName, setRepoName] = useState('')
  const [currentBranch, setCurrentBranch] = useState('main')
  const [branches, setBranches] = useState([])
  const [commitMessage, setCommitMessage] = useState('')
  const [stagedFiles, setStagedFiles] = useState([])
  const [newBranchName, setNewBranchName] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const fetchRepoData = async () => {
    const { data: repoData } = await supabase
      .from('repos')
      .select('name')
      .eq('id', repoId)
      .single()
    if (repoData) setRepoName(repoData.name)

    const { data: headData } = await supabase
      .from('head')
      .select('branch_name')
      .eq('repo_id', repoId)
      .single()
    if (headData) setCurrentBranch(headData.branch_name)

    const { data: branchData } = await supabase
      .from('refs')
      .select('name')
      .eq('repo_id', repoId)
    if (branchData) setBranches(branchData.map(b => b.name))
  }

  const fetchStagedFiles = async () => {
    const { data } = await supabase
      .from('staging')
      .select('file_path, blob_hash')
      .eq('repo_id', repoId)
    if (data) setStagedFiles(data)
  }

  useEffect(() => {
    fetchRepoData()
    fetchStagedFiles()
  }, [repoId])

  const handleCommit = async (e) => {
    e.preventDefault()
    setError(null)
    const result = await commitFiles(repoId, commitMessage, session.user.email)
    if (result.success) {
      setSuccess('Committed successfully!')
      setCommitMessage('')
      fetchStagedFiles()
    } else {
      setError(result.message)
    }
  }

  const handleCreateBranch = async (e) => {
    e.preventDefault()
    const result = await createBranch(repoId, newBranchName)
    if (result.success) {
      setSuccess(`Branch created: ${newBranchName}`)
      setNewBranchName('')
      fetchRepoData()
    } else {
      setError(result.message)
    }
  }

  const handleCheckout = async (branch) => {
    const result = await checkoutBranch(repoId, branch)
    if (result.success) {
      setCurrentBranch(branch)
      setSuccess(`Switched to ${branch}`)
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-950 text-white">
      <Navbar session={session} />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-300 text-sm mb-2 transition-colors"
            >
              ← Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white!">{repoName}</h1>
            <span className="inline-flex items-center gap-1.5 text-green-400 text-sm mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              branch: {currentBranch}
            </span>
          </div>
          <button
            onClick={() => navigate(`/repo/${repoId}/log`)}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Commit Log
          </button>
        </div>

        {/* Feedback messages */}
        {error && (
          <p className="text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-4 py-3 mb-6">{error}</p>
        )}
        {success && (
          <p className="text-green-400 bg-green-950/40 border border-green-900 rounded-lg px-4 py-3 mb-6">{success}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left column — file editor + staged files + commit */}
          <div>

            {/* File editor */}
            <div className="mb-6">
              <FileEditor onStage={(filePath, content) => {
                addFile(repoId, filePath, content).then(result => {
                  if (result.success) {
                    setSuccess(`File staged: ${filePath}`)
                    fetchStagedFiles()
                  } else {
                    setError(result.message)
                  }
                })
              }} />
            </div>

            {/* Staged files */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl mb-6">
              <h2 className="login-heading text-lg font-bold mb-4">
                Staged Files <span className="text-gray-500 font-normal">({stagedFiles.length})</span>
              </h2>
              {stagedFiles.length === 0 ? (
                <p className="text-gray-500 text-sm">No files staged</p>
              ) : (
                <div className="space-y-1.5">
                  {stagedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-950/60 rounded-lg px-3 py-2">
                      <span className="text-green-400 font-mono">+</span>
                      <span className="text-gray-300 font-mono text-sm">{f.file_path}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commit form */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h2 className="login-heading text-lg font-bold mb-4">Commit</h2>
              <form onSubmit={handleCommit}>
                <input
                  type="text"
                  id="commit-message"
                  name="commit-message"
                  placeholder="Commit message"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full bg-gray-800 text-white p-3 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
                <button
                  type="submit"
                  disabled={stagedFiles.length === 0}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Commit
                </button>
              </form>
            </div>

          </div>

          {/* Right column — branches */}
          <div>

            {/* Create branch */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl mb-6">
              <h2 className="login-heading text-lg font-bold mb-4">Create Branch</h2>
              <form onSubmit={handleCreateBranch} className="flex gap-3">
                <input
                  type="text"
                  id="branch-name"
                  name="branch-name"
                  placeholder="Branch name"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="flex-1 bg-gray-800 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 transition"
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
              </form>
            </div>

            {/* Branch list */}
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
              <h2 className="login-heading text-lg font-bold mb-4">Branches</h2>
              {branches.length === 0 ? (
                <p className="text-gray-500 text-sm">No branches yet</p>
              ) : (
                <div className="space-y-2">
                  {branches.map((branch, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-gray-800 rounded-lg"
                    >
                      <span className={branch === currentBranch
                        ? 'text-green-400 font-semibold flex items-center gap-1.5'
                        : 'text-gray-300'}
                      >
                        {branch}
                        {branch === currentBranch && (
                          <span className="text-xs bg-green-900/60 text-green-400 px-1.5 py-0.5 rounded">current</span>
                        )}
                      </span>
                      {branch !== currentBranch && (
                        <button
                          onClick={() => handleCheckout(branch)}
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          Checkout
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}