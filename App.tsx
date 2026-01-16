import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CheckInPage from './pages/CheckInPage';
import HistoryPage from './pages/HistoryPage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
        <Header />
        <main className="pt-6">
          <Routes>
            <Route path="/" element={<CheckInPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;