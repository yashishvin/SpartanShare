// src/components/layout/SearchBar.js
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Folder, FileText, Image, File } from 'lucide-react';

const SearchBar = ({ files = [], onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const searchRef = useRef(null);

  // Handle clicks outside the search component to close results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);

  // Filter files based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (onSearch) onSearch(files); // Reset to show all files
      setFilteredFiles([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = files.filter(file => 
      file.name.toLowerCase().includes(query)
    );

    setFilteredFiles(results);
    if (onSearch) onSearch(results);
  }, [searchQuery, files, onSearch]);

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) onSearch(files);
  };

  // Get file icon based on file type
  const getFileIcon = (file) => {
    if (file.isFolder) {
      return <Folder className="text-sjsu-gold" size={18} />;
    }

    const type = file.type?.toLowerCase() || '';
    
    if (type.includes('pdf')) {
      return <File className="text-red-500" size={18} />; // Using File instead of FilePdf
    } else if (type.includes('image') || type.includes('jpg') || type.includes('png')) {
      return <Image className="text-blue-500" size={18} />; // Using Image instead of FileImage
    } else {
      return <FileText className="text-gray-500" size={18} />;
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search files and folders..." 
          className="w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sjsu-gold bg-blue-800 text-white placeholder-blue-200"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => searchQuery && setShowResults(true)}
        />
        <Search className="absolute left-3 top-2.5 text-blue-200" size={18} />
        
        {searchQuery && (
          <button 
            className="absolute right-3 top-2.5 text-blue-200 hover:text-white"
            onClick={handleClearSearch}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchQuery && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-96 overflow-y-auto">
          {filteredFiles.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-700">
              No matching files or folders found
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredFiles.slice(0, 8).map((file) => (
                <li 
                  key={file.id} 
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setShowResults(false)}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {getFileIcon(file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {new Date(file.updatedAt).toLocaleDateString()}
                        {!file.isFolder && file.size && (
                          <span className="ml-2">{formatFileSize(file.size)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              {filteredFiles.length > 8 && (
                <li className="px-4 py-2 text-center text-xs text-blue-600">
                  {filteredFiles.length - 8} more results
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;