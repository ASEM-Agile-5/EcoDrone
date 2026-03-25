import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Radio } from "lucide-react";
import React from "react";
import { loginAPI } from "../services/services";
// import { setCookieData } from "../utils/cookies";
import { LoginResponse } from "../models/users";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt");
    setError("");

    try {
      const response: any = await loginAPI(email, password);

      if (!response) {
        throw new Error("Login failed");
      }
      if (response.status === 401) {
        console.log("Wrong credentials");
        setError("Password or email is incorrect. Please try again.");
        return;
      }

      const data = response.data;

      // Handle non_field_errors from the API (e.g. incorrect credentials)
      if (data?.non_field_errors && data.non_field_errors.length > 0) {
        const errorMessage = data.non_field_errors.join(", ");
        setError(errorMessage);
        return;
      }

      const loginData: LoginResponse = data;
      console.log(loginData);
      const token = loginData.token;
      const user_id = loginData.user_id;

      console.log(token, user_id);
      console.log("Login successful", token, user_id);
      if (token && user_id) {
        // response.cookies
        // setCookieData("access_token", token)
        // setCookieData("user_id", user_id)
        navigate("/dashboard");

        localStorage.getItem("lastname");
      }
    } catch (error: any) {
      console.error(error);

      // Also handle non_field_errors from error responses (e.g. 400 status)
      const errData = error?.response?.data;
      if (errData?.non_field_errors && errData.non_field_errors.length > 0) {
        setError(errData.non_field_errors.join(", "));
        return;
      }

      setError("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #8A1538 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8A1538] rounded-xl mb-4">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl mb-2" style={{ color: "#8A1538" }}>
              EcoDrone
            </h1>
            <p className="text-gray-600">Agile 5 Drone Delivery System</p>
            <div className="mt-2 text-sm text-gray-500">
              Administrator Access
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Ashesi Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ashesi.edu.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#8A1538] hover:bg-[#6d1029] text-white"
            >
              Login to Dashboard
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Secure Admin Portal • ASEM Agile 5
          </div>
        </div>

        {/* Ashesi Branding */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Powered by Agile 5 Development Labs
          </p>
        </div>
      </div>
    </div>
  );
}
