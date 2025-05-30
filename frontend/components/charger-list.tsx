"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Zap,
  Loader2,
} from "lucide-react";
import { ChargerForm } from "./charger-form";
import { apiClient, ChargingStation } from "@/lib/api";

export default function ChargerList() {
  const [chargers, setChargers] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [connectorFilter, setConnectorFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCharger, setEditingCharger] = useState<ChargingStation | null>(
    null
  );

  const fetchChargers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getChargingStations({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        connectorType: connectorFilter === "all" ? undefined : connectorFilter,
      });

      if (response.success && response.data) {
        setChargers(response.data);
        setTotalPages(response.pagination?.pages || 1);
      } else {
        setError(response.message || "Failed to fetch chargers");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch chargers"
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, connectorFilter]);

  useEffect(() => {
    fetchChargers();
  }, [fetchChargers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this charger?")) return;

    try {
      const response = await apiClient.deleteChargingStation(id);
      if (response.success) {
        fetchChargers();
      } else {
        setError(response.message || "Failed to delete charger");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete charger"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Charging Stations</h1>
          <p className="text-muted-foreground">
            Manage your EV charging infrastructure
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Charger
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Charging Station</DialogTitle>
              <DialogDescription>
                Create a new charging station in your network
              </DialogDescription>
            </DialogHeader>
            <ChargerForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                fetchChargers();
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Connector Type</Label>
              <Select
                value={connectorFilter}
                onValueChange={setConnectorFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All connectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All connectors</SelectItem>
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
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setConnectorFilter("all");
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Chargers Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chargers.map((charger) => (
            <Card
              key={charger._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{charger.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {charger.location.address ||
                        `${charger.location.latitude}, ${charger.location.longitude}`}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingCharger(charger)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(charger._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge className={getStatusColor(charger.status)}>
                      {charger.status}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Zap className="h-3 w-3 mr-1" />
                      {charger.powerOutput} kW
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Connector:</span>{" "}
                    {charger.connectorType}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created by {charger.createdBy.name}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCharger}
        onOpenChange={() => setEditingCharger(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Charging Station</DialogTitle>
            <DialogDescription>
              Update the charging station details
            </DialogDescription>
          </DialogHeader>
          {editingCharger && (
            <ChargerForm
              charger={editingCharger}
              onSuccess={() => {
                setEditingCharger(null);
                fetchChargers();
              }}
              onCancel={() => setEditingCharger(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
