import { useState, useEffect } from 'react';
import { useSEO } from '../../../hooks/useSEO';
import { LineChart, Line, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';
import '../css/Analytics.css';

const Analytics = () => {
  useSEO({
    title: 'Financial Analytics',
    description: 'Advanced financial analytics and reporting tools to understand your business performance.',
    keywords: 'financial analytics, business intelligence, revenue reporting, transaction analysis',
    robots: 'noindex, follow',
  });
  
  const [data, setData] = useState(null);
  const [visiblePyramids, setVisiblePyramids] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/analytics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 60%, 45%)`;
  };

  if (loading) return <div className="analytics-loading">Loading analytics...</div>;
  if (error) return <div className="analytics-error">{error}</div>;
  if (!data) return <div className="analytics-error">No data available</div>;

  const { transactions, pyramids, graphs, mostFunded } = data;

  const lineData = graphs?.lineGraph?.map(point => ({
    receivable: point.receivable,
    allocations: point.allocations
  })) || [];

  return (
    <div className="analytics">
      <div className="analytics-left">
        
        <div className="graphs-row">
          <div className="graph-card">
            <h4>Receivables vs Allocations</h4>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={lineData}>
                <XAxis dataKey="receivable" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="allocations" stroke="#3498db" strokeWidth={2} dot={{ fill: '#3498db' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="graph-card">
            <h4>Allocations Distribution</h4>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={graphs?.pieChart} dataKey="percentage" nameKey="name" outerRadius={50}>
                  {graphs?.pieChart?.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="graph-card">
            <h4>Allocations vs Amount</h4>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={graphs?.barGraph}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="amount" fill="#3498db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {mostFunded && (
          <p className="most-funded">
            Most funded: <strong>{mostFunded.name}</strong> - {mostFunded.reason}
          </p>
        )}

        <div className="table-section">
          <h3>Transaction History</h3>
          <table>
            <thead>
              <tr>
                <th>Received</th>
                <th>Date & Time</th>
                <th>Allocation</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map(t => (
                t.allocations?.map((a, i) => (
                  <tr key={`${t._id || t.id}-${i}`}>
                    {i === 0 && <td rowSpan={t.allocations.length}>KSH. {t.amount?.toLocaleString()}</td>}
                    {i === 0 && <td rowSpan={t.allocations.length}>{new Date(t.timestamp).toLocaleString()}</td>}
                    <td>{a.name}</td>
                    <td>KSH. {a.amount?.toLocaleString()}</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="analytics-right">
        <div className="pyramids-header">
          <h3>Allocation Pyramids</h3>
          {visiblePyramids < (pyramids?.length || 0) && (
            <button onClick={() => setVisiblePyramids(prev => prev + 3)}>
              Load More
            </button>
          )}
        </div>

        <div className="pyramids-list">
          {pyramids?.slice(0, visiblePyramids).map(pyramid => (
            <div key={pyramid._id || pyramid.id} className="pyramid-card">
              <div className="pyramid-title">Money at {new Date(pyramid.timestamp).toLocaleString()}</div>
              <div className="pyramid-bars">
                {pyramid.allocations?.map((item, i) => (
                  <div
                    key={i}
                    className="pyramid-bar"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: getColor(item.name)
                    }}
                  >
                    <span>{item.name}</span>
                    <span>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;