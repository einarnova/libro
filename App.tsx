import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ComplaintList from './pages/ComplaintList';
import ComplaintDetails from './pages/ComplaintDetails';
import Confirmation from './pages/Confirmation';
import CreateComplaint from './pages/CreateComplaint';
import OdooDashboard from './pages/OdooDashboard';
import WebComplaintForm from './pages/WebComplaintForm';
import OdooModuleCode from './pages/OdooModuleCode';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OdooDashboard />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/create" element={<CreateComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetails />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/module-code" element={<OdooModuleCode />} />
          {/* Public Website Route */}
          <Route path="/website/complaints" element={<WebComplaintForm />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;