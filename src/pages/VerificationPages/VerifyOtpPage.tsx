import './VerifyOtpPage.css';
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useVerifyOtpMutation, useResendOtpMutation } from "../../store/api/authApi";
import { setError } from "../../store/slices/authSlice";
import Button from "../../components/ui/Button/Button";
import type { AppDispatch } from "../../store/store";

function VerifyOtpPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const otpEmail = localStorage.getItem("otpEmail");

  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();

  useEffect(() => {
    if (!otpEmail) navigate("/register");
  }, [otpEmail, navigate]);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    dispatch(setError(null));

    try {
      await verifyOtp({ email: otpEmail!, otp }).unwrap();
      localStorage.removeItem("otpEmail");
      navigate("/login");
    } catch (err: any) {
      const message = err?.data?.message || "OTP verification failed";
      setErrorMessage(message);
    }
  };

  const handleResend = async () => {
    if (!otpEmail) return;
    setErrorMessage(null);
    try {
      await resendOtp({ email: otpEmail }).unwrap();
      setErrorMessage("OTP resent! Check your email.");
      setOtp(""); // clear OTP inputs for new code
    } catch (err: any) {
      const message = err?.data?.message || "Failed to resend OTP";
      setErrorMessage(message);
    }
  };

  return (
    <div className="verify-otp-page">
      <div className="verify-otp-container">
        <h2>Verify Your Account</h2>
        <p>Enter the OTP sent to <strong>{otpEmail}</strong></p>

        <form onSubmit={handleVerify}>
          <div className="otp-inputs">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={otp[i] || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/, "");
                  const newOtp = otp.split("");
                  newOtp[i] = val;
                  setOtp(newOtp.join(""));
                  if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                }}
                id={`otp-${i}`}
                required
              />
            ))}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </form>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}{" "}
            <span
              onClick={handleResend}
              style={{ color: "#2f80ed", cursor: "pointer", fontWeight: 500 }}
            >
              Resend OTP
            </span>
          </p>
        )}

      </div>
    </div>
  );
}

export default VerifyOtpPage;
