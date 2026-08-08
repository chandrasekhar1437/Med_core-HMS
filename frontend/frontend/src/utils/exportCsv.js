export const exportToCSV = (data, filename = "export.csv", columnMapping = null) => {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }

  // Determine headers based on mapping or raw object keys
  const keys = columnMapping ? Object.keys(columnMapping) : Object.keys(data[0]);
  const headers = columnMapping ? Object.values(columnMapping) : keys;

  // Construct CSV rows
  const csvRows = [];
  csvRows.push(headers.join(","));

  for (const row of data) {
    const values = keys.map((key) => {
      let val = row[key] !== undefined && row[key] !== null ? row[key] : "";
      // Escape double quotes and enclose values in quotes to prevent formatting errors
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    });
    csvRows.push(values.join(","));
  }

  // Create Blob and trigger download
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};