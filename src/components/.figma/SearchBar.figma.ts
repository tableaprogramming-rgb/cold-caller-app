// url=https://www.figma.com/design/PhfWVOOFvwPbtpHBUNa47V/cold-calling-tracking
// source=src/components/SearchBar.jsx
// component=SearchBar

import figma from 'figma'
const instance = figma.selectedInstance

const placeholder = instance.getString('Placeholder') || 'Search by company, contact name, or phone...'

export default {
  example: figma.code`
    <div className="search-bar">
      <input
        type="text"
        placeholder="${placeholder}"
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        className="search-input"
      />
      {query && (
        <button onClick={() => onSearch('')} className="clear-btn">
          ✕
        </button>
      )}
    </div>
  `,
  imports: [],
  id: 'search-bar',
  metadata: {
    nestable: true,
  },
}
