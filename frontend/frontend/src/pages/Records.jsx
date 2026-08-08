import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Records() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch medical records from FastAPI backend
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get("/medical-records/");
      setRecords(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching records:", err);
      setError("Failed to load medical records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await api.delete(`/medical-records/${id}`);
      fetchRecords();
    } catch (err) {
      console.error("Error deleting record:", err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
        <p className="text-gray-400 mb-6">
          Manage and view patient medical histories and reports here.
        </p>

        {error && (
          <div className="mb-4 text-red-400 bg-red-900/50 p-3 rounded border border-red-800">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700 text-left">
            <thead className="bg-gray-700/50 text-gray-300">
              <tr>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Diagnosis
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                    Loading medical records...
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id || r._id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 font-medium">{r.patient}</td>
                    <td className="px-6 py-4">{r.diagnosis}</td>
                    <td className="px-6 py-4 text-gray-400">{r.date}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(r.id || r._id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                    No medical records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}