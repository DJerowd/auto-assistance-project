import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { InputNumber } from "../ui/InputNumber";
import { Button } from "../ui/Button";
import type { Maintenance, MaintenanceFormData } from "../../types";

interface MaintenanceFormProps {
  onSubmit: (data: MaintenanceFormData) => void;
  onCancel: () => void;
  initialData?: Maintenance | null;
  isLoading?: boolean;
}

const MaintenanceForm = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: MaintenanceFormProps) => {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    service_type: "",
    maintenance_date: new Date().toISOString().split("T")[0], // Data de hoje
    mileage: 0,
    cost: 0,
    service_provider: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        service_type: initialData.service_type,
        // Formata a data para YYYY-MM-DD para o input date
        maintenance_date: new Date(initialData.maintenance_date)
          .toISOString()
          .split("T")[0],
        mileage: initialData.mileage,
        cost: initialData.cost,
        service_provider: initialData.service_provider || "",
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: "mileage" | "cost") => (value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Tipo de Serviço
          </label>
          <Input
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            required
            placeholder="Ex: Troca de Óleo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Data
          </label>
          <Input
            name="maintenance_date"
            type="date"
            value={formData.maintenance_date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Quilometragem (km)
          </label>
          <InputNumber
            name="mileage"
            value={formData.mileage}
            onValueChange={handleNumberChange("mileage")}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Custo (R$)
          </label>
          <InputNumber
            name="cost"
            value={formData.cost}
            onValueChange={handleNumberChange("cost")}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Prestador de Serviço
        </label>
        <Input
          name="service_provider"
          value={formData.service_provider}
          onChange={handleChange}
          placeholder="Ex: Oficina do Zé"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Observações
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="flex w-full rounded-md border border-gray-300 bg-transparent py-2 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="flex justify-end space-x-4 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default MaintenanceForm;
