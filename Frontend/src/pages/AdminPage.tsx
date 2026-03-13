import { useState, useEffect, useRef } from "react";
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
import { UploadIcon } from "../components/icons/UploadIcon";
import ConfirmDialog from "../components/ui/modal/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { useToastStore } from "../store/toastStore";
import type {
  Brand,
  Color,
  Feature,
  ServiceType,
  AdminUser,
  AdminVehicle,
} from "../types";
import { Skeleton } from "../components/ui/Skeleton";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<
    "brands" | "colors" | "features" | "serviceTypes" | "users" | "vehicles"
  >("brands");
  const addToast = useToastStore((state) => state.addToast);

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
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Form states
  const [newItemName, setNewItemName] = useState("");
  const [newItemHex, setNewItemHex] = useState("#000000");
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // File states
  const brandFileRef = useRef<HTMLInputElement>(null);

  // Confirm Dialog states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      if (activeTab === "users") {
        const res = await getAllUsers(userSearch, userPage, 10);
        setUsers(res.data);
        setUserTotalPages(res.pagination.totalPages);
      } else if (activeTab === "vehicles") {
        const res = await getAllVehicles(
          vehiclePage,
          10,
          vehicleOwner,
          vehicleSearch,
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
  }, [
    activeTab,
    vehiclePage,
    vehicleSearch,
    vehicleOwner,
    userSearch,
    userPage,
  ]);

  useEffect(() => {
    if (activeTab === "users") setUserPage(1);
    if (activeTab === "vehicles") setVehiclePage(1);
  }, [activeTab]);

  const handleSave = async () => {
    if (!newItemName) return;
    setIsSaving(true);
    try {
      if (editingId) {
        if (activeTab === "brands") {
          const formData = new FormData();
          formData.append("name", newItemName);
          if (brandFileRef.current?.files?.[0]) {
            formData.append("logo", brandFileRef.current.files[0]);
          }
          await updateBrand(editingId, formData);
        }
        if (activeTab === "features")
          await updateFeature(editingId, newItemName);
        if (activeTab === "colors")
          await updateColor(editingId, newItemName, newItemHex);
        if (activeTab === "serviceTypes")
          await updateServiceType(editingId, newItemName);
        addToast({ type: "success", message: "Item atualizado com sucesso!" });
      } else {
        if (activeTab === "brands") {
          const formData = new FormData();
          formData.append("name", newItemName);
          if (brandFileRef.current?.files?.[0]) {
            formData.append("logo", brandFileRef.current.files[0]);
          }
          await createBrand(formData);
        }
        if (activeTab === "features") await createFeature(newItemName);
        if (activeTab === "colors") await createColor(newItemName, newItemHex);
        if (activeTab === "serviceTypes") await createServiceType(newItemName);
        addToast({ type: "success", message: "Item adicionado com sucesso!" });
      }
      cancelEdit();
      fetchData();
    } catch (error) {
      console.error(error);
      addToast({ type: "error", message: "Erro ao salvar item." });
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
    if (brandFileRef.current) brandFileRef.current.value = "";
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
      addToast({ type: "success", message: "Item deletado com sucesso!" });
      fetchData();
    } catch (error) {
      console.error(error);
      addToast({
        type: "error",
        message: "Erro ao deletar. Verifique se o item está em uso.",
      });
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleRoleChange = async (
    userId: number,
    newRole: "ADMIN" | "USER",
  ) => {
    try {
      await updateUserRole(userId, newRole);
      addToast({
        type: "warning",
        message: "Permissão de usuário atualizada com sucesso!",
      });
      fetchData();
    } catch (error) {
      console.error(error);
      addToast({ type: "error", message: "Erro ao atualizar permissão." });
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
      if (activeTab === "users" || activeTab === "vehicles") {
        return (
          <div className="space-y-4 animate-pulse">
            {/* Filtros */}
            <div className="bg-secondary/50 p-4 rounded-lg border border-input mb-6">
              <Skeleton className="h-10 w-full" />
            </div>
            {/* Cabeçalho da Tabela */}
            <div className="flex gap-4 border-b border-input pb-2">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-1/4" />
            </div>
            {/* Linhas da Tabela */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 py-3 border-b border-input items-center"
              >
                <div className="w-1/4 flex items-center gap-2">
                  {activeTab === "users" && (
                    <Skeleton className="h-8 w-8 rounded-full" />
                  )}
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <div className="w-1/4 flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        );
      }
      // Skeleton para Grid (Marcas, Cores, etc.)
      return (
        <div className="space-y-6 animate-pulse">
          {/* Formulário Superior */}
          <div className="bg-secondary/50 p-4 rounded-lg border border-input flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          {/* Grid de Itens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 border rounded border-input"
              >
                <div className="flex items-center gap-3">
                  {activeTab === "colors" && (
                    <Skeleton className="h-6 w-6 rounded-full" />
                  )}
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (activeTab === "users") {
      return (
        <>
          <div className="mb-6 bg-secondary/50 p-4 rounded-lg border border-input">
            <Input
              placeholder="Buscar usuário..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-input">
                  <th className="p-3 text-sm font-semibold text-foreground">
                    Nome
                  </th>
                  <th className="p-3 text-sm font-semibold text-foreground">
                    Email
                  </th>
                  <th className="p-3 text-sm font-semibold text-foreground">
                    Permissão
                  </th>
                  <th className="p-3 text-sm font-semibold text-foreground text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-input hover:bg-secondary/50 transition-colors"
                    >
                      <td className="p-3 text-sm text-foreground">
                        {user.name}
                      </td>
                      <td className="p-3 text-sm text-foreground">
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
                          className="text-destructive hover:text-destructive-hover p-2 rounded-full hover:bg-destructive/10 transition-colors"
                          title="Excluir Usuário"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-center text-secondary-foreground"
                    >
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {userTotalPages > 1 && (
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="outline"
                disabled={userPage === 1}
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-sm self-center text-secondary-foreground">
                Página {userPage} de {userTotalPages}
              </span>
              <Button
                variant="outline"
                disabled={userPage === userTotalPages}
                onClick={() =>
                  setUserPage((p) => Math.min(userTotalPages, p + 1))
                }
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      );
    }
    if (activeTab === "vehicles") {
      return (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-secondary/50 p-4 rounded-lg border border-input">
            <Input
              placeholder="Buscar por modelo..."
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
            />
            <Input
              placeholder="Filtrar por dono..."
              value={vehicleOwner}
              onChange={(e) => setVehicleOwner(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-input">
                  <th className="p-3 text-sm font-semibold text-foreground">
                    ID
                  </th>
                  <th className="p-3 text-sm font-semibold text-foreground">
                    Modelo
                  </th>
                  <th className="p-3 text-sm font-semibold text-foreground">
                    Placa
                  </th>
                  <th className="p-3 text-sm font-semibold text-foreground">
                    Dono
                  </th>
                  <th className="p-3 text-sm font-semibold text-foreground text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-input hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-3 text-sm text-foreground">{v.id}</td>
                    <td className="p-3 text-sm text-foreground">
                      {v.brand_name} - {v.model} ({v.year_model})
                    </td>
                    <td className="p-3 text-sm text-foreground">
                      {v.license_plate}
                    </td>
                    <td className="p-3 text-sm text-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium">{v.owner_name}</span>
                        <span className="text-xs text-secondary-foreground">
                          {v.owner_email}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openDeleteConfirm(v.id)}
                        className="text-destructive hover:text-destructive-hover p-2 rounded-full hover:bg-destructive/10 transition-colors"
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
            <span className="text-sm self-center text-secondary-foreground">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto px-4">
        {data[activeTab as keyof typeof data].map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-3 border rounded border-input text-foreground bg-background hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {activeTab === "colors" && (
                <div
                  className="w-6 h-6 rounded-full border border-input flex-shrink-0"
                  style={{ backgroundColor: (item as Color).hex }}
                ></div>
              )}
              {activeTab === "brands" && (item as Brand).logo_url && (
                <img
                  src={(item as Brand).logo_url!}
                  alt="logo"
                  className="w-8 h-8 object-contain"
                />
              )}
              <span className="truncate block" title={item.name}>
                {item.name}
              </span>
            </div>

            <div className="flex gap-1 flex-shrink-0 ml-2">
              <button
                onClick={() => startEdit(item)}
                className="text-info hover:text-info-hover p-2 rounded-full hover:bg-info-hover/10 transition-colors"
                title="Editar"
              >
                <EditIcon size={18} />
              </button>
              <button
                onClick={() => openDeleteConfirm(item.id)}
                className="text-destructive hover:text-destructive-hover p-2 rounded-full hover:bg-destructive-hover/10 transition-colors"
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
      <h2 className="text-2xl font-bold text-foreground">
        Administração do Sistema
      </h2>

      <div className="flex gap-2 border-b border-input pb-2 overflow-x-auto">
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
                ? "bg-primary/10 text-primary font-medium"
                : "text-secondary-foreground hover:bg-accent"
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
          {activeTab !== "users" && activeTab !== "vehicles" && !isFetching && (
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-end bg-secondary/50 p-4 rounded-lg border border-input">
              <div className="flex-1 w-full">
                <label className="text-sm text-foreground font-medium mb-1 block">
                  {editingId
                    ? `Editando ${getTabLabel()}`
                    : `Adicionar ${getTabLabel()}`}
                </label>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Nome..."
                />
              </div>

              {activeTab === "brands" && (
                <div className="w-full md:w-auto">
                  <label className="text-sm text-foreground font-medium mb-1 block">
                    Logo (Opcional)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => brandFileRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 border rounded-md bg-secondary border-input hover:bg-secondary-hover transition-colors"
                    >
                      <UploadIcon
                        size={18}
                        className="text-secondary-foreground"
                      />
                      <span className="text-sm ys">Escolher Imagem</span>
                    </button>
                    <input
                      type="file"
                      ref={brandFileRef}
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                    />
                  </div>
                </div>
              )}

              {activeTab === "colors" && (
                <div>
                  <label className="text-sm text-foreground font-medium mb-1 block">
                    Cor (Hex)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newItemHex}
                      onChange={(e) => setNewItemHex(e.target.value)}
                      className="h-10 w-10 border border-input rounded-md cursor-pointer"
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
