import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'

export default function Navbar({ session }) {
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 lg:px-10 py-4 flex justify-between items-center sticky top-0 z-10">

            {/* Logo */}
            <div
                onClick={() => navigate('/dashboard')}
                className="cursor-pointer flex items-center gap-2 group">
                <span className="w-2 h-2 rounded-full bg-green-400 group-hover:bg-green-300 transition-colors"></span>
                <span className="text-white font-bold text-xl">Mini-Git</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-6">
                <span className="text-gray-400 text-sm hidden sm:inline">
                    {session?.user?.email}
                </span>
                <button
                    onClick={handleSignOut}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Sign out
                </button>
            </div>
        </nav>
    )
}