"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Loader2, Eye, Plus } from "lucide-react"
import { searchArticlesByNumber } from "@/lib/apify-api"
import { useCart } from "@/hooks/use-cart"
import { RobustProductImage } from "@/components/ui/robust-product-image"

interface SearchResult {
  articleId: number
  articleNo: string
  articleProductName: string
  supplierName: string
  supplierId: number
  articleMediaType: number
  articleMediaFileName: string
  imageLink: string
  imageMedia: string
  s3ImageLink: string
}

interface SearchResponse {
  articleSearchNr: string
  countArticles: number
  articles: SearchResult[]
}

interface ArticleSearchProps {
  onArticleSelect?: (articleId: number) => void
  initialSearchQuery?: string
}

export default function ArticleSearch({ onArticleSelect, initialSearchQuery = "" }: ArticleSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [resultCount, setResultCount] = useState(0)
  const { addItem } = useCart()

  // Auto-search when initialSearchQuery is provided
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery.trim()) {
      setSearchQuery(initialSearchQuery)
      setHasSearched(true)
      // Trigger search automatically
      handleSearchWithQuery(initialSearchQuery)
    }
  }, [initialSearchQuery])

  const handleSearchWithQuery = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setHasSearched(false)

    try {
      console.log("[v0] Searching for article:", query)
      const response = await searchArticlesByNumber(query.trim())

      if (response.error) {
        console.error("[v0] Search error:", response.error)
        setSearchResults([])
        setResultCount(0)
      } else {
        console.log("[v0] Search response:", response.data)
        let searchData: SearchResponse | null = null
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          searchData = response.data[0] as SearchResponse
        } else if (response.data && typeof response.data === 'object') {
          searchData = response.data as SearchResponse
        }

        if (searchData?.articles) {
          setSearchResults(searchData.articles)
          setResultCount(searchData.countArticles || searchData.articles.length)
          console.log("[v0] Found articles:", searchData.articles.length)
        } else {
          setSearchResults([])
          setResultCount(0)
        }
      }
    } catch (error) {
      console.error("[v0] Search failed:", error)
      setSearchResults([])
      setResultCount(0)
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }

  const handleSearch = async () => {
    await handleSearchWithQuery(searchQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleAddToCart = (article: SearchResult) => {
    addItem({
      articleId: article.articleId,
      name: article.articleProductName,
      price: 29.99, // Mock price for all articles
      quantity: 1,
              image: article.imageLink || article.imageMedia || article.s3ImageLink || '',
      supplier: article.supplierName,
      articleNo: article.articleNo,
    })
  }

  return (
    <div className="space-y-8">
      <Card className="border-2 border-primary/10 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <Search className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Recherche par Numéro d'Article
            </span>
          </CardTitle>
          <CardDescription className="text-center text-lg mt-3">
            Recherchez des pièces auto en utilisant le numéro d'article ou de référence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Input
                placeholder="Entrez le numéro d'article (ex: 2250038, BP4W-14-302, etc.)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 sm:h-14 pl-4 sm:pl-6 pr-4 sm:pr-6 text-base sm:text-lg font-medium rounded-xl border-2 placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50"
                aria-label="Numéro d'article à rechercher"
                aria-describedby="search-description"
              />
              <div id="search-description" className="sr-only">
                Entrez un numéro d'article ou une référence pour rechercher des pièces automobiles
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="h-12 sm:h-14 px-6 sm:px-8 bg-primary hover:bg-primary/90 rounded-xl font-semibold text-base sm:text-lg transition-all hover:scale-105 disabled:hover:scale-100 w-full sm:w-auto"
              aria-label="Lancer la recherche"
              type="submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                  <span className="hidden sm:inline">Recherche...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Rechercher
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-foreground">
              Résultats de recherche
            </h3>
            {resultCount > 0 && (
              <Badge variant="secondary" className="text-base px-4 py-2 bg-primary/10 text-primary border-primary/20">
                {resultCount} article{resultCount > 1 ? "s" : ""} trouvé{resultCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {searchResults.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/30">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-muted/60 rounded-full flex items-center justify-center mb-6">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Aucun article trouvé</h3>
                <p className="text-muted-foreground text-lg mb-4 max-w-md">
                  Aucun article ne correspond au numéro "{searchQuery}". Vérifiez le numéro et réessayez.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-xl">
                    Nouvelle recherche
                  </Button>
                  <Button variant="ghost" className="rounded-xl">
                    Parcourir par véhicule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {searchResults.map((article) => (
                <Card key={article.articleId} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-primary/20 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="space-y-4">
                      {/* Product Image */}
                      <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/80 relative overflow-hidden">
                        <RobustProductImage
                          s3ImageLink={article.s3ImageLink}
                          imageLink={article.imageLink}
                          imageMedia={article.imageMedia}
                          alt={article.articleProductName}
                          className="w-full h-full group-hover:scale-110 transition-transform duration-300"
                          size="xl"
                          showDebug={false}
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-background/90 text-foreground border">
                            Disponible
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {/* Product Name */}
                        <h4 className="font-bold text-base line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                          {article.articleProductName}
                        </h4>

                        {/* Product Details */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground font-medium">Référence</span>
                            <span className="font-mono text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                              {article.articleNo}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground font-medium">Fournisseur</span>
                            <Badge variant="outline" className="text-xs font-semibold border-primary/20">
                              {article.supplierName}
                            </Badge>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-center py-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
                          <div className="text-2xl font-bold text-primary">
                            29,99 <span className="text-lg">TND</span>
                          </div>
                          <div className="text-xs text-muted-foreground">Prix TTC</div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => handleAddToCart(article)}
                            className="w-full transition-all hover:scale-105 rounded-xl"
                            size="sm"
                            variant="outline"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Panier
                          </Button>
                          {onArticleSelect && (
                            <Button
                              onClick={() => onArticleSelect(article.articleId)}
                              className="w-full transition-all hover:scale-105 rounded-xl"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Détails
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
