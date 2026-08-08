function Appointments() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Appointments</h1>
          <p>Manage patient appointments and schedules.</p>
        </div>

        <button className="primary-button">
          Add Appointment
        </button>
      </div>

      <div className="empty-state">
        <div className="empty-icon">📅</div>
        <h2>No appointments available</h2>
        <p>
          Appointment management will appear here.
        </p>
      </div>
    </section>
  );
}

export default Appointments;