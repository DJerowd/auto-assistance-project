import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  toggleVehicleFavorite,
  toggleVehicleShare,
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
import { WarningIcon } from "../components/icons/WarningIcon";
import { SharedIcon } from "../components/icons/SharedIcon";

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

  const handleToggleShare = async () => {
    if (!vehicle) return;
    const previousState = vehicle.share_with_friends;
    setVehicle({ ...vehicle, share_with_friends: !previousState });
    try {
      await toggleVehicleShare(vehicle.id);
      addToast({ 
        type: "success", 
        message: !previousState ? "Veículo visível para amigos!" : "Veículo oculto para amigos." 
      });
    } catch (err) {
      console.error("Failed to toggle visibility", err);
      addToast({ type: "error", message: "Erro ao alterar visibilidade." });
      setVehicle({ ...vehicle, share_with_friends: previousState });
    }
  };

  if (isLoading) {
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
          <div className="md:col-span-1 bg-background rounded-xl border border-input p-6 space-y-4 h-full">
            <div className="flex flex-wrap justify-between gap-2">
              <Skeleton className="h-8 w-full" />
              <div className="flex gap-2 w-full">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </div>

            <div className="space-y-4 mt-6">
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
          <div className="bg-background rounded-xl border border-input p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="bg-background rounded-xl border border-input p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex justify-between items-center gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>

        <div className="bg-background rounded-xl border border-input p-6">
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
      <p className="text-destructive text-center">
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
            <div className="aspect-video relative bg-secondary sm:rounded-lg overflow-hidden cursor-pointer group shadow-lg border border-input">
              <img
                src={selectedImage ? selectedImage.url : DEFAULT_VEHICLE_IMG}
                alt={vehicle.model}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="absolute top-3 left-3 z-10">
              <div className="w-16 h-16 bg-background/60 backdrop-blur-sm rounded-full p-1 shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                {vehicle.brand_logo_url ? (
                  <img
                    src={vehicle.brand_logo_url}
                    alt={`Logo ${vehicle.brand_name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <CarIcon className="text-foreground/60" size={28} />
                )}
              </div>
            </div>

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
                          ? "border-primary"
                          : "border-transparent hover:border-foreground/50",
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
            <CardHeader className="border-b border-input pb-4 mb-4">
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {vehicle.nickname || vehicle.model}
                  </CardTitle>
                  <CardDescription>
                    {vehicle.version || "Versão não informada"}
                  </CardDescription>
                </div>

                <div className="flex space-x-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite();
                    }}
                    title={
                      vehicle.is_favorite
                        ? "Remover dos favoritos"
                        : "Adicionar aos favoritos"
                    }
                  >
                    <StarIcon
                      size={16}
                      className={cn(
                        "transition-colors",
                        vehicle.is_favorite
                          ? "text-warning fill-warning"
                          : "text-foreground/50"
                      )}
                    />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleShare();
                    }}
                    title={
                      vehicle.share_with_friends
                        ? "Tornar invisível para amigos"
                        : "Compartilhar com amigos"
                    }
                  >
                    <SharedIcon
                      size={16}
                      className={cn(
                        "transition-colors",
                        vehicle.share_with_friends
                          ? "text-info fill-info"
                          : "text-foreground/50"
                      )}
                    />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsFormModalOpen(true)}
                    title="Editar Informações"
                  >
                    <EditIcon size={16} className="text-foreground/80" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsImagesModalOpen(true)}
                    title="Gerenciar Imagens"
                  >
                    <ImageIcon size={16} className="text-foreground/80" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                <li className="grid grid-cols-3 gap-4 border-b border-input pb-3">
                  <span className="text-secondary-foreground col-span-1 text-sm font-medium">
                    Marca
                  </span>
                  <span className="text-sm font-medium text-foreground col-span-2">
                    {vehicle.brand_name || "N/I"}
                  </span>
                </li>

                <li className="grid grid-cols-3 gap-4 border-b border-input pb-3">
                  <span className="text-sm text-secondary-foreground col-span-1 font-medium">
                    Placa
                  </span>
                  <span className="text-sm font-medium text-foreground col-span-2 uppercase">
                    {vehicle.license_plate}
                  </span>
                </li>

                <li className="grid grid-cols-3 gap-4 border-b border-input pb-3">
                  <span className="text-sm text-secondary-foreground col-span-1 font-medium">
                    Cor
                  </span>
                  <span className="text-sm font-medium text-foreground col-span-2">
                    {vehicle.color_name || "N/I"}
                  </span>
                </li>

                <li className="grid grid-cols-3 gap-4 border-b border-input pb-3">
                  <span className="text-sm text-secondary-foreground col-span-1 font-medium">
                    Ano
                  </span>
                  <span className="text-sm font-medium text-foreground col-span-2">
                    {vehicle.year_of_manufacture} / {vehicle.year_model}
                  </span>
                </li>

                <li className="pt-2 flex justify-between items-center bg-secondary p-3 rounded-lg mt-4">
                  <span className="text-sm text-secondary-foreground flex items-center gap-2 font-medium">
                    <SpeedometerIcon size={16} /> Km Atual
                  </span>
                  <span className="font-bold text-lg text-primary">
                    {vehicle.current_mileage.toLocaleString("pt-BR")} KM
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
              className="w-full flex items-center justify-between h-auto py-3 hover:border-primary/50"
            >
              <span className="flex items-center gap-2">
                <MaintenanceIcon size={18} /> Manutenções
              </span>
              <span className="font-medium text-info bg-info/10 px-2 py-1 rounded-md text-xs">
                {counts.maintenances} Registros
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(`/vehicles/${vehicle.id}/reminders`)}
              className="w-full flex items-center justify-between h-auto py-3 hover:border-pending/50"
            >
              <span className="flex items-center gap-2">
                <BellIcon size={18} /> Lembretes Pendentes
              </span>
              <span className="font-medium text-pending bg-pending/10 px-2 py-1 rounded-md text-xs">
                {counts.reminders} Pendentes
              </span>
            </Button>
          </CardContent>
        </Card>

        <Card className="h-full border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg text-destructive flex items-center gap-2">
              <WarningIcon size={20} /> 
              Zona de Perigo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-1">
                Excluir Veículo
              </h4>
              <p className="text-sm text-secondary-foreground leading-relaxed">
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
          {vehicle.features && vehicle.features.length > 0 ? (
            <div className="p-6">
              <h4 className="text-sm font-semibold text-secondary-foreground uppercase mb-4">
                Opcionais do veículo
              </h4>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((feature) => (
                  <Badge
                    key={feature.id}
                    variant="default"
                    className="bg-secondary text-foreground border-input px-3 py-1.5 text-sm font-medium hover:bg-accent"
                  >
                    {feature.name}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-secondary-foreground">
               Nenhum opcional registrado para este veículo.
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
