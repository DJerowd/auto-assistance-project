import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Input } from "../ui/Input";
import { InputNumber } from "../ui/InputNumber";
import { Button } from "../ui/Button";
import { getVehicleOptions } from "../../services/optionsService";
import type {
  Vehicle,
  VehicleFormData,
  Brand,
  Color,
  Feature,
} from "../../types";

interface VehicleFormProps {
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
  initialData?: Vehicle | null;
  isLoading?: boolean;
}

const VehicleForm = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: VehicleFormProps) => {
  const [formData, setFormData] = useState<VehicleFormData>({
    model: "",
    version: "",
    nickname: "",
    license_plate: "",
    year_of_manufacture: new Date().getFullYear(),
    year_model: new Date().getFullYear(),
    current_mileage: 0,
    brand_id: "",
    color_id: "",
    features: [],
  });

  const [options, setOptions] = useState<{
    brands: Brand[];
    colors: Color[];
    features: Feature[];
  }>({
    brands: [],
    colors: [],
    features: [],
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await getVehicleOptions();
        setOptions({
          brands: data.brands || [],
          colors: data.colors || [],
          features: data.features || [],
        });
      } catch (error) {
        console.error("Failed to fetch vehicle options", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        model: initialData.model,
        version: initialData.version || "",
        nickname: initialData.nickname || "",
        license_plate: initialData.license_plate,
        year_of_manufacture:
          initialData.year_of_manufacture || new Date().getFullYear(),
        year_model: initialData.year_model,
        current_mileage: initialData.current_mileage,
        brand_id: initialData.brand_id || "",
        color_id: initialData.color_id || "",
        features: initialData.features
          ? initialData.features.map((f) => f.id)
          : [],
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange =
    (name: "brand_id" | "color_id") => (value: string) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

  const handleNumberChange =
    (name: "year_of_manufacture" | "year_model" | "current_mileage") =>
    (value: number) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

  const handleFeatureToggle = (featureId: number) => {
    setFormData((prev) => {
      const currentFeatures = prev.features || [];
      if (currentFeatures.includes(featureId)) {
        return {
          ...prev,
          features: currentFeatures.filter((id) => id !== featureId),
        };
      } else {
        return { ...prev, features: [...currentFeatures, featureId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (isLoadingOptions) {
    return <p className="text-center">Carregando opções...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1 dark:text-gray-300">
          Apelido (Opcional)
        </label>
        <Input
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
        />
      </div>

      {/* Coluna 1 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Marca
          </label>
          <Select
            onValueChange={handleSelectChange("brand_id")}
            value={String(formData.brand_id)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma marca" />
            </SelectTrigger>
            <SelectContent>
              {options.brands.map((brand) => (
                <SelectItem key={brand.id} value={String(brand.id)}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Cor
          </label>
          <Select
            onValueChange={handleSelectChange("color_id")}
            value={String(formData.color_id)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma cor" />
            </SelectTrigger>
            <SelectContent>
              {options.colors.map((color) => (
                <SelectItem key={color.id} value={String(color.id)}>
                  <span
                    className="inline-block align-middle w-5 h-5 mr-2 rounded-full border dark:border-gray-600"
                    style={{ backgroundColor: color.hex }}
                  ></span>
                  <span>{color.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Ano de Fabricação
          </label>
          <InputNumber
            name="year_of_manufacture"
            value={formData.year_of_manufacture}
            onValueChange={handleNumberChange("year_of_manufacture")}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Placa
          </label>
          <Input
            name="license_plate"
            value={formData.license_plate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Coluna 2 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Modelo
          </label>
          <Input
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Versão
          </label>
          <Input
            name="version"
            value={formData.version}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Ano do Modelo
          </label>
          <InputNumber
            name="year_model"
            value={formData.year_model}
            onValueChange={handleNumberChange("year_model")}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">
            Quilometragem
          </label>
          <InputNumber
            name="current_mileage"
            value={formData.current_mileage}
            onValueChange={handleNumberChange("current_mileage")}
            required
          />
        </div>
      </div>

      <div className="md:col-span-2 mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium mb-3 dark:text-gray-300">
          Itens Opcionais
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(options.features || []).map((feature) => (
            <label
              key={feature.id}
              className="flex items-center space-x-2 cursor-pointer p-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <input
                type="checkbox"
                checked={(formData.features || []).includes(feature.id)}
                onChange={() => handleFeatureToggle(feature.id)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {feature.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 flex justify-end space-x-4 pt-4">
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

export default VehicleForm;
