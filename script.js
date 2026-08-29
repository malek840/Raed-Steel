document.addEventListener("DOMContentLoaded", function () {
  // العناصر الأساسية في الصفحة
  const cartBtn = document.getElementById("cart-btn");
  const closeCart = document.getElementById("close-cart");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const buyButtons = document.querySelectorAll(".btn-buy");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const checkoutBtn = document.querySelector(".btn-checkout");

  // رقم الواتساب المخصص لاستقبال الطلبات
  const phoneNumber = "201097074813";

  // مصفوفة لحفظ منتجات السلة
  let cart = [];

  // 1. زر تبديل الوضع (داكن / فاتح)
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      document.body.classList.toggle("dark-mode");
      if (document.body.classList.contains("dark-mode")) {
        themeToggleBtn.innerHTML = "☀️ Light Mode";
      } else {
        themeToggleBtn.innerHTML = "🌙 Dark Mode";
      }
    });
  }

  // 2. فتح وإغلاق القائمة الجانبية للسلة
  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.add("open");
      cartOverlay.classList.add("active");
    });
  }

  if (closeCart) closeCart.addEventListener("click", closeCartSidebar);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCartSidebar);

  function closeCartSidebar() {
    cartSidebar.classList.remove("open");
    cartOverlay.classList.remove("active");
  }

  // 3. إضافة المنتجات إلى السلة عند الضغط على "أضف للسلة"
  buyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const productCard = this.closest(".product-card");
      const title = productCard.querySelector(".product-title").innerText;
      const price = productCard.querySelector(".product-price").innerText;
      const colorSelect = productCard.querySelector(".color-select");
      const selectedColor = colorSelect ? colorSelect.value : "غير محدد";
      const imgSrc = productCard.querySelector(".product-img").getAttribute("src");

      // إضافة المنتج للمصفوفة
      cart.push({
        title: title,
        price: price,
        color: selectedColor,
        imgSrc: imgSrc
      });

      // تحديث واجهة السلة وفتحها
      updateCartUI();
      cartSidebar.classList.add("open");
      cartOverlay.classList.add("active");
    });
  });

  // 4. تحديث عرض المنتجات داخل القائمة الجانبية للسلة
  function updateCartUI() {
    cartCount.innerText = cart.length;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-msg">السلة فارغة حالياً</p>';
      return;
    }

    cartItemsContainer.innerHTML = "";
    cart.forEach((item, index) => {
      const itemElement = document.createElement("div");
      itemElement.classList.add("cart-item");
      itemElement.style.cssText = "display: flex; align-items: center; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;";
      
      itemElement.innerHTML = `
        <img src="${item.imgSrc}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        <div style="flex: 1;">
          <div style="font-weight: bold; font-size: 13px;">${item.title}</div>
          <div style="font-size: 12px; color: #666;">اللون: ${item.color}</div>
          <div style="font-size: 12px; color: #28a745;">${item.price}</div>
        </div>
        <button onclick="removeItem(${index})" style="background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 18px; font-weight: bold;">&times;</button>
      `;
      cartItemsContainer.appendChild(itemElement);
    });
  }

  // 5. وظيفة حذف عنصر معين من السلة
  window.removeItem = function (index) {
    cart.splice(index, 1);
    updateCartUI();
  };

  // 6. التحقق من البيانات وإتمام الطلب وإرساله إلى الواتساب
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (cart.length === 0) {
        alert("السلة فارغة! يرجى إضافة منتجات أولاً.");
        return;
      }

      // أخذ البيانات من الحقول
      const name = document.getElementById("cust-name").value.trim();
      const phone = document.getElementById("cust-phone").value.trim();
      const email = document.getElementById("cust-email").value.trim();
      const location = document.getElementById("cust-location").value.trim();

      // التحقق من تعبئة جميع البيانات المطلوب إدخالها
      if (!name || !phone || !email || !location) {
        alert("يرجى ملء جميع البيانات (الاسم، رقم الهاتف، الإيميل، والمكان) قبل إتمام الطلب.");
        return;
      }


      

      let message = "مرحباً، أرغب في إتمام طلب جديد:\n\n";

      // إضافة بيانات العميل إلى الرسالة
      message += `👤 *بيانات العميل:*\n`;
      message += `• *الاسم:* ${name}\n`;
      message += `• *رقم الهاتف:* ${phone}\n`;
      message += `• *الإيميل:* ${email}\n`;
      message += `• *المكان:* ${location}\n`;
      message += `-----------------------------------\n\n`;

      // إضافة المنتجات إلى الرسالة
      message += `📦 *المنتجات المطلوبة:*\n`;
      cart.forEach((item, index) => {
        const fullImageUrl = window.location.origin + "/" + item.imgSrc;

        message += `🛍️ *المنتج (${index + 1}):*\n`;
        message += `• *العنوان:* ${item.title}\n`;
        message += `• *اللون المختار:* ${item.color}\n`;
        message += `• *السعر:* ${item.price}\n`;
        message += `• *صورة القطعة:* ${fullImageUrl}\n`;
        message += `-----------------------------------\n`;
      });

      message += "\nيرجى تأكيد إتاحة القطع وتزويدي بالتفاصيل المتبقية.";

      // فتح الواتساب بالرسالة المنظمة
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    });
  }
});