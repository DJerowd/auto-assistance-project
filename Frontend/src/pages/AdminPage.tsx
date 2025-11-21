import { useState, useEffect } from "react";
import { getVehicleOptions } from "../services/optionsService";
import {
  createBrand,
  updateBrand,
  deleteBrand,
  createColor,
  updateColor,
  deleteColor,
  createFeature,
  updateFeature,
  deleteFeature,
  createServiceType,
  updateServiceType,
  deleteServiceType,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllVehicles,
  deleteVehicleAdmin,
} from "../services/adminService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { TrashIcon } from "../components/icons/TrashIcon";
import { EditIcon } from "../components/icons/EditIcon";
import ConfirmDialog from "../components/ui/modal/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import Spinner from "../components/ui/Spinner";
import type {
  Brand,
  Color,
  Feature,
  ServiceType,
  AdminUser,
  AdminVehicle,
} from "../types";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<
    "brands" | "colors" | "features" | "serviceTypes" | "users" | "vehicles"
  >("brands");

  // Datas
  const [data, setData] = useState<{
    brands: Brand[];
    colors: Color[];
    features: Feature[];
    serviceTypes: ServiceType[];
  }>({ brands: [], colors: [], features: [], serviceTypes: [] });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);

  // Filters
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleOwner, setVehicleOwner] = useState("");
  const [vehiclePage, setVehiclePage] = useState(1);
  const [vehicleTotalPages, setVehicleTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");

  // Form states
  const [newItemName, setNewItemName] = useState("");
  const [newItemHex, setNewItemHex] = useState("#000000");
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Confirm Dialog states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      if (activeTab === "users") {
        const usersData = await getAllUsers(userSearch);
        setUsers(usersData);
      } else if (activeTab === "vehicles") {
        const res = await getAllVehicles(
          vehiclePage,
          10,
          vehicleOwner,
          vehicleSearch
        );
        setVehicles(res.data);
        setVehicleTotalPages(res.pagination.totalPages);
      } else {
        const res = await getVehicleOptions();
        setData({
          brands: res.brands || [],
          colors: res.colors || [],
          features: res.features || [],
          serviceTypes: res.serviceTypes || [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    cancelEdit();
    return () => clearTimeout(timer);
  }, [activeTab, vehiclePage, vehicleSearch, vehicleOwner, userSearch]);

  const handleSave = async () => {
    if (!newItemName) return;
    setIsSaving(true);
    try {
      if (editingId) {
        if (activeTab === "brands") await updateBrand(editingId, newItemName);
        if (activeTab === "features")
          await updateFeature(editingId, newItemName);
        if (activeTab === "colors")
          await updateColor(editingId, newItemName, newItemHex);
        if (activeTab === "serviceTypes")
          await updateServiceType(editingId, newItemName);
      } else {
        if (activeTab === "brands") await createBrand(newItemName);
        if (activeTab === "features") await createFeature(newItemName);
        if (activeTab === "colors") await createColor(newItemName, newItemHex);
        if (activeTab === "serviceTypes") await createServiceType(newItemName);
      }
      cancelEdit();
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar item.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (item: Brand | Color | Feature) => {
    setEditingId(item.id);
    setNewItemName(item.name);
    if (activeTab === "colors") {
      setNewItemHex((item as Color).hex || "#000000");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewItemName("");
    setNewItemHex("#000000");
  };

  const openDeleteConfirm = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (activeTab === "brands") await deleteBrand(itemToDelete);
      if (activeTab === "features") await deleteFeature(itemToDelete);
      if (activeTab === "colors") await deleteColor(itemToDelete);
      if (activeTab === "serviceTypes") await deleteServiceType(itemToDelete);
      if (activeTab === "users") await deleteUser(itemToDelete);
      if (activeTab === "vehicles") await deleteVehicleAdmin(itemToDelete);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar. Verifique se o item está em uso.");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleRoleChange = async (
    userId: number,
    newRole: "ADMIN" | "USER"
  ) => {
    try {
      await updateUserRole(userId, newRole);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar permissão.");
    }
  };

  const getTabLabel = () => {
    switch (activeTab) {
      case "brands":
        return "Marca";
      case "colors":
        return "Cor";
      case "features":
        return "Opcional";
      case "serviceTypes":
        return "Tipo de Serviço";
      case "users":
        return "Usuário";
      case "vehicles":
        return "Veículo";
    }
  };

  const renderContent = () => {
    if (isFetching) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      );
    }
    if (activeTab === "users") {
      return (
        <>
          <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <Input
              placeholder="Buscar usuário por nome ou email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="p-3 text-sm font-semibold dark:text-gray-300">
                    Nome
                  </th>
                  <th className="p-3 text-sm font-semibold dark:text-gray-300">
                    Email
                  </th>
                  <th className="p-3 text-sm font-semibold dark:text-gray-300">
                    Permissão
                  </th>
                  <th className="p-3 text-sm font-semibold dark:text-gray-300 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="p-3 text-sm dark:text-gray-300">
                        {user.name}
                      </td>
                      <td className="p-3 text-sm dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="p-3">
                        <div className="w-32">
                          <Select
                            value={user.role}
                            onValueChange={(val) =>
                              handleRoleChange(user.id, val as "ADMIN" | "USER")
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER">Usuário</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => openDeleteConfirm(user.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Excluir Usuário"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      );
    }
    if (activeTab === "vehicles") {
      return (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="p-3 text-sm font-semibold dark:text-gray-300">
                    ID
                  </th>
                  <th className="p-3 text-sm font-semibold dark:text-gray-300">
                    Modelo
                  </th>
                  <th className="p-3 text-sm font-semibold dark:text-gray-300">
                    Placa
                  </th>
                  <th className="p-3 text-sm font-semibold dark:text-gray-300">
                    Dono
                  </th>
                  <th className="p-3 text-sm font-semibold dark:text-gray-300 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-3 text-sm dark:text-gray-300">{v.id}</td>
                    <td className="p-3 text-sm dark:text-gray-300">
                      {v.brand_name} - {v.model} ({v.year_model})
                    </td>
                    <td className="p-3 text-sm dark:text-gray-300">
                      {v.license_plate}
                    </td>
                    <td className="p-3 text-sm dark:text-gray-300">
                      <div className="flex flex-col">
                        <span className="font-medium">{v.owner_name}</span>
                        <span className="text-xs text-gray-500">
                          {v.owner_email}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openDeleteConfirm(v.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Excluir Veículo"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="outline"
              disabled={vehiclePage === 1}
              onClick={() => setVehiclePage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm self-center text-gray-500">
              Página {vehiclePage} de {vehicleTotalPages}
            </span>
            <Button
              variant="outline"
              disabled={vehiclePage === vehicleTotalPages}
              onClick={() => setVehiclePage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {data[activeTab as keyof typeof data].map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-3 border rounded dark:border-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {activeTab === "colors" && (
                <div
                  className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: (item as Color).hex }}
                ></div>
              )}
              <span className="truncate block" title={item.name}>
                {item.name}
              </span>
            </div>

            <div className="flex gap-1 flex-shrink-0 ml-2">
              <button
                onClick={() => startEdit(item)}
                className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Editar"
              >
                <EditIcon size={18} />
              </button>
              <button
                onClick={() => openDeleteConfirm(item.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Excluir"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">
        Administração do Sistema
      </h2>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
        {(
          [
            "brands",
            "colors",
            "features",
            "serviceTypes",
            "users",
            "vehicles",
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md capitalize whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab === "serviceTypes"
              ? "Tipos de Serviço"
              : tab === "users"
              ? "Usuários"
              : tab === "vehicles"
              ? "Veículos"
              : tab === "brands"
              ? "Marcas"
              : tab === "colors"
              ? "Cores"
              : "Opcionais"}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar {getTabLabel()}s</CardTitle>
        </CardHeader>

        <CardContent>
          {activeTab !== "users" && activeTab !== "vehicles" && (
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-end bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex-1 w-full">
                <label className="text-sm dark:text-gray-300 font-medium mb-1 block">
                  {editingId
                    ? `Editando ${getTabLabel()}`
                    : `Nova ${getTabLabel()}`}
                </label>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Nome..."
                />
              </div>
              {activeTab === "colors" && (
                <div>
                  <label className="text-sm dark:text-gray-300 font-medium mb-1 block">
                    Cor (Hex)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newItemHex}
                      onChange={(e) => setNewItemHex(e.target.value)}
                      className="h-10 w-10 border rounded cursor-pointer"
                    />
                    <Input
                      value={newItemHex}
                      onChange={(e) => setNewItemHex(e.target.value)}
                      className="w-24"
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2 w-full md:w-auto">
                {editingId && (
                  <Button
                    onClick={cancelEdit}
                    variant="outline"
                    className="flex-1 md:flex-none"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  isLoading={isSaving}
                  className="flex-1 md:flex-none"
                >
                  {editingId ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "vehicles" && (
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <Input
                placeholder="Buscar por modelo..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
              />
              <Input
                placeholder="Filtrar por email do dono..."
                value={vehicleOwner}
                onChange={(e) => setVehicleOwner(e.target.value)}
              />
            </div>
          )}

          {renderContent()}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title={`Excluir ${getTabLabel()}`}
        description={`Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
};

export default AdminPage;
