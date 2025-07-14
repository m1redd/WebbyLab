import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, logout } from "../features/auth/authSlice";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    dispatch(
      registerUser({
        email,
        name,
        password,
        confirmPassword: password,
      })
    );
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Movie CRUD</h1>

      <h2>Register</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="text"
        placeholder="Email"
      />
      <br />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        type="text"
        placeholder="Name"
      />
      <br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <br />
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogout} style={{ marginLeft: 10 }}>
        Logout
      </button>

      {auth.status === "loading" && <p>Loading...</p>}
      {auth.status === "succeeded" && <p>Token: {auth.token}</p>}
      {auth.status === "failed" && <p>Error: {JSON.stringify(auth.error)}</p>}

      <hr />
      <p>
        <strong>Token in localStorage:</strong>{" "}
        {localStorage.getItem("token") || "null"}
      </p>
    </div>
  );
};

export default RegisterForm;
