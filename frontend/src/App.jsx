import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabase/supabaseClient'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Repository from './pages/Repository'
import CommitLog from './pages/CommitLog'

function App() {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => setSession(session)
        )

        return () => subscription.unsubscribe()
    }, [])

    if (loading) return <div>Loading...</div>

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/dashboard"
                    element={session ? <Dashboard session={session} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/repo/:repoId"
                    element={session ? <Repository session={session} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/repo/:repoId/log"
                    element={session ? <CommitLog session={session} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/"
                    element={<Navigate to={session ? "/dashboard" : "/login"} />}
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App