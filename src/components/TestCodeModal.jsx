import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";

const TestCodeModal = ({ open, onClose, onSubmit }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setCode("");
      setError("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!code.trim()) {
      setError("Test code is required.");
      return;
    }
    onSubmit(code.trim());
    setCode("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
          Enter Test Code
        </h3>

        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          placeholder="e.g. ABC123"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

TestCodeModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default TestCodeModal;
