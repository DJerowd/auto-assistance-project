import { useState } from "react";
import { AxiosError } from "axios";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { changePassword } from "../../services/profileService";
import { EyeIcon } from "../icons/EyeIcon";
import { EyeOffIcon } from "../icons/EyeOffIcon";

interface ChangePasswordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ChangePasswordForm = ({
  onSuccess,
  onCancel,
}: ChangePasswordFormProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmNewPassword) {
      setMessage({
        type: "error",
        text: "As novas senhas não coincidem.",
      });
      setIsUpdatingPassword(false);
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      onSuccess();
    } catch (err) {
      let msg = "Erro ao alterar senha.";
      if (err instanceof AxiosError && err.response) {
        msg = err.response.data.message || msg;
      }
      setMessage({ type: "error", text: msg });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleChangePassword}>
      <div className="relative">
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Senha Atual
        </label>
        <Input
          name="currentPassword"
          type={showCurrent ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowCurrent(!showCurrent)}
          className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500"
        >
          {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Nova Senha
        </label>
        <Input
          name="newPassword"
          type={showNew ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500"
        >
          {showNew ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      
      <div className="relative">
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Confirmar Nova Senha
        </label>
        <Input
          name="confirmNewPassword"
          type={showConfirm ? "text" : "password"}
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500"
        >
          {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {message.text && (
        <p
          className={`text-sm ${
            message.type === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isUpdatingPassword}>
          Alterar Senha
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
