import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  }

  function handleClear() {
    setQuery('');
    onSearch('');
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by company, contact name, or phone..."
        value={query}
        onChange={handleChange}
        className="search-input"
      />
      {query && (
        <button onClick={handleClear} className="clear-btn">
          Clear
        </button>
      )}
    </div>
  );
}
