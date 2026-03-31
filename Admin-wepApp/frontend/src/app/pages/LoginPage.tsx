import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Radio } from "lucide-react";
import React from "react";
import { loginAPI } from "../services/services";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await loginAPI(email, password);
      if (response?.status === 200) {
        navigate("/dashboard");
      } else {
        setError("Invalid email or password.");
      }
    } catch {
      setError("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #8A1538 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8A1538] rounded-xl mb-4">
              <Radio className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl mb-2" style={{ color: '#8A1538' }}>EcoDrone</h1>
            <p className="text-gray-600">Agile 5 Drone Delivery System</p>
            <div className="mt-2 text-sm text-gray-500">Administrator Access</div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
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

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#8A1538] hover:bg-[#6d1029] text-white"
            >
              {isLoading ? "Logging in..." : "Login to Dashboard"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">Secure Admin Portal • ASEM Agile 5</div>
        </div>

        {/* Ashesi Branding */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Powered by Agile 5 Development Labs</p>
        </div>
      </div>
    </div>
  );
}