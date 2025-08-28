"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, ShoppingCart, Search, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import { searchArticlesByNumber } from "@/lib/apify-api"
import { useRouter } from "next/navigation"

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { toggleCart, getTotalItems } = useCart()
  const router = useRouter()

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setShowSearchResults(true)
    
    try {
      const response = await searchArticlesByNumber(searchQuery.trim())
      if (response.error) {
        setSearchResults([])
      } else {
        let searchData: any = null
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          searchData = response.data[0]
        } else if (response.data && typeof response.data === 'object') {
          searchData = response.data
        }
        
        if (searchData?.articles) {
          setSearchResults(searchData.articles)
        } else {
          setSearchResults([])
        }
      }
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleArticleSelect = (articleId: number) => {
    setShowSearchResults(false)
    setSearchQuery("")
    router.push(`/?articleId=${articleId}`)
  }

  const handleViewAllResults = () => {
    setShowSearchResults(false)
    setSearchQuery("")
    router.push(`/?search=${encodeURIComponent(searchQuery)}`)
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              {/* Light Mode Logos */}
              <div className="flex items-center space-x-2 dark:hidden">
                <img
                  src="/LL1.png"
                  alt="Ste Piece Auto Renault"
                  className="h-10 w-auto transition-transform hover:scale-105"
                />
                <img
                  src="/LL2.png"
                  alt="Ste Piece Auto Renault"
                  className="h-10 w-auto transition-transform hover:scale-105"
                />
                <img
                  src="/LL3.png"
                  alt="Ste Piece Auto Renault"
                  className="h-10 w-auto transition-transform hover:scale-105"
                />
              </div>
              
              {/* Dark Mode Logos */}
              <div className="flex items-center space-x-2 hidden dark:flex">
                <img
                  src="/DL1.png"
                  alt="Ste Piece Auto Renault"
                  className="h-10 w-auto transition-transform hover:scale-105"
                />
                <img
                  src="/DL2.png"
                  alt="Ste Piece Auto Renault"
                  className="h-10 w-auto transition-transform hover:scale-105"
                />
                <img
                  src="/DL3.png"
                  alt="Ste Piece Auto Renault"
                  className="h-10 w-auto transition-transform hover:scale-105"
                />
              </div>
            </div>
            
            {/* Brand Text */}
            <div className="hidden md:block border-l pl-4">
              <h1 className="text-xl font-bold text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Ste Piéces Auto Renault
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Recherche professionnelle TecDoc
              </p>
            </div>
          </div>

                      {/* Enhanced Search Bar */}
          <div className="relative flex-1 max-w-lg mx-6" ref={searchRef}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
              <input
                type="text"
                placeholder="Rechercher par référence ou nom de pièce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-12 py-3 border-2 border-input bg-background rounded-xl text-sm font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/50"
                aria-label="Rechercher des pièces automobiles par référence"
                role="searchbox"
                aria-expanded={showSearchResults}
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Entrez une référence de pièce pour rechercher dans notre catalogue
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-muted/60 rounded-lg transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Enhanced Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-primary/10 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50 backdrop-blur-xl">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground bg-primary/10 px-3 py-1 rounded-full">
                      {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewAllResults}
                      className="text-xs h-7 px-3 bg-primary/5 hover:bg-primary/10 rounded-lg font-medium"
                    >
                      Voir tous
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {searchResults.slice(0, 5).map((article) => (
                      <div
                        key={article.articleId}
                        onClick={() => handleArticleSelect(article.articleId)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-all duration-200 border border-transparent hover:border-primary/10 group"
                      >
                        <div className="w-12 h-12 bg-muted/60 rounded-xl flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                          {article.imageLink && (
                            <img
                              src={article.imageLink}
                              alt={article.articleProductName}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                            {article.articleProductName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            <span className="font-mono bg-muted/60 px-2 py-1 rounded">
                              {article.articleNo}
                            </span>
                            <span className="mx-2">•</span>
                            {article.supplierName}
                          </p>
                        </div>
                        <div className="text-base font-bold text-primary">
                          29,99 TND
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-primary/10 rounded-2xl shadow-2xl p-6 text-center z-50 backdrop-blur-xl">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-muted/60 rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Aucun résultat trouvé</p>
                  <p className="text-xs text-muted-foreground">
                    Essayez avec une autre référence ou parcourez notre catalogue
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewAllResults}
                    className="mt-3 text-xs h-8 px-4 bg-primary/5 hover:bg-primary/10 rounded-lg font-medium"
                  >
                    Parcourir le catalogue
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Admin Link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all hover:bg-primary/10 hover:scale-105"
            >
              <span className="text-sm">Administration</span>
            </Button>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative h-11 w-11 rounded-xl transition-all hover:bg-primary/10 hover:scale-105 group"
            >
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {getTotalItems()}
                </span>
              )}
              <span className="sr-only">Panier</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-11 w-11 rounded-xl transition-all hover:bg-primary/10 hover:scale-105 group"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:scale-110" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:scale-110" />
              <span className="sr-only">Basculer le thème</span>
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-11 w-11 rounded-xl transition-all hover:bg-primary/10 hover:scale-105"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-6 pb-6 border-t border-primary/10">
            <div className="pt-6 space-y-6">
              <div className="text-center space-y-3">
                <h2 className="text-xl font-bold text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Ste Piéces Auto Renault
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Recherche professionnelle de pièces automobiles
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    router.push('/admin')
                    setMobileMenuOpen(false)
                  }}
                  className="w-full justify-center py-3 rounded-xl font-medium bg-muted/30 hover:bg-primary/10 transition-all"
                >
                  <span className="text-base">Administration</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
