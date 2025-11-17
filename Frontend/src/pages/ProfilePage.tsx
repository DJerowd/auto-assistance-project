import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { getProfile } from "../services/profileService";
import { useAuthStore } from "../store/authStore";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/modal/Modal";
import { UserIcon } from "../components/icons/UserIcon";
import { EditIcon } from "../components/icons/EditIcon";
import UpdateProfileForm from "../components/profile/UpdateProfileForm";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { setUser: setAuthUser } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
      } catch {
        setError("Falha ao carregar perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdated = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setAuthUser(updatedUser);
    setIsProfileModalOpen(false);
  };

  const handlePasswordChanged = () => {
    setIsPasswordModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error || !user) {
    return (
      <p className="text-red-500 text-center">
        {error || "Usuário não encontrado."}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Meu Perfil</h2>
            <CardDescription>Suas informações de conta.</CardDescription>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setIsProfileModalOpen(true)}
              title="Editar Perfil"
            >
              <EditIcon className="mr-2 h-4 w-4" />
              Alterar Informações
            </Button>

            <Button
              onClick={() => setIsPasswordModalOpen(true)}
            >
              <EditIcon className="mr-2 h-4 w-4" />
              Alterar Senha
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <UserIcon /> Suas informações de conta
              </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Nome
                </label>
                <p className="text-lg dark:text-white">
                  {user.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <p className="text-lg dark:text-white">
                  {user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Editar Perfil"
      >
        <UpdateProfileForm
          currentUser={user}
          onSuccess={handleProfileUpdated}
          onCancel={() => setIsProfileModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Alterar Senha"
      >
        <ChangePasswordForm
          onSuccess={handlePasswordChanged}
          onCancel={() => setIsPasswordModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default ProfilePage;
