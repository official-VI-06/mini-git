import { useState } from 'react'
import { supabase } from '../supabase/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css';

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSignup = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-lg w-full max-w-md">
        <h1 className="login-heading text-lg font-bold mb-6">Create your Mini-Git account</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 text-white p-3 rounded-lg mb-4 outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
          >
            Sign Up
          </button>
        </form>
        <p className="text-gray-400 mt-4">
          Already have an account? <Link to="/login" className="text-blue-400">Sign in</Link>
        </p>
      </div>
    </div>
  )
}