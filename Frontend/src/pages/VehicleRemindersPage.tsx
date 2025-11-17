import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getVehicleReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "../services/reminderService";
import { getVehicleById } from "../services/vehicleService";
import type { Reminder, ReminderFormData, Vehicle } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ReturnIcon } from "../components/icons/ReturnIcon";
import { PlusIcon } from "../components/icons/PlusIcon";
import { EditIcon } from "../components/icons/EditIcon";
import { TrashIcon } from "../components/icons/TrashIcon";
import { CalendarIcon } from "../components/icons/CalendarIcon";
import { SpeedometerIcon } from "../components/icons/SpeedometerIcon";
import ReminderStatusBadge from "../components/reminders/ReminderStatusBadge";
import Spinner from "../components/ui/Spinner";
import ProgressBar from "../components/ui/ProgressBar";
import Modal from "../components/ui/modal/Modal";
import ConfirmDialog from "../components/ui/modal/ConfirmDialog";
import ReminderForm from "../components/reminders/ReminderForm";

const calculateRemainingDays = (dateStr: string) => {
  const today = new Date();
  const targetDate = new Date(dateStr);
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateRemainingKm = (current: number, target: number) => {
  const remaining = target - current;
  return remaining > 0 ? remaining : 0;
};

const VehicleRemindersPage = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!vehicleId) return;
    try {
      setIsLoading(true);
      const [vehicleData, reminderData] = await Promise.all([
        getVehicleById(Number(vehicleId)),
        getVehicleReminders(Number(vehicleId)),
      ]);
      setVehicle(vehicleData);
      setReminders(reminderData.data);
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
    setSelectedReminder(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedReminder(null);
  };

  const handleSave = async (data: ReminderFormData) => {
    if (!vehicleId) return;
    setIsSubmitting(true);
    try {
      if (selectedReminder) {
        await updateReminder(selectedReminder.id, data);
      } else {
        await createReminder(Number(vehicleId), data);
      }
      handleCloseModals();
      fetchData();
    } catch (error) {
      console.error("Failed to save reminder", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReminder) return;
    setIsSubmitting(true);
    try {
      await deleteReminder(selectedReminder.id);
      handleCloseModals();
      fetchData();
    } catch (error) {
      console.error("Failed to delete reminder", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusClass = (status: Reminder["status"]) => {
    switch (status) {
      case "PENDING":
        return "border-yellow-500";
      case "COMPLETED":
        return "border-green-500";
      case "CANCELLED":
        return "border-red-500";
      default:
        return "border-gray-300";
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
        <h2 className="text-2xl font-bold dark:text-white">
          Lembretes de {vehicle?.nickname || vehicle?.model}
        </h2>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate(-1)}
          >
            <ReturnIcon className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button
            onClick={handleOpenAddModal}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Novo Lembrete
          </Button>
        </div>
      </div>

      {reminders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600 dark:text-gray-400">
            Nenhum lembrete cadastrado para este veículo.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => {
            let remainingDays: number | null = null;
            let remainingKm: number | null = null;
            let progressKm = 0;

            if (reminder.date_threshold) {
              remainingDays = calculateRemainingDays(reminder.date_threshold);
            }
            if (reminder.mileage_threshold && vehicle) {
              remainingKm = calculateRemainingKm(
                vehicle.current_mileage,
                reminder.mileage_threshold
              );
              progressKm = vehicle.current_mileage;
            }

            return (
              <Card
                key={reminder.id}
                className={`border-l-4 ${getStatusClass(reminder.status)}`}
              >
                <CardHeader className="flex-row items-center justify-between">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <CardTitle
                      className="truncate"
                      title={reminder.service_type}
                    >
                      {reminder.service_type}
                    </CardTitle>
                    <ReminderStatusBadge status={reminder.status} />
                  </div>

                  <div className="flex space-x-2 self-end md:self-center flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(reminder)}
                      title="Editar"
                    >
                      <EditIcon size={16} />
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenDeleteModal(reminder)}
                      title="Excluir"
                    >
                      <TrashIcon size={16} />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex-grow space-y-2 w-full">
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {reminder.date_threshold && (
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon size={14} />
                          Alvo:{" "}
                          {new Date(
                            reminder.date_threshold
                          ).toLocaleDateString()}
                        </span>
                      )}

                      {reminder.mileage_threshold && (
                        <span className="flex items-center gap-1.5">
                          <SpeedometerIcon size={14} />
                          Alvo:{" "}
                          {reminder.mileage_threshold.toLocaleString(
                            "pt-BR"
                          )}{" "}
                          km
                        </span>
                      )}
                    </div>

                    {reminder.status === "PENDING" && (
                      <div className="space-y-2 pt-2">
                        {reminder.mileage_threshold && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                Progresso (Km)
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                Faltam {remainingKm?.toLocaleString("pt-BR")} km
                              </span>
                            </div>
                            <ProgressBar
                              value={progressKm}
                              max={reminder.mileage_threshold}
                            />

                            <div className="flex justify-between text-xs text-gray-500">
                              <span>
                                {progressKm.toLocaleString("pt-BR")} km
                              </span>
                              <span>
                                {reminder.mileage_threshold.toLocaleString(
                                  "pt-BR"
                                )}{" "}
                                km
                              </span>
                            </div>
                          </div>
                        )}

                        {reminder.date_threshold && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Tempo Restante:{" "}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {remainingDays !== null
                                ? `${remainingDays} dias`
                                : "N/A"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {reminder.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 pt-1 italic">
                        "{reminder.notes}"
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title={selectedReminder ? "Editar Lembrete" : "Novo Lembrete"}
      >
        <ReminderForm
          onSubmit={handleSave}
          onCancel={handleCloseModals}
          initialData={selectedReminder}
          isLoading={isSubmitting}
          vehicle={vehicle}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        title="Excluir Lembrete"
        description="Tem certeza que deseja excluir este lembrete? Esta ação não pode ser desfeita."
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default VehicleRemindersPage;
