import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  getProfile,
  uploadProfileImage,
  deleteProfileImage,
} from "../services/profileService";
import { useAuthStore } from "../store/authStore";
import { Skeleton } from "../components/ui/Skeleton";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/modal/Modal";
import { UserIcon } from "../components/icons/UserIcon";
import { EditIcon } from "../components/icons/EditIcon";
import { TrashIcon } from "../components/icons/TrashIcon";
import { UploadIcon } from "../components/icons/UploadIcon";
import UpdateProfileForm from "../components/profile/UpdateProfileForm";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";
import { useToastStore } from "../store/toastStore";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_image?: string | null;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUser: setAuthUser } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  const fetchProfile = async () => {
    try {
      const userData = await getProfile();
      if (
        userData.profile_image &&
        !userData.profile_image.startsWith("http")
      ) {
        userData.profile_image = `${import.meta.env.VITE_API_BASE_URL.replace(
          "/api",
          ""
        )}/${userData.profile_image}`;
      }
      setUser(userData);
      setAuthUser(userData);
    } catch {
      setError("Falha ao carregar perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadProfileImage(file);
      addToast({ type: "success", message: "Foto de perfil atualizada!" });
      await fetchProfile();
    } catch (error) {
      console.error(error);
      addToast({ type: "error", message: "Erro ao enviar imagem." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm("Tem certeza que deseja remover sua foto?")) return;
    setIsUploading(true);
    try {
      await deleteProfileImage();
      addToast({ type: "success", message: "Foto removida." });
      await fetchProfile();
    } catch (error) {
      console.error(error);
      addToast({ type: "error", message: "Erro ao remover imagem." });
    } finally {
      setIsUploading(false);
    }
  };

  interface UpdatedUserData {
    id: number;
    name: string;
    email: string;
  }

  const handleProfileUpdated = (updatedUser: UpdatedUserData) => {
    if (!user) return;
    const mergedUser: UserProfile = {
      ...updatedUser,
      role: user.role,
      profile_image: user.profile_image,
    };
    setUser(mergedUser);
    setAuthUser(mergedUser);
    setIsProfileModalOpen(false);
  };

  const handlePasswordChanged = () => {
    setIsPasswordModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6">
          {/* Card Foto */}
          <div className="flex flex-col items-center space-y-4 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-gray-800">
            <Skeleton className="w-64 h-64 rounded-full" />
            <div className="space-y-2 text-center">
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
          </div>

          {/* Card Detalhes */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between mb-6">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <Card className="p-4">
        <p className="text-red-500 text-center">
          {error || "Usuário não encontrado."}
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Meu Perfil</h2>
            <CardDescription>
              Gerencie suas informações pessoais.
            </CardDescription>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="relative group">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800">
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Spinner />
                  </div>
                ) : user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-500 dark:text-indigo-300">
                    <UserIcon size={128} />
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 right-0 flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg transition-transform hover:scale-105"
                  title="Alterar foto"
                >
                  <UploadIcon size={16} />
                </button>
                {user.profile_image && (
                  <button
                    onClick={handleDeleteImage}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-transform hover:scale-105"
                    title="Remover foto"
                  >
                    <TrashIcon size={16} />
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileChange}
              />
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-lg dark:text-white">
                {user.name}
              </h3>

              <p className="text-sm text-gray-500">
                {user.role === "ADMIN" ? "Administrador" : "Usuário"}
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle className="flex items-center gap-2">
                Detalhes da Conta
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <EditIcon className="mr-2 h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  Senha
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Nome Completo
                    </label>
                    <p className="text-base font-medium dark:text-white mt-1">
                      {user.name}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Email
                    </label>
                    <p className="text-base font-medium dark:text-white mt-1">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
