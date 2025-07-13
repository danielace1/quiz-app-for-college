import PropTypes from "prop-types";
import { useState } from "react";

const SearchInput = ({ placeholder, onSearch }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder || "Search..."}
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm outline-none focus:border-blue-500 "
      />
    </div>
  );
};

SearchInput.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
};

export default SearchInput;
