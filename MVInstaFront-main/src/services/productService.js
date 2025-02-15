import axios from "axios";
import Cookies from "js-cookie";

// Function to retrieve the organizationId from local storage
const getOrganizationId = () => {
  // const organizationId = sessionStorage.getItem("organizationId");
  const organizationId = Cookies.get('organizationId');
  if (!organizationId) {
    throw new Error("Organization ID not found in local storage");
  }
  return organizationId;
};

// Function to retrieve the token from local storage
const getToken = () => {
  // const token = sessionStorage.getItem("token");
  const token = Cookies.get('token');
  if (!token) {
    throw new Error("Token not found in local storage");
  }
  return token;
};

export const getProductDetails = async () => {
  try {
    const organizationId = getOrganizationId();
    const token = getToken();
    const response = await axios.get(
      `${process.env.REACT_APP_PRODUCT_BASE_URL}/products/all?organizationId=${organizationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.products.map((product) => ({
      id: product.productId,
      name: product.productName,
      price: product.price,
      buying_link: product.buyingLink,
      payment_link: product.paymentLink,
      shipping_policy: product.shippingPolicy,
      return_policy: product.returnPolicy,
      description: product.productDescription,
      imageUrl: product.imageUrl,
      createdDate: product.createdAt,
      modifiedDate: product.updatedAt
    }));
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw new Error("Failed to fetch product details");
  }
};

export const addProduct = async (productData) => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.post(
    `${process.env.REACT_APP_PRODUCT_BASE_URL}/products/add`,
    { ...productData, organizationId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const updateProduct = async (productData) => {
  try {
    const organizationId = getOrganizationId();
    const token = getToken();
    const response = await axios.patch(
      `${process.env.REACT_APP_PRODUCT_BASE_URL}/products/update`,
      { ...productData, organizationId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product");
  }
};

export const deleteProduct = async (productId) => {
  const organizationId = getOrganizationId();
  const token = getToken();
  const response = await axios.delete(
    `${process.env.REACT_APP_PRODUCT_BASE_URL}/products/delete`,
    {
      data: { organizationId, productId },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const saveTagMedia = async (data) => {
  try {
    const { organizationId, tagRequests } = data;
    const token = getToken();

    const response = await axios.post(
      `${process.env.REACT_APP_PRODUCT_BASE_URL}/products/tag-product`,
      { organizationId, tagRequests },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving tag media:", error);
    throw new Error("Failed to save tag media");
  }
};

export const unTagMedia = async (data) => {
  try {
    const { organizationId, postId } = data;
    const token = getToken();

    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/users/${organizationId}/posts/${postId}/untag-product`,
      { organizationId, postId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving tag media:", error);
    throw new Error("Failed to save tag media");
  }
};

export const getProductName = async (productId) => {
  try {
    // const organizationId = sessionStorage.getItem("organizationId");
    // const token = sessionStorage.getItem("token");
    const organizationId = Cookies.get('organizationId');
    const token = Cookies.get('token');
    const response = await axios.post(
      `${process.env.REACT_APP_PRODUCT_BASE_URL}/products/product-name`,
      { organizationId, productId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch product name");
  }
};

export const mediaCount = async (productId) => {
  try {
    // const organizationId = sessionStorage.getItem("organizationId");
    // const token = sessionStorage.getItem("token");
    const organizationId = Cookies.get('organizationId');
    const token = Cookies.get('token');
    const response = await axios.post(
      `${process.env.REACT_APP_PRODUCT_BASE_URL}/products/media-count`,
      { organizationId, productId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch product name");
  }
};

export const getProductTaggedMedia = async (productId, filterParams) => {
  try {
    const organizationId = getOrganizationId();
    const token = getToken();
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/users/${organizationId}/product/${productId}/posts`,
      {
        params: {
          filter: filterParams
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw new Error("Failed to fetch product details");
  }
};

// export const getProductUntaggedMedia = async () => {
//   try {
//     const organizationId = getOrganizationId();
//     const token = getToken();
//     const response = await axios.get(
//       `${process.env.REACT_APP_PRODUCT_BASE_URL}/products/all?organizationId=${organizationId}`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return response.data.products.map((product) => ({
//       id: product.productId,
//       name: product.productName,
//       price: product.price,
//       buying_link: product.buyingLink,
//       payment_link: product.paymentLink,
//       shipping_policy: product.shippingPolicy,
//       return_policy: product.returnPolicy,
//       description: product.productDescription,
//       imageUrl: product.imageUrl,
//     }));
//   } catch (error) {
//     console.error("Error fetching product details:", error);
//     throw new Error("Failed to fetch product details");
//   }
// };
