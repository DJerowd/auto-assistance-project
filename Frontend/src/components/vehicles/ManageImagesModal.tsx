import React, { useState, useRef } from "react";
import Modal from "../ui/modal/Modal";
import { Button } from "../ui/Button";
import {
  uploadVehicleImages,
  deleteVehicleImage,
  setPrimaryVehicleImage,
} from "../../services/imageService";
import { UploadIcon } from "../icons/UploadIcon";
import { StarIcon } from "../icons/StarIcon";
import { TrashIcon } from "../icons/TrashIcon";
import Spinner from "../ui/Spinner";
import type { Vehicle, VehicleImage } from "../../types";

interface ManageImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onUpdate: () => void;
}

const ManageImagesModal = ({
  isOpen,
  onClose,
  vehicle,
  onUpdate,
}: ManageImagesModalProps) => {
  const [images, setImages] = useState<VehicleImage[]>(vehicle?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setImages(vehicle?.images || []);
  }, [vehicle]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!vehicle || !event.target.files?.length) return;
    const files = Array.from(event.target.files);
    setIsUploading(true);
    try {
      await uploadVehicleImages(vehicle.id, files);
      onUpdate();
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await setPrimaryVehicleImage(imageId);
      onUpdate();
    } catch (error) {
      console.error("Failed to set primary image", error);
    }
    onClose();
  };

  const handleDelete = async (imageId: number) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir esta imagem?"
    );
    if (confirmDelete) {
      try {
        await deleteVehicleImage(imageId);
        onUpdate();
      } catch (error) {
        console.error("Failed to delete image", error);
      }
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gerenciar Imagens - ${vehicle?.nickname || vehicle?.model}`}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto px-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group border rounded-lg overflow-hidden"
            >
              <img
                src={image.url}
                alt="Veículo"
                className="w-full h-32 object-cover"
              />

              {image.is_primary ? (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                  <StarIcon size={16} />
                </div>
              ) : null}

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                {!image.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(image.id)}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    title="Definir como principal"
                  >
                    <StarIcon size={18} />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Excluir imagem"
                >
                  <TrashIcon size={18} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-32 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {isUploading ? (
              <Spinner />
            ) : (
              <>
                <UploadIcon size={32} />
                <span>Adicionar</span>
              </>
            )}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/png, image/jpeg, image/gif"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageImagesModal;
