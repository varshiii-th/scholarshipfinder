// TagFilter.js
import React from 'react';

const TagFilter = ({ tags, selectedTags, onTagChange }) => {
  return (
    <div className="tag-filters">
      {tags.map(tag => (
        <label key={tag}>
          <input
            type="checkbox"
            value={tag}
            checked={selectedTags.includes(tag)}
            onChange={() => onTagChange(tag)}
          />
          <span>{tag}</span>
        </label>
      ))}
    </div>
  );
};

export default TagFilter;
