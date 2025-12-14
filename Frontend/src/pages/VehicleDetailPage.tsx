import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  toggleVehicleFavorite,
} from "../services/vehicleService";
import { getVehicleMaintenances } from "../services/maintenanceService";
import { getVehicleReminders } from "../services/reminderService";
import type { Vehicle, VehicleFormData, VehicleImage } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ReturnIcon } from "../components/icons/ReturnIcon";
import { EditIcon } from "../components/icons/EditIcon";
import { TrashIcon } from "../components/icons/TrashIcon";
import { ImageIcon } from "../components/icons/ImageIcon";
import { MaintenanceIcon } from "../components/icons/MaintenanceIcon";
import { BellIcon } from "../components/icons/BellIcon";
import { SpeedometerIcon } from "../components/icons/SpeedometerIcon";
import { StarIcon } from "../components/icons/StarIcon";
import { CarIcon } from "../components/icons/CarIcon";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import Modal from "../components/ui/modal/Modal";
import ConfirmDialog from "../components/ui/modal/ConfirmDialog";
import VehicleForm from "../components/vehicles/VehicleForm";
import ManageImagesModal from "../components/vehicles/ManageImagesModal";
import { useToastStore } from "../store/toastStore";
import { cn } from "../lib/utils";

const DEFAULT_VEHICLE_IMG = "http://localhost:8800/public/default-vehicle.png";

