import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { updateProfile } from "../../services/profileService";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface UpdateProfileFormProps {
  currentUser: UserProfile;
  onSuccess: (updatedUser: UserProfile) => void;
  onCancel: () => void;
}

const UpdateProfileForm = ({
  currentUser,
  onSuccess,
  onCancel,
}: UpdateProfileFormProps) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage({ type: "", text: "" });

    try {
      const { user } = await updateProfile({ name, email });
      onSuccess(user);
    } catch (err) {
      let msg = "Erro ao atualizar perfil.";
      if (err instanceof AxiosError && err.response) {
        msg = err.response.data.message || msg;
      }
      setMessage({ type: "error", text: msg });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleUpdateProfile}>
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Nome
        </label>
        <Input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Email
        </label>
        <Input
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
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
        <Button type="submit" isLoading={isUpdatingProfile}>
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

export default UpdateProfileForm;
