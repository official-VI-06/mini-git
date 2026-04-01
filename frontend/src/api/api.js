const BASE_URL = 'http://localhost:8080/api'

// POST /init
export async function initRepo(repoName, userId) {
    const response = await fetch(`${BASE_URL}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoName, userId })
    })
    return response.json()
}

// POST /add
export async function addFile(repoId, filePath, content) {
    const response = await fetch(`${BASE_URL}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId, filePath, content })
    })
    return response.json()
}

// POST /commit
export async function commitFiles(repoId, message, author) {
    const response = await fetch(`${BASE_URL}/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId, message, author })
    })
    return response.json()
}

// GET /log
export async function getLog(repoId) {
    const response = await fetch(`${BASE_URL}/log?repoId=${repoId}`)
    return response.json()
}

// POST /branch
export async function createBranch(repoId, branchName) {
    const response = await fetch(`${BASE_URL}/branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId, branchName })
    })
    return response.json()
}

// POST /checkout
export async function checkoutBranch(repoId, targetBranch) {
    const response = await fetch(`${BASE_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId, targetBranch })
    })
    return response.json()
}

// POST /diff
export async function getDiff(repoId, hashA, hashB) {
    const response = await fetch(`${BASE_URL}/diff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId, hashA, hashB })
    })
    return response.json()
}