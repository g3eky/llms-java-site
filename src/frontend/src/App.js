import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phoneNumber: '', aadharNumber: '', region: 'REGION1', amount: 0 });
  const [adding, setAdding] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', error: false });

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, error: isError });
    setTimeout(() => setToast({ show: false, message: '', error: false }), 2500);
  };

  const fetchUsers = (pageNum = 0) => {
    setLoading(true);
    fetch(`http://localhost:8080/api/users?page=${pageNum}&size=10`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.content)) {
          setError('Unexpected response from backend.');
          setUsers([]);
          setTotalPages(0);
        } else {
          setUsers(data.content);
          setTotalPages(data.totalPages);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Error: ' + err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line
  }, [page]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    setAdding(true);
    setError('');
    fetch('http://localhost:8080/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add user');
        return res.json();
      })
      .then(() => {
        setForm({ name: '', phoneNumber: '', aadharNumber: '', region: 'REGION1', amount: 0 });
        fetchUsers(page);
        showToast('User added successfully!');
      })
      .catch((err) => {
        setError('Error: ' + err);
        showToast('Failed to add user', true);
      })
      .finally(() => setAdding(false));
  };

  const handleDeleteUser = (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    fetch(`http://localhost:8080/api/users/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete user');
        // If last user on page is deleted, go to previous page if not on first
        if (users.length === 1 && page > 0) {
          setPage(page - 1);
        } else {
          fetchUsers(page);
        }
        showToast('User deleted!');
      })
      .catch((err) => {
        setError('Error: ' + err);
        showToast('Failed to delete user', true);
      });
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>User Management</h1>
        {toast.show && (
          <div className={`toast${toast.error ? ' error' : ''}`}>{toast.message}</div>
        )}
        {loading ? (
          <div className="spinner" />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Aadhar Number</th>
                  <th>Region</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.aadharNumber}</td>
                    <td>{user.region}</td>
                    <td>{user.amount}</td>
                    <td>
                      <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <button onClick={handlePrev} disabled={page === 0}>
                Prev
              </button>
              <span>Page {page + 1} of {totalPages}</span>
              <button onClick={handleNext} disabled={page >= totalPages - 1}>
                Next
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <h2>Add New User</h2>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <label htmlFor="aadharNumber">Aadhar Number (16 chars)</label>
                <input
                  id="aadharNumber"
                  name="aadharNumber"
                  placeholder="Aadhar Number (16 chars)"
                  value={form.aadharNumber}
                  onChange={handleInputChange}
                  minLength={16}
                  maxLength={16}
                  required
                />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label htmlFor="region">Region</label>
                <select
                  id="region"
                  name="region"
                  value={form.region}
                  onChange={handleInputChange}
                  required
                >
                  <option value="REGION1">REGION1</option>
                  <option value="REGION2">REGION2</option>
                  <option value="REGION3">REGION3</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label htmlFor="amount">Amount (0-1000)</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min={0}
                  max={1000}
                  value={form.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" disabled={adding} style={{ minWidth: 120 }}>
                {adding ? 'Adding...' : 'Add User'}
              </button>
            </form>
          </>
        )}
        {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
      </header>
    </div>
  );
}

export default App;
