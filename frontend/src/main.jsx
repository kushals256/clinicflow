import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API = "/api";

const STATUS_FLOW = {
  SCHEDULED: "CHECKED_IN",
  CHECKED_IN: "COMPLETED",
  COMPLETED: "SCHEDULED",
  CANCELLED: "SCHEDULED",
};

function App() {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    checkedIn: 0,
    completed: 0,
    cancelled: 0,
  });
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const [listRes, statsRes] = await Promise.all([
        fetch(`${API}/appointments`),
        fetch(`${API}/appointments/stats`),
      ]);
      if (!listRes.ok || !statsRes.ok) throw Error("Backend unavailable");
      setAppointments(await listRes.json());
      setStats(await statsRes.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible =
    filter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  const advanceStatus = async (appointment) => {
    const next = STATUS_FLOW[appointment.status] || "SCHEDULED";
    await fetch(`${API}/appointments/${appointment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...appointment, status: next }),
    });
    load();
  };

  const create = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch(`${API}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_name: form.get("patient_name"),
        doctor: form.get("doctor"),
        reason: form.get("reason"),
        priority: form.get("priority"),
        status: "SCHEDULED",
        appointment_at: form.get("appointment_at")
          ? new Date(form.get("appointment_at")).toISOString()
          : null,
      }),
    });
    e.currentTarget.reset();
    setShowForm(false);
    load();
  };

  const formatWhen = (value) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">C</span>
          <div>
            <b>ClinicFlow</b>
            <small>DevOps Capstone</small>
          </div>
        </div>
        <nav>
          <a className="active">▦ <span>Dashboard</span></a>
          <a>◷ <span>Appointments</span></a>
          <a>◫ <span>Doctors</span></a>
          <a>◌ <span>Activity</span></a>
        </nav>
        <div className="side-bottom">
          <div className="upgrade">
            <strong>Ship with confidence.</strong>
            <p>Build, scan, deploy, and observe ClinicFlow end to end.</p>
          </div>
          <div className="profile">
            <div className="avatar">KS</div>
            <div>
              <b>Kushal Sacharya</b>
              <small>Developer</small>
            </div>
            <span>⋮</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <header>
          <div>
            <p className="eyebrow">CLINIC / OVERVIEW</p>
            <h1>Good morning, Kushal</h1>
            <p className="muted">Here is what is happening in your clinic today.</p>
          </div>
          <button className="primary" onClick={() => setShowForm(true)}>
            ＋ New appointment
          </button>
        </header>

        {error && (
          <div className="alert">
            ⚠ {error}. Start the backend and PostgreSQL, then refresh.
          </div>
        )}

        <section className="stats">
          <Stat label="Total" value={stats.total} icon="▦" />
          <Stat label="Scheduled" value={stats.scheduled} icon="○" />
          <Stat label="Checked in" value={stats.checkedIn} icon="◔" />
          <Stat label="Completed" value={stats.completed} icon="✓" />
        </section>

        <section className="content-grid">
          <div className="panel tasks-panel">
            <div className="panel-head">
              <div>
                <h2>Appointments</h2>
                <p className="muted">Track patient visits across the clinic.</p>
              </div>
              <div className="filters">
                {["ALL", "SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED"].map((x) => (
                  <button
                    className={filter === x ? "selected" : ""}
                    onClick={() => setFilter(x)}
                    key={x}
                  >
                    {x === "ALL" ? "All" : x.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="empty">Loading appointments…</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>When</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div className="task-title">
                            <span className={`dot ${a.status.toLowerCase()}`}></span>
                            <div>
                              <b>{a.patient_name}</b>
                              <small>{a.reason || "No reason provided"}</small>
                            </div>
                          </div>
                        </td>
                        <td>{a.doctor}</td>
                        <td>{formatWhen(a.appointment_at)}</td>
                        <td>
                          <span className={`priority ${a.priority.toLowerCase()}`}>
                            {a.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`status ${a.status.toLowerCase()}`}>
                            {a.status.replace("_", " ")}
                          </span>
                        </td>
                        <td>
                          <button
                            className="icon-btn"
                            onClick={() => advanceStatus(a)}
                            title="Advance status"
                          >
                            ↻
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!visible.length && (
                  <div className="empty">No appointments in this filter.</div>
                )}
              </div>
            )}
          </div>

          <aside className="panel activity">
            <div className="panel-head">
              <div>
                <h2>Recent activity</h2>
                <p className="muted">Latest clinic workspace events.</p>
              </div>
            </div>
            <Activity icon="✓" text="Morning triage board refreshed" time="12 min ago" />
            <Activity icon="◔" text="Patient checked in at reception" time="38 min ago" />
            <Activity icon="＋" text="New follow-up appointment created" time="1 hr ago" />
            <Activity icon="↗" text="Deployment pipeline passed" time="2 hrs ago" />
            <div className="pipeline">
              <span>CI</span>
              <i></i>
              <span>Build</span>
              <i></i>
              <span>Scan</span>
              <i></i>
              <span>Deploy</span>
            </div>
          </aside>
        </section>

        {showForm && (
          <div className="modal-backdrop">
            <form className="modal" onSubmit={create}>
              <div className="modal-head">
                <div>
                  <p className="eyebrow">CREATE APPOINTMENT</p>
                  <h2>Book a clinic visit</h2>
                </div>
                <button type="button" className="close" onClick={() => setShowForm(false)}>
                  ×
                </button>
              </div>
              <label>
                Patient name
                <input name="patient_name" required placeholder="e.g. Ada Lovelace" />
              </label>
              <label>
                Reason
                <textarea name="reason" placeholder="Why is the patient visiting?" />
              </label>
              <div className="form-row">
                <label>
                  Priority
                  <select name="priority" defaultValue="MEDIUM">
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                  </select>
                </label>
                <label>
                  Doctor
                  <input name="doctor" defaultValue="Dr. Mehta" />
                </label>
              </div>
              <label>
                Appointment time
                <input name="appointment_at" type="datetime-local" />
              </label>
              <button className="primary full">Create appointment</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="stat">
      <div className="stat-icon">{icon}</div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>Updated just now</span>
      </div>
    </div>
  );
}

function Activity({ icon, text, time }) {
  return (
    <div className="activity-row">
      <span className="activity-icon">{icon}</span>
      <div>
        <b>{text}</b>
        <small>{time}</small>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
