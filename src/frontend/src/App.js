import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phoneNumber: '', aadharNumber: '' });
  const [adding, setAdding] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
        setForm({ name: '', phoneNumber: '', aadharNumber: '' });
        fetchUsers(page);
      })
      .catch((err) => setError('Error: ' + err))
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
      })
      .catch((err) => setError('Error: ' + err));
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
        {loading ? (
          <div>Loading users...</div>
        ) : (
          <>
            <table style={{ margin: '1rem auto', borderCollapse: 'collapse', width: '90%' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Aadhar Number</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.aadharNumber}</td>
                    <td>
                      <button onClick={() => handleDeleteUser(user.id)} style={{ color: 'red' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ margin: '1rem' }}>
              <button onClick={handlePrev} disabled={page === 0} style={{ marginRight: '1rem' }}>
                Prev
              </button>
              <span>Page {page + 1} of {totalPages}</span>
              <button onClick={handleNext} disabled={page >= totalPages - 1} style={{ marginLeft: '1rem' }}>
                Next
              </button>
            </div>
            <form onSubmit={handleAddUser} style={{ marginTop: '2rem' }}>
              <h2>Add New User</h2>
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleInputChange}
                required
                style={{ marginRight: '1rem' }}
              />
              <input
                name="phoneNumber"
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={handleInputChange}
                required
                style={{ marginRight: '1rem' }}
              />
              <input
                name="aadharNumber"
                placeholder="Aadhar Number (16 chars)"
                value={form.aadharNumber}
                onChange={handleInputChange}
                minLength={16}
                maxLength={16}
                required
                style={{ marginRight: '1rem' }}
              />
              <button type="submit" disabled={adding}>
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
