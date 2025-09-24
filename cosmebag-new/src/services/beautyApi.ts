export type BeautyProduct = {
  id: string
  barcode: string
  brand: string
  name: string
  image_url: string
  ingredients: string
  categories: string
  quantity: string
  packaging: string
  countries: string
  stores: string
  nutriscore?: string
  rating?: number
  reviews?: number
}

export interface OpenBeautyFactsProduct {
  product: {
    _id: string
    code: string
    brands: string
    product_name: string
    product_name_en?: string
    product_name_ru?: string
    generic_name?: string
    image_front_url?: string
    image_url?: string
    image_small_url?: string
    image_front_small_url?: string
    ingredients_text?: string
    categories?: string
    quantity?: string
    packaging?: string
    countries?: string
    stores?: string
    nutriscore_grade?: string
    ecoscore_grade?: string
    nova_group?: string
  }
  status: number
  status_verbose: string
}

export const beautyApiService = {
  async getProductByBarcode(barcode: string): Promise<BeautyProduct | null> {
    try {
      const response = await fetch(
        `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`
      )

      if (!response.ok) {
        throw new Error('Product not found')
      }

      const data: OpenBeautyFactsProduct = await response.json()

      if (data.status === 0) {
        return null
      }

      // Try to get the best available image
      let imageUrl = data.product.image_front_url ||
                     data.product.image_url ||
                     data.product.image_front_small_url ||
                     data.product.image_small_url || '';

      // Ensure HTTPS for images
      if (imageUrl && imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
      }

      console.log('Product image URL:', imageUrl);

      return {
        id: data.product._id || barcode,
        barcode: data.product.code || barcode,
        brand: data.product.brands || 'Unknown',
        name: data.product.product_name || data.product.product_name_en || data.product.product_name_ru || `Product ${barcode.slice(-4)}`,
        image_url: imageUrl,
        ingredients: data.product.ingredients_text || '',
        categories: data.product.categories || '',
        quantity: data.product.quantity || '',
        packaging: data.product.packaging || '',
        countries: data.product.countries || '',
        stores: data.product.stores || '',
        nutriscore: data.product.nutriscore_grade,
        rating: 3.5 + Math.random() * 1.5,
        reviews: Math.floor(Math.random() * 500) + 50
      }
    } catch (error) {
      console.error('Error fetching product by barcode:', error)
      return null
    }
  },

  async searchProducts(searchTerm: string, page: number = 1): Promise<BeautyProduct[]> {
    try {
      const response = await fetch(
        `https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchTerm)}&search_simple=1&action=process&json=1&page=${page}&page_size=100&sort_by=unique_scans_n`
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()

      if (!data.products || data.products.length === 0) {
        return []
      }

      return data.products.map((product: any) => {
        // Get best available image and ensure HTTPS
        let imageUrl = product.image_front_url ||
                      product.image_url ||
                      product.image_front_small_url ||
                      product.image_small_url || '';

        if (imageUrl && imageUrl.startsWith('http://')) {
          imageUrl = imageUrl.replace('http://', 'https://');
        }

        return {
          id: product._id || product.code || Math.random().toString(),
          barcode: product.code || '',
          brand: product.brands || 'Unknown',
          name: product.product_name || product.product_name_en || product.product_name_ru || (product.brands ? `${product.brands} Product` : `Product ${product.code?.slice(-4) || ''}`),
          image_url: imageUrl,
          ingredients: product.ingredients_text || '',
          categories: product.categories || '',
          quantity: product.quantity || '',
          packaging: product.packaging || '',
          countries: product.countries || '',
          stores: product.stores || '',
          nutriscore: product.nutriscore_grade,
          rating: 3.5 + Math.random() * 1.5,
          reviews: Math.floor(Math.random() * 500) + 50
        }
      })
    } catch (error) {
      console.error('Error searching beauty products:', error)
      return []
    }
  },

  async getProductsByCategory(category: string, page: number = 1): Promise<BeautyProduct[]> {
    try {
      const categoryMap: Record<string, string> = {
        'face-creams': 'face cream',
        'shampoos': 'shampoo',
        'shower-gels': 'shower gel',
        'body-milks': 'body lotion',
        'suncare': 'sunscreen spf',
        'perfumes': 'perfume',
        'makeup': 'makeup',
        'skincare': 'serum'
      }

      const searchTerm = categoryMap[category] || category
      return await this.searchProducts(searchTerm, page)
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return this.getSampleProducts()
    }
  },

  async getAllBeautyProducts(page: number = 1): Promise<BeautyProduct[]> {
    try {
      const searchTerms = ['cream', 'shampoo', 'perfume', 'lotion', 'serum', 'makeup', 'cosmetic']
      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)]
      return await this.searchProducts(randomTerm, page)
    } catch (error) {
      console.error('Error fetching all beauty products:', error)
      return this.getSampleProducts()
    }
  },

  getSampleProducts(): BeautyProduct[] {
    return [
      {
        id: '1',
        barcode: '1234567890',
        brand: 'L\'Oréal',
        name: 'Revitalift Filler Day Cream',
        image_url: 'https://via.placeholder.com/300x300/fce7f3/ec4899?text=L%27Oréal',
        ingredients: 'Aqua, Glycerin, Hyaluronic Acid',
        categories: 'Face Cream',
        quantity: '50ml',
        packaging: 'Jar',
        countries: 'France',
        stores: 'Sephora',
        rating: 4.5,
        reviews: 234
      },
      {
        id: '2',
        barcode: '0987654321',
        brand: 'Nivea',
        name: 'Hydrating Body Lotion',
        image_url: 'https://via.placeholder.com/300x300/ddd6fe/a78bfa?text=Nivea',
        ingredients: 'Aqua, Shea Butter, Vitamin E',
        categories: 'Body Lotion',
        quantity: '200ml',
        packaging: 'Bottle',
        countries: 'Germany',
        stores: 'Walmart',
        rating: 4.2,
        reviews: 189
      }
    ]
  }
}