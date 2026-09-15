import { useState } from 'react'

export default function FileEditor({ onStage }) {
    const [filePath, setFilePath] = useState('')
    const [content, setContent] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!filePath || !content) return
        onStage(filePath, content)
        setFilePath('')
        setContent('')
    }

    return (
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <h2 className="text-lg font-bold mb-4 text-white!">Add File</h2>
            <form onSubmit={handleSubmit}>

                {/* File path input */}
                <input
                    type="text"
                    id="file-path" 
                    name="file-path"
                    placeholder="File path (e.g. src/Main.java)"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    className="w-full bg-gray-800 text-white p-3 rounded-lg mb-3 outline-none font-mono focus:ring-2 focus:ring-blue-500 transition"
                    required
                />

                {/* Line numbers + textarea wrapper */}
                <div className="flex bg-gray-800 rounded-lg mb-3 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition">
                    {/* Line numbers */}
                    <div className="bg-gray-700 text-gray-500 p-3 text-right font-mono text-sm select-none min-w-10">
                        {content.split('\n').map((_, i) => (
                            <div key={i}>{i + 1}</div>
                        ))}
                    </div>
                    {/* Code textarea */}
                    <textarea
                        id="file-content"
                        name="file-content"
                        placeholder="File content..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-1 bg-transparent text-white p-3 outline-none font-mono text-sm h-48 resize-none"
                        required
                    />
                </div>

                {/* File info bar */}
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs font-mono">
                        {content.split('\n').length} lines · {content.length} chars
                    </span>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors">
                        Stage File
                    </button>
                </div>

            </form>
        </div>
    )
}