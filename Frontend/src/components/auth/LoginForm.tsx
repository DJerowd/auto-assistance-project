import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useAuthStore } from "../../store/authStore";
import { loginUser } from "../../services/authService";
import { EyeIcon } from "../icons/EyeIcon";
import { EyeOffIcon } from "../icons/EyeOffIcon";
import { Input, InputWithIcon } from "../ui/Input";
import { Button } from "../ui/Button";
import type { LoginCredentials } from "../../types";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

const LoginForm = ({ onSuccess, onSwitchToRegister }: LoginFormProps) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { token, user } = await loginUser(credentials);
      if (user.profile_image && !user.profile_image.startsWith("http")) {
        const baseUrl = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
        user.profile_image = `${baseUrl}/${
          user.profile_image.startsWith("/")
            ? user.profile_image.slice(1)
            : user.profile_image
        }`;
      }
      setToken(token);
      setUser(user);
      onSuccess();
      navigate("/dashboard");
    } catch (err) {
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ApiError;
        errorMessage = errorData.message || "Erro ao tentar fazer login.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Email
          </label>
          <Input
            ref={emailInputRef}
            id="login-email"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-foreground mb-1"
          >
            Senha
          </label>
          <InputWithIcon>
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={credentials.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/50 hover:text-foreground/80 transition-colors"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </InputWithIcon>
        </div>

        {error && <p className="text-sm text-center text-destructive">{error}</p>}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Entrar
        </Button>
      </form>

      <div className="text-center text-sm text-secondary-foreground">
        Não tem uma conta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          Cadastre-se
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
