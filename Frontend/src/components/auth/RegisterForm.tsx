import React, { useState, useEffect, useRef } from "react";
import { AxiosError } from "axios";
import { registerUser } from "../../services/authService";
import { EyeIcon } from "../icons/EyeIcon";
import { EyeOffIcon } from "../icons/EyeOffIcon";
import { Input, InputWithIcon } from "../ui/Input";
import { Button } from "../ui/Button";
import type { RegisterData } from "../../types";

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      onSuccess();
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
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={handleRegister}>
        <div>
          <label
            htmlFor="register-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Nome
          </label>
          <Input
            ref={nameInputRef}
            id="register-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            E-mail
          </label>
          <Input
            id="register-email"
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
            htmlFor="register-password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Senha
          </label>
          <InputWithIcon>
            <Input
              id="register-password"
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

        {error && <p className="text-sm text-center text-red-600">{error}</p>}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Cadastrar
        </Button>
      </form>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Já tem uma conta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
        >
          Faça login
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
