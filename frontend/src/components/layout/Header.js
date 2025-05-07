import React from 'react';
import { Search, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onOpenUploadDialog }) => {
  const { user, logout } = useAuth();
  
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };
  
  return (
    <header className="bg-sjsu-blue text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-sjsu-gold text-sjsu-blue font-bold text-xl p-2 rounded">SS</div>
          <h1 className="text-xl font-bold">Spartan Share</h1>
        </div>
        <div className="flex-1 mx-4 relative">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search files and folders..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sjsu-gold"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="bg-sjsu-gold hover:bg-yellow-600 text-sjsu-blue font-bold py-2 px-4 rounded-lg flex items-center space-x-1"
            onClick={onOpenUploadDialog}
          >
            <Upload size={18} />
            <span>Upload</span>
          </button>
          <div className="relative group">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sjsu-blue font-bold cursor-pointer">
              {getInitials(user?.name)}
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;