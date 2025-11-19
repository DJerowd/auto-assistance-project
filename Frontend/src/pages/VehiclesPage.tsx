import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import {
  getVehicles,
  createVehicle,
  toggleVehicleFavorite,
  getUserVehicleFilters,
} from "../services/vehicleService";
import { getVehicleOptions } from "../services/optionsService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { PlusIcon } from "../components/icons/PlusIcon";
import { Button } from "../components/ui/Button";
import { StarIcon } from "../components/icons/StarIcon";
import { FilterIcon } from "../components/icons/FilterIcon";
import { BellIcon } from "../components/icons/BellIcon";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/modal/Modal";
import Drawer from "../components/ui/Drawer";
import VehicleForm from "../components/vehicles/VehicleForm";
import { Input } from "../components/ui/Input";
import { InputNumber } from "../components/ui/InputNumber";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import type {
  Vehicle,
  VehicleFormData,
  PaginatedResponse,
  Brand,
} from "../types";
import { cn } from "../lib/utils";

const DEFAULT_VEHICLE_IMG = "http://localhost:8800/public/default-vehicle.png";

const VehiclesPage = () => {
  // Dados
  const [vehiclesResponse, setVehiclesResponse] =
    useState<PaginatedResponse<Vehicle> | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [filterOptions, setFilterOptions] = useState<{
    brands: Brand[];
    minYear: number | null;
    maxYear: number | null;
  }>({ brands: [], minYear: null, maxYear: null });

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("DESC");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [minYear, setMinYear] = useState<number | undefined>(undefined);
  const [maxYear, setMaxYear] = useState<number | undefined>(undefined);
  const [showPendingReminders, setShowPendingReminders] = useState(false);

  // UI
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const data = await getUserVehicleFilters();
      setFilterOptions(data);
    } catch (err) {
      console.error("Failed to load filter options", err);
    }
  }, []);

  useEffect(() => {
    const fetchBrandOptions = async () => {
      try {
        const data = await getVehicleOptions();
        setBrands(data.brands);
      } catch (err) {
        console.error("Failed to load global brands", err);
      }
    };
    fetchBrandOptions();
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getVehicles({
        page: currentPage,
        limit: 10,
        model: debouncedQuery,
        favorites: showFavorites,
        sortBy,
        order,
        brandId: selectedBrand !== "all" ? selectedBrand : undefined,
        minYear,
        maxYear,
        pendingReminders: showPendingReminders,
      });
      setVehiclesResponse(response);
    } catch {
      setError("Não foi possível carregar seus veículos.");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedQuery,
    showFavorites,
    sortBy,
    order,
    selectedBrand,
    minYear,
    maxYear,
    showPendingReminders,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleOpenAddModal = () => setIsFormModalOpen(true);
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
      fetchFilterOptions();
      if (currentPage !== 1 || debouncedQuery !== "" || showFavorites) {
        setCurrentPage(1);
        setSearchTerm("");
        setShowFavorites(false);
        setSortBy("created_at");
        setOrder("DESC");
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

  const handleToggleFavorite = async (
    e: React.MouseEvent,
    vehicle: Vehicle
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (vehiclesResponse) {
        const updatedVehicles = vehiclesResponse.data.map((v) =>
          v.id === vehicle.id ? { ...v, is_favorite: !v.is_favorite } : v
        );
        setVehiclesResponse({ ...vehiclesResponse, data: updatedVehicles });
      }
      await toggleVehicleFavorite(vehicle.id);
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      fetchVehicles();
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
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const toggleShowFavorites = () => {
    setShowFavorites(!showFavorites);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSortBy("created_at");
    setOrder("DESC");
    setShowFavorites(false);
    setSearchTerm("");
    setSelectedBrand("all");
    setMinYear(undefined);
    setMaxYear(undefined);
    setShowPendingReminders(false);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const vehicles = vehiclesResponse?.data || [];
  const pagination = vehiclesResponse?.pagination;
  const nextYear = new Date().getFullYear() + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Meus Veículos</h2>

        <div className="w-full md:w-auto flex flex-1 justify-end gap-2">
          <div className="w-full md:w-64">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <FilterIcon size={18} className="mr-2" />
            Filtros
          </Button>

          <Button onClick={handleOpenAddModal} className="flex-shrink-0">
            <PlusIcon className="mr-2 h-4 w-4" />{" "}
            <span className="hidden md:inline">Adicionar</span>
          </Button>
        </div>
      </div>

      {isLoading && !vehiclesResponse && (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!isLoading && vehicles.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-600 dark:text-gray-400">
            {debouncedQuery ||
            showFavorites ||
            showPendingReminders ||
            selectedBrand !== "all" ||
            minYear ||
            maxYear
              ? "Nenhum veículo encontrado com os filtros atuais."
              : "Você ainda não cadastrou nenhum veículo."}
          </CardContent>
        </Card>
      )}

      {!isLoading && vehicles.length > 0 && (
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
                <Card className="overflow-hidden flex flex-col relative h-full hover:border-indigo-300 transition-colors">
                  {vehicle.has_pending_reminders && (
                    <div
                      className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-red-500/90 text-white shadow-sm backdrop-blur-sm"
                      title="Lembretes Pendentes"
                    >
                      <BellIcon size={16} />
                    </div>
                  )}

                  <button
                    onClick={(e) => handleToggleFavorite(e, vehicle)}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                    title={
                      vehicle.is_favorite ? "Remover favorito" : "Favoritar"
                    }
                  >
                    <StarIcon
                      className={cn(
                        "transition-colors",
                        vehicle.is_favorite
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-white"
                      )}
                    />
                  </button>

                  <div className="w-full h-38 bg-gray-800 relative">
                    <img
                      src={
                        primaryImage ? primaryImage.url : DEFAULT_VEHICLE_IMG
                      }
                      alt={vehicle.model}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardHeader>
                    <CardTitle
                      className="truncate"
                      title={vehicle.nickname || vehicle.model}
                    >
                      {vehicle.nickname || vehicle.model}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {vehicle.brand_name || "N/I"} - {vehicle.model}
                    </p>
                    <p className="text-xs text-gray-400">
                      {vehicle.year_model} •{" "}
                      {vehicle.current_mileage.toLocaleString()} km
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

      <Drawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros e Ordenação"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3 dark:text-gray-300">
              Estado
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={toggleShowFavorites}
                className={cn(
                  "w-full justify-start",
                  showFavorites
                    ? "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-500"
                    : ""
                )}
              >
                <StarIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    showFavorites
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-500"
                  )}
                />
                {showFavorites ? "Apenas Favoritos" : "Filtrar por Favoritos"}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setShowPendingReminders(!showPendingReminders);
                  setCurrentPage(1);
                }}
                className={cn(
                  "w-full justify-start",
                  showPendingReminders
                    ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:text-red-500"
                    : ""
                )}
              >
                <BellIcon
                  className={cn(
                    "mr-2 h-4 w-4",
                    showPendingReminders ? "text-red-500" : "text-gray-500"
                  )}
                />
                {showPendingReminders
                  ? "Com Lembretes Pendentes"
                  : "Filtrar Lembretes Pendentes"}
              </Button>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 my-4"></div>

          <div>
            <h3 className="text-sm font-medium mb-3 dark:text-gray-300">
              Marca
            </h3>
            <Select
              value={selectedBrand}
              onValueChange={(val) => {
                setSelectedBrand(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as marcas</SelectItem>
                {filterOptions.brands.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 dark:text-gray-300">
              Ano (Modelo)
            </h3>
            <div className="flex gap-2">
              <InputNumber
                placeholder="De"
                value={minYear || ""}
                onValueChange={(val) => {
                  setMinYear(val || undefined);
                  setCurrentPage(1);
                }}
                min={filterOptions.minYear || 1900}
                max={nextYear}
              />
              <InputNumber
                placeholder="Até"
                value={maxYear || ""}
                onValueChange={(val) => {
                  setMaxYear(val || undefined);
                  setCurrentPage(1);
                }}
                min={filterOptions.minYear || 1900}
                max={nextYear}
              />
            </div>
            {filterOptions.minYear && filterOptions.maxYear && (
              <p className="text-xs text-gray-500 mt-1">
                Faixa disponível: {filterOptions.minYear} -{" "}
                {filterOptions.maxYear}
              </p>
            )}
          </div>

          <div className="border-t dark:border-gray-700 my-4"></div>

          <div>
            <h3 className="text-sm font-medium mb-3 dark:text-gray-300">
              Ordenar por
            </h3>
            <div className="space-y-4">
              <Select
                value={sortBy}
                onValueChange={(val) => {
                  setSortBy(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Data de Cadastro</SelectItem>
                  <SelectItem value="model">Modelo (A-Z)</SelectItem>
                  <SelectItem value="year_model">Ano do Modelo</SelectItem>
                  <SelectItem value="current_mileage">Quilometragem</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={order === "ASC" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setOrder("ASC");
                    setCurrentPage(1);
                  }}
                >
                  Crescente
                </Button>
                <Button
                  variant={order === "DESC" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => {
                    setOrder("DESC");
                    setCurrentPage(1);
                  }}
                >
                  Decrescente
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 my-4"></div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={handleClearFilters}
          >
            Limpar Filtros
          </Button>
        </div>
      </Drawer>

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
