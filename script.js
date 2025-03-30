// Handle gui form
document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Chặn reload trang

    document.getElementById("successMessage").style.display = "block";

    this.reset(); // Reset form sau khi gửi
  });

// Cart handle

document.addEventListener("DOMContentLoaded", function () {
  // Lấy tất cả các sản phẩm trong giỏ hàng
  const cartItems = document.querySelectorAll(".cart-item");
  const totalAmountElement = document.querySelector(".total-amount");

  // Hàm định dạng số tiền
  function formatMoney(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  }

  // Hàm tính toán tổng giá trị đơn hàng
  function calculateTotal() {
    let total = 0;

    cartItems.forEach((item) => {
      const price = parseInt(item.dataset.price);
      const quantity = parseInt(item.querySelector(".quantity-input").value);
      const itemTotal = price * quantity;

      // Cập nhật tổng giá cho từng sản phẩm
      item.querySelector(".item-total").textContent = formatMoney(itemTotal);

      // Cộng vào tổng đơn hàng
      total += itemTotal;
    });

    // Cập nhật tổng đơn hàng
    totalAmountElement.textContent = formatMoney(total);
  }

  // Thêm sự kiện cho các nút +/-
  cartItems.forEach((item) => {
    const minusBtn = item.querySelector(".minus");
    const plusBtn = item.querySelector(".plus");
    const quantityInput = item.querySelector(".quantity-input");

    minusBtn.addEventListener("click", function () {
      let value = parseInt(quantityInput.value);
      if (value > 1) {
        quantityInput.value = value - 1;
        calculateTotal();
      }
    });

    plusBtn.addEventListener("click", function () {
      let value = parseInt(quantityInput.value);
      quantityInput.value = value + 1;
      calculateTotal();
    });

    quantityInput.addEventListener("change", function () {
      if (this.value < 1) this.value = 1;
      calculateTotal();
    });
  });

  // Tính toán lần đầu khi tải trang
  calculateTotal();
});

// Dành cho Home.html
