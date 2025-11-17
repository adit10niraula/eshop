import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  createProduct, deleteProduct, fetchActivityBasedRecommendation, 
  fetchActivityBasedRecommendationML, 
  fetchAllBrands, fetchAllCategory, fetchAllProducts, fetchInteractionBasedRecommendation, fetchMonthelyProducts, 
  fetchProductById, fetchProductBySellerId, fetchProductRecommendation, 
  fetchProductsByFilter, searchProduct, updateProduct, updateProductRating 
} from "./productListApi";
import toast from "react-hot-toast";

const initialState = {
  products: [],
  sellerProducts: [],
  recommendations: [],
  activityRecommendations: [],
  activityRecommendationsML: [],
  interactionRecommendations: [],
  brands: [],
  categories: [],
  count: 1,
  status: "idle",
  labels: [], // Months to print in chart
  monthelyProducts: [],
  selectedProduct: null,
};

const mergeAndShuffleProducts = (existingProducts, recommendedProducts) => {

  console.log("existing", existingProducts)
  const productMap = new Map();

  // Add all existing products to the map
  existingProducts.forEach((product) => {
    productMap.set(product.id, product);
  });

  // Add recommended products with higher priority
  recommendedProducts.forEach((product) => {
    productMap.set(product._id, { ...product, isRecommended: true });
  });

  // Convert the map to an array and shuffle
  let allProducts = Array.from(productMap.values());

  // Separate recommended and non-recommended products
  const recommended = allProducts.filter(p => p.isRecommended);
  const nonRecommended = allProducts.filter(p => !p.isRecommended);




  // Shuffle both arrays
  recommended.sort(() => 0.5 - Math.random());
  nonRecommended.sort(() => 0.5 - Math.random());

  // Merge them with priority to recommended products (e.g., 70% recommended, 30% non-recommended)
  const finalProducts = [];
  const ratio = 0.7; // 70% recommended products
  
  const maxLength = Math.max(recommended.length, nonRecommended.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < recommended.length && Math.random() <= ratio) {
      finalProducts.push(recommended[i]);
    }
    if (i < nonRecommended.length && Math.random() > ratio) {
      finalProducts.push(nonRecommended[i]);
    }
  }

  return finalProducts;
};


export const fetchAllProductsAsync = createAsyncThunk(
  "products/fetchAllProducts",
  async () => {
    const response = await fetchAllProducts();
    return response.data;
  }
);

export const createProductAsync = createAsyncThunk(
  "products/createNewProduct",
  async (product) => {
    const response = await createProduct(product);
    toast.success("Product Added Successfully");
    return response.data;
  }
);

export const updateProductAsync = createAsyncThunk(
  "products/updateProduct",
  async (data) => {
    const response = await updateProduct(data);
    toast.success("Product Updated Successfully");
    return response.data;
  }
);

export const updateProductRatingAsync = createAsyncThunk(
  "products/updateProductRating",
  async (data) => {
    const response = await updateProductRating(data);
    return response.data.products;
  }
);

export const deleteProductAsync = createAsyncThunk(
  "products/deleteProduct",
  async (id) => {
    const response = await deleteProduct(id);
    return response.data.products;
  }
);

export const fetchProductByIdAsync = createAsyncThunk(
  "products/fetchProductById",
  async (id) => {
    const response = await fetchProductById(id);
    return response.data;
  }
);

export const fetchProductBySellerIdAsync = createAsyncThunk(
  "products/fetchProductBySellerId",
  async (id) => {
    const response = await fetchProductBySellerId(id);
    return response.data.products;
  }
);

export const fetchProductsByFilterAsync = createAsyncThunk(
  "products/fetchProductByFilter",
  async ({ filter, sort }) => {
    const response = await fetchProductsByFilter(filter, sort);
    return response.data.products;
  }
);

export const searchProductAsync = createAsyncThunk(
  'products/search',
  async (searchQuery) => {
    const response = await searchProduct(searchQuery);
    return response.data.products;
  }
);

export const fetchBrandsAsync = createAsyncThunk(
  "products/fetchBrands",
  async () => {
    const response = await fetchAllBrands();
    return response.data.brands;
  }
);

