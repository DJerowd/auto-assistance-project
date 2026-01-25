import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllReminders } from "../services/reminderService";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/Select";
import { FilterIcon } from "../components/icons/FilterIcon";
import { CalendarIcon } from "../components/icons/CalendarIcon";
import { SpeedometerIcon } from "../components/icons/SpeedometerIcon";
import ReminderStatusBadge from "../components/reminders/ReminderStatusBadge";
import Drawer from "../components/ui/Drawer";
import Spinner from "../components/ui/Spinner";
import type { Reminder, PaginatedResponse } from "../types";

interface ReminderWithVehicle extends Reminder {
  vehicle_model: string;
  vehicle_current_mileage?: number;
}

const AllRemindersPage = () => {
  const [data, setData] =
    useState<PaginatedResponse<ReminderWithVehicle> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("PENDING");
  const [serviceType, setServiceType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllReminders({
        page,
        limit: 10,
        status: status === "ALL" ? undefined : status,
        service_type: serviceType,
        vehicle_model: vehicleModel,
      });
      setData(response as unknown as PaginatedResponse<ReminderWithVehicle>);
    } catch {
      setError("Não foi possível carregar seus lembretes.");
    } finally {
      setIsLoading(false);
    }
  }, [page, status, serviceType, vehicleModel]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleClearFilters = () => {
    setStatus("PENDING");
    setServiceType("");
    setVehicleModel("");
    setPage(1);
    setIsFilterOpen(false);
  };

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-red-500 text-center">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">
          Todos os lembretes registrados
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
          {data?.data.map((item) => {
            let remainingInfo = "";
            if (item.status === "PENDING") {
              if (item.date_threshold) {
                const diff =
                  new Date(item.date_threshold).getTime() -
                  new Date().getTime();
                const days = Math.ceil(diff / (1000 * 3600 * 24));
                remainingInfo += `${days} dias restantes`;
              }
              if (item.mileage_threshold && item.vehicle_current_mileage) {
                const kmDiff =
                  item.mileage_threshold - item.vehicle_current_mileage;
                if (remainingInfo) remainingInfo += " • ";
                remainingInfo += `${kmDiff > 0 ? kmDiff : 0} km restantes`;
              }
            }

            return (
              <Card
                key={item.id}
                className="hover:border-indigo-300 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* min-w-0 para permitir que o flex item encolha e quebre o texto */}
                    <div className="space-y-2 flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg dark:text-white truncate">
                          {item.service_type}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full dark:text-gray-300 whitespace-nowrap">
                          {item.vehicle_model}
                        </span>
                        <div className="flex-shrink-0">
                          <ReminderStatusBadge status={item.status} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.date_threshold && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon size={14} />
                            {new Date(item.date_threshold).toLocaleDateString()}
                          </span>
                        )}
                        {item.mileage_threshold && (
                          <span className="flex items-center gap-1">
                            <SpeedometerIcon size={14} />
                            {item.mileage_threshold.toLocaleString()} km
                          </span>
                        )}
                      </div>
                      {remainingInfo && (
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                          {remainingInfo}
                        </p>
                      )}

                      {item.notes && (
                        <p
                          className="text-sm italic text-gray-600 dark:text-gray-300 break-all line-clamp-4"
                          title={item.notes}
                        >
                          "{item.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center self-start md:self-center flex-shrink-0">
                      <Link to={`/vehicles/${item.vehicle_id}/reminders`}>
                        <Button variant="outline" size="sm">
                          Gerenciar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {data?.data.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nenhum lembrete encontrado.
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
        title="Filtrar Lembretes"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium dark:text-gray-300">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="COMPLETED">Concluído</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

export default AllRemindersPage;
