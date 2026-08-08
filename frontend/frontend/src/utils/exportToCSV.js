/**
 * Exports an array of JSON objects as a downloadable CSV file.
 * 
 * @param {Array<Object>} data - Array of records to export
 * @param {string} [filename='export.csv'] - Download filename
 * @param {Array<string>|Object} [columns] - Optional specific key list or key-to-label map (e.g. { id: 'ID', name: 'Full Name' })
 */
export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || !data.length) {
    console.warn('Export skipped: No data available for export.');
    return;
  }

  let keys = [];
  let headerLabels = [];

  // Determine headers and mapping keys
  if (columns) {
    if (Array.isArray(columns)) {
      keys = columns;
      headerLabels = columns;
    } else if (typeof columns === 'object') {
      keys = Object.keys(columns);
      headerLabels = Object.values(columns);
    }
  } else {
    keys = Object.keys(data[0]);
    headerLabels = keys;
  }

  // Format CSV rows and escape quotes/commas
  const csvRows = [
    headerLabels.map((header) => `"${String(header).replace(/"/g, '""')}"`).join(','),
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = row[key] !== undefined && row[key] !== null ? row[key] : '';
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ];

  // Include UTF-8 BOM (\uFEFF) to ensure Microsoft Excel renders characters and formatting correctly
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  
  link.click();

  // Cleanup DOM node and memory reference
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};