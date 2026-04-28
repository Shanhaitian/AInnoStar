import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ResearchList from './pages/research/ResearchList';
import InsightBoard from './pages/research/InsightBoard';
import ProjectManagement from './pages/document/ProjectManagement';
import RequirementPool from './pages/document/RequirementPool';
import PRDList from './pages/document/PRDList';
import PRDEditor from './pages/document/PRDEditor';
import TechDocList from './pages/document/TechDocList';
import CustomerDocList from './pages/document/CustomerDocList';
import Generator from './pages/prototype/Generator';
import PrototypeList from './pages/prototype/PrototypeList';
import PrototypeWorkbench from './pages/prototype/PrototypeWorkbench';

export default function App() {
  const { user, loading, login, logout, isLoggedIn } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl text-sm"
          style={{ border: '1px solid var(--ui-border)', background: 'var(--ui-panel)', color: 'var(--ui-muted)' }}>
          <span className="w-2.5 h-2.5 rounded-full animate-pulse-dot" style={{ background: '#4f6bff' }} />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={logout} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/research" element={<ResearchList />} />
        <Route path="/research/insights" element={<InsightBoard />} />
        <Route path="/document/projects" element={<ProjectManagement />} />
        <Route path="/document/requirements" element={<RequirementPool />} />
        <Route path="/document/prd" element={<PRDList />} />
        <Route path="/document/prd/:id" element={<PRDEditor />} />
        <Route path="/document/tech" element={<TechDocList />} />
        <Route path="/document/customer" element={<CustomerDocList />} />
        <Route path="/prototype/generate" element={<Generator />} />
        <Route path="/prototype/list" element={<PrototypeList />} />
        <Route path="/prototype/workbench/:id" element={<PrototypeWorkbench />} />
      </Route>
      <Route path="/login" element={<Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
