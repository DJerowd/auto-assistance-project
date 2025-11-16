import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../services/vehicleService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { PlusIcon } from "../components/icons/PlusIcon";
import { MaintenanceIcon } from "../components/icons/MaintenanceIcon";
import { ImageIcon } from "../components/icons/ImageIcon";
import { EditIcon } from "../components/icons/EditIcon";
import { TrashIcon } from "../components/icons/TrashIcon";
import { BellIcon } from "../components/icons/BellIcon";
import { Button } from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/modal/Modal";
import ManageImagesModal from "../components/vehicles/ManageImagesModal";
import ConfirmDialog from "../components/ui/modal/ConfirmDialog";
import VehicleForm from "../components/vehicles/VehicleForm";
import type { Vehicle, VehicleFormData } from "../types";

const DEFAULT_VEHICLE_IMG = "http://localhost:8800/public/default-vehicle.png";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const response = await getVehicles();
      setVehicles(response.data);
    } catch {
      setError("Não foi possível carregar seus veículos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedVehicle(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };

  const handleOpenImagesModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsImagesModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsImagesModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleSaveVehicle = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedVehicle) {
        await updateVehicle(selectedVehicle.id, data);
      } else {
        await createVehicle(data);
      }
      handleCloseModals();
      fetchVehicles();
    } catch (err) {
      console.error("Failed to save vehicle", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;
    setIsSubmitting(true);
    try {
      await deleteVehicle(selectedVehicle.id);
      handleCloseModals();
      fetchVehicles();
    } catch (err) {
      console.error("Failed to delete vehicle", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Meus Veículos</h2>

        <Button onClick={handleOpenAddModal}>
          <PlusIcon className="mr-2 h-4 w-4" /> Novo Veículo
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600 dark:text-gray-400">
            Você ainda não cadastrou nenhum veículo.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => {
            const primaryImage =
              vehicle.images.find((img) => img.is_primary) || vehicle.images[0];
            return (
              <Card key={vehicle.id} className="overflow-hidden flex flex-col">
                <img
                  src={primaryImage ? primaryImage.url : DEFAULT_VEHICLE_IMG}
                  alt={vehicle.model}
                  className="w-full h-38 object-cover bg-gray-800"
                />

                <div className="flex-grow flex flex-col">
                  <CardHeader>
                    <CardTitle
                      className="truncate"
                      title={vehicle.nickname || vehicle.model}
                    >
                      {vehicle.nickname || vehicle.model}
                    </CardTitle>

                    <p
                      className="text-sm text-gray-500 dark:text-gray-400 truncate"
                      title={`${
                        vehicle.brand_name || "Marca não informada"
                      } - ${vehicle.year_model}`}
                    >
                      {vehicle.brand_name || "Marca não informada"} -{" "}
                      {vehicle.year_model}
                    </p>
                  </CardHeader>

                  <CardContent className="mt-auto flex justify-center space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        navigate(`/vehicles/${vehicle.id}/reminders`)
                      }
                      title="Lembretes"
                    >
                      <BellIcon size={16} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        navigate(`/vehicles/${vehicle.id}/maintenances`)
                      }
                      title="Manutenções"
                    >
                      <MaintenanceIcon size={16} />{" "}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(vehicle)}
                      title="Editar"
                    >
                      <EditIcon size={16} />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenImagesModal(vehicle)}
                      title="Imagens"
                    >
                      <ImageIcon size={16} />
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenDeleteModal(vehicle)}
                      title="Excluir"
                    >
                      <TrashIcon size={16} />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title={selectedVehicle ? "Editar Veículo" : "Adicionar Novo Veículo"}
      >
        <VehicleForm
          onSubmit={handleSaveVehicle}
          onCancel={handleCloseModals}
          initialData={selectedVehicle}
          isLoading={isSubmitting}
        />
      </Modal>

      <ManageImagesModal
        isOpen={isImagesModalOpen}
        onClose={handleCloseModals}
        vehicle={selectedVehicle}
        onUpdate={fetchVehicles}
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteVehicle}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o veículo "${
          selectedVehicle?.nickname || selectedVehicle?.model
        }"? Esta ação não poderá ser desfeita.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default VehiclesPage;
