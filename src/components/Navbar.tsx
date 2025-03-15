import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, User, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">EventHub</span>
          </Link>

          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      to="/create-event"
                      className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600"
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span>Create Event</span>
                    </Link>
                    <Link
                      to="/my-events"
                      className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600"
                    >
                      <User className="h-5 w-5" />
                      <span>My Events</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-600 hover:text-indigo-600"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Register
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;