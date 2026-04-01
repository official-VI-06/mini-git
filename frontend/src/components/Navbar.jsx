import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/supabaseClient'

export default function Navbar({ session }) {
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <nav className="bg-gray-900 border-b border-gray-700 px-8 py-4 flex justify-between items-center">
            
            {/* Logo */}
            <div 
                onClick={() => navigate('/dashboard')} 
                className="cursor-pointer flex items-center gap-2">
                <span className="text-green-400 font-bold text-xl">Mini-Git</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-6">
                <span className="text-gray-400 text-sm">
                    {session?.user?.email}
                </span>
                <button
                    onClick={handleSignOut}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
                    Sign out
                </button>
            </div>
        </nav>
    )
}