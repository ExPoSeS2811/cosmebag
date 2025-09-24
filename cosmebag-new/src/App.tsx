import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PhoneFrame } from './layouts/PhoneFrame';
import { MobileLayout } from './layouts/MobileLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { MyBagPage } from './pages/MyBagPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { PassportPage } from './pages/PassportPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <PhoneFrame>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes with layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MobileLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="bag" element={<MyBagPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="passport" element={<PassportPage />} />
              <Route path="scan" element={
                <div className="p-4 text-center">
                  <p>Функция сканирования скоро будет доступна!</p>
                </div>
              } />
              <Route path="products" element={
                <div className="p-4 text-center">
                  <p>Каталог продуктов скоро будет доступен!</p>
                </div>
              } />
              <Route path="feed" element={
                <div className="p-4 text-center">
                  <p>Лента активности скоро будет доступна!</p>
                </div>
              } />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PhoneFrame>
      </Router>
    </AuthProvider>
  );
}

export default App;