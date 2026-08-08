import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, FileText, PlusCircle, Calendar, User } from 'lucide-react';

export default function MedicalRecordsModal({ patient, onClose }) {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ diagnosis: '', prescription: '', notes: '' });

  const fetchRecords = async () => {
    try {
      const res = await api.get(`/records/${patient.id}`);
      setRecords(res.data);
    } catch (err) {
      console.error('Failed to load medical records', err);
    }
  };

  useEffect(() => {
    if (patient?.id) fetchRecords();
  }, [patient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/records/', { ...form, patient_id: patient.id });
      setForm({ diagnosis: '', prescription: '', notes: '' });
      fetchRecords();
    } catch (err) {
      console.error('Failed to create medical record', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="text-blue-500" /> Medical Records
            </h3>
            <p className="text-slate-400 text-sm mt-0.5">{patient.name} • {patient.gender}, {patient.age} yrs</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <form onSubmit={handleSubmit} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl space-y-3">
            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-400" /> New Record Entry
            </h4>
            <input
              type="text"
              placeholder="Diagnosis"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
            />
            <input
              type="text"
              placeholder="Prescription"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
              value={form.prescription}
              onChange={(e) => setForm({ ...form, prescription: e.target.value })}
            />
            <textarea
              placeholder="Doctor's Notes"
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium p-2 rounded-lg text-sm transition-colors cursor-pointer">
              Save Medical Record
            </button>
          </form>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-400">Past Consultations ({records.length})</h4>
            {records.map((r) => (
              <div key={r.id} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-start text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(r.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Dr. {r.doctor}</span>
                </div>
                <div className="text-sm font-semibold text-blue-400">{r.diagnosis}</div>
                <div className="text-sm text-slate-300"><strong className="text-slate-400">Prescription:</strong> {r.prescription}</div>
                {r.notes && <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">{r.notes}</div>}
              </div>
            ))}
            {records.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-sm">No medical records found for this patient.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
