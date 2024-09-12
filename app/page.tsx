"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CircularProgress, Button, TextField } from "@mui/material";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // Fixed password as per instructions
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Manage loading state
  const router = useRouter();

  async function handleLogin() {
    if (!username || !password) {
      setError("Please provide both username and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API + "ru/data/v3/testmethods/docs/login",
        {
          method: "POST",
          body: JSON.stringify({ username, password }),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();
      localStorage.setItem("token", data.data.token);
      router.push("/tables");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Login</h1>
      <TextField
        className="m-2"
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <TextField
        className="m-2"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        disabled={loading} // Disable button while loading
      >
        {loading ? <CircularProgress size={24} /> : "Login"}
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginPage;
