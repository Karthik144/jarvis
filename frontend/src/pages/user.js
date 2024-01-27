import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nibfafwhlabdjvkzpvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pYmZhZndobGFiZGp2a3pwdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ5MDk3NTUsImV4cCI6MjAyMDQ4NTc1NX0.jWvB1p6VVEgG0sqjjsbL9EXNZpSWZfaAqA3uMCKx5AU';

const supabase = createClient(supabaseUrl, supabaseKey);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    })
  }   

  async function handleSignUp() {
    console.log(supabase)
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            emailRedirectTo: 'http://localhost:3000/'
        }
    })
    console.error(error)
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Login or Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ margin: '10px', padding: '5px' }}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ margin: '10px', padding: '5px' }}
      />
      <br />
      <button onClick={handleLogin} style={{ margin: '10px', padding: '5px' }}>
        Log In
      </button>
      <button onClick={handleSignUp} style={{ margin: '10px', padding: '5px' }}>
        Sign Up
      </button>
    </div>
  );
};

export default LoginPage;
