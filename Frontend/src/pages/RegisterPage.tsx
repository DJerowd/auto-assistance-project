import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

import { registerUser } from "../services/authService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { EyeIcon } from "../components/icons/EyeIcon";
import { EyeOffIcon } from "../components/icons/EyeOffIcon";
import { Input, InputWithIcon } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import type { RegisterData } from "../types";

interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await registerUser(formData);
      navigate("/login?registered=true");
    } catch (err) {
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (err instanceof AxiosError && err.response) {
        const errorData = err.response.data as ApiError;
        errorMessage = errorData.errors
          ? Object.values(errorData.errors)[0]
          : errorData.message;
      }
      setError(errorMessage || "Erro ao tentar se cadastrar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Crie sua Conta</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nome
              </label>

              <Input
                ref={nameInputRef}
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
                autoComplete="name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                E-mail
              </label>

              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
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
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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
              Cadastrar
            </Button>
            
            {error && (
              <p className="text-sm text-center text-red-600">{error}</p>
            )}
          </form>

          <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Faça login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
