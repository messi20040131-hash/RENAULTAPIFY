"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RotateCcw, ChevronRight, Car, Settings, Zap, Info, CheckCircle2 } from "lucide-react"
import { getManufacturers, getModels, getVehicles } from "@/lib/apify-api"
import { CategoriesDisplay } from "./categories-display"
import { ArticlesList } from "./articles-list"
import { ArticleDetails } from "./article-details"

interface Manufacturer {
  manufacturerId: number
  brand: string
}

interface Model {
  modelId: number
  modelName: string
  modelYearFrom: string
  modelYearTo: string | null
}

interface Vehicle {
  vehicleId: number
  manufacturerName: string
  modelName: string
  typeEngineName: string
  powerKw: string
  powerPs: string
  fuelType: string
  bodyType: string
  constructionIntervalStart: string
  constructionIntervalEnd: string | null
}

export function VehicleSelector() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const [selectedBrand, setSelectedBrand] = useState<Manufacturer | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null)

  const [loadingManufacturers, setLoadingManufacturers] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadManufacturers()
  }, [])

  const loadManufacturers = async () => {
    try {
      setLoadingManufacturers(true)
      setError(null)
      const response = await getManufacturers()

      if (response.error) {
        setError(response.error)
        return
      }

      const manufacturersData = (response.data as any)?.[0]?.manufacturers || []
      console.log("[v0] Full response:", response)
      console.log("[v0] Response data:", response.data)
      console.log("[v0] Extracted manufacturers:", manufacturersData)
      
      // Filter to only show Renault, Dacia, and Nissan
      const allowedBrands = ['RENAULT', 'DACIA', 'NISSAN']
      const filteredManufacturers = manufacturersData.filter((manufacturer: Manufacturer) => 
        allowedBrands.includes(manufacturer.brand.toUpperCase())
      )
      
      console.log("[v0] Filtered manufacturers:", filteredManufacturers)
      setManufacturers(filteredManufacturers)
    } catch (err) {
      setError("Erreur lors du chargement des marques")
      console.error("Error loading manufacturers:", err)
    } finally {
      setLoadingManufacturers(false)
    }
  }

  const loadModels = async (manufacturerId: number) => {
    try {
      setLoadingModels(true)
      setError(null)
      const response = await getModels(manufacturerId)

      if (response.error) {
        setError(response.error)
        return
      }

      const modelsData = (response.data as any)?.[0]?.models || []
      console.log("[v0] Extracted models:", modelsData)
      setModels(modelsData)
    } catch (err) {
      setError("Erreur lors du chargement des modèles")
      console.error("Error loading models:", err)
    } finally {
      setLoadingModels(false)
    }
  }

  const loadVehicles = async (manufacturerId: number, modelId: number) => {
    try {
      setLoadingVehicles(true)
      setError(null)
      const response = await getVehicles(manufacturerId, modelId)

      if (response.error) {
        setError(response.error)
        return
      }

      const vehiclesData = (response.data as any)?.[0]?.modelTypes || []
      console.log("[v0] Extracted vehicles:", vehiclesData)
      setVehicles(vehiclesData)
    } catch (err) {
      setError("Erreur lors du chargement des motorisations")
      console.error("Error loading vehicles:", err)
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleBrandChange = (brandId: string) => {
    const brand = manufacturers.find((m) => m.manufacturerId.toString() === brandId)
    if (brand) {
      setSelectedBrand(brand)
      setSelectedModel(null)
      setSelectedVehicle(null)
      setSelectedCategory(null)
      setSelectedArticle(null)
      setModels([])
      setVehicles([])
      loadModels(brand.manufacturerId)
    }
  }

  const handleModelChange = (modelId: string) => {
    const model = models.find((m) => m.modelId.toString() === modelId)
    if (model && selectedBrand) {
      setSelectedModel(model)
      setSelectedVehicle(null)
      setSelectedCategory(null)
      setSelectedArticle(null)
      setVehicles([])
      loadVehicles(selectedBrand.manufacturerId, model.modelId)
    }
  }

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.vehicleId.toString() === vehicleId)
    if (vehicle) {
      setSelectedVehicle(vehicle)
    }
  }

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName })
    setSelectedArticle(null)
  }

  const handleArticleSelect = (articleId: number) => {
    setSelectedArticle(articleId)
  }

  const handleBackFromArticle = () => {
    setSelectedArticle(null)
  }

  const handleReset = () => {
    setSelectedBrand(null)
    setSelectedModel(null)
    setSelectedVehicle(null)
    setSelectedCategory(null)
    setSelectedArticle(null)
    setModels([])
    setVehicles([])
    setError(null)
  }

  // Calculate progress
  const getProgress = () => {
    if (selectedVehicle) return 100
    if (selectedModel) return 66
    if (selectedBrand) return 33
    return 0
  }

  const getStepStatus = (step: number) => {
    switch (step) {
      case 1:
        return selectedBrand ? 'completed' : 'current'
      case 2:
        if (!selectedBrand) return 'disabled'
        return selectedModel ? 'completed' : loadingModels ? 'loading' : 'current'
      case 3:
        if (!selectedModel) return 'disabled'
        return selectedVehicle ? 'completed' : loadingVehicles ? 'loading' : 'current'
      default:
        return 'disabled'
    }
  }

  return (
    <div className="space-y-8">
      <Card className="border-2 border-primary/10 shadow-lg bg-gradient-to-br from-background to-muted/20 overflow-hidden">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Sélection du Véhicule
            </CardTitle>
            {(selectedBrand || selectedModel || selectedVehicle) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="rounded-xl hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-all"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Recommencer
              </Button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium text-primary">{Math.round(getProgress())}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Marque</span>
              <span>Modèle</span>
              <span>Motorisation</span>
            </div>
          </div>
          
          <p className="text-center text-muted-foreground mt-4">
            Choisissez votre véhicule pour une recherche personnalisée
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border-l-4 border-destructive rounded-lg">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Selection Steps */}
          <div className="relative">
            {/* Step Connectors (Desktop) */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted to-transparent pointer-events-none" />
            <div className="hidden lg:flex absolute top-12 left-1/3 right-1/3 justify-between pointer-events-none">
              <ChevronRight className={`h-4 w-4 transition-colors ${selectedBrand ? 'text-primary' : 'text-muted-foreground/50'}`} />
              <ChevronRight className={`h-4 w-4 transition-colors ${selectedModel ? 'text-primary' : 'text-muted-foreground/50'}`} />
            </div>
            
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Step 1: Brand */}
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    getStepStatus(1) === 'completed' 
                      ? 'bg-green-500 text-white shadow-lg scale-110' 
                      : getStepStatus(1) === 'current'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground'
                  }`} aria-hidden="true">
                    {getStepStatus(1) === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Car className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="brand-select" className="text-lg font-semibold text-foreground flex items-center gap-2">
                      Marque
                      {selectedBrand && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedBrand.brand}
                        </Badge>
                      )}
                    </label>
                    <p className="text-sm text-muted-foreground">Sélectionnez votre marque</p>
                  </div>
                </div>
                {loadingManufacturers ? (
                  <div className="h-12 bg-gradient-to-r from-muted/60 to-muted/40 rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/30 animate-shimmer">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Chargement des marques...</span>
                  </div>
                ) : (
                  <Select onValueChange={handleBrandChange} value={selectedBrand?.manufacturerId.toString() || ""}>
                    <SelectTrigger 
                      id="brand-select"
                      className={`h-12 rounded-xl border-2 text-left font-medium transition-all duration-200 ${
                        selectedBrand 
                          ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' 
                          : 'border-primary/20 hover:border-primary/50 hover:shadow-md'
                      }`}
                      aria-label="Sélectionner une marque de véhicule"
                    >
                      <SelectValue placeholder="🚗 Choisissez une marque" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {manufacturers.map((manufacturer) => (
                        <SelectItem 
                          key={manufacturer.manufacturerId} 
                          value={manufacturer.manufacturerId.toString()}
                          className="font-medium py-3 hover:bg-primary/5"
                        >
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-primary" />
                            {manufacturer.brand}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Step 2: Model */}
              <div className={`space-y-4 transition-all duration-500 ${
                selectedBrand ? 'animate-fade-in' : 'opacity-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    getStepStatus(2) === 'completed' 
                      ? 'bg-green-500 text-white shadow-lg scale-110' 
                      : getStepStatus(2) === 'current'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : getStepStatus(2) === 'loading'
                      ? 'bg-primary/70 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`} aria-hidden="true">
                    {getStepStatus(2) === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : getStepStatus(2) === 'loading' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Settings className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="model-select" className={`text-lg font-semibold transition-colors flex items-center gap-2 ${
                      selectedBrand ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      Modèle
                      {selectedModel && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedModel.modelName}
                        </Badge>
                      )}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {!selectedBrand ? 'Sélectionnez d\'abord une marque' : 'Choisissez le modèle'}
                    </p>
                  </div>
                </div>
                {loadingModels ? (
                  <div className="h-12 bg-gradient-to-r from-muted/60 to-muted/40 rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/30 animate-shimmer">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Chargement des modèles...</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={handleModelChange}
                    value={selectedModel?.modelId.toString() || ""}
                    disabled={!selectedBrand || models.length === 0}
                  >
                    <SelectTrigger 
                      id="model-select"
                      className={`h-12 rounded-xl border-2 text-left font-medium transition-all duration-200 ${
                        !selectedBrand 
                          ? 'opacity-50 cursor-not-allowed border-muted' 
                          : selectedModel
                          ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
                          : 'border-primary/20 hover:border-primary/50 hover:shadow-md'
                      }`}
                      aria-label="Sélectionner un modèle de véhicule"
                      aria-describedby={!selectedBrand ? "model-help" : undefined}
                    >
                      <SelectValue placeholder={selectedBrand ? "🔧 Choisissez un modèle" : "Sélectionnez d'abord une marque"} />
                    </SelectTrigger>
                    {!selectedBrand && (
                      <div id="model-help" className="sr-only">
                        Vous devez d'abord sélectionner une marque pour choisir un modèle
                      </div>
                    )}
                    <SelectContent className="rounded-xl max-h-64">
                      {models.map((model) => (
                        <SelectItem 
                          key={model.modelId} 
                          value={model.modelId.toString()}
                          className="font-medium py-3 hover:bg-primary/5"
                        >
                          <div className="flex items-start gap-2">
                            <Settings className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-semibold">{model.modelName}</span>
                              <span className="text-xs text-muted-foreground">
                                {model.modelYearFrom ? model.modelYearFrom.split("-")[0] : "N/A"} - {model.modelYearTo ? model.modelYearTo.split("-")[0] : "présent"}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Step 3: Engine */}
              <div className={`space-y-4 transition-all duration-500 ${
                selectedModel ? 'animate-fade-in' : 'opacity-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    getStepStatus(3) === 'completed' 
                      ? 'bg-green-500 text-white shadow-lg scale-110' 
                      : getStepStatus(3) === 'current'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : getStepStatus(3) === 'loading'
                      ? 'bg-primary/70 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`} aria-hidden="true">
                    {getStepStatus(3) === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : getStepStatus(3) === 'loading' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={`text-lg font-semibold transition-colors flex items-center gap-2 ${
                      selectedModel ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      Motorisation
                      {selectedVehicle && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedVehicle.powerPs}ch
                        </Badge>
                      )}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {!selectedModel ? 'Sélectionnez d\'abord un modèle' : 'Choisissez la motorisation'}
                    </p>
                  </div>
                </div>
                {loadingVehicles ? (
                  <div className="h-12 bg-gradient-to-r from-muted/60 to-muted/40 rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/30 animate-shimmer">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Chargement des motorisations...</span>
                  </div>
                ) : (
                  <Select
                    onValueChange={handleVehicleChange}
                    value={selectedVehicle?.vehicleId.toString() || ""}
                    disabled={!selectedModel || vehicles.length === 0}
                  >
                    <SelectTrigger className={`h-12 rounded-xl border-2 text-left font-medium transition-all duration-200 ${
                      !selectedModel 
                        ? 'opacity-50 cursor-not-allowed border-muted' 
                        : selectedVehicle
                        ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
                        : 'border-primary/20 hover:border-primary/50 hover:shadow-md'
                    }`}>
                      <SelectValue
                        placeholder={selectedModel ? "⚡ Choisissez une motorisation" : "Sélectionnez d'abord un modèle"}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-64">
                      {vehicles.map((vehicle) => (
                        <SelectItem 
                          key={vehicle.vehicleId} 
                          value={vehicle.vehicleId.toString()}
                          className="font-medium py-3 hover:bg-primary/5"
                        >
                          <div className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-semibold">{vehicle.typeEngineName}</span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                  {vehicle.powerPs}ch
                                </span>
                                <span>({vehicle.powerKw}kW)</span>
                                <span>•</span>
                                <span>{vehicle.fuelType}</span>
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {/* Selected Vehicle Summary */}
          {selectedVehicle && (
            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 via-primary/5 to-green-50 dark:from-green-950/20 dark:via-primary/5 dark:to-green-950/20 border-2 border-green-500/20 rounded-2xl animate-scale-in shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Véhicule sélectionné</h3>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Configuration validée</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="rounded-xl hover:bg-primary/10 border-primary/20"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
              
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-background/50 rounded-xl">
                <Badge variant="secondary" className="font-medium">
                  {selectedVehicle.manufacturerName}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className="font-medium">
                  {selectedVehicle.modelName}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className="font-medium">
                  {selectedVehicle.powerPs}ch
                </Badge>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2 p-3 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Marque</span>
                  </div>
                  <p className="font-bold text-foreground text-lg">{selectedVehicle.manufacturerName}</p>
                </div>
                <div className="space-y-2 p-3 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Modèle</span>
                  </div>
                  <p className="font-bold text-foreground text-lg">{selectedVehicle.modelName}</p>
                </div>
                <div className="space-y-2 p-3 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Motorisation</span>
                  </div>
                  <p className="font-bold text-foreground text-lg">{selectedVehicle.typeEngineName}</p>
                </div>
                <div className="space-y-2 p-3 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Puissance</span>
                  </div>
                  <p className="font-bold text-foreground text-lg">
                    {selectedVehicle.powerPs}ch ({selectedVehicle.powerKw}kW)
                  </p>
                </div>
                <div className="space-y-2 p-3 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Carburant</span>
                  </div>
                  <p className="font-bold text-foreground text-lg">{selectedVehicle.fuelType}</p>
                </div>
                <div className="space-y-2 p-3 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Période</span>
                  </div>
                  <p className="font-bold text-foreground text-lg">
                    {selectedVehicle.constructionIntervalStart
                      ? selectedVehicle.constructionIntervalStart.split("-")[0]
                      : "N/A"} - {selectedVehicle.constructionIntervalEnd
                      ? selectedVehicle.constructionIntervalEnd.split("-")[0]
                      : "présent"}
                  </p>
                </div>
              </div>
              
              {/* Next Step Hint */}
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Info className="h-4 w-4" />
                  <span>Étape suivante</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre véhicule est configuré ! Vous pouvez maintenant parcourir les catégories de pièces ci-dessous.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedVehicle && selectedBrand && (
        <CategoriesDisplay
          manufacturerId={selectedBrand.manufacturerId}
          vehicleId={selectedVehicle.vehicleId}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {selectedCategory && selectedBrand && selectedVehicle && !selectedArticle && (
        <ArticlesList
          manufacturerId={selectedBrand.manufacturerId}
          vehicleId={selectedVehicle.vehicleId}
          productGroupId={selectedCategory.id}
          categoryName={selectedCategory.name}
          onArticleSelect={handleArticleSelect}
        />
      )}

      {selectedArticle && <ArticleDetails articleId={selectedArticle} onBack={handleBackFromArticle} />}
    </div>
  )
}
