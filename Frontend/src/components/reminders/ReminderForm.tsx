import React, { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { InputNumber } from "../ui/InputNumber";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Button } from "../ui/Button";
import type { Reminder, ReminderFormData, Vehicle } from "../../types";

interface ReminderFormProps {
  onSubmit: (data: ReminderFormData) => void;
  onCancel: () => void;
  initialData?: Reminder | null;
  isLoading?: boolean;
  vehicle: Vehicle | null;
}

const ReminderForm = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
  vehicle
}: ReminderFormProps) => {
  const [formData, setFormData] = useState<ReminderFormData>({
    service_type: "",
    status: "PENDING",
    date_threshold: "",
    mileage_threshold: undefined,
    notes: "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        service_type: initialData.service_type,
        status: initialData.status,
        date_threshold: initialData.date_threshold
          ? new Date(initialData.date_threshold).toISOString().split("T")[0]
          : "",
        mileage_threshold: initialData.mileage_threshold || undefined,
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

  const handleNumberChange = (name: "mileage_threshold") => (value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value || undefined }));
  };

  const handleStatusChange = (value: "PENDING" | "COMPLETED" | "CANCELLED") => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.date_threshold && (!formData.mileage_threshold || formData.mileage_threshold <= 0)) {
      setFormError("Por favor, defina pelo menos um gatilho (data ou quilometragem).");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tipo de Serviço</label>
          <Input name="service_type" value={formData.service_type} onChange={handleChange} required placeholder="Ex: Próxima troca de óleo" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
          <Select onValueChange={handleStatusChange} value={formData.status} required>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="COMPLETED">Concluído</SelectItem>
              <SelectItem value="CANCELLED">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 text-center text-sm text-gray-500">
          Defina pelo menos um gatilho (data ou km):
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Data Limite</label>
          <Input 
            name="date_threshold" 
            type="date" 
            value={formData.date_threshold} 
            onChange={handleChange} 
            // Não permite adicionar lembrete para datas passadas
            min={!initialData ? new Date().toISOString().split('T')[0] : undefined} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Quilometragem (km)</label>
          <InputNumber name="mileage_threshold" value={formData.mileage_threshold || ''} onValueChange={handleNumberChange('mileage_threshold')} />
          {/* Helper de KM Atual */}
          {vehicle && (
            <p className="text-xs text-gray-500 mt-1">
              Km atual do veículo: {vehicle.current_mileage.toLocaleString('pt-BR')} km
            </p>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Observações</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="flex w-full rounded-md border border-gray-300 bg-transparent py-2 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="flex justify-end space-x-4 pt-2">
        {formError && <p className="text-sm text-red-600 mr-auto self-center">{formError}</p>}
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={isLoading}>Salvar</Button>
      </div>
    </form>
  );
};

export default ReminderForm;
