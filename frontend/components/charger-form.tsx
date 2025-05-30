"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { apiClient, ChargingStation } from "@/lib/api";

interface ChargerFormProps {
  charger?: ChargingStation;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ChargerForm({
  charger,
  onSuccess,
  onCancel,
}: ChargerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError("");

    try {
      const data = {
        name: formData.get("name") as string,
        location: {
          latitude: Number.parseFloat(formData.get("latitude") as string),
          longitude: Number.parseFloat(formData.get("longitude") as string),
          address: formData.get("address") as string,
        },
        status: formData.get("status") as "Active" | "Inactive" | "Maintenance",
        powerOutput: Number.parseFloat(formData.get("powerOutput") as string),
        connectorType: formData.get("connectorType") as
          | "Type 1"
          | "Type 2"
          | "CCS"
          | "CHAdeMO"
          | "Tesla Supercharger",
      };

      let response;
      if (charger) {
        response = await apiClient.updateChargingStation(charger._id, data);
      } else {
        response = await apiClient.createChargingStation(data);
      }

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || "Failed to save charger");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save charger"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={charger?.name}
            placeholder="Tesla Supercharger Station 1"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="powerOutput">Power Output (kW) *</Label>
          <Input
            id="powerOutput"
            name="powerOutput"
            type="number"
            min="0"
            step="0.1"
            defaultValue={charger?.powerOutput}
            placeholder="150"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          defaultValue={charger?.location.address}
          placeholder="123 Main St, New York, NY"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude *</Label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            min="-90"
            max="90"
            defaultValue={charger?.location.latitude}
            placeholder="40.7128"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude *</Label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            min="-180"
            max="180"
            defaultValue={charger?.location.longitude}
            placeholder="-74.0060"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={charger?.status || "Active"}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="connectorType">Connector Type</Label>
          <Select name="connectorType" defaultValue={charger?.connectorType}>
            <SelectTrigger>
              <SelectValue placeholder="Select connector type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Type 1">Type 1</SelectItem>
              <SelectItem value="Type 2">Type 2</SelectItem>
              <SelectItem value="CCS">CCS</SelectItem>
              <SelectItem value="CHAdeMO">CHAdeMO</SelectItem>
              <SelectItem value="Tesla Supercharger">
                Tesla Supercharger
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {charger ? "Update" : "Create"} Charger
        </Button>
      </div>
    </form>
  );
}
