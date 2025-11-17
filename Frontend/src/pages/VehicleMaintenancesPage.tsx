import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getVehicleMaintenances,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from "../services/maintenanceService";
import { getVehicleById } from "../services/vehicleService";
import type { Maintenance, MaintenanceFormData, Vehicle } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { ReturnIcon } from "../components/icons/ReturnIcon";
import { PlusIcon } from "../components/icons/PlusIcon";
import { EditIcon } from "../components/icons/EditIcon";
import { TrashIcon } from "../components/icons/TrashIcon";
import { CalendarIcon } from "../components/icons/CalendarIcon";
import { SpeedometerIcon } from "../components/icons/SpeedometerIcon";
import { MaintenanceIcon } from "../components/icons/MaintenanceIcon";
import { Button } from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/modal/Modal";
import ConfirmDialog from "../components/ui/modal/ConfirmDialog";
import MaintenanceForm from "../components/maintenances/MaintenanceForm";
import { MoneyIcon } from "../components/icons/MoneyIcon";

const VehicleMaintenancesPage = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<Maintenance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!vehicleId) return;
    try {
      setIsLoading(true);
      const [vehicleData, maintenanceData] = await Promise.all([
        getVehicleById(Number(vehicleId)),
        getVehicleMaintenances(Number(vehicleId)),
      ]);
      setVehicle(vehicleData);
      setMaintenances(maintenanceData.data);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [vehicleId]);

  const handleOpenAddModal = () => {
    setSelectedMaintenance(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedMaintenance(null);
  };

  const handleSave = async (data: MaintenanceFormData) => {
    if (!vehicleId) return;
    setIsSubmitting(true);
    try {
      if (selectedMaintenance) {
        await updateMaintenance(selectedMaintenance.id, data);
      } else {
        await createMaintenance(Number(vehicleId), data);
      }
      handleCloseModals();
      fetchData();
    } catch (error) {
      console.error("Failed to save maintenance", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMaintenance) return;
    setIsSubmitting(true);
    try {
      await deleteMaintenance(selectedMaintenance.id);
      handleCloseModals();
      fetchData();
    } catch (error) {
      console.error("Failed to delete maintenance", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="h-64">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Manutenções</h2>
          <CardDescription>
            {vehicle?.nickname || vehicle?.model}
          </CardDescription>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate(-1)}>
            <ReturnIcon className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button onClick={handleOpenAddModal}>
            <PlusIcon className="mr-2 h-4 w-4" /> Nova Manutenção
          </Button>
        </div>
      </div>

      {maintenances.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600 dark:text-gray-400">
            Nenhuma manutenção registrada para este veículo.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
          {maintenances.map((maintenance) => (
            <Card
              key={maintenance.id}
              className="overflow-hidden flex flex-col"
            >
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle
                  className="truncate"
                  title={maintenance.service_type}
                >
                  {maintenance.service_type}
                </CardTitle>

                <div className="flex space-x-2 self-end md:self-center flex-shrink-0">
                  <Button
                    variant="secondary"
                    onClick={() => handleOpenEditModal(maintenance)}
                    title="Editar"
                  >
                    <EditIcon size={16} />
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() => handleOpenDeleteModal(maintenance)}
                    title="Excluir"
                  >
                    <TrashIcon size={16} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon size={14} />
                      {new Date(
                        maintenance.maintenance_date
                      ).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <SpeedometerIcon size={14} />
                      {maintenance.mileage.toLocaleString("pt-BR")} km
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MoneyIcon size={14} />
                      R${" "}
                      {maintenance.cost.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    {maintenance.service_provider && (
                      <span className="flex items-center gap-1.5">
                        <MaintenanceIcon size={14} />{" "}
                        {maintenance.service_provider}
                      </span>
                    )}
                  </div>
                  {maintenance.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic truncate">
                      "{maintenance.notes}"
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title={selectedMaintenance ? "Editar Manutenção" : "Nova Manutenção"}
      >
        <MaintenanceForm
          onSubmit={handleSave}
          onCancel={handleCloseModals}
          initialData={selectedMaintenance}
          isLoading={isSubmitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        title="Excluir Manutenção"
        description="Tem certeza que deseja excluir este registro de manutenção? Esta ação não pode ser desfeita."
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default VehicleMaintenancesPage;
