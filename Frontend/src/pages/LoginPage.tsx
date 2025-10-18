import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";

import { useAuthStore } from "../store/authStore";
import { loginUser } from "../services/authService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/Card";
import { EyeIcon } from "../components/icons/EyeIcon";
import { EyeOffIcon } from "../components/icons/EyeOffIcon";
import { Input, InputWithIcon } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import type { LoginCredentials } from "../types";

interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

const LoginPage = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken, setUser } = useAuthStore();
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
    if (searchParams.get("registered") === "true") {
      setSuccessMessage(
        "Cadastro realizado com sucesso! Faça o login para continuar."
      );
    }
  }, [searchParams]);

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
      setToken(token);
      setUser(user);
      navigate("/");
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Bem-vindo de Volta
          </CardTitle>
          {successMessage && (
            <CardDescription className="text-center text-green-600 pt-2">
              {successMessage}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>

              <Input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Senha
              </label>

              <InputWithIcon>
                <Input
                  id="password"
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
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </InputWithIcon>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Entrar
            </Button>
            
            {error && (
              <p className="text-sm text-center text-red-600">{error}</p>
            )}
          </form>

          <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Cadastre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