export const fetchCategoryAsync = createAsyncThunk(
  "products/fetchCategory",
  async () => {
    const response = await fetchAllCategory();
    return response.data.categories;
  }
);

export const fetchMonthelyProductsAync = createAsyncThunk(
  'products/fetchMonthelyProducts',
  async (id) => {
    const response = await fetchMonthelyProducts(id);
    return response.data;
  }
);

export const fetchProductRecommendationAsync = createAsyncThunk(
  'products/recommend',
  async (id) => {
    const response = await fetchProductRecommendation(id);
    return response.data.recommendation;
  }
);

export const fetchActivityBasedRecommendationAsync = createAsyncThunk(
  "products/activity-recommendation",
  async () => {
    const response = await fetchActivityBasedRecommendation();
    return response.data.result;
  }
);
export const fetchActivityBasedRecommendationMLAsync = createAsyncThunk(
  "products/activity-recommendation-ml",
  async () => {
    const response = await fetchActivityBasedRecommendationML();
    return response.data.result;
  }
);

export const fetchInteractionBasedRecommendationAsync = createAsyncThunk(
  "products/interaction-recommendation",
  async () => {
    const response = await fetchInteractionBasedRecommendation();
    console.log(response)
    return response.data.result;
  }
);

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    increament: (state) => {
      state.count + 1
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProductsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllProductsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.products = action.payload;
      })
      .addCase(createProductAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createProductAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.products.push(action.payload);
      })
      .addCase(updateProductAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.products = action.payload;
      })
      .addCase(updateProductRatingAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProductRatingAsync.fulfilled, (state, action) => {
        state.status = "idle";
      })
      .addCase(deleteProductAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.status = "idle";
      })
      .addCase(fetchProductByIdAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductByIdAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductBySellerIdAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductBySellerIdAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.sellerProducts = action.payload;
      })
      .addCase(fetchProductsByFilterAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchProductAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(searchProductAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.products = action.payload;
      })
      .addCase(fetchProductsByFilterAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.products = action.payload;
      })
      .addCase(fetchBrandsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBrandsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.brands = action.payload;
      })
      .addCase(fetchCategoryAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategoryAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.categories = action.payload;
      })
      .addCase(fetchMonthelyProductsAync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMonthelyProductsAync.fulfilled, (state, action) => {
        state.status = 'idle';
        state.monthelyProducts = action.payload.products;
        state.labels = action.payload.months;
      })
      .addCase(fetchProductRecommendationAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductRecommendationAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.recommendations = action.payload;
      })
      .addCase(fetchActivityBasedRecommendationAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchActivityBasedRecommendationAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.activityRecommendations = action.payload;
      })
      .addCase(fetchActivityBasedRecommendationMLAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchActivityBasedRecommendationMLAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.activityRecommendationsML = action.payload;
      })
      .addCase(fetchInteractionBasedRecommendationAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInteractionBasedRecommendationAsync.fulfilled, (state, action) => {
        state.status = "idle";
        console.log("--------->>",action.payload);
        state.interactionRecommendations = action.payload;
        // Merge the interaction recommendations with existing products, ensuring no duplicates
        state.products = mergeAndShuffleProducts(state.products, action.payload);
      });
  },
});

export const { increament } = productSlice.actions;

export const selectAllProducts = (state) => state.product.products;
export const selectAllBrands = (state) => state.product.brands;
export const selectAllCategories = (state) => state.product.categories;
export const selectProductRecommendation = (state) => state.product.recommendations;
export const selectProductById = (state) => state.product.selectedProduct;
export const sellerProducts = (state) => state.product.sellerProducts;
export const selectMonthelyProduct = (state) => state.product.monthelyProducts;
export const selectLabels = (state) => state.product.labels;
export const selectActivityBasedRecommendation = (state) => state.product.activityRecommendations;
export const selectActivityBasedRecommendationML = (state) => state.product.activityRecommendationsML;
export const selectInteractionRecommendations = (state) => state.product.interactionRecommendations;

export default productSlice.reducer;
