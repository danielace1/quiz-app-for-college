import PropTypes from "prop-types";

const Pagination = ({ current, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const handleClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onChange(page);
    }
  };

  return (
    <div className="flex justify-center items-center flex-wrap gap-2 mt-8">
      <button
        onClick={() => handleClick(current - 1)}
        disabled={current === 1}
        className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, idx) => {
        const page = idx + 1;
        const isActive = current === page;
        return (
          <button
            key={page}
            onClick={() => handleClick(page)}
            className={`px-4 py-2 text-sm rounded-md border ${
              isActive
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => handleClick(current + 1)}
        disabled={current === totalPages}
        className="px-4 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

Pagination.propTypes = {
  current: PropTypes.number,
  total: PropTypes.number,
  pageSize: PropTypes.number,
  onChange: PropTypes.func,
};

export default Pagination;
