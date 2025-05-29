import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import AddUserPage from './pages/AddUserPage';
import EditUserPage from './pages/EditUserPage';
import DuplicateUserPage from './pages/DuplicateUserPage';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppLayout>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<UsersPage />} />
          <Route path="/add-user" element={<AddUserPage />} />
          <Route path="/edit-user/:id" element={<EditUserPage />} />
          <Route path="/duplicate-user/:id" element={<DuplicateUserPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;