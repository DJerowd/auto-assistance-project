import { Card, CardHeader, CardTitle } from "../components/ui/Card";

const VehiclesPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Veículos</CardTitle>
      </CardHeader>
      <div className="p-6 pt-0">
        <p className="text-gray-600 dark:text-gray-400">
          A funcionalidade para visualizar e gerenciar os veículos será
          implementada aqui.
        </p>
      </div>
    </Card>
  );
};

export default VehiclesPage;
