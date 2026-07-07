import { useState, useEffect } from 'react';
import { useSEO } from '../../../hooks/useSEO';
import '../css/Allocations.css';

const Allocations = () => {
  useSEO({
    title: 'Allocations',
    description: 'Manage and configure allocation rules for your financial operations.',
    keywords: 'allocation management, fund distribution, financial rules',
    robots: 'noindex, follow',
  });
  
  //declare the state of our app to define ui layout
  const [visibleCards, setVisibleCards] = useState(3);
  const [reapplyLoading, setReapplyLoading] = useState(false);
  const [reapplyMsg, setReapplyMsg] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [form, setForm] = useState({ name: '', percentage: '', reason: '' });
  const [expandedId, setExpandedId] = useState(null);

  // Fetch from API
  useEffect(() => {
    //store a jwt token to user's device localStorage for sometime
    const token = localStorage.getItem('token');
    fetch('/api/allocations', {//define and 
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => setAllocations(data.allocations))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save to API
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.percentage) return;

  // ✅ ADD THIS BLOCK
  const currentTotal = allocations.reduce((sum, a) => sum + a.percentage, 0);
  const newPercentage = Number(form.percentage);
  if (currentTotal + newPercentage > 100) {
    setReapplyMsg(`Cannot add: existing allocations total ${currentTotal}%. Max 100%.`);
    return;
  }
 
    const token = localStorage.getItem('token');



    try {
      await fetch('/api/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      // Refresh list
      const res = await fetch('/api/allocations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAllocations(data.allocations);
      setForm({ name: '', percentage: '', reason: '' });
    } catch (err) {
      console.error(err);
    }
  };

  // Delete from API, to delete the allocation from our database
  const handleDelete = async (allocationId) => {
    const token = localStorage.getItem('token');

    try {
      await fetch(`/api/allocations/${allocationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setAllocations((prev) => prev.filter((a) => a.id !== allocationId));
    } catch (err) {
      console.error(err);
    }
  };
  //a logic to handle the reapplication of the alocations 
  // so that our system is flexible in that one can do allocation
  //  creation later after finances have been deposited in the till number
  const handleReapply = async () => {
  const token = localStorage.getItem('token');
  setReapplyLoading(true);
  setReapplyMsg('');

  try {
    const res = await fetch('/api/allocations/reapply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();

    if (res.ok) {
      setReapplyMsg(`Updated ${data.updatedCount} transactions!`);
      // Refresh allocations list
      const refreshRes = await fetch('/api/allocations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const refreshData = await refreshRes.json();
      setAllocations(refreshData.allocations);
    } else {
      setReapplyMsg(data.message || 'Failed to re-apply');
    }
  } catch (err) {
    setReapplyMsg('Network error');
  } finally {
    setReapplyLoading(false);
  }
};

  const sortedByAmount = [...allocations].sort((a, b) => b.amount - a.amount);//sort the allocations alphabetically
  const maxAmount = sortedByAmount[0]?.amount || 1;

  return (
    <div className="allocations">
      <section className="dashboard-row">
        <form className="allocation-form" onSubmit={handleSave}>
          <h3>New Allocation</h3>
          <input
            name="name"
            placeholder="Allocation name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="percentage"
            type="number"
            placeholder="Percentage"
            value={form.percentage}
            onChange={handleChange}
            min="0"
            max="100"
            required
          />
          <textarea
            name="reason"
            placeholder="Reason"
            value={form.reason}
            onChange={handleChange}
          />
          <button type="submit">Save</button>

          <button type="button" onClick={handleReapply} disabled={reapplyLoading} className="reapply-btn">
          {reapplyLoading ? 'Applying...' : 'Re-apply Allocations'}
          </button>

         {reapplyMsg && <p className="reapply-msg">{reapplyMsg}</p>}
        </form>

        
      <div className="cards-grid">
         {visibleCards < allocations.length && (
          <button 
          className="load-more-btn"
          onClick={() => setVisibleCards(prev => prev + 3)}
          > Load More
          </button>
          )}

        <div className="allocation-cards">
          {allocations.slice(0, visibleCards).map((a) => (
            <div key={a._id} className="allocation-card" title={a.reason}>
              <div className="allocation-avatar">{a.name.charAt(0).toUpperCase()}</div>
              <h4>{a.name}</h4>
              <p className="allocation-percentage">{a.percentage}%</p>
              <p className="allocation-amount">KSH. {a.amount.toLocaleString()}</p>
              <div className="allocation-actions">
                <button onClick={() => handleDelete(a.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      <section className="dashboard-row">
        <div className="allocation-pyramid">
          <h3>Allocations by Amount</h3>
          {sortedByAmount.map((a) => (
            <div key={a._id} className="pyramid-item">
              <span className="pyramid-label">{a.name}</span>
              <div
                className="pyramid-bar"
                onClick={() => setExpandedId(expandedId === a._id ? null : a._id)}
              >
                <div
                  className="pyramid-fill"
                  style={{ width: `${(a.amount / maxAmount) * 100}%` }}
                />
                {expandedId === a._id && <span className="pyramid-percent">{a.percentage}%</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="allocation-table-wrapper">
          <h3>Allocation Breakdown</h3>
          <table className="allocation-table">
            <thead>
              <tr>
                <th>Allocation</th>
                <th>Amount</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a._id}>
                  <td>{a.name}</td>
                  <td>KSH. {a.amount.toLocaleString()}</td>
                  <td>{a.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Allocations;