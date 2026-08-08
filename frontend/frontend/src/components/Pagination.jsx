import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
      <button 
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
        style={buttonStyle(currentPage === 1)}
      >
        Previous
      </button>

      <span style={{ fontSize: '14px', color: '#6c757d' }}>
        Page {currentPage} of {totalPages}
      </span>

      <button 
        disabled={currentPage === totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
        style={buttonStyle(currentPage === totalPages)}
      >
        Next
      </button>
    </div>
  );
}

const buttonStyle = (disabled) => ({
  padding: '6px 12px',
  backgroundColor: disabled ? '#e9ecef' : '#007bff',
  color: disabled ? '#6c757d' : '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer'
});