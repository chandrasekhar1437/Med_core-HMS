import { Link } from "react-router-dom";

function Dashboard() {
  const cards = [
    {
      title: "Total Patients",
      value: "1,248",
      description: "Registered patients",
      icon: "♙",
      className: "blue",
    },
    {
      title: "Available Doctors",
      value: "42",
      description: "Doctors on duty",
      icon: "⚕",
      className: "green",
    },
    {
      title: "Today's Appointments",
      value: "86",
      description: "Scheduled today",
      icon: "◷",
      className: "orange",
    },
    {
      title: "Pending Requests",
      value: "14",
      description: "Need attention",
      icon: "!",
      className: "purple",
    },
  ];

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Healthcare Dashboard</h1>
          <p>
            Monitor patients, doctors, and appointments from one place.
          </p>
        </div>

        <Link to="/appointments" className="primary-button">
          + New Appointment
        </Link>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <article className="stat-card" key={card.title}>
            <div className={`stat-icon ${card.className}`}>
              {card.icon}
            </div>

            <div>
              <p>{card.title}</p>
              <h2>{card.value}</h2>
              <small>{card.description}</small>
            </div>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest activity in the hospital</p>
            </div>
          </div>

          <div className="activity-list">
            <div className="activity">
              <span className="activity-dot green-dot" />
              <div>
                <strong>New patient registered</strong>
                <p>Patient information was added successfully.</p>
              </div>
              <small>10 min ago</small>
            </div>

            <div className="activity">
              <span className="activity-dot blue-dot" />
              <div>
                <strong>Appointment confirmed</strong>
                <p>Appointment assigned to a doctor.</p>
              </div>
              <small>25 min ago</small>
            </div>

            <div className="activity">
              <span className="activity-dot orange-dot" />
              <div>
                <strong>Doctor availability updated</strong>
                <p>Doctor schedule was changed.</p>
              </div>
              <small>1 hour ago</small>
            </div>
          </div>
        </section>

        <section className="panel quick-panel">
          <h2>Quick Actions</h2>
          <p>Manage hospital information quickly.</p>

          <Link to="/patients" className="quick-action">
            <span>♙</span>
            <div>
              <strong>Manage Patients</strong>
              <small>Add, edit, or delete patients</small>
            </div>
          </Link>

          <Link to="/doctors" className="quick-action">
            <span>⚕</span>
            <div>
              <strong>Manage Doctors</strong>
              <small>Update doctor information</small>
            </div>
          </Link>

          <Link to="/appointments" className="quick-action">
            <span>◷</span>
            <div>
              <strong>Appointments</strong>
              <small>Schedule and manage visits</small>
            </div>
          </Link>
        </section>
      </div>
    </section>
  );
}

export default Dashboard;