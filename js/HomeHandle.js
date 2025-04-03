document.addEventListener("DOMContentLoaded", () => {
  const bestSellingList = document.getElementById("bestSellingList");
  const newestList = document.getElementById("newestList");
  const bestSellingButtons = document.querySelectorAll(
    ".best-selling-categories .category-btn"
  );
  const newestButtons = document.querySelectorAll(
    ".newest-categories .category-btn"
  );

  let bestSellingCategory = 1;
  let newestCategory = 1;

  // Khởi tạo giỏ hàng nếu chưa có
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]));
  }

  fetchProducts(bestSellingCategory, bestSellingList, 0);
  fetchProducts(newestCategory, newestList, 3);

  // Xử lý sự kiện chọn danh mục
  bestSellingButtons.forEach((button) => {
    button.addEventListener("click", function () {
      bestSellingButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      bestSellingCategory = this.getAttribute("data-category");
      fetchProducts(bestSellingCategory, bestSellingList, 0);
    });
  });

  newestButtons.forEach((button) => {
    button.addEventListener("click", function () {
      newestButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      newestCategory = this.getAttribute("data-category");
      fetchProducts(newestCategory, newestList, 3);
    });
  });

  // Hàm fetch API
  function fetchProducts(categoryId, targetList, startIndex) {
    fetch("https://localhost:7206/api/Products")
      .then((response) => response.json())
      .then((data) => {
        const filteredProducts = data.filter(
          (product) => product.categoryId == categoryId
        );
        const selectedProducts = filteredProducts.slice(
          startIndex,
          startIndex + 3
        );
        renderProducts(selectedProducts, targetList);
      })
      .catch((error) => console.error("Lỗi khi fetch API:", error));
  }

  // Hàm render sản phẩm (đã cập nhật)
  function renderProducts(products, targetList) {
    targetList.innerHTML = products
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
    targetList.querySelectorAll(".product").forEach((product) => {
      product.addEventListener("click", function (e) {
        if (!e.target.closest(".product-actions")) {
          const productId = this.dataset.id;
          window.location.href = `Detail.html?id=${productId}`;
        }
      });
    });

    // Thêm sự kiện cho nút "Thêm vào giỏ hàng"
    targetList.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const productId = this.getAttribute("data-id");
        addToCart(productId);
      });
    });
  }

  // Hàm thêm vào giỏ hàng (tích hợp với Cart.js)
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

  // Cập nhật số lượng giỏ hàng (tương thích với Cart.js)
  function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCounter = document.querySelector(".cart-counter");
    if (cartCounter) {
      cartCounter.textContent = totalItems;
    }
  }

  // Cập nhật counter ngay khi tải trang
  updateCartCounter();
});
