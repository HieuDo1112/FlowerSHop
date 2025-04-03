document.addEventListener("DOMContentLoaded", () => {
  const productList = document.querySelector(".product-list");
  const categoryButtons = document.querySelectorAll(".category-btn");
  const paginationContainer = document.querySelector(".pagination");

  let currentCategory = 1;
  let currentPage = 1;
  const itemsPerPage = 6;
  let allProducts = [];

  // Khởi tạo giỏ hàng nếu chưa có
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]));
  }

  fetchProducts(currentCategory);
  updateCartCounter(); // Cập nhật số lượng giỏ hàng ngay khi tải trang

  // Xử lý sự kiện khi chọn danh mục
  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      currentCategory = this.getAttribute("data-category");
      currentPage = 1;
      fetchProducts(currentCategory);
    });
  });

  // Hàm fetch API
  function fetchProducts(categoryId) {
    fetch("https://localhost:7206/api/Products")
      .then((response) => response.json())
      .then((data) => {
        allProducts = data.filter(
          (product) => product.categoryId == categoryId
        );
        renderProducts();
        renderPagination();
      })
      .catch((error) => console.error("Lỗi khi fetch API:", error));
  }

  // Hàm render danh sách sản phẩm
  function renderProducts() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const visibleProducts = allProducts.slice(startIndex, endIndex);

    productList.innerHTML = visibleProducts
      .map(
        (product) => `
      <div class="product" data-id="${product.id}">
          <img src="https://localhost:7206${product.image}" alt="${
          product.name
        }" />
          <h3>${product.name}</h3>
          <p class="price">${product.price.toLocaleString("vi-VN")}đ</p>
          <div class="product-actions">
              <button class="add-to-cart" data-id="${
                product.id
              }">Thêm vào giỏ hàng</button>
          </div>
      </div>
    `
      )
      .join("");

    // Thêm sự kiện click vào sản phẩm
    addProductClickEvents();

    // Thêm sự kiện cho nút "Thêm vào giỏ hàng"
    addToCartEventListeners();
  }

  // Hàm thêm sự kiện click vào sản phẩm
  function addProductClickEvents() {
    document.querySelectorAll(".product").forEach((product) => {
      product.addEventListener("click", function (e) {
        if (!e.target.closest(".product-actions")) {
          const productId = this.dataset.id;
          window.location.href = `Detail.html?id=${productId}`;
        }
      });
    });
  }

  // Hàm thêm sự kiện cho nút "Thêm vào giỏ hàng"
  function addToCartEventListeners() {
    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const productId = this.getAttribute("data-id");
        addToCart(productId);
      });
    });
  }

  // Hàm thêm vào giỏ hàng
  function addToCart(productId) {
    fetch(`https://localhost:7206/api/Products/${productId}`)
      .then((response) => response.json())
      .then((product) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const existingItem = cart.find((item) => item.id == productId);

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
        showAddToCartEffect(productId);
        updateCartCounter();
      })
      .catch((error) => console.error("Lỗi khi thêm vào giỏ hàng:", error));
  }

  // Hiệu ứng khi thêm vào giỏ hàng
  function showAddToCartEffect(productId) {
    const button = document.querySelector(
      `.add-to-cart[data-id="${productId}"]`
    );
    if (button) {
      button.textContent = "✓ Đã thêm";
      button.style.backgroundColor = "#4CAF50";
      button.style.color = "#fff";

      setTimeout(() => {
        button.textContent = "Thêm vào giỏ hàng";
        button.style.backgroundColor = "";
      }, 2000);
    }
  }

  // Cập nhật số lượng giỏ hàng trên header
  function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCounter = document.querySelector(".cart-counter");
    if (cartCounter) {
      cartCounter.textContent = totalItems;
    }
  }

  // Hàm render pagination
  function renderPagination() {
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    if (currentPage > 1) {
      paginationContainer.innerHTML += `<a href="#" class="page-link prev">←</a>`;
    }

    for (let i = 1; i <= totalPages; i++) {
      const isCurrent = i === currentPage;
      paginationContainer.innerHTML += `
        <a href="#" class="page-link ${
          isCurrent ? "current" : ""
        }" data-page="${i}">
          ${i}
        </a>
      `;
    }

    if (currentPage < totalPages) {
      paginationContainer.innerHTML += `<a href="#" class="page-link next">→</a>`;
    }

    addPaginationEventListeners();
  }

  // Hàm xử lý sự kiện chuyển trang
  function addPaginationEventListeners() {
    paginationContainer.querySelectorAll(".page-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        if (link.classList.contains("prev")) {
          currentPage--;
        } else if (link.classList.contains("next")) {
          currentPage++;
        } else {
          currentPage = parseInt(link.getAttribute("data-page"));
        }
        renderProducts();
        renderPagination();
      });
    });
  }
});
