import { useState } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css';

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-950 px-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-start gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 mt-3 flex-shrink-0"></span>
          <h1 className="login-heading text-2xl font-bold whitespace-nowrap">Sign in to Mini-Git</h1>
        </div>
        {error && (
          <p className="text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-4 py-3 mb-4 text-sm">{error}</p>
        )}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
        />

        <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
        />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-medium p-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </button>
        </form>
        <p className="text-gray-400 mt-4 text-sm">
          Don't have an account? <Link to="/signup" className="text-blue-400 hover:text-blue-300">Sign up</Link>
        </p>
      </div>
    </div>
  )
}