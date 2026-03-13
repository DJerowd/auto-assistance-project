import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { BellIcon } from "../components/icons/BellIcon";
import { MaintenanceIcon } from "../components/icons/MaintenanceIcon";
import { MoneyIcon } from "../components/icons/MoneyIcon";
import { CheckCircleIcon } from "../components/icons/CheckCircleIcon";
import { useAuthStore } from "../store/authStore";
import Footer from "../components/layout/Footer";
import Modal from "../components/ui/modal/Modal";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import { useToastStore } from "../store/toastStore";

interface HomeHeaderProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

const HomeHeader = ({ onOpenLogin, onOpenRegister }: HomeHeaderProps) => {
  const { user } = useAuthStore();

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md text-primary-foreground border-b border-input shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/logo.svg" alt="Auto Assistance Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-foreground">
            Auto Assistance
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/dashboard">
              <Button>
                Ir para o Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Button variant="secondary" onClick={onOpenLogin}>
                Entrar
              </Button>
              <Button onClick={onOpenRegister}>Criar Conta</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-background p-6 rounded-xl shadow-lg border border-input hover:-translate-y-1 transition-transform duration-300">
    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-active-foreground mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-foreground">
      {title}
    </h3>
    <p className="text-secondary-foreground">{description}</p>
  </div>
);

const HomePage = () => {
  const [activeModal, setActiveModal] = useState<"login" | "register" | null>(
    null,
  );
  const addToast = useToastStore((state) => state.addToast);

  const openLogin = () => setActiveModal("login");
  const openRegister = () => setActiveModal("register");
  const closeModal = () => setActiveModal(null);

  const handleRegisterSuccess = () => {
    addToast({
      type: "success",
      message: "Conta criada com sucesso! Faça login.",
    });
    openLogin();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <HomeHeader onOpenLogin={openLogin} onOpenRegister={openRegister} />

      <main className="flex-grow pt-16">
        {/* Seção Hero */}
        <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-7xl mx-auto text-center z-10 animate-page-enter">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              Gerencie seus veículos com <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
                inteligência e facilidade
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-active-foreground/70 mb-8">
              Controle manutenções, acompanhe gastos e receba lembretes
              automáticos. Tudo o que você precisa para cuidar do seu carro em
              um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="px-8 text-lg h-12"
                onClick={openRegister}
              >
                Começar Agora Grátis
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-8 text-lg h-12"
                onClick={openLogin}
              >
                Já tenho conta
              </Button>
            </div>
          </div>

          {/* Blob Decorativo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 dark:opacity-20 pointer-events-none -z-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          </div>
        </section>

        {/* Seção de Funçoes */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground">
                Tudo sob controle
              </h2>
              <p className="mt-4 text-secondary-foreground">
                Funcionalidades pensadas para facilitar a vida de quem ama seu
                carro.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<MaintenanceIcon size={28} />}
                title="Histórico de Manutenções"
                description="Registre todas as revisões, trocas de óleo e reparos. Tenha o histórico completo na palma da mão."
              />
              <FeatureCard
                icon={<BellIcon size={28} />}
                title="Lembretes Inteligentes"
                description="Nunca mais esqueça uma revisão. O sistema avisa quando chegar a hora por km ou data."
              />
              <FeatureCard
                icon={<MoneyIcon size={28} />}
                title="Controle de Custos"
                description="Acompanhe quanto você gasta com seu veículo e visualize relatórios detalhados."
              />
            </div>
          </div>
        </section>

        {/* Benefits / CTA Section */}
        <section className="py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  Por que usar o Auto Assistance?
                </h3>
                <ul className="space-y-3">
                  {[
                    "Interface simples e intuitiva",
                    "Dashboard completo com gráficos",
                    "Gestão de múltiplos veículos",
                    "Totalmente gratuito",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-secondary-foreground"
                    >
                      <CheckCircleIcon className="text-active-foreground" size={20} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center items-center p-8 bg-secondary rounded-2xl text-secondary-foreground shadow-xl">
                <h3 className="text-2xl font-bold mb-2">
                  Pronto para começar?
                </h3>
                <p className="mb-6 opacity-90">
                  Crie sua conta em menos de 1 minuto.
                </p>
                <Button className="w-full font-bold" onClick={openRegister}>
                  Criar Conta Grátis
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Modal
        isOpen={activeModal === "login"}
        onClose={closeModal}
        title="Bem-vindo de Volta"
      >
        <LoginForm onSuccess={closeModal} onSwitchToRegister={openRegister} />
      </Modal>

      <Modal
        isOpen={activeModal === "register"}
        onClose={closeModal}
        title="Crie sua Conta"
      >
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={openLogin}
        />
      </Modal>
    </div>
  );
};

export default HomePage;
