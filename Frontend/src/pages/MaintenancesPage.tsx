import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllMaintenances } from "../services/maintenanceService";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { MaintenanceIcon } from "../components/icons/MaintenanceIcon";
import { CalendarIcon } from "../components/icons/CalendarIcon";
import { MoneyIcon } from "../components/icons/MoneyIcon";
import { FilterIcon } from "../components/icons/FilterIcon";
import Drawer from "../components/ui/Drawer";
import Spinner from "../components/ui/Spinner";
import type { Maintenance, PaginatedResponse } from "../types";

interface MaintenanceWithVehicle extends Maintenance {
  vehicle_model: string;
}

const AllMaintenancesPage = () => {
  const [data, setData] =
    useState<PaginatedResponse<MaintenanceWithVehicle> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [serviceType, setServiceType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllMaintenances({
        page,
        limit: 10,
        service_type: serviceType,
        vehicle_model: vehicleModel,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setData(response as unknown as PaginatedResponse<MaintenanceWithVehicle>);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, serviceType, vehicleModel, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleClearFilters = () => {
    setServiceType("");
    setVehicleModel("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">
          Todas as manutenções registradas
        </h2>
        <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
          <FilterIcon className="mr-2 h-4 w-4" /> Filtros
        </Button>
      </div>

      {isLoading && !data ? (
        <div className="h-64">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.data.map((item) => (
            <Card
              key={item.id}
              className="hover:border-indigo-300 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg dark:text-white truncate">
                        {item.service_type}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full dark:text-gray-300 whitespace-nowrap">
                        {item.vehicle_model}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon size={14} />
                        {new Date(item.maintenance_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MoneyIcon size={14} />
                        R${" "}
                        {item.cost.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      {item.service_provider && (
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <MaintenanceIcon size={14} /> {item.service_provider}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p
                        className="text-sm italic text-gray-600 dark:text-gray-300 break-all line-clamp-4"
                        title={item.notes}
                      >
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center flex-shrink-0">
                    <Link to={`/vehicles/${item.vehicle_id}/maintenances`}>
                      <Button variant="outline" size="sm">
                        Ver no Veículo
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {data?.data.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nenhuma manutenção encontrada.
            </p>
          )}
        </div>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="self-center text-sm dark:text-gray-300">
            Página {page} de {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setPage((p) => Math.min(data.pagination.totalPages, p + 1))
            }
            disabled={page === data.pagination.totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtrar Manutenções"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium dark:text-gray-300">
              Veículo
            </label>
            <Input
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium dark:text-gray-300">
              Tipo
            </label>
            <Input
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium dark:text-gray-300">
              Início
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium dark:text-gray-300">
              Fim
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button
            onClick={handleClearFilters}
            variant="secondary"
            className="w-full"
          >
            Limpar
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default AllMaintenancesPage;