const VehicleDetailPage = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<VehicleImage | null>(null);
  const [counts, setCounts] = useState({ maintenances: 0, reminders: 0 });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVehicleData = async (id: number) => {
    try {
      setIsLoading(true);
      const [vehicleData, maintenanceData, reminderData] = await Promise.all([
        getVehicleById(id),
        getVehicleMaintenances(id, 1, 1),
        getVehicleReminders(id, 1, 1, "PENDING"),
      ]);
      setVehicle(vehicleData);
      setCounts({
        maintenances: maintenanceData.pagination.totalItems,
        reminders: reminderData.pagination.totalItems,
      });
      const primary =
        vehicleData.images.find((img: VehicleImage) => img.is_primary) ||
        vehicleData.images[0];
      setSelectedImage(primary || null);
    } catch {
      setError("Não foi possível carregar os dados do veículo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleData(Number(vehicleId));
    }
  }, [vehicleId]);

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsImagesModalOpen(false);
  };

  const handleDataUpdate = () => {
    if (vehicleId) {
      fetchVehicleData(Number(vehicleId));
    }
  };

  const handleSaveVehicle = async (data: VehicleFormData) => {
    if (!vehicle) return;
    setIsSubmitting(true);
    try {
      await updateVehicle(vehicle.id, data);
      addToast({
        type: "success",
        message: "Informações atualizadas com sucesso!",
      });
      handleCloseModals();
      handleDataUpdate();
    } catch (err) {
      console.error("Failed to save vehicle", err);
      addToast({ type: "error", message: "Erro ao salvar alterações." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicle) return;
    setIsSubmitting(true);
    try {
      await deleteVehicle(vehicle.id);
      addToast({ type: "success", message: "Veículo excluído com sucesso." });
      handleCloseModals();
      navigate("/vehicles");
    } catch (err) {
      console.error("Failed to delete vehicle", err);
      addToast({ type: "error", message: "Erro ao excluir veículo." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!vehicle) return;
    try {
      setVehicle({ ...vehicle, is_favorite: !vehicle.is_favorite });
      await toggleVehicleFavorite(vehicle.id);
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      addToast({ type: "error", message: "Erro ao alterar favorito." });
      setVehicle({ ...vehicle, is_favorite: !vehicle.is_favorite });
    }
  };

  if (!isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex">
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Imagem Principal */}
          <div className="md:col-span-2">
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>

          {/* Card de Detalhes */}
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 h-full">
            <div className="flex flex-wrap justify-between gap-2">
              <Skeleton className="h-8 w-full mb-" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>

            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex justify-between items-center gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <p className="text-red-500 text-center">
        {error || "Veículo não encontrado."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Button onClick={() => navigate("/vehicles")}>
        <ReturnIcon className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Imagem Principal */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden relative group h-full border-0 shadow-none bg-transparent">
            <div className="aspect-video relative bg-gray-100 dark:bg-gray-800 sm:rounded-lg overflow-hidden cursor-pointer group shadow-lg border border-gray-200 dark:border-gray-700">
              <img
                src={selectedImage ? selectedImage.url : DEFAULT_VEHICLE_IMG}
                alt={vehicle.model}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="absolute top-3 left-3 z-10">
              <div className="w-16 h-16 bg-white/40 dark:bg-gray-900/40 rounded-full p-1 shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                {vehicle.brand_logo_url ? (
                  <img
                    src={vehicle.brand_logo_url}
                    alt={`Logo ${vehicle.brand_name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <CarIcon
                    className="text-gray-500 dark:text-gray-400"
                    size={28}
                  />
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/40 dark:bg-black/40 text-gray-600  dark:text-gray-300 hover:text-yellow-500 hover:bg-gray-100/40 dark:hover:bg-gray-700/40 shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
              title={
                vehicle.is_favorite
                  ? "Remover dos favoritos"
                  : "Adicionar aos favoritos"
              }
            >
              <StarIcon
                size={24}
                className={cn(
                  "transition-colors",
                  vehicle.is_favorite
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-400 dark:text-gray-500"
                )}
              />
            </button>

            {vehicle.images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {vehicle.images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image)}
                      className={cn(
                        "w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all",
                        selectedImage?.id === image.id
                          ? "border-indigo-500"
                          : "border-transparent hover:border-gray-400"
                      )}
                    >
                      <img
                        src={image.url}
                        alt="Miniatura"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Card de Detalhes */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {vehicle.nickname || vehicle.model}
                  </CardTitle>
                  <CardDescription>
                    {vehicle.version || "Versão não informada"}
                  </CardDescription>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsFormModalOpen(true)}
                    title="Editar Informações"
                  >
                    <EditIcon size={16} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsImagesModalOpen(true)}
                    title="Gerenciar Imagens"
                  >
                    <ImageIcon size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2">
                <li className="grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 dark:text-gray-400 col-span-1">
                    Marca:
                  </span>

                  <span className="text-sm font-medium dark:text-white col-span-2">
                    {vehicle.brand_name || "N/I"}
                  </span>
                </li>

                <li className="grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 col-span-1">
                    Placa
                  </span>
                  <span className="text-sm font-medium dark:text-white col-span-2 uppercase">
                    {vehicle.license_plate}
                  </span>
                </li>

                <li className="grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 col-span-1">
                    Cor
                  </span>
                  <span className="text-sm font-medium dark:text-white col-span-2">
                    {vehicle.color_name || "N/I"}
                  </span>
                </li>

                <li className="grid grid-cols-3 gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 col-span-1">
                    Ano
                  </span>
                  <span className="text-sm font-medium dark:text-white col-span-2">
                    {vehicle.year_of_manufacture} / {vehicle.year_model}
                  </span>
                </li>

                <li className="pt-2 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <SpeedometerIcon size={16} /> Km Atual
                  </span>
                  <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                    {vehicle.current_mileage.toLocaleString("pt-BR")}
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/vehicles/${vehicle.id}/maintenances`)}
              className="w-full flex items-center justify-between h-auto py-3"
            >
              <span className="flex items-center gap-2">
                <MaintenanceIcon size={18} /> Manutenções
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md text-xs">
                {counts.maintenances} Registros
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(`/vehicles/${vehicle.id}/reminders`)}
              className="w-full flex items-center justify-between h-auto py-3"
            >
              <span className="flex items-center gap-2">
                <BellIcon size={18} /> Lembretes Pendentes
              </span>
              <span className="font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-md text-xs">
                {counts.reminders} Pendentes
              </span>
            </Button>
          </CardContent>
        </Card>

        <Card className="h-full border-red-200 dark:border-red-900/30">
          <CardHeader>
            <CardTitle className="text-lg text-red-600 dark:text-red-400">
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-medium dark:text-white mb-1">
                Excluir Veículo
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Esta ação é permanente e excluirá todo o histórico.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex-shrink-0 w-full sm:w-auto"
            >
              <TrashIcon size={16} className="mr-2" /> Excluir
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="gap-6">
        <Card className="h-full">
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="p-6">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                Opcionais do veículo
              </h4>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((feature) => (
                  <Badge
                    key={feature.id}
                    variant="default"
                    className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 hover:dark:bg-indigo-800"
                  >
                    {feature.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title="Editar Veículo"
      >
        <VehicleForm
          onSubmit={handleSaveVehicle}
          onCancel={handleCloseModals}
          initialData={vehicle}
          isLoading={isSubmitting}
        />
      </Modal>

      <ManageImagesModal
        isOpen={isImagesModalOpen}
        onClose={handleCloseModals}
        vehicle={vehicle}
        onUpdate={handleDataUpdate}
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteVehicle}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o veículo "${
          vehicle.nickname || vehicle.model
        }"? Esta ação não poderá ser desfeita.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default VehicleDetailPage;
