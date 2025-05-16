import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [pingResponse, setPingResponse] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/ping')
      .then((res) => res.text())
      .then((data) => setPingResponse(data))
      .catch((err) => setPingResponse('Error: ' + err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {pingResponse}
        </div>
      </header>
    </div>
  );
}

export default App;
