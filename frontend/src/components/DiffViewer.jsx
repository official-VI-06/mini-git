import React from 'react'

export default function DiffViewer({ diff }) {
    const getLineStyle = (line) => {
        if (line.startsWith('+ ')) return 'bg-green-900 text-green-300'
        if (line.startsWith('- ')) return 'bg-red-900 text-red-300'
        return 'text-gray-400'
    }

    const getLinePrefix = (line) => {
        if (line.startsWith('+ ')) return '+'
        if (line.startsWith('- ')) return '-'
        return ' '
    }

    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
            <h2 className="text-xl font-semibold p-4 border-b border-gray-700">
                Diff Viewer
            </h2>

            {Object.entries(diff).map(([filename, lines]) => (
                <div key={filename} className="mb-4">

                    {/* File header */}
                    <div className="bg-gray-800 px-4 py-2 font-mono text-blue-300 text-sm border-b border-gray-700">
                        {filename}
                    </div>

                    {/* Diff lines */}
                    <div className="font-mono text-sm">
                        {lines.map((line, i) => (
                            <div
                                key={i}
                                className={`flex px-4 py-0.5 ${getLineStyle(line)}`}
                            >
                                {/* Gutter */}
                                <span className="w-6 select-none opacity-50 mr-4">
                                    {getLinePrefix(line)}
                                </span>
                                {/* Line content — strip the first 2 chars (the prefix) */}
                                <span>{line.substring(2)}</span>
                            </div>
                        ))}
                    </div>

                </div>
            ))}

            {/* Empty state */}
            {Object.keys(diff).length === 0 && (
                <p className="text-gray-400 p-4">No differences found</p>
            )}
        </div>
    )
}