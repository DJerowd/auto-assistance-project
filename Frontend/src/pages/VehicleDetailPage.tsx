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
import { Badge } from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/modal/Modal";
import ConfirmDialog from "../components/ui/modal/ConfirmDialog";
import VehicleForm from "../components/vehicles/VehicleForm";
import ManageImagesModal from "../components/vehicles/ManageImagesModal";
import { cn } from "../lib/utils";

const DEFAULT_VEHICLE_IMG = "http://localhost:8800/public/default-vehicle.png";

const VehicleDetailPage = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

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
      handleCloseModals();
      handleDataUpdate();
    } catch (err) {
      console.error("Failed to save vehicle", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicle) return;
    setIsSubmitting(true);
    try {
      await deleteVehicle(vehicle.id);
      handleCloseModals();
      navigate("/vehicles");
    } catch (err) {
      console.error("Failed to delete vehicle", err);
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
      setVehicle({ ...vehicle, is_favorite: !vehicle.is_favorite });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
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
      <Button onClick={() => navigate("/vehicles")}>
        <ReturnIcon className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden relative group">
            <div className="w-full h-128 bg-gray-200 dark:bg-gray-700">
              <img
                src={selectedImage ? selectedImage.url : DEFAULT_VEHICLE_IMG}
                alt={vehicle.model}
                className="w-full h-full object-cover"
              />
            </div>
            {vehicle.images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="flex gap-2 overflow-x-auto pb-2">
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

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {vehicle.nickname || vehicle.model}
                    </CardTitle>
                    <CardDescription>
                      {vehicle.version || "Versão não informada"}
                    </CardDescription>
                  </div>

                  <button
                    onClick={handleToggleFavorite}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
              <ul className="space-y-1">
                <li className="pt-2 grid grid-cols-3 gap-4">
                  <span className="text-gray-500 dark:text-gray-400 col-span-1">
                    Marca:
                  </span>
                  <span className="font-medium dark:text-white col-span-2">
                    {vehicle.brand_name || "N/I"}
                  </span>
                </li>

                <li className="pt-2 grid grid-cols-3 gap-4">
                  <span className="text-gray-500 dark:text-gray-400 col-span-1">
                    Placa:
                  </span>
                  <span className="font-medium dark:text-white col-span-2 uppercase">
                    {vehicle.license_plate}
                  </span>
                </li>

                <li className="pt-2 grid grid-cols-3 gap-4">
                  <span className="text-gray-500 dark:text-gray-400 col-span-1">
                    Cor:
                  </span>
                  <span className="font-medium dark:text-white col-span-2">
                    {vehicle.color_name || "N/I"}
                  </span>
                </li>

                <li className="pt-2 grid grid-cols-3 gap-4">
                  <span className="text-gray-500 dark:text-gray-400 col-span-1">
                    Ano Fab/Mod:
                  </span>
                  <span className="font-medium dark:text-white col-span-2">
                    {vehicle.year_of_manufacture} / {vehicle.year_model}
                  </span>
                </li>

                <li className="pt-2 flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <SpeedometerIcon size={16} /> Quilometragem Atual:
                  </span>
                  <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                    {vehicle.current_mileage.toLocaleString("pt-BR")} km
                  </span>
                </li>
              </ul>
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Itens Opcionais
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((feature) => (
                      <Badge key={feature.id} variant="default" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-200 hover:dark:bg-indigo-800">
                        {feature.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/vehicles/${vehicle.id}/maintenances`)}
                className="w-full flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <MaintenanceIcon size={16} /> Manutenções
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {counts.maintenances}
                </span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate(`/vehicles/${vehicle.id}/reminders`)}
                className="w-full flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <BellIcon size={16} /> Lembretes Pendentes
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {counts.reminders}
                </span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="font-semibold dark:text-white">
                  Excluir Veículo
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Esta ação é permanente e excluirá o veículo, seu histórico de
                  manutenções, lembretes e imagens.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex-shrink-0"
              >
                <TrashIcon size={16} className="mr-2" /> Excluir
              </Button>
            </CardContent>
          </Card>
        </div>
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
