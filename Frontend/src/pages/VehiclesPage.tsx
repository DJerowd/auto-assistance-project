import { useEffect, useState, useCallback } from "react";
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
import { Input } from "../components/ui/Input";
import type { Vehicle, VehicleFormData, PaginatedResponse } from "../types";

const DEFAULT_VEHICLE_IMG = "http://localhost:8800/public/default-vehicle.png";

const VehiclesPage = () => {
  const [vehiclesResponse, setVehiclesResponse] =
    useState<PaginatedResponse<Vehicle> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getVehicles(currentPage, 8, debouncedQuery);
      setVehiclesResponse(response);
    } catch {
      setError("Não foi possível carregar seus veículos.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleOpenAddModal = () => {
    setIsFormModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setFormError(null);
  };

  const handleSaveVehicle = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await createVehicle(data);
      handleCloseModals();
      if (currentPage !== 1 || debouncedQuery !== "") {
        setCurrentPage(1);
        setSearchTerm("");
      } else {
        fetchVehicles();
      }
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

  const handleNextPage = () => {
    if (
      vehiclesResponse &&
      currentPage < vehiclesResponse.pagination.totalPages
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading && !vehiclesResponse) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  const vehicles = vehiclesResponse?.data || [];
  const pagination = vehiclesResponse?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Meus Veículos</h2>
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Buscar por modelo ou apelido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button onClick={handleOpenAddModal} className="flex-shrink-0">
          <PlusIcon className="mr-2 h-4 w-4" /> Adicionar Veículo
        </Button>
      </div>

      {isLoading && (
        <div className="h-64">
          <Spinner />
        </div>
      )}

      {!isLoading && vehicles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600 dark:text-gray-400">
            {debouncedQuery
              ? `Nenhum veículo encontrado para "${debouncedQuery}".`
              : "Você ainda não cadastrou nenhum veículo."}
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

      {pagination && pagination.totalPages > 1 && !isLoading && (
        <div className="flex justify-center items-center gap-4">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === pagination.totalPages}
            variant="outline"
          >
            Próxima
          </Button>
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
