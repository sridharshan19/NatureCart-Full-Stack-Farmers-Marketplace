import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import { createFarmerByAdmin, getFarmers } from "../services/authService";
import {
  createProduct,
  deleteManagedProduct,
  getManagedProducts,
  updateManagedProduct,
} from "../services/productService";
import { getFarmerOrders } from "../services/orderService";
import {
  formatCurrency,
  getErrorMessage,
  getStoredUser,
  validateRequiredFields,
} from "../utils/helpers";

const emptyFarmerForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  farmName: "",
  location: "",
};

const emptyProductForm = {
  productName: "",
  category: "",
  price: "",
  quantity: "",
  image: null,
  farmerId: "",
};

export default function Dashboard() {
  const user = getStoredUser();
  const isAdmin = user?.role === "admin";
  const isFarmer = user?.role === "farmer";
  const isConsumer = user?.role === "consumer";

  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmerForm, setFarmerForm] = useState(emptyFarmerForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState("");
  const { showError, showInfo, showSuccess } = useToast();

  const loadDashboard = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (isAdmin) {
        const [farmerData, productData, orderData] = await Promise.all([
          getFarmers(),
          getManagedProducts(),
          getFarmerOrders(),
        ]);
        setFarmers(Array.isArray(farmerData) ? farmerData : []);
        setProducts(productData);
        setOrders(orderData);
      } else if (isFarmer) {
        const [productData, orderData] = await Promise.all([
          getManagedProducts(),
          getFarmerOrders(),
        ]);
        setFarmers([]);
        setProducts(productData);
        setOrders(orderData);
      } else {
        setFarmers([]);
        setProducts([]);
        setOrders([]);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [isAdmin, isFarmer, user?.role]);

  const orderSummary = useMemo(() => {
    return orders.reduce(
      (accumulator, order) => {
        accumulator.total += 1;
        accumulator[order.status] += 1;
        return accumulator;
      },
      { total: 0, pending: 0, confirmed: 0, completed: 0 }
    );
  }, [orders]);

  const handleFarmerSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateRequiredFields([
      { label: "Farmer name", value: farmerForm.name },
      { label: "Farmer email", value: farmerForm.email },
      { label: "Farmer password", value: farmerForm.password },
      { label: "Phone", value: farmerForm.phone },
      { label: "Farm name", value: farmerForm.farmName },
      { label: "Location", value: farmerForm.location },
    ]);

    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    try {
      await createFarmerByAdmin(farmerForm);
      showSuccess("New farmer account created successfully.");
      setFarmerForm(emptyFarmerForm);
      await loadDashboard();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateRequiredFields(
      isAdmin
        ? [
            { label: "Farmer", value: productForm.farmerId },
            { label: "Product name", value: productForm.productName },
            { label: "Category", value: productForm.category },
            { label: "Price", value: productForm.price },
            { label: "Quantity", value: productForm.quantity },
            { label: "Product image", value: productForm.image },
          ]
        : [
            { label: "Product name", value: productForm.productName },
            { label: "Category", value: productForm.category },
            { label: "Price", value: productForm.price },
            { label: "Quantity", value: productForm.quantity },
            { label: "Product image", value: productForm.image },
          ]
    );

    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        quantity: Number(productForm.quantity),
      };

      if (!isAdmin) {
        delete payload.farmerId;
      }

      if (editingProductId) {
        const updatedProduct = await updateManagedProduct(editingProductId, payload);
        showSuccess(
          `${updatedProduct.productName} stock details were updated in MongoDB successfully.`
        );
      } else {
        const createdProduct = await createProduct(payload);
        showSuccess(`${createdProduct.productName} was created successfully.`);
      }

      setProductForm((current) => ({
        ...emptyProductForm,
        farmerId: isAdmin ? current.farmerId : "",
      }));
      setEditingProductId("");
      await loadDashboard();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteManagedProduct(productId);
      showSuccess("Product deleted successfully.");
      await loadDashboard();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      productName: product.productName || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      quantity: String(product.quantity ?? ""),
      image: null,
      farmerId:
        typeof product.farmerId === "object" ? product.farmerId?._id || "" : product.farmerId || "",
    });
    showInfo(`Editing ${product.productName}. Update the fields and save to sync the new stock details.`);
  };

  const handleCancelEdit = () => {
    setEditingProductId("");
    setProductForm(emptyProductForm);
  };

  if (!user) {
    return (
      <div className="rounded-[2rem] bg-white/85 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold text-slate-900">Welcome to NatureCart</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Login to open your role dashboard. Admin can create farmers and manage
          products and orders, farmers can manage their catalog, and consumers can
          shop and checkout.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/login"
            className="rounded-full bg-[#0f766e] px-5 py-3 font-semibold text-white"
          >
            Login
          </Link>
          <Link
            to="/products"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-hero p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-200">
          {user.role} workspace
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          {isConsumer
            ? "Shop fresh produce and track every order from one place."
            : "Control produce, farmers, and order flow from one place."}
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-teal-50/90">
          {isConsumer
            ? "Consumers can browse available products, place pickup orders, and monitor order status without seeing product management tools."
            : "This dashboard is aligned with the current backend routes. Admin can add new farmers, add or delete products, and review order activity. Farmers can manage their own inventory and track order progress."}
        </p>
      </section>

      {loading ? <Loader label="Loading dashboard..." /> : null}

      {!loading && isConsumer ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">Browse</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Available Products</p>
              <p className="mt-2 text-sm text-slate-600">
                Explore fresh produce added by verified farmers.
              </p>
              <Link
                to="/products"
                className="mt-4 inline-block rounded-full bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white"
              >
                View Products
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">Cart</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Ready to Order</p>
              <p className="mt-2 text-sm text-slate-600">
                Review selected items before placing your pickup order.
              </p>
              <Link
                to="/cart"
                className="mt-4 inline-block rounded-full bg-[#b45309] px-4 py-2 text-sm font-semibold text-white"
              >
                Open Cart
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">Track</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Order Status</p>
              <p className="mt-2 text-sm text-slate-600">
                Follow pending, confirmed, and completed pickup updates.
              </p>
              <Link
                to="/orders"
                className="mt-4 inline-block rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800"
              >
                Track Orders
              </Link>
            </div>
          </section>

          <section className="rounded-[1.75rem] bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
              Consumer access
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Product management is restricted
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              Only farmer and admin accounts can add or delete products. Consumer
              accounts can browse products, place orders, and track order status.
            </p>
          </section>
        </>
      ) : null}

      {!loading && !isConsumer ? (
        <>
          <section
            className={`grid gap-4 ${
              isFarmer ? "md:grid-cols-3 xl:grid-cols-5" : "md:grid-cols-4"
            }`}
          >
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">Orders</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{orderSummary.total}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">Pending</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{orderSummary.pending}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">Confirmed</p>
              <p className="mt-2 text-3xl font-bold text-sky-600">{orderSummary.confirmed}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{orderSummary.completed}</p>
            </div>
            {isFarmer ? (
              <>
                <div className="rounded-2xl bg-white p-5 shadow">
                  <p className="text-sm text-slate-500">Workspace</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">Farmer tools</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Manage orders, inventory, and live products from this workspace.
                  </p>
                </div>
              </>
            ) : null}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
            {isAdmin ? (
              <div className="rounded-[1.75rem] bg-white p-6 shadow-xl">
                <div className="mb-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">
                    Admin control
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Add a new farmer
                  </h2>
                </div>

                <form onSubmit={handleFarmerSubmit} className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Name"
                    value={farmerForm.name}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={farmerForm.email}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={farmerForm.password}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, password: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Phone"
                    value={farmerForm.phone}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Farm Name"
                    value={farmerForm.farmName}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, farmName: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Location"
                    value={farmerForm.location}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, location: event.target.value }))
                    }
                  />
                  <Button className="md:col-span-2 bg-[#0f766e]" type="submit">
                    Create Farmer
                  </Button>
                </form>
              </div>
            ) : null}

            <div className="surface-panel p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
                    Inventory
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {editingProductId
                      ? "Update stock details"
                      : isAdmin
                        ? "Add product for any farmer"
                        : "Add your next product"}
                  </h2>
                </div>
                <Link
                  to="/orders"
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Review Orders
                </Link>
              </div>

              <form onSubmit={handleProductSubmit} className="grid gap-3 md:grid-cols-2">
                {isAdmin ? (
                  <select
                    value={productForm.farmerId}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, farmerId: event.target.value }))
                    }
                    className="select-field"
                    required
                  >
                    <option value="">Select farmer</option>
                    {farmers.map((farmer) => (
                      <option key={farmer._id} value={farmer._id}>
                        {farmer.farmName || farmer.name}
                      </option>
                    ))}
                  </select>
                ) : null}

                <Input
                  placeholder="Product name"
                  value={productForm.productName}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      productName: event.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Category"
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({ ...current, category: event.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm((current) => ({ ...current, price: event.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={productForm.quantity}
                  onChange={(event) =>
                    setProductForm((current) => ({ ...current, quantity: event.target.value }))
                  }
                />
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Product image file
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    required={!editingProductId}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        image: event.target.files?.[0] || null,
                      }))
                    }
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Upload a JPG, PNG, or other image file up to 5 MB.
                  </p>
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <Button className="bg-[#b45309]" type="submit">
                    {editingProductId ? "Update Product" : "Save Product"}
                  </Button>
                  {editingProductId ? (
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-slate-200 text-slate-800 hover:bg-slate-300"
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </form>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-panel p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                    Product manager
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Delete or review live products
                  </h2>
                </div>
                <Button onClick={loadDashboard}>Refresh</Button>
              </div>

              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className={`flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between ${
                      editingProductId === product._id
                        ? "border-violet-300 bg-violet-50 ring-2 ring-violet-200"
                        : "border-slate-100"
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{product.productName}</h3>
                      <p className="text-sm text-slate-500">
                        {product.category} | {formatCurrency(product.price)} | stock {product.quantity}
                      </p>
                      {product.farmerId ? (
                        <p className="text-xs uppercase tracking-wide text-teal-600">
                          {product.farmerId.farmName || product.farmerId.name}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleEditProduct(product)}
                        className={`${
                          editingProductId === product._id
                            ? "bg-violet-700 hover:bg-violet-800"
                            : "bg-violet-600 hover:bg-violet-700"
                        }`}
                      >
                        {editingProductId === product._id ? "Editing" : "Edit"}
                      </Button>
                      <Button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="bg-rose-600 hover:bg-rose-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}

                {!products.length ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    No managed products found.
                  </p>
                ) : null}
              </div>
            </div>

            {isAdmin ? (
              <div className="surface-panel p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Farmers
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Active farmer accounts
                </h2>
                <div className="mt-5 space-y-3">
                  {farmers.map((farmer) => (
                    <div key={farmer._id} className="rounded-2xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">
                        {farmer.farmName || farmer.name}
                      </p>
                      <p className="text-sm text-slate-500">{farmer.email}</p>
                      <p className="text-xs uppercase tracking-wide text-amber-600">
                        {farmer.location || "Location pending"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
