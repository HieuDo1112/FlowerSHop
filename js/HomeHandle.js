document.addEventListener("DOMContentLoaded", () => {
  // Các biến chính
  const bestSellingList = document.getElementById("bestSellingList");
  const newestList = document.getElementById("newestList");
  const bestSellingButtons = document.querySelectorAll(
    ".best-selling-categories .category-btn"
  );
  const newestButtons = document.querySelectorAll(
    ".newest-categories .category-btn"
  );
  const searchBtn = document.querySelector(".search-btn");
  const searchInput = document.querySelector(".search-input");
  const searchResultsSection = document.querySelector(
    ".search-results-section"
  );
  const searchResultsContainer = document.getElementById("searchResults");
  const searchKeywordElement = document.getElementById("search-keyword");

  // Danh sách section cần ẩn khi tìm kiếm
  const sectionsToHide = [
    ".banner",
    ".categories",
    ".best-selling-container",
    ".newest-container",
    ".testimonials",
    ".facebook-section",
  ];

  let bestSellingCategory = 1;
  let newestCategory = 1;

  // Khởi tạo giỏ hàng
  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]));
  }

  // Load sản phẩm ban đầu
  fetchProducts(bestSellingCategory, bestSellingList, 0);
  fetchProducts(newestCategory, newestList, 3);

  // Xử lý sự kiện danh mục (giữ nguyên)
  bestSellingButtons.forEach((button) => {
    button.addEventListener(
      "click",
      handleCategoryClick.bind(null, "bestSelling")
    );
  });

  newestButtons.forEach((button) => {
    button.addEventListener("click", handleCategoryClick.bind(null, "newest"));
  });

  // Xử lý tìm kiếm
  searchBtn.addEventListener("click", toggleSearchInput);
  searchInput.addEventListener("keypress", handleSearch);

  // Hàm xử lý click danh mục
  function handleCategoryClick(type, e) {
    const buttons = type === "bestSelling" ? bestSellingButtons : newestButtons;
    buttons.forEach((btn) => btn.classList.remove("active"));
    e.currentTarget.classList.add("active");

    if (type === "bestSelling") {
      bestSellingCategory = e.currentTarget.getAttribute("data-category");
      fetchProducts(bestSellingCategory, bestSellingList, 0);
    } else {
      newestCategory = e.currentTarget.getAttribute("data-category");
      fetchProducts(newestCategory, newestList, 3);
    }
  }

  // Hàm toggle search input
  function toggleSearchInput(e) {
    e.stopPropagation();
    searchInput.classList.toggle("show");
    if (searchInput.classList.contains("show")) {
      searchInput.focus();
    }
  }

  // Hàm xử lý tìm kiếm
  function handleSearch(e) {
    if (e.key === "Enter") {
      const keyword = searchInput.value.trim();
      if (keyword.length > 0) {
        searchProducts(keyword);
      }
    }
  }

  // Hàm tìm kiếm sản phẩm
  function searchProducts(keyword) {
    // Hiển thị loading
    searchResultsContainer.innerHTML = createLoadingIndicator(keyword);
    searchResultsSection.style.display = "block";
    searchKeywordElement.textContent = keyword;

    // Ẩn các section khác
    hideAllSections();

    // Cuộn lên đầu trang
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Lấy tất cả sản phẩm và tìm kiếm phía client
    fetch("https://localhost:7206/api/Products")
      .then((response) => response.json())
      .then((products) => {
        // Chuyển từ khóa sang chữ thường để so sánh không phân biệt hoa thường
        const keywordLower = keyword.toLowerCase();

        // Lọc sản phẩm có chứa từ khóa trong tên
        const filteredProducts = products.filter((product) =>
          product.name.toLowerCase().includes(keywordLower)
        );

        if (filteredProducts.length > 0) {
          renderSearchResults(filteredProducts);
        } else {
          showNoResults(keyword);
        }
      })
      .catch((error) => {
        console.error("Lỗi tìm kiếm:", error);
        showSearchError();
      });
  }

  // Hàm ẩn tất cả sections
  function hideAllSections() {
    sectionsToHide.forEach((selector) => {
      const section = document.querySelector(selector);
      if (section) section.style.display = "none";
    });
  }

  // Hàm hiển thị loading
  function createLoadingIndicator(keyword) {
    return `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Đang tìm kiếm "${keyword}"...</p>
      </div>
    `;
  }

  // Hàm hiển thị khi không có kết quả
  function showNoResults(keyword) {
    searchResultsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="fas fa-search fa-3x mb-3 text-muted"></i>
        <h4>Không tìm thấy sản phẩm phù hợp</h4>
        <p class="text-muted">Không có kết quả nào cho "${keyword}"</p>
        <button class="btn btn-primary mt-3" onclick="resetSearch()">
          <i class="fas fa-arrow-left"></i> Quay lại trang chủ
        </button>
      </div>
    `;
  }

  // Hàm hiển thị lỗi tìm kiếm
  function showSearchError() {
    searchResultsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="text-danger">Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.</p>
        <button class="btn btn-primary mt-3" onclick="resetSearch()">
          <i class="fas fa-arrow-left"></i> Quay lại trang chủ
        </button>
      </div>
    `;
  }

  // Hàm reset tìm kiếm
  window.resetSearch = function () {
    // Ẩn section kết quả
    searchResultsSection.style.display = "none";

    // Hiện lại tất cả sections
    sectionsToHide.forEach((selector) => {
      const section = document.querySelector(selector);
      if (section) section.style.display = "block";
    });

    // Reset ô tìm kiếm
    searchInput.value = "";
    searchInput.classList.remove("show");
  };

  // Hàm fetch API (giữ nguyên)
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

  // Hàm render sản phẩm (giữ nguyên)
  function renderProducts(products, targetList) {
    targetList.innerHTML = products.map(createProductCard).join("");

    addProductEvents(targetList);
  }

  // Hàm render kết quả tìm kiếm
  function renderSearchResults(products) {
    searchResultsContainer.innerHTML = products.map(createProductCard).join("");

    addProductEvents(searchResultsContainer);
  }

  // Hàm tạo thẻ sản phẩm
  function createProductCard(product) {
    return `
        <div class="product mb-5" data-id="${product.id}">
            <img class="result-img" src="https://localhost:7206${
              product.image
            }" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p class="price">${product.price.toLocaleString("vi-VN")}đ</p>
            <div class="product-actions">
                <button class="add-to-cart" data-id="${
                  product.id
                }">Thêm vào giỏ hàng</button>
            </div>
        </div>
    `;
  }

  // Hàm thêm sự kiện cho sản phẩm
  function addProductEvents(container) {
    container.querySelectorAll(".product").forEach((product) => {
      product.addEventListener("click", function (e) {
        if (!e.target.closest(".product-actions")) {
          const productId = this.dataset.id;
          window.location.href = `Detail.html?id=${productId}`;
        }
      });
    });

    container.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const productId = this.getAttribute("data-id");
        addToCart(productId);
      });
    });
  }

  // Hàm thêm vào giỏ hàng (giữ nguyên)
  function addToCart(productId) {
    fetch(`https://localhost:7206/api/Products/${productId}`)
      .then((response) => response.json())
      .then((product) => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

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

        localStorage.setItem("cart", JSON.stringify(cart));
        showAddToCartEffect(productId);
        updateCartCounter();
      })
      .catch((error) => console.error("Lỗi khi thêm vào giỏ hàng:", error));
  }

  // Hàm hiệu ứng thêm vào giỏ (giữ nguyên)
  function showAddToCartEffect(productId) {
    const button = document.querySelector(
      `.add-to-cart[data-id="${productId}"]`
    );
    if (button) {
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-check"></i> Đã thêm';
      button.classList.add("btn-success");
      button.classList.remove("btn-outline-primary");

      setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove("btn-success");
        button.classList.add("btn-outline-primary");
      }, 2000);
    }
  }

  // Hàm cập nhật giỏ hàng (giữ nguyên)
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

  // Ẩn search khi click ra ngoài
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-container")) {
      searchInput.classList.remove("show");
    }
  });
});
