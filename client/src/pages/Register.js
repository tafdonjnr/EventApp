import React from 'react';

function Register() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 min-h-screen flex flex-col items-center justify-center">
      <h2 className="heading-2 mb-8">Register</h2>
      <div className="w-full max-w-md space-y-4">
        <input type="text" placeholder="Full Name" className="input-standard" />
        <input type="email" placeholder="Email" className="input-standard" />
        <input type="password" placeholder="Password" className="input-standard" />
        <button type="button" className="primary-btn w-full">Sign Up</button>
      </div>
    </div>
  );
}

export default Register;
