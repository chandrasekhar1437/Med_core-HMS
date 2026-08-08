function MedicalRecords() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Medical Records</h1>
          <p>View and manage patient medical records.</p>
        </div>

        <button className="primary-button">
          Add Record
        </button>
      </div>

      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h2>No medical records available</h2>
        <p>
          Medical records will appear here.
        </p>
      </div>
    </section>
  );
}

export default MedicalRecords;