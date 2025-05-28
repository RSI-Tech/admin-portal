import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddUserPage from './pages/AddUserPage';
import EditUserPage from './pages/EditUserPage';
import DuplicateUserPage from './pages/DuplicateUserPage';
import Layout from './components/Layout';

function App() {
  return (
    <Router basename="/admin-portal">
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-user" element={<AddUserPage />} />
          <Route path="/edit-user/:id" element={<EditUserPage />} />
          <Route path="/duplicate-user/:id" element={<DuplicateUserPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;