const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 dark:text-white">
          © {new Date().getFullYear()} Auto Assistance. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
