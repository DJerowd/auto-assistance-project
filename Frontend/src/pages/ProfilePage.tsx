import { Card, CardHeader, CardTitle } from "../components/ui/Card";

const ProfilePage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
      </CardHeader>
      
      <div className="p-6 pt-0">
        <p className="text-gray-600 dark:text-gray-400">
          A funcionalidade para visualizar e editar o perfil de usuário será
          implementada aqui.
        </p>
      </div>
    </Card>
  );
};

export default ProfilePage;
