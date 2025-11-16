import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

const VehicleMaintenancesPage = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manuteções</CardTitle>
      </CardHeader>

      <div className="p-6 pt-0">
        <Button onClick={() => navigate("/vehicles")}>
          ← Voltar
        </Button>
        <p className="text-gray-600 dark:text-gray-400">
          A funcionalidade para visualizar e editar as manutenções de veículos
          será implementada aqui.
        </p>
      </div>
    </Card>
  );
};

export default VehicleMaintenancesPage;
