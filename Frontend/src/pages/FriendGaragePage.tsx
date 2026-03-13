import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFriendVehicles } from "../services/friendshipService";
import type { Vehicle } from "../types";
import { Button } from "../components/ui/Button";
import { ReturnIcon } from "../components/icons/ReturnIcon";
import { CarIcon } from "../components/icons/CarIcon";
import Spinner from "../components/ui/Spinner";
import { useToastStore } from "../store/toastStore";

const FriendGaragePage = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    const fetchGarage = async () => {
      if (!friendId) return;
      try {
        const data = await getFriendVehicles(Number(friendId));
        setVehicles(data);
      } catch (error) {
        console.error(error);
        addToast({
          type: "error",
          message:
            "Erro ao carregar garagem do amigo. Verifique se vocês ainda são amigos.",
        });
        navigate("/friends");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGarage();
  }, [friendId, navigate, addToast]);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate("/friends")}>
          <ReturnIcon className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <h2 className="text-2xl font-bold dark:text-white">Garagem do Amigo</h2>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <CarIcon className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Nenhum veículo compartilhado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Este amigo não possui veículos compartilhados no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img
                    src={
                      vehicle.images.find((img) => img.is_primary)?.url ||
                      vehicle.images[0].url
                    }
                    alt={`${vehicle.brand_name} ${vehicle.model}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <CarIcon size={48} className="mb-2 opacity-50" />
                    <span className="text-sm">Sem foto</span>
                  </div>
                )}

                {/* Logo da Marca */}
                {vehicle.brand_logo_url && (
                  <div className="absolute top-2 left-2 w-10 h-10 bg-white/90 rounded-full p-1 shadow-md flex items-center justify-center">
                    <img
                      src={vehicle.brand_logo_url}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    {vehicle.brand_name}
                  </p>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">
                    {vehicle.nickname}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {vehicle.model} • {vehicle.version} • {vehicle.year_model}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-400 text-xs">Cor</span>
                    <span className="font-medium dark:text-gray-200">
                      {vehicle.color_name}
                    </span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-xs">
                      Km Atual
                    </span>
                    <span className="font-medium dark:text-gray-200">
                      {vehicle.current_mileage.toLocaleString()} km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendGaragePage;
