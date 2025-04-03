document.addEventListener("DOMContentLoaded", function () {
  // 1. Lấy dữ liệu từ localStorage
  const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
  const codPayment = document.getElementById("cod");
  const onlinePayment = document.getElementById("online");
  const qrCodeContainer = document.getElementById("qrCodeContainer");
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  // 2. Kiểm tra dữ liệu hợp lệ
  if (!checkoutData?.items || checkoutData.items.length === 0) {
    alert(
      "⚠️ Không tìm thấy thông tin đơn hàng. Vui lòng thêm sản phẩm vào giỏ hàng trước."
    );
    window.location.href = "Cart.html";
    return;
  }

  // 3. Hiển thị sản phẩm
  renderOrderItems(checkoutData.items);

  // Xử lý khi thay đổi phương thức thanh toán
  codPayment.addEventListener("change", function () {
    if (this.checked) {
      qrCodeContainer.style.display = "none";
    }
  });

  onlinePayment.addEventListener("change", function () {
    if (this.checked) {
      qrCodeContainer.style.display = "block";
      qrCodeContainer.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Xử lý khi nhấn nút Đặt Hàng
  placeOrderBtn.addEventListener("click", function (e) {
    e.preventDefault();
    validateAndSubmitOrder(checkoutData);
  });

  // Thêm sự kiện input để reset lỗi khi người dùng bắt đầu nhập
  document.querySelectorAll(".form-group input").forEach((input) => {
    input.addEventListener("input", function () {
      const errorElement = document.getElementById(`${this.id}-error`);
      if (errorElement) {
        errorElement.textContent = "";
        this.classList.remove("invalid");
      }
    });
  });
});

function renderOrderItems(items) {
  const container = document.getElementById("orderItemsContainer");
  let total = 0;

  container.innerHTML = "";

  items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemElement = document.createElement("div");
    itemElement.className = "order-item";
    itemElement.innerHTML = `
      <span class="item-name">${item.name} × ${item.quantity}</span>
      <span class="item-price">${formatMoney(itemTotal)}</span>
    `;
    container.appendChild(itemElement);
  });

  document.getElementById("totalAmount").textContent = formatMoney(total);
}

function validateAndSubmitOrder(checkoutData) {
  // Danh sách các trường cần validate
  const fields = [
    { id: "last-name", name: "Họ", validator: validateRequired },
    { id: "first-name", name: "Tên", validator: validateRequired },
    { id: "email", name: "Email", validator: validateEmail },
    { id: "address", name: "Địa chỉ", validator: validateRequired },
    { id: "city", name: "Thành phố/Tỉnh", validator: validateRequired },
    { id: "zip-code", name: "Mã bưu điện", validator: validateRequired },
    { id: "phone", name: "Số điện thoại", validator: validatePhone },
  ];

  let isValid = true;

  // Reset tất cả thông báo lỗi trước khi validate
  fields.forEach((field) => {
    resetFieldError(field.id);
  });

  // Validate từng trường
  fields.forEach((field) => {
    const input = document.getElementById(field.id);
    const value = input.value.trim();
    const error = field.validator(value, field.name);

    if (error) {
      showFieldError(field.id, error);
      isValid = false;
    }
  });

  if (!isValid) {
    return false;
  }

  // Xử lý khi tất cả trường hợp lệ
  const orderData = {
    customerInfo: {
      lastName: document.getElementById("last-name").value.trim(),
      firstName: document.getElementById("first-name").value.trim(),
      email: document.getElementById("email").value.trim(),
      address: document.getElementById("address").value.trim(),
      city: document.getElementById("city").value.trim(),
      zipCode: document.getElementById("zip-code").value.trim(),
      phone: document.getElementById("phone").value.trim(),
    },
    paymentMethod:
      document.querySelector('input[name="payment"]:checked')?.id || "cod",
    items: checkoutData.items,
    total: calculateTotal(checkoutData.items),
    orderDate: new Date().toISOString(),
    status: "pending",
  };

  saveOrder(orderData);
  showSuccessMessage();
  return true;
}

// Các hàm validate
function validateRequired(value, fieldName) {
  return !value ? `Vui lòng nhập ${fieldName}` : null;
}

function validateEmail(value, fieldName) {
  if (!value) return `Vui lòng nhập ${fieldName}`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email không hợp lệ";
  return null;
}

function validatePhone(value, fieldName) {
  if (!value) return `Vui lòng nhập ${fieldName}`;
  if (!/^\d{9,}$/.test(value)) return "Số điện thoại phải có ít nhất 9 chữ số";
  return null;
}

// Hiển thị lỗi cho từng trường
function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);

  if (input && errorElement) {
    input.classList.add("invalid");
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

// Reset lỗi
function resetFieldError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);

  if (input && errorElement) {
    input.classList.remove("invalid");
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }
}

// Hiển thị thông báo thành công
function showSuccessMessage() {
  const successElement = document.getElementById("success-message");
  if (successElement) {
    successElement.style.display = "block";
    successElement.scrollIntoView({ behavior: "smooth" });

    // Xóa toàn bộ dữ liệu giỏ hàng
    localStorage.removeItem("cart");
    localStorage.removeItem("checkoutData");

    // Thông báo cho các tab khác biết giỏ hàng đã thay đổi
    localStorage.setItem("cartUpdated", Date.now());

    // Chuyển hướng sau 3 giây
    setTimeout(() => {
      window.location.href = "Home.html";
    }, 3000);
  }
}

function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

function saveOrder(orderData) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders.push(orderData);
  localStorage.setItem("orders", JSON.stringify(orders));
}

function formatMoney(amount) {
  return amount.toLocaleString("vi-VN") + "đ";
}
