document.addEventListener("DOMContentLoaded", () => {
  const cartItemsContainer = document.querySelector(".cart-items");
  const totalAmountElement = document.querySelector(".total-amount");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // Hàm định dạng số tiền
  function formatMoney(amount) {
    return amount.toLocaleString("vi-VN") + "đ";
  }

  // Hàm xử lý khi giỏ hàng thay đổi
  function handleCartUpdate() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      showEmptyCart();
    } else {
      renderCartItems(cart);
    }
    updateCartCounter();
  }

  // Hiển thị giỏ hàng trống
  function showEmptyCart() {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-message">
        <p>Giỏ hàng của bạn đang trống</p>
        <a href="Products.html" class="continue-shopping">Tiếp tục mua sắm</a>
      </div>
    `;
    totalAmountElement.textContent = formatMoney(0);
    checkoutBtn.disabled = true;
  }

  // Hàm hiển thị sản phẩm trong giỏ hàng
  function renderCartItems(cart) {
    cartItemsContainer.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item" data-id="${item.id}" data-price="${item.price}">
          <img class="item-image" src="https://localhost:7206${
            item.image
          }" alt="${item.name}">
          <div class="item-info">
            <h3>${item.name}</h3>
            <p class="item-price">${formatMoney(item.price)}</p>
          </div>
          <div class="item-quantity">
            <button class="quantity-btn minus">-</button>
            <input type="number" class="quantity-input" value="${
              item.quantity
            }" min="1">
            <button class="quantity-btn plus">+</button>
          </div>
          <div class="item-total">${formatMoney(
            item.price * item.quantity
          )}</div>
          <button class="item-remove">Xoá</button>
        </div>
      `
      )
      .join("");

    setupEventHandlers();
    calculateTotal();
    checkoutBtn.disabled = false;
  }

  // Hàm tính tổng tiền
  function calculateTotal() {
    let total = 0;
    const items = document.querySelectorAll(".cart-item");

    items.forEach((item) => {
      const price = parseInt(item.dataset.price);
      const quantity = parseInt(item.querySelector(".quantity-input").value);
      const itemTotal = price * quantity;

      item.querySelector(".item-total").textContent = formatMoney(itemTotal);
      total += itemTotal;
    });

    totalAmountElement.textContent = formatMoney(total);
    updateCartInLocalStorage();
  }

  // Cập nhật localStorage
  function updateCartInLocalStorage() {
    const items = document.querySelectorAll(".cart-item");
    let cart = [];

    items.forEach((item) => {
      cart.push({
        id: item.dataset.id,
        name: item.querySelector("h3").textContent,
        price: parseInt(item.dataset.price),
        image: item
          .querySelector("img")
          .src.replace("https://localhost:7206", ""),
        quantity: parseInt(item.querySelector(".quantity-input").value),
      });
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCounter();
  }

  // Cập nhật số lượng trên header
  function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const counter = document.querySelector(".cart-counter");
    if (counter) counter.textContent = totalItems;
  }

  // Thiết lập sự kiện
  function setupEventHandlers() {
    // Nút +/-
    document.querySelectorAll(".quantity-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const input = this.parentElement.querySelector(".quantity-input");
        let value = parseInt(input.value);

        if (this.classList.contains("minus") && value > 1) {
          input.value = value - 1;
        } else if (this.classList.contains("plus")) {
          input.value = value + 1;
        }

        calculateTotal();
      });
    });

    // Thay đổi số lượng trực tiếp
    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", function () {
        if (this.value < 1) this.value = 1;
        calculateTotal();
      });
    });

    // Nút xóa
    document.querySelectorAll(".item-remove").forEach((btn) => {
      btn.addEventListener("click", function () {
        const item = this.closest(".cart-item");
        item.style.animation = "fadeOut 0.3s ease";

        setTimeout(() => {
          item.remove();
          updateCartInLocalStorage();

          if (document.querySelectorAll(".cart-item").length === 0) {
            showEmptyCart();
          } else {
            calculateTotal();
          }
        }, 300);
      });
    });
  }

  // Xử lý thanh toán
  checkoutBtn.addEventListener("click", function () {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán");
      return;
    }

    // Lưu thông tin tạm thời để thanh toán
    localStorage.setItem(
      "checkoutData",
      JSON.stringify({
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        timestamp: new Date().getTime(),
      })
    );

    window.location.href = "Payment.html";
  });

  // Lắng nghe sự kiện thay đổi giỏ hàng từ các tab khác
  window.addEventListener("storage", function (event) {
    if (event.key === "cartUpdated") {
      handleCartUpdate();
    }
  });

  // CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeOut {
      from { opacity: 1; transform: translateX(0); }
      to { opacity: 0; transform: translateX(-50px); }
    }
    .cart-empty-message {
      text-align: center;
      padding: 40px 0;
      font-size: 18px;
      color: #666;
    }
    .continue-shopping {
      display: inline-block;
      margin-top: 15px;
      padding: 8px 20px;
      background: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    .checkout-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // Khởi tạo
  handleCartUpdate();
});
