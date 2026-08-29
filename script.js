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
  const phoneNumber = "201019835001";

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
      const countryCode = document.getElementById("cust-country-code").value.trim();

      // التحقق من تعبئة جميع البيانات المطلوب إدخالها
      if (!name || !phone || !email || !location) {
        alert("يرجى ملء جميع البيانات (الاسم، رقم الهاتف، الإيميل، والمكان) قبل إتمام الطلب.");
        return;
      }

      // إنشاء modal لعرض ملخص الطلب
      showOrderSummary(name, countryCode, phone, email, location, cart, phoneNumber);
    });
  }

  // وظيفة لعرض ملخص الطلب
  window.showOrderSummary = function(name, countryCode, phone, email, location, cart, whatsappNumber) {
    // إنشاء modal
    const modal = document.createElement("div");
    modal.id = "order-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      direction: rtl;
      text-align: right;
    `;

    // محتوى الملخص
    let summaryHTML = `
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #28a745; padding-bottom: 15px;">
          <h2 style="margin: 0; color: #28a745; font-size: 24px;">✅ ملخص الطلب</h2>
          <button onclick="document.getElementById('order-modal').remove();" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #666;">&times;</button>
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">👤 بيانات العميل</h3>
          <p style="margin: 8px 0;"><strong>الاسم:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>رقم الهاتف:</strong> ${countryCode} ${phone}</p>
          <p style="margin: 8px 0;"><strong>الإيميل:</strong> ${email}</p>
          <p style="margin: 8px 0; margin-bottom: 0;"><strong>المكان:</strong> ${location}</p>
        </div>

        <div style="background: #fff9e6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">📦 المنتجات المطلوبة (${cart.length} منتج)</h3>
          ${cart.map((item, index) => `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0;">
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <img src="${item.imgSrc}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                <div style="flex: 1;">
                  <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px; color: #333;">🛍️ المنتج ${index + 1}: ${item.title}</p>
                  <p style="margin: 5px 0; color: #666;"><strong>اللون:</strong> ${item.color}</p>
                  <p style="margin: 5px 0 0 0; color: #28a745; font-weight: bold;">${item.price}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 10px; justify-content: space-between;">
          <button onclick="sendToWhatsapp('${countryCode}', '${phone}', '${email}', '${location}', '${name}', '${whatsappNumber}');" style="flex: 1; background: #25d366; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">✅ تأكيد وإرسال على WhatsApp</button>
          <button onclick="document.getElementById('order-modal').remove();" style="flex: 1; background: #ccc; color: #333; border: none; padding: 12px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">❌ إلغاء</button>
        </div>
      </div>
    `;

    modal.innerHTML = summaryHTML;
    document.body.appendChild(modal);
  };

  // وظيفة الإرسال على WhatsApp
  window.sendToWhatsapp = function(countryCode, phone, email, location, name, whatsappNumber) {
    let message = "مرحباً، أرغب في إتمام طلب جديد:\n\n";

    // إضافة بيانات العميل إلى الرسالة
    message += `👤 *بيانات العميل:*\n`;
    message += `• *الاسم:* ${name}\n`;
    message += `• *رقم الهاتف:* ${countryCode} ${phone}\n`;
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
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    
    // إغلاق الـ modal بعد الفتح
    document.getElementById("order-modal").remove();
  };
});