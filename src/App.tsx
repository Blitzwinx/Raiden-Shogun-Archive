import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Lore from './pages/Lore';
import InGame from './pages/InGame';
import PowerScaling from './pages/PowerScaling';
import Blog from './pages/Blog';
import Dashboard from './pages/Dashboard';
import PostDetail from './pages/PostDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800">
        <div className="stars-bg">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lore" element={<Lore />} />
            <Route path="/ingame" element={<InGame />} />
            <Route path="/powerscaling" element={<PowerScaling />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/post/:id" element={<PostDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;