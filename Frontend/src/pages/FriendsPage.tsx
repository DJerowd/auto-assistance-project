import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  respondFriendRequest,
  removeFriend,
} from "../services/friendshipService";
import type { Friend, FriendRequest } from "../types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { UserIcon } from "../components/icons/UserIcon";
import { PlusIcon } from "../components/icons/PlusIcon";
import { TrashIcon } from "../components/icons/TrashIcon";
import { CarIcon } from "../components/icons/CarIcon";
import { CheckCircleIcon } from "../components/icons/CheckCircleIcon";
import { XCircleIcon } from "../components/icons/XCircleIcon";
import Spinner from "../components/ui/Spinner";
import { useToastStore } from "../store/toastStore";
import ConfirmDialog from "../components/ui/modal/ConfirmDialog";

import { useRef } from "react";
import { searchPotentialFriends } from "../services/friendshipService";
import { useDebounce } from "../hooks/useDebounce";

const FriendsPage = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [friendToDelete, setFriendToDelete] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getPendingRequests(),
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (error) {
      console.error(error);
      addToast({ type: "error", message: "Erro ao carregar lista de amigos." });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearch.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchPotentialFriends(debouncedSearch);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Erro ao buscar sugestões", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [debouncedSearch]);

  const handleSendRequest = async (emailToInvite: string) => {
    if (!emailToInvite) return;
    setIsSending(true);
    try {
      await sendFriendRequest(emailToInvite);
      addToast({
        type: "success",
        message: "Solicitação enviada com sucesso!",
      });
      setSearchTerm("");
      setShowSuggestions(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      addToast({
        type: "error",
        message: err.response?.data?.message || "Erro ao enviar solicitação.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRespond = async (id: number, action: "ACCEPT" | "REJECT") => {
    try {
      await respondFriendRequest(id, action);
      addToast({
        type: action === "ACCEPT" ? "success" : "info",
        message:
          action === "ACCEPT" ? "Solicitação aceita!" : "Solicitação recusada.",
      });
      fetchData();
    } catch (error) {
      console.error("Erro ao responder pedido:", error);
      addToast({ type: "error", message: "Erro ao processar solicitação." });
    }
  };

  const confirmDelete = (friendshipId: number) => {
    setFriendToDelete(friendshipId);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!friendToDelete) return;
    try {
      await removeFriend(friendToDelete);
      addToast({ type: "success", message: "Amigo removido." });
      fetchData();
    } catch (error) {
      console.error("Erro ao remover:", error);
      addToast({ type: "error", message: "Erro ao remover amigo." });
    } finally {
      setIsDeleteModalOpen(false);
      setFriendToDelete(null);
    }
  };

  if (isLoading)
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Meus Amigos</h2>
          <p className="text-secondary-foreground text-sm">
            Gerencie sua rede e visualize veículos compartilhados.
          </p>
        </div>
      </div>

      {/* Seção de Adicionar Amigo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Novo Amigo</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="relative flex flex-col sm:flex-row gap-4"
            ref={searchContainerRef}
          >
            <div className="relative flex-grow">
              <Input
                placeholder="Digite o nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() =>
                  searchTerm.length >= 2 && setShowSuggestions(true)
                }
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Atraso para permitir o clique na lista
              />
              {/* Dropdown de Sugestões */}
              {showSuggestions && (
                <div className="absolute z-50 mt-1 w-full bg-background rounded-md shadow-lg border border-input overflow-hidden">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-foreground/60 flex justify-center items-center gap-2">
                      <Spinner /> Buscando...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto">
                      {suggestions.map((user) => (
                        <li
                          key={user.user_id}
                          onClick={() => handleSendRequest(user.email)}
                          className="px-4 py-3 hover:bg-accent cursor-pointer flex items-center gap-3 transition-colors border-b border-input last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {user.profile_image ? (
                              <img
                                src={user.profile_image}
                                className="w-full h-full object-cover"
                                alt={user.name}
                              />
                            ) : (
                              <UserIcon size={16} className="text-primary" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium text-sm text-foreground truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-secondary-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="ml-auto"
                          >
                            Adicionar
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-sm text-foreground/60">
                      Nenhum usuário encontrado.
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={() => handleSendRequest(searchTerm)}
              disabled={!searchTerm || isSending}
            >
              {isSending ? <Spinner /> : <PlusIcon className="mr-2 h-4 w-4" />}
              Enviar Convite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Solicitações Pendentes */}
      {requests.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Solicitações Pendentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req) => (
              <div
                key={req.friendship_id}
                className="bg-background p-4 rounded-xl border border-orange-500/30 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                    {req.profile_image ? (
                      <img
                        src={req.profile_image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={20} className="text-secondary-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {req.name}
                    </p>
                    <p className="text-xs text-secondary-foreground">{req.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespond(req.friendship_id, "ACCEPT")}
                    className="text-green-500 hover:bg-green-500/10 p-1 rounded transition-colors"
                  >
                    <CheckCircleIcon size={20} />
                  </button>
                  <button
                    onClick={() => handleRespond(req.friendship_id, "REJECT")}
                    className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                  >
                    <XCircleIcon size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Amigos */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground">
          Amigos Adicionados ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <p className="text-secondary-foreground">
            Você ainda não adicionou nenhum amigo.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <div
                key={friend.friendship_id}
                className="bg-background rounded-xl border border-input p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-primary">
                    {friend.profile_image ? (
                      <img
                        src={friend.profile_image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon size={24} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{friend.name}</h4>
                    <p className="text-xs text-secondary-foreground">{friend.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/friends/${friend.user_id}/garage`}
                    className="flex-1"
                  >
                    <Button variant="secondary" className="w-full text-sm">
                      <CarIcon className="mr-2 h-4 w-4" /> Ver Garagem
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => confirmDelete(friend.friendship_id)}
                    className="text-destructive hover:text-destructive-hover hover:bg-destructive/10"
                  >
                    <TrashIcon size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remover Amigo"
        description="Tem certeza que deseja remover este usuário da sua lista de amigos?"
      />
    </div>
  );
};

export default FriendsPage;
