import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="container">
            <h1>BeyondChats Article Management</h1>
          </div>
        </header>
        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<ArticleList />} />
              <Route path="/article/:id" element={<ArticleView />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;

