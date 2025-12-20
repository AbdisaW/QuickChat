import './LoginPage.css';
import MessageIcon from "../../../assets/images/icons/MessageIcon";
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button/Button';
import InputField from '../../../components/ui/Input/InputField';
import { useEffect, useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setError } from '../../../store/slices/authSlice';
import { useLoginMutation } from '../../../store/api/authApi';
import type { AppDispatch, RootState } from '../../../store/store';

function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(setError(null));
    try {
      const response = await login({ email, password }).unwrap();
      if (response.user.status === "PENDING") {
        localStorage.setItem("otpEmail", response.user.email);
        navigate("/verify-otp");
        return;
      }
      dispatch(setCredentials({ user: response.user, token: response.token }));
      navigate("/dashboard");
    } catch {
      dispatch(setError("Login failed"));
    }
  };

  return (
    <div className='login-page'>
      <div className="login-container">
        <div className="quick-logo">
          <div className='circle-warp'><MessageIcon width={30} height={30} color="white" /></div>
          <h4 className="app-title">QuickChat App</h4>
          <p className="app-subtitle">Sign in to continue</p>
        </div>
        <form onSubmit={handleLogin}>
          <InputField label="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <InputField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit">{isLoading ? "Signing in..." : "Sign In"}</Button>
          {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
          <p className="signup-redirect">
            Don’t have an account? <span onClick={() => navigate("/register")} style={{ color: "#4f46e5", cursor: "pointer" }}>Sign up</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
