import "./RegisterPage.css";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import InputField from "../../../components/ui/Input/InputField";
import Button from "../../../components/ui/Button/Button";

import { setError } from "../../../store/slices/authSlice";
import { useRegisterMutation } from "../../../store/api/authApi";
import type { AppDispatch } from "../../../store/store";

function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const [register, { isLoading }] = useRegisterMutation();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(setError(null));
    setLocalError(null); // reset error

    try {
      // Call backend
      await register({ firstName, lastName, email, password }).unwrap();

      // Save email for OTP verification
      localStorage.setItem("otpEmail", email);

      // Redirect to OTP verification page
      navigate("/verify-otp");
    } catch (err: any) {
      // Log the full error for debugging
      console.log("Register error:", err);

      // Safely get backend message
      const message =
        err?.data?.message || err?.error || "Registration failed";

      dispatch(setError(message));
      setLocalError(message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <InputField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <InputField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit">
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>

          {/* Display backend/local error */}
          {localError && (
            <p style={{ color: "red", marginTop: 8 }}>{localError}</p>
          )}

          <p className="login-redirect">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer", color: "#4f46e5", fontWeight: 500 }}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
