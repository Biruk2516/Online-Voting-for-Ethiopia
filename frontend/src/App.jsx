import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateBook from './pages/CreateBook';
import ShowBook from './pages/ShowBook';
import EditBook from './pages/EditBook';
import DeleteBook from './pages/DeleteBook';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AboutUs from './pages/AboutUs';
import Service from './pages/Services';
import { UserContext } from './components/hooks/UserContext';
import { BookContext } from './components/hooks/BookContext';
import { SearchContext } from './components/hooks/SearchContext';
import { AdminCont, AdminContext } from './components/hooks/AdminContext';
import ComingSoon from './pages/ComingSoon';
import LandingPage from './pages/LandingPage';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProfilePage from './pages/ProfilePage';
import AdminCandidate from './pages/AdminCandidate';
import Unauthorized from './pages/UnAouthorized';
import ProtectedRoute from './pages/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import ElectedPage from './pages/ElectedPage';
import RegionAdminBoard from './pages/RegionAdminBoard';
import { useParams } from 'react-router-dom';
import RegionStatsChart from './components/RegionalDashboard';
import RegionalDashboard from './components/RegionalDashboard';
import NationalDashboard from './pages/NationalDashBoard';
import CandidateDashboard from './pages/CandidateDashboard';
import ManageUsers from './pages/ManageUsers';
import ZoneAdminDashboard from './pages/ZoneAdminDashboard';
import { LanguageProvider } from './contexts/LanguageContext';
import CandidateProfile from './pages/CandidateProfile';
import UserManagement from './pages/UserManagement';
import SystemAdminLogin from './pages/SystemAdminLogin';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import FaydaCallback from './pages/FaydaCallback';

const RegionStatsChartWrapper = () => {
  const { regionName } = useParams();
  return <RegionStatsChart region={regionName} />;
};

const App = () => {
  return (
    <LanguageProvider>
      <UserContext>
        <BookContext>
          <SearchContext>
            <AdminContext>
              <ThemeProvider>
                <AuthProvider>
                  <Routes>
                    <Route path='/' element={<LandingPage />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path='/home' element={<ProtectedRoute>
                                                          <Home />
                                                        </ProtectedRoute>} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Signup />} />
                    <Route path='/about' element={<AboutUs />} />
                    <Route path='/service' element={<Service />} />
                    <Route path='/books/create' element={<CreateBook />} />
                    <Route path='/books/details/:id' element={<ShowBook />} />
                    <Route path='/books/edit/:id' element={<EditBook />} />
                    <Route path='/books/delete/:id' element={<DeleteBook />} />
                    <Route path='/coming' element={<ComingSoon />} />
                    <Route path='/profile' element={<ProfilePage />} />
                    <Route path='/addCandidate' element={<ProtectedRoute>
                                                          <AdminCandidate />
                                                        </ProtectedRoute> } />
                    <Route path='/elections' element={< ElectedPage />} />
                    <Route path="/region/:regionName/stats" element={<RegionStatsChartWrapper />} />
                    <Route path="/admin/dashboard" element={<RegionalDashboard />} />
                    <Route path="/region-admin/:region" element={<AdminDashboard />} />
                    <Route path='/nationalAdmin' element={<NationalDashboard />} />
                    <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
                    <Route path="/candidate-profile" element={<ProtectedRoute><CandidateProfile /></ProtectedRoute>} />
                    <Route path='/admin/manage-users' element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
                    <Route path="/zone-admin/:zone" element={<ZoneAdminDashboard />} />
                    <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
                    <Route path="/system-admin/login" element={<SystemAdminLogin />} />
                    <Route path="/system-admin/dashboard" element={<ProtectedRoute><SystemAdminDashboard /></ProtectedRoute>} />
                    <Route path='/fayda-callback' element={<FaydaCallback />} />
                  </Routes>
                </AuthProvider>
              </ThemeProvider>
            </AdminContext>
          </SearchContext>
        </BookContext>
      </UserContext>
    </LanguageProvider>
  );
};

export default App;

