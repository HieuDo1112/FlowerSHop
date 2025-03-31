// Handle gui form
document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Chặn reload trang

    document.getElementById("successMessage").style.display = "block";

    this.reset(); // Reset form sau khi gửi
  });
