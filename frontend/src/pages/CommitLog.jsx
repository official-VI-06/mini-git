import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLog, getDiff } from '../api/api'
import DiffViewer from '../components/DiffViewer'
import CommitGraph from '../components/CommitGraph'
import Navbar from '../components/Navbar'

export default function CommitLog({ session }) {
    const { repoId } = useParams()
    const navigate = useNavigate()

    const [commits, setCommits] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedCommits, setSelectedCommits] = useState([])
    const [diffResult, setDiffResult] = useState(null)
    const [diffLoading, setDiffLoading] = useState(false)

    const fetchLog = async () => {
        const result = await getLog(repoId)
        if (result.success) {
            setCommits(result.data)
        } else {
            setError(result.message)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchLog()
    }, [repoId])

    const handleSelectCommit = (hash) => {
        if (selectedCommits.includes(hash)) {
            setSelectedCommits(selectedCommits.filter(h => h !== hash))
            setDiffResult(null)
        } else if (selectedCommits.length < 2) {
            setSelectedCommits([...selectedCommits, hash])
        }
    }

    const handleDiff = async () => {
        if (selectedCommits.length !== 2) return
        setDiffLoading(true)
        const result = await getDiff(repoId, selectedCommits[0], selectedCommits[1])
        if (result.success) {
            setDiffResult(result.data)
        } else {
            setError(result.message)
        }
        setDiffLoading(false)
    }

    return (
        <div className="min-h-screen w-full bg-gray-950 text-white">
            <Navbar session={session} />

            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <button onClick={() => navigate(`/repo/${repoId}`)}
                            className="text-gray-500 hover:text-gray-300 text-sm mb-2 transition-colors">
                            ← Back to Repo
                        </button>
                        <h1 className="text-3xl font-bold">Commit History</h1>
                    </div>
                    {selectedCommits.length > 0 && (
                        <span className="text-gray-500 text-sm">
                            {selectedCommits.length}/2 commits selected
                        </span>
                    )}
                </div>

                {error && (
                    <p className="text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-4 py-3 mb-6">{error}</p>
                )}
                {loading && <p className="text-gray-400">Loading commits...</p>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left — commit list */}
                    <div>
                        {/* Diff button */}
                        {selectedCommits.length === 2 && (
                            <button
                                onClick={handleDiff}
                                disabled={diffLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-lg mb-6 transition-colors">
                                {diffLoading ? 'Computing diff...' : 'Compare selected commits'}
                            </button>
                        )}

                        {/* Commit cards */}
                        <div className="space-y-3">
                            {commits.map((commit, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleSelectCommit(commit.hash)}
                                    className={`p-4 rounded-xl cursor-pointer border transition ${
                                        selectedCommits.includes(commit.hash)
                                            ? 'border-blue-500 bg-gray-800'
                                            : 'border-gray-800 bg-gray-900 hover:bg-gray-800 hover:border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-mono text-blue-400 text-sm">
                                            {commit.hash?.substring(0, 8)}
                                        </p>
                                        {selectedCommits.includes(commit.hash) && (
                                            <span className="text-xs bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-full">
                                                #{selectedCommits.indexOf(commit.hash) + 1}
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-semibold mb-1">{commit.message}</p>
                                    <div className="flex justify-between text-gray-500 text-sm">
                                        <span>{commit.author}</span>
                                        <span>{new Date(commit.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!loading && commits.length === 0 && (
                            <div className="text-center mt-8 border border-dashed border-gray-800 rounded-xl py-16 px-6">
                                <p className="text-gray-400">No commits yet</p>
                            </div>
                        )}
                    </div>

                    {/* Right — diff viewer + commit graph */}
                    <div>
                        {diffResult && <DiffViewer diff={diffResult} />}
                        <CommitGraph commits={commits} />
                    </div>
                </div>
            </div>
        </div>
    )
}