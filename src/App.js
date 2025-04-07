import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import User from './components/User';
import Admin from './components/Admin';

function App() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/user" element={<User />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;