import { useState } from 'react';

const metrics = [
  { label: 'Active users', value: '24 800' },
  { label: 'Conversion', value: '4.2%' },
  { label: 'Uptime', value: '99.98%' },
];

const bars = [42, 67, 35, 81, 58, 74, 90];

const users = [
  { name: 'Alice Smith', role: 'Designer', status: 'Online' },
  { name: 'Mikhail Orlov', role: 'Engineer', status: 'Idle' },
  { name: 'Dana Reyes', role: 'Analyst', status: 'Online' },
];

export function Metrics() {
  return (
    <dl className="metric-list">
      {metrics.map((metric) => (
        <div className="metric" key={metric.label}>
          <dt className="metric-label">{metric.label}</dt>
          <dd className="metric-value">{metric.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function BarChart() {
  return (
    <div className="bar-chart">
      {bars.map((height, index) => (
        <div
          className="bar"
          key={index}
          style={{ height: `${height}%` }}
          title={`Day ${index + 1}: ${height}%`}
        />
      ))}
    </div>
  );
}

export function StatusFeed({ items }: { items: Array<{ time: string; text: string }> }) {
  return (
    <ul className="feed">
      {items.map((item) => (
        <li className="feed-item" key={item.time}>
          <span className="feed-time">{item.time}</span>
          <span className="feed-text">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function UsersTable() {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.name}>
            <td>{user.name}</td>
            <td>{user.role}</td>
            <td>{user.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Notes() {
  const [value, setValue] = useState('Remember to review the launch checklist.');

  return (
    <textarea
      className="note-input"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Write a note..."
    />
  );
}
