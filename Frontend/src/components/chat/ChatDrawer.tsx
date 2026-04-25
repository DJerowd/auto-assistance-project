import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { getFriends } from "../../services/friendshipService";
import api from "../../config/api";
import Drawer from "../ui/Drawer";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import Spinner from "../ui/Spinner";
import { MessageIcon } from "../icons/MessageIcon";
import { ReturnIcon } from "../icons/ReturnIcon";
import { UserIcon } from "../icons/UserIcon";
import { CarIcon } from "../icons/CarIcon";
import { PlusIcon } from "../icons/PlusIcon";
import { cn } from "../../lib/utils";
import type { Friend, Vehicle } from "../../types";
import { SearchIcon } from "../icons/SearchIcon";

export const ChatDrawer = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    isDrawerOpen,
    activeFriendId,
    activeFriendName,
    messages,
    isLoadingHistory,
    closeChat,
    openChat,
    sendMessage,
    isTyping,
    emitTyping,
  } = useChatStore();

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [myVehicles, setMyVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (activeFriendId) {
      emitTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(false);
      }, 1500);
    }
  };

  useEffect(() => {
    if (isDrawerOpen && !activeFriendId) {
      const loadFriends = async () => {
        setIsLoadingFriends(true);
        try {
          const data = await getFriends();
          setFriendsList(data.filter((f: Friend) => f.status === "ACCEPTED"));
        } catch (error) {
          console.error("Erro ao carregar contatos", error);
        } finally {
          setIsLoadingFriends(false);
        }
      };
      loadFriends();
    }
  }, [isDrawerOpen, activeFriendId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    emitTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    try {
      await sendMessage(newMessage);
      setNewMessage("");
      emitTyping(false);
    } catch (error) {
      console.error("Erro ao enviar:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleBackToList = () => {
    useChatStore.setState({
      activeFriendId: null,
      activeFriendName: null,
    });
  };

  const handleToggleAttach = async () => {
    setShowAttachMenu(!showAttachMenu);
    if (!showAttachMenu && myVehicles.length === 0) {
      setIsLoadingVehicles(true);
      try {
        const response = await api.get("/vehicles?limit=50");
        setMyVehicles(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingVehicles(false);
      }
    }
  };

  const sendVehicleAttachment = async (vehicle: Vehicle) => {
    setShowAttachMenu(false);
    setIsSending(true);
    try {
      await sendMessage(
        `Veja o meu veículo: ${vehicle.model}`,
        "VEHICLE",
        vehicle.id,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredFriends = friendsList.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const drawerTitle = activeFriendId ? (
    <div className="flex items-center gap-2 min-w-0 max-w-full">
      <button
        onClick={handleBackToList}
        className="p-1 hover:bg-secondary rounded-full mr-1 transition-colors text-secondary-foreground hover:text-foreground shrink-0"
        title="Voltar para a lista de contatos"
      >
        <ReturnIcon size={18} />
      </button>
      <span className="truncate block pr-4">{activeFriendName}</span>
    </div>
  ) : (
    "Mensagens"
  );

  return (
    <Drawer isOpen={isDrawerOpen} onClose={closeChat} title={drawerTitle}>
      <div className="flex flex-col h-full -mx-6 -my-6 relative">
        {!activeFriendId ? (
          /* MODO LISTA */
          <div className="flex-1 flex flex-col bg-background">
            <div className="p-4 border-b border-input bg-secondary/10 shrink-0">
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar conversa..."
                  className="w-full pl-10 bg-background"
                  autoComplete="off"
                />
                <SearchIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-foreground"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-1 px-2 space-y-4 bg-secondary/30 relative flex flex-col">
              {isLoadingFriends ? (
                <div className="flex justify-center h-full items-center">
                  <Spinner />
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center p-10 text-secondary-foreground flex flex-col items-center">
                  <MessageIcon size={48} className="mb-4 opacity-20" />
                  <p>
                    {searchQuery
                      ? "Nenhum contato encontrado."
                      : "Nenhuma conversa ativa."}
                  </p>
                  {!searchQuery && (
                    <p className="text-xs mt-2">
                      Adicione amigos para começar a conversar.
                    </p>
                  )}
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const hasUnread = friend.unread_count > 0;

                  return (
                    <div
                      key={friend.friendship_id || friend.user_id}
                      onClick={() => openChat(friend.user_id, friend.name)}
                      className="flex items-center gap-4 p-4 hover:bg-secondary/50 cursor-pointer transition-colors"
                    >
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-input shadow-inner">
                          {friend.profile_image ? (
                            <img
                              src={friend.profile_image}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <UserIcon size={20} />
                          )}
                        </div>
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3 animate-in fade-in zoom-in">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive border-2 border-background"></span>
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                        <h4
                          className={cn(
                            "font-medium text-foreground text-sm truncate",
                            hasUnread && "font-bold text-active-text-color",
                          )}
                        >
                          {friend.name}
                        </h4>
                        <p
                          className={cn(
                            "text-xs text-secondary-foreground truncate",
                            hasUnread && "font-medium",
                          )}
                        >
                          {hasUnread
                            ? "Nova(s) mensagem(ns). Toque para abrir."
                            : "Toque para abrir a conversa"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30 relative">
              {isLoadingHistory ? (
                <div className="flex justify-center h-full items-center">
                  <Spinner />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-secondary-foreground opacity-70 mt-10">
                  <MessageIcon size={48} className="mb-4 opacity-50" />
                  <p className="font-medium text-sm">Nenhuma mensagem ainda.</p>
                  <p className="text-xs mt-2 max-w-[200px]">
                    Envie um "Olá" para {activeFriendName} e inicie a conversa!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  const msgDate = new Date(msg.created_at);
                  const today = new Date();
                  const isToday =
                    msgDate.getDate() === today.getDate() &&
                    msgDate.getMonth() === today.getMonth() &&
                    msgDate.getFullYear() === today.getFullYear();

                  const timeStr = msgDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const dateStr = msgDate.toLocaleDateString([], {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  });
                  const displayDate = isToday
                    ? `Hoje às ${timeStr}`
                    : `${dateStr} às ${timeStr}`;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        isMine ? "ml-auto items-end" : "mr-auto items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl text-sm shadow-sm",
                          isMine
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-background border border-input text-foreground rounded-tl-sm",
                        )}
                      >
                        {msg.content}

                        {/* RENDERIZAÇÃO DO ANEXO DE VEÍCULO */}
                        {msg.attachment_type === "VEHICLE" && (
                          <div
                            onClick={() => {
                              closeChat();
                              if (isMine) {
                                navigate(`/vehicles/${msg.attachment_id}`);
                              } else {
                                navigate(`/friends/${msg.sender_id}/garage`);
                              }
                            }}
                            className="mt-3 p-3 bg-background/10 border border-background/20 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-background/20 transition-colors"
                          >
                            <div className="p-2 bg-background/20 rounded-full">
                              <CarIcon
                                size={20}
                                className={
                                  isMine
                                    ? "text-primary-foreground"
                                    : "text-primary"
                                }
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-xs opacity-90">
                                {isMine
                                  ? "Meu Veículo Compartilhado"
                                  : "Veículo Compartilhado"}
                              </p>
                              <p className="text-[10px] opacity-70">
                                {isMine
                                  ? "Toque para ver os detalhes"
                                  : "Toque para ver a garagem"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] text-secondary-foreground mt-1 px-1">
                        {displayDate}
                      </span>
                    </div>
                  );
                })
              )}

              {/* INDICADOR DE DIGITANDO */}
              {isTyping[activeFriendId] && (
                <div className="flex items-center gap-2 text-xs text-secondary-foreground ml-2 animate-pulse mt-auto min-w-0 pb-2">
                  <div className="flex gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 bg-secondary-foreground/50 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-secondary-foreground/50 rounded-full"></span>
                    <span className="w-1.5 h-1.5 bg-secondary-foreground/50 rounded-full"></span>
                  </div>
                  <span className="truncate">
                    {activeFriendName} está digitando...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* MENU FLUTUANTE DE ANEXOS */}
            {showAttachMenu && (
              <div className="absolute bottom-20 left-4 w-64 bg-background border border-input rounded-xl shadow-lg p-3 z-10 animate-in fade-in slide-in-from-bottom-2">
                <h5 className="text-xs font-bold text-secondary-foreground mb-2 px-1 uppercase tracking-wider">
                  Anexar Veículo
                </h5>
                {isLoadingVehicles ? (
                  <div className="flex justify-center p-4">
                    <Spinner />
                  </div>
                ) : myVehicles.length === 0 ? (
                  <p className="text-sm text-center text-secondary-foreground p-2">
                    Nenhum veículo na garagem.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-hide">
                    {myVehicles.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => sendVehicleAttachment(v)}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary flex items-center transition-colors"
                      >
                        <span className="truncate">
                          {v.nickname || v.model}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-4 bg-background border-t border-input">
              <form onSubmit={handleSend} className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={handleToggleAttach}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    showAttachMenu
                      ? "bg-primary text-primary-foreground"
                      : "text-secondary-foreground hover:bg-secondary hover:text-foreground",
                  )}
                  title="Anexar"
                >
                  <PlusIcon size={20} />
                </button>
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Escreva uma mensagem..."
                  className="flex-1"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                >
                  Enviar
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
};
