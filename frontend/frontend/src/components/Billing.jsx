function Billing() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Billing</h1>
          <p>Manage invoices, payments, and billing records.</p>
        </div>

        <button className="primary-button">
          Create Invoice
        </button>
      </div>

      <div className="empty-state">
        <div className="empty-icon">💳</div>
        <h2>No billing records available</h2>
        <p>
          Billing information will appear here.
        </p>
      </div>
    </section>
  );
}

export default Billing;