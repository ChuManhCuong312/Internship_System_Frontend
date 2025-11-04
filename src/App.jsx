import React from 'react';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Intern/Dashboard';

const App = () => {
  return (
    <div className="flex">
      <Sidebar />
      <Dashboard />
    </div>
  );
};

export default App;