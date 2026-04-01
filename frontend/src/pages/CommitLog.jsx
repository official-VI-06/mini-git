import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLog, getDiff } from '../api/api'
import DiffViewer from '../components/DiffViewer'
import CommitGraph from '../components/CommitGraph'

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
        <div className="min-h-screen bg-gray-950 text-white p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Commit History</h1>
                <button onClick={() => navigate(`/repo/${repoId}`)}
                    className="text-gray-400 hover:text-white">
                    ← Back to Repo
                </button>
            </div>

            {error && <p className="text-red-400 mb-4">{error}</p>}
            {loading && <p className="text-gray-400">Loading commits...</p>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left — commit list */}
                <div>
                    {/* Diff button */}
                    {selectedCommits.length === 2 && (
                        <button
                            onClick={handleDiff}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg mb-6">
                            {diffLoading ? 'Computing diff...' : 'Compare selected commits'}
                        </button>
                    )}

                    {/* Commit cards */}
                    {commits.map((commit, i) => (
                        <div
                            key={i}
                            onClick={() => handleSelectCommit(commit.hash)}
                            className={`p-4 rounded-lg mb-3 cursor-pointer border transition ${
                                selectedCommits.includes(commit.hash)
                                    ? 'border-blue-500 bg-gray-800'
                                    : 'border-gray-700 bg-gray-900 hover:bg-gray-800'
                            }`}
                        >
                            <p className="font-mono text-blue-400 text-sm mb-1">
                                {commit.hash?.substring(0, 8)}
                            </p>
                            <p className="font-semibold mb-1">{commit.message}</p>
                            <div className="flex justify-between text-gray-400 text-sm">
                                <span>{commit.author}</span>
                                <span>{new Date(commit.timestamp).toLocaleString()}</span>
                            </div>
                            {selectedCommits.includes(commit.hash) && (
                                <p className="text-blue-400 text-xs mt-2">
                                    Selected #{selectedCommits.indexOf(commit.hash) + 1}
                                </p>
                            )}
                        </div>
                    ))}

                    {!loading && commits.length === 0 && (
                        <p className="text-gray-400 text-center mt-8">No commits yet</p>
                    )}
                </div>

                {/* Right — diff viewer + commit graph */}
                <div>
                    {diffResult && <DiffViewer diff={diffResult} />}
                    <CommitGraph commits={commits} />
                </div>
            </div>
        </div>
    )
}