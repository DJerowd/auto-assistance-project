import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import { getVehicles, createVehicle } from "../services/vehicleService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { PlusIcon } from "../components/icons/PlusIcon";
import { Button } from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/modal/Modal";
import VehicleForm from "../components/vehicles/VehicleForm";
import type { Vehicle, VehicleFormData } from "../types";

const DEFAULT_VEHICLE_IMG = "http://localhost:8800/public/default-vehicle.png";

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    setIsFormModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
  };

  const handleSaveVehicle = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createVehicle(data);
      handleCloseModals();
      fetchVehicles();
    } catch (err) {
      console.error("Failed to save vehicle", err);
      if (err instanceof AxiosError && err.response) {
        setFormError(err.response.data.message || "Ocorreu um erro ao salvar.");
      } else {
        setFormError("Ocorreu um erro desconhecido.");
      }
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
          <PlusIcon className="mr-2 h-4 w-4" /> Adicionar Veículo
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
              <Link
                to={`/vehicles/${vehicle.id}`}
                key={vehicle.id}
                className="block group"
              >
                <Card
                  key={vehicle.id}
                  className="overflow-hidden flex flex-col"
                >
                  <img
                    src={primaryImage ? primaryImage.url : DEFAULT_VEHICLE_IMG}
                    alt={vehicle.model}
                    className="w-full h-38 object-cover bg-gray-800"
                  />

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
                      {vehicle.model}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title={"Adicionar Novo Veículo"}
      >
        {formError && (
          <p className="text-red-500 text-center text-sm mb-4">{formError}</p>
        )}
        <VehicleForm
          onSubmit={handleSaveVehicle}
          onCancel={handleCloseModals}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default VehiclesPage;
