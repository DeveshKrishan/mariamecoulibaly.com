import { Analytics } from '@vercel/analytics/react';
import { Route, Routes } from 'react-router-dom';
import { EditToolbar } from './components/edit/EditToolbar';
import { PageLayout } from './components/layout/PageLayout';
import { AboutPage } from './pages/AboutPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';

function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about-me" element={<AboutPage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Routes>
      <EditToolbar />
      <Analytics />
    </PageLayout>
  );
}

export default App;
