"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type ChargingStation, apiClient } from "@/lib/api";
import { MapPin, Zap, Navigation, Loader2, Search, Filter } from "lucide-react";

// Simple map component using a grid layout to simulate map view
export default function ChargerMap() {
  const [chargers, setChargers] = useState<ChargingStation[]>([]);
  const [filteredChargers, setFilteredChargers] = useState<ChargingStation[]>(
    []
  );
  const [selectedCharger, setSelectedCharger] =
    useState<ChargingStation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const fetchChargers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getChargingStations({ limit: 100 });

      if (response.success && response.data) {
        setChargers(response.data);
        setFilteredChargers(response.data);
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
  };

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  // Filter chargers based on search and status
  useEffect(() => {
    let filtered = chargers;

    if (searchTerm) {
      filtered = filtered.filter(
        (charger) =>
          charger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          charger.location.address
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((charger) => charger.status === statusFilter);
    }

    setFilteredChargers(filtered);
  }, [chargers, searchTerm, statusFilter]);

  useEffect(() => {
    fetchChargers();
    getUserLocation();
  }, [getUserLocation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Inactive":
        return "bg-gray-500";
      case "Maintenance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const openInMaps = (charger: ChargingStation) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${charger.location.latitude},${charger.location.longitude}`;
    window.open(url, "_blank");
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers
    return d;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Charging Station Map</h1>
        <p className="text-muted-foreground">
          View and explore all charging stations
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label>Status Filter</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Station Locations</CardTitle>
              <CardDescription>
                Geographic distribution of charging stations (
                {filteredChargers.length} stations)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Simulated Map Grid */}
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 min-h-96">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
                  {filteredChargers.map((charger) => (
                    <div
                      key={charger._id}
                      className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        selectedCharger?._id === charger._id
                          ? "bg-blue-100 border-blue-300 shadow-lg"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedCharger(charger)}
                      style={{
                        // Simulate geographic positioning based on coordinates
                        gridColumn:
                          Math.floor((charger.location.longitude + 180) / 90) +
                          1,
                        gridRow:
                          Math.floor((90 - charger.location.latitude) / 45) + 1,
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusDotColor(
                            charger.status
                          )}`}
                        />
                        <MapPin className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium truncate">
                          {charger.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {charger.powerOutput}kW
                        </p>
                        {userLocation && (
                          <p className="text-xs text-gray-400">
                            {calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              charger.location.latitude,
                              charger.location.longitude
                            ).toFixed(1)}
                            km
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {userLocation && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    📍 Your Location: {userLocation.lat.toFixed(2)},{" "}
                    {userLocation.lng.toFixed(2)}
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  💡 For a full interactive map experience, integrate with
                  Google Maps, Mapbox, or OpenStreetMap
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station List and Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stations ({filteredChargers.length})</CardTitle>
              <CardDescription>
                Click on a station to view details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {filteredChargers.map((charger) => (
                <div
                  key={charger._id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCharger?._id === charger._id
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedCharger(charger)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{charger.name}</h4>
                    <Badge
                      className={`text-xs ${getStatusColor(charger.status)}`}
                    >
                      {charger.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {charger.location.address ||
                      `${charger.location.latitude}, ${charger.location.longitude}`}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      {charger.powerOutput} kW
                    </span>
                    <span>{charger.connectorType}</span>
                  </div>
                  {userLocation && (
                    <p className="text-xs text-gray-400 mt-1">
                      Distance:{" "}
                      {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        charger.location.latitude,
                        charger.location.longitude
                      ).toFixed(1)}{" "}
                      km
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Charger Details */}
          {selectedCharger && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedCharger.name}
                </CardTitle>
                <CardDescription>Charging station details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getStatusColor(selectedCharger.status)}>
                    {selectedCharger.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Power Output:</span>
                  <span className="text-sm">
                    {selectedCharger.powerOutput} kW
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Connector:</span>
                  <span className="text-sm">
                    {selectedCharger.connectorType}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Location:</span>
                  <p className="text-sm text-muted-foreground">
                    {selectedCharger.location.address || "No address provided"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedCharger.location.latitude},{" "}
                    {selectedCharger.location.longitude}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Created by:</span>
                  <p className="text-sm text-muted-foreground">
                    {selectedCharger.createdBy.name}
                  </p>
                </div>
                {userLocation && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Distance:</span>
                    <p className="text-sm text-muted-foreground">
                      {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        selectedCharger.location.latitude,
                        selectedCharger.location.longitude
                      ).toFixed(1)}{" "}
                      km from your location
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => openInMaps(selectedCharger)}
                  className="w-full"
                  size="sm"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Open in Maps
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
