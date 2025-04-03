document.addEventListener("DOMContentLoaded", async () => {
  // Lấy productId từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    window.location.href = "404.html";
    return;
  }

  try {
    // Fetch chi tiết sản phẩm
    const response = await fetch(
      `https://localhost:7206/api/Products/${productId}`
    );
    if (!response.ok) throw new Error("Product not found");

    const product = await response.json();

    // Cập nhật breadcrumb
    updateBreadcrumb(product);

    // Cập nhật gallery ảnh
    updateProductGallery(product);

    // Cập nhật thông tin sản phẩm
    updateProductInfo(product);

    // Load sản phẩm liên quan
    await fetchRelatedProducts(product.categoryId, product.id);

    // Thêm sự kiện cho nút "Thêm vào giỏ hàng"
    const addToCartBtn = document.querySelector(".add-to-cart");
    addToCartBtn.addEventListener("click", function (e) {
      e.preventDefault();
      addToCart(product);
    });

    // Cập nhật số lượng giỏ hàng ngay khi tải trang
    updateCartCounter();
  } catch (error) {
    console.error("Error:", error);
    window.location.href = "404.html";
  }
});

// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Kiểm tra sản phẩm đã có trong giỏ chưa
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  // Lưu vào localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Hiệu ứng và thông báo
  showAddToCartEffect();
  updateCartCounter();
}

// Hiệu ứng khi thêm vào giỏ hàng
function showAddToCartEffect() {
  const button = document.querySelector(".add-to-cart");
  button.textContent = "✓ Đã thêm";
  button.style.backgroundColor = "#4CAF50";
  button.style.color = "#fff";
  button.disabled = true;

  setTimeout(() => {
    button.textContent = "Thêm vào giỏ hàng";
    button.style.backgroundColor = "";
    button.style.color = "";
    button.disabled = false;
  }, 2000);
}

// Cập nhật số lượng trên icon giỏ hàng
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const cartCounter = document.querySelector(".cart-counter");
  if (cartCounter) {
    cartCounter.textContent = totalItems;
  }
}

// Hàm cập nhật breadcrumb
function updateBreadcrumb(product) {
  const breadcrumb = document.querySelector(".breadcrumb");
  breadcrumb.innerHTML = `
      <li><a href="Home.html">Trang chủ</a></li>
      <li><a href="Product.html">Sản phẩm</a></li>
      <li>${product.name}</li>
    `;
}

// Hàm cập nhật gallery ảnh
function updateProductGallery(product) {
  const gallery = document.querySelector(".product-gallery");
  gallery.innerHTML = `
      <img src="https://localhost:7206${product.image}" 
           alt="${product.name}" 
           class="main-image" />
      <div class="thumbnail-container">
        <img src="https://localhost:7206${product.image}" 
             alt="Thumbnail" 
             class="thumbnail active" />
        <!-- Có thể thêm nhiều thumbnail khác nếu có -->
      </div>
    `;
}

// Hàm cập nhật thông tin sản phẩm
function updateProductInfo(product) {
  document.querySelector(".product-title").textContent = product.name;
  document.querySelector(
    ".product-price"
  ).textContent = `${product.price.toLocaleString("vi-VN")}đ`;

  const shortDesc = document.querySelector(".product-short-description p");
  shortDesc.textContent = product.shortDescription;

  // Thêm mô tả đầy đủ nếu có phần đó trong HTML
  const fullDesc = document.querySelector(".product-full-description");
  if (fullDesc) {
    fullDesc.innerHTML = `<p>${product.description}</p>`;
  }

  // Cập nhật các thông tin khác liên quan
  const categoryInfo = document.querySelector(".product-category");
  if (categoryInfo) {
    categoryInfo.textContent = `Danh mục: ${product.category.name}`;
  }

  const descriptionAuthor = document.querySelector(".description-author");
  const descriptionContent = document.querySelector(".description-content p");

  if (descriptionAuthor) {
    descriptionAuthor.textContent = `❤️ ${product.name} ❤️`;
  }

  if (descriptionContent) {
    descriptionContent.textContent = product.description;
  }
}

// Hàm fetch sản phẩm liên quan
async function fetchRelatedProducts(categoryId, currentProductId) {
  try {
    const response = await fetch(
      `https://localhost:7206/api/Products?categoryId=${categoryId}`
    );
    const products = await response.json();

    // Lọc bỏ sản phẩm hiện tại và lấy tối đa 4 sản phẩm
    const relatedProducts = products
      .filter((p) => p.id != currentProductId)
      .slice(0, 4);

    renderRelatedProducts(relatedProducts);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm liên quan:", error);
    document.querySelector(".products-grid").innerHTML =
      '<p class="no-products">Hiện chưa có sản phẩm liên quan</p>';
  }
}

// Hàm render sản phẩm liên quan
function renderRelatedProducts(products) {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return;

  if (products.length === 0) {
    productsGrid.innerHTML =
      '<p class="no-products">Hiện chưa có sản phẩm liên quan</p>';
    return;
  }

  productsGrid.innerHTML = products
    .map(
      (product) => `
      <a href="Detail.html?id=${product.id}" class="product-card">
        <img src="https://localhost:7206${product.image}" 
             alt="${product.name}" 
             class="product-card-image" />
        <div class="product-card-info">
          <h3 class="product-card-title">${product.name}</h3>
          <div class="product-card-price">${product.price.toLocaleString(
            "vi-VN"
          )}đ</div>
        </div>
      </a>
    `
    )
    .join("");
}
