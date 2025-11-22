import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ItemsList from './pages/ItemsList';
import ItemDetail from './pages/ItemDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import { useAuthContext } from './context/AuthContext';
import NoticeStrip from './components/NoticeStrip';
import Footer from './components/Footer';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthContext();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <NoticeStrip />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<ItemsList />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
