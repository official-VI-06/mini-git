import { useEffect, useRef } from 'react'

export default function CommitGraph({ commits }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!commits || commits.length === 0) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        const nodeRadius = 8
        const nodeX = 40
        const rowHeight = 60
        canvas.height = commits.length * rowHeight + 40

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        commits.forEach((commit, i) => {
            const y = i * rowHeight + 40

            // Line to parent (next commit)
            if (i < commits.length - 1) {
                ctx.beginPath()
                ctx.moveTo(nodeX, y)
                ctx.lineTo(nodeX, y + rowHeight)
                ctx.strokeStyle = '#4B5563'
                ctx.lineWidth = 2
                ctx.stroke()
            }

            // Node circle
            ctx.beginPath()
            ctx.arc(nodeX, y, nodeRadius, 0, Math.PI * 2)
            ctx.fillStyle = '#3B82F6'
            ctx.fill()

            // Commit hash
            ctx.fillStyle = '#60A5FA'
            ctx.font = '12px monospace'
            ctx.fillText(commit.hash?.substring(0, 8), nodeX + 20, y - 6)

            // Commit message
            ctx.fillStyle = '#E5E7EB'
            ctx.font = '13px sans-serif'
            ctx.fillText(commit.message, nodeX + 20, y + 10)

            // Author
            ctx.fillStyle = '#9CA3AF'
            ctx.font = '11px sans-serif'
            ctx.fillText(commit.author, nodeX + 20, y + 26)
        })
    }, [commits])

    return (
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl mt-6">
            <h2 className="text-lg font-bold mb-4">Commit Graph</h2>
            {commits.length === 0
                ? <p className="text-gray-500 text-sm">No commits to display</p>
                : <canvas
                    ref={canvasRef}
                    width={400}
                    className="w-full"
                  />
            }
        </div>
    )
}