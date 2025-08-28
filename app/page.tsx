"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { VehicleSelector } from "@/components/vehicle-selector"
import ArticleSearch from "@/components/article-search"
import { ArticleDetails } from "@/components/article-details"
import { CartDrawer } from "@/components/cart-drawer"

export default function HomePage() {
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [showArticleDetails, setShowArticleDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle articleId from URL (from navbar search)
    const articleId = searchParams.get('articleId')
    const search = searchParams.get('search')
    
    if (articleId) {
      setSelectedArticleId(Number(articleId))
      setShowArticleDetails(true)
    } else if (search) {
      setSearchQuery(search)
      setShowArticleDetails(false)
      setSelectedArticleId(null)
    }
  }, [searchParams])

  const handleArticleSelect = (articleId: number) => {
    setSelectedArticleId(articleId)
    setShowArticleDetails(true)
  }

  const handleBackToSearch = () => {
    setShowArticleDetails(false)
    setSelectedArticleId(null)
  }

  if (showArticleDetails && selectedArticleId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <ArticleDetails articleId={selectedArticleId} onBack={handleBackToSearch} />
          </div>
        </main>
        <CartDrawer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16 space-y-6 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-gradient leading-tight">
                Recherche de Pièces Automobiles
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up">
                Trouvez facilement les pièces compatibles avec votre véhicule grâce à notre base de données
                professionnelle <span className="font-semibold text-primary">TecDoc</span>
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mt-8">
              <div className="text-center p-4 sm:p-6 rounded-xl bg-muted/50 border stagger-item card-hover">
                <div className="text-2xl sm:text-3xl font-bold text-primary animate-bounce-subtle">1M+</div>
                <div className="text-sm sm:text-base text-muted-foreground">Pièces</div>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-xl bg-muted/50 border stagger-item card-hover">
                <div className="text-2xl sm:text-3xl font-bold text-primary animate-bounce-subtle">500+</div>
                <div className="text-sm sm:text-base text-muted-foreground">Marques</div>
              </div>
              <div className="text-center p-4 sm:p-6 rounded-xl bg-muted/50 border stagger-item card-hover">
                <div className="text-2xl sm:text-3xl font-bold text-primary animate-bounce-subtle">24/7</div>
                <div className="text-sm sm:text-base text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          {/* Vehicle Selection Section */}
          <div className="mb-12 animate-slide-up">
            <div className="text-center mb-8 space-y-4">
              <h2 className="text-3xl font-bold text-foreground">
                Recherche par Véhicule
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Sélectionnez votre véhicule pour découvrir toutes les pièces compatibles
              </p>
            </div>
            <div className="animate-scale-in">
              <VehicleSelector />
            </div>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="mt-16">
              <div className="text-center mb-8 space-y-4">
                <h2 className="text-3xl font-bold text-foreground">
                  Résultats de recherche
                </h2>
                <p className="text-lg text-muted-foreground">
                  Articles trouvés pour <span className="font-semibold text-primary">"{searchQuery}"</span>
                </p>
              </div>
              <ArticleSearch 
                initialSearchQuery={searchQuery}
                onArticleSelect={handleArticleSelect}
              />
            </div>
          )}

          {/* Help Section */}
          {!searchQuery && (
            <div className="text-center mt-16 animate-fade-in">
              <div className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20 card-hover">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Recherche rapide par référence
                </h3>
                <p className="text-muted-foreground">
                  Vous connaissez déjà la référence ? Utilisez la barre de recherche ci-dessus pour un accès direct
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t bg-gradient-to-r from-muted/30 to-muted/10 mt-20">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-foreground mb-3 text-lg">À propos</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Spécialiste en pièces automobiles Renault, Dacia et Nissan
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-foreground mb-3 text-lg">Contact</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Support professionnel 24/7
                </p>
              </div>
              <div className="text-center sm:text-right sm:col-span-2 lg:col-span-1">
                <h3 className="font-bold text-foreground mb-3 text-lg">Base de données</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Propulsé par TecDoc
                </p>
              </div>
            </div>
            <div className="text-center text-sm sm:text-base text-muted-foreground border-t pt-6">
              <p>© 2024 Ste Piéces Auto Renault - Recherche professionnelle de pièces automobiles</p>
            </div>
          </div>
        </div>
      </footer>
      <CartDrawer />
    </div>
  )
}
