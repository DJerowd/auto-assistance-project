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
import type { Brand, Color, Feature, ServiceType, AdminUser } from "../types";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<
    "brands" | "colors" | "features" | "serviceTypes" | "users"
  >("brands");
  const [data, setData] = useState<{
    brands: Brand[];
    colors: Color[];
    features: Feature[];
    serviceTypes: ServiceType[];
  }>({ brands: [], colors: [], features: [], serviceTypes: [] });

  // Dados de Usuários
  const [users, setUsers] = useState<AdminUser[]>([]);

  // Form states
  const [newItemName, setNewItemName] = useState("");
  const [newItemHex, setNewItemHex] = useState("#000000");
  const [isLoading, setIsLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);

  // Confirm Dialog states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    if (activeTab === "users") {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        const res = await getVehicleOptions();
        setData({
          brands: res.brands || [],
          colors: res.colors || [],
          features: res.features || [],
          serviceTypes: res.serviceTypes || [],
        });
      } catch (err) {
        console.error(err);
      }
    }
  };
  useEffect(() => {
    fetchData();
    cancelEdit();
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    cancelEdit();
  }, [activeTab]);

  const handleSave = async () => {
    if (!newItemName) return;
    setIsLoading(true);
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
      setIsLoading(false);
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
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">
        Administração do Sistema
      </h2>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
        {(
          ["brands", "colors", "features", "serviceTypes", "users"] as const
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
          {activeTab !== "users" && (
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
                  isLoading={isLoading}
                  className="flex-1 md:flex-none"
                >
                  {editingId ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "users" ? (
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
                  {users.map((user) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto px-4">
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
          )}
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
