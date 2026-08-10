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
      setRecords(Array.isArray(response.data) ? response.data : []);
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
    if (!id) return;
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
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Medical Records</h1>
        <p className="text-sm sm:text-base text-gray-400 mb-6">
          Manage and view patient medical histories and reports here.
        </p>

        {error && (
          <div className="mb-4 text-red-400 bg-red-900/50 p-3 rounded border border-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Desktop View Table (Hidden on Mobile) */}
        <div className="hidden md:block bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
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
                records.map((r) => {
                  const recordId = r.id || r._id;
                  return (
                    <tr key={recordId} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 font-medium">
                        {r.patient || r.patient_name || "N/A"}
                      </td>
                      <td className="px-6 py-4">{r.diagnosis || "N/A"}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {r.date || r.created_at?.slice(0, 10) || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(recordId)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
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

        {/* Mobile View Card List (Visible on Mobile Only) */}
        <div className="block md:hidden space-y-4">
          {loading ? (
            <div className="text-center p-6 bg-gray-800 rounded-lg text-gray-400 border border-gray-700">
              Loading medical records...
            </div>
          ) : records.length > 0 ? (
            records.map((r) => {
              const recordId = r.id || r._id;
              return (
                <div
                  key={recordId}
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="flex justify-between items-start border-b border-gray-700 pb-2">
                    <div>
                      <span className="text-xs text-gray-400 uppercase tracking-wider block">
                        Patient
                      </span>
                      <span className="font-semibold text-white text-base">
                        {r.patient || r.patient_name || "N/A"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {r.date || r.created_at?.slice(0, 10) || "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider block">
                      Diagnosis
                    </span>
                    <p className="text-sm text-gray-200 mt-0.5">
                      {r.diagnosis || "N/A"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-700/50">
                    <button
                      onClick={() => handleDelete(recordId)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-2 rounded font-semibold transition"
                    >
                      Delete Record
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center p-6 bg-gray-800 rounded-lg text-gray-400 border border-gray-700">
              No medical records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}