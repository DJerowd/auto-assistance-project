const Spinner = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Carregando...
        </span>
      </div>
    </div>
  );
};

export default Spinner;
