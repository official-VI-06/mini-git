import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'
import { addFile, commitFiles, createBranch, checkoutBranch } from '../api/api'

export default function Repository({ session }) {
  const { repoId } = useParams()
  const navigate = useNavigate()

  const [repoName, setRepoName] = useState('')
  const [currentBranch, setCurrentBranch] = useState('main')
  const [branches, setBranches] = useState([])
  const [filePath, setFilePath] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [commitMessage, setCommitMessage] = useState('')
  const [stagedFiles, setStagedFiles] = useState([])
  const [newBranchName, setNewBranchName] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const fetchRepoData = async () => {
    // Repo name
    const { data: repoData } = await supabase
      .from('repos')
      .select('name')
      .eq('id', repoId)
      .single()
    if (repoData) setRepoName(repoData.name)

    // Current HEAD
    const { data: headData } = await supabase
      .from('head')
      .select('branch_name')
      .eq('repo_id', repoId)
      .single()
    if (headData) setCurrentBranch(headData.branch_name)

    // All branches
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

  const handleAddFile = async (e) => {
    e.preventDefault()
    setError(null)
    const result = await addFile(repoId, filePath, fileContent)
    if (result.success) {
      setSuccess(`File staged: ${filePath}`)
      setFilePath('')
      setFileContent('')
      fetchStagedFiles()
    } else {
      setError(result.message)
    }
  }

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
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{repoName}</h1>
          <span className="text-green-400 text-sm">branch: {currentBranch}</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/repo/${repoId}/log`)}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            Commit Log
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Feedback messages */}
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {success && <p className="text-green-400 mb-4">{success}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column — file editor + commit */}
        <div>
          {/* Add file form */}
          <div className="bg-gray-900 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Add File</h2>
            <form onSubmit={handleAddFile}>
              <input
                type="text"
                placeholder="File path (e.g. src/Main.java)"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 rounded-lg mb-3 outline-none"
                required
              />
              <textarea
                placeholder="File content..."
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 rounded-lg mb-3 outline-none h-48 font-mono"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg"
              >
                Stage File
              </button>
            </form>
          </div>

          {/* Staged files */}
          <div className="bg-gray-900 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Staged Files ({stagedFiles.length})
            </h2>
            {stagedFiles.length === 0 ? (
              <p className="text-gray-400">No files staged</p>
            ) : (
              stagedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <span className="text-green-400">+</span>
                  <span className="text-gray-300 font-mono">{f.file_path}</span>
                </div>
              ))
            )}
          </div>

          {/* Commit form */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Commit</h2>
            <form onSubmit={handleCommit}>
              <input
                type="text"
                placeholder="Commit message"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 rounded-lg mb-3 outline-none"
                required
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg"
              >
                Commit
              </button>
            </form>
          </div>
        </div>

        {/* Right column — branches */}
        <div>
          {/* Create branch */}
          <div className="bg-gray-900 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Create Branch</h2>
            <form onSubmit={handleCreateBranch} className="flex gap-3">
              <input
                type="text"
                placeholder="Branch name"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                className="flex-1 bg-gray-800 text-white p-3 rounded-lg outline-none"
                required
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg"
              >
                Create
              </button>
            </form>
          </div>

          {/* Branch list */}
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Branches</h2>
            {branches.length === 0 ? (
              <p className="text-gray-400">No branches yet</p>
            ) : (
              branches.map((branch, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center mb-3 p-3 bg-gray-800 rounded-lg"
                >
                  <span
                    className={
                      branch === currentBranch
                        ? 'text-green-400 font-semibold'
                        : 'text-gray-300'
                    }
                  >
                    {branch}
                    {branch === currentBranch && ' ✓'}
                  </span>
                  {branch !== currentBranch && (
                    <button
                      onClick={() => handleCheckout(branch)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Checkout
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}