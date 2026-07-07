import { useState, useEffect } from 'react';
import { useSEO } from '../../../hooks/useSEO';
import '../css/Revenue.css';

const Revenue = () => {
  useSEO({
    title: 'Revenue Management',
    description: 'Track and optimize your revenue streams with comprehensive analytics.',
    keywords: 'revenue management, income tracking, financial optimization',
    robots: 'noindex, follow',
  });
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/revenue', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load revenue');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="revenue-loading">{error}</div>;
  if (!data) return <div className="revenue-loading">Loading...</div>;

  const { transactions, allocations } = data;

  return (
    <div className="revenue">
      <div className="revenue-section">
        <h3>Transaction History</h3>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Receivable</th>
              <th>From</th>
              <th>M-Pesa Code</th>
            </tr>
          </thead>
          <tbody>
            {transactions?.map(t => (
              <tr key={t._id}>
                <td>{new Date(t.timestamp).toLocaleString()}</td>
                <td>KSH. {t.amount?.toLocaleString()}</td>
                <td>{t.senderName}</td>
                <td>{t.mpesaCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="revenue-section">
        <h3>Allocation History</h3>
        <table>
          <thead>
            <tr>
              <th>Allocation</th>
              <th>Amount</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {allocations?.map(a => (
              <tr key={a._id || a.name}>
                <td>{a.name}</td>
                <td>KSH. {a.amount?.toLocaleString()}</td>
                <td>{a.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Revenue;