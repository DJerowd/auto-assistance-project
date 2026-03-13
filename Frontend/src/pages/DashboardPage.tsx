import { useEffect, useState } from "react";

import { getDashboardStats } from "../services/dashboardService";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import type { DashboardData } from "../types";

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getDashboardStats();
        setData(stats);
      } catch {
        setError("Não foi possível carregar os dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-secondary/50 p-4 rounded-xl shadow-sm border border-input space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-destructive text-center">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Seção de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total de Veículos</CardTitle>
            <CardDescription className="text-3xl">
              {data?.kpi.totalVehicles}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lembretes Pendentes</CardTitle>
            <CardDescription className="text-3xl">
              {data?.kpi.pendingReminders}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Custo Anual (Manutenção)</CardTitle>
            <CardDescription className="text-3xl">
              {data?.kpi.totalCostLastYear.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Próximo Lembrete</CardTitle>
            <CardDescription className="truncate">
              {data?.kpi.nextReminder?.service_type ||
                "Nenhum lembrete próximo"}
            </CardDescription>
            <CardDescription className="truncate">
              {data?.kpi.nextReminder
                ? new Date(
                    data.kpi.nextReminder.date_threshold
                  ).toLocaleDateString()
                : ""}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Seção de Gráficos (dados brutos) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Custos Mensais (Último Ano)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data?.charts.maintenanceCostByMonth.map((item) => (
                <li
                  key={item.month}
                  className="text-sm text-foreground flex justify-between"
                >
                  <span>{item.month}:</span>
                  <span className="font-mono">
                    {parseFloat(item.totalCost).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manutenções por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data?.charts.maintenancesByType.map((item) => (
                <li
                  key={item.service_type}
                  className="text-sm text-foreground flex justify-between"
                >
                  <span>{item.service_type}:</span>
                  <span className="font-bold">{item.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
