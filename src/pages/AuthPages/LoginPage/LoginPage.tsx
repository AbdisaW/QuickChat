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

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(setError(null));

    try {
      const response = await login({ email, password }).unwrap();

      if (response.user.status === "PENDING") {
        dispatch(setError("Please verify your account before logging in."));
        return;
      }

      dispatch(setCredentials({ user: response.user, token: "SOME_TOKEN" }));
      navigate("/dashboard");
    }

    catch (err) {
      dispatch(setError("Login failed"));
    }
  };


  return (
    <div className='login-page'>
      <div className="login-container">
        <div className="quick-logo">
          <div className='circle-warp'>
            <MessageIcon width={30} height={30} color="white" />
          </div>
          <h4 className="app-title">QuickChat App</h4>
          <p className="app-subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <InputField
            label="Email"
            id="email"
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <InputField
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
