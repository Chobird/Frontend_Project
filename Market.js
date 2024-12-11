let draggingMenu = null;

document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".menu");
    const cartBox = document.querySelector(".cart-box");

    // 메뉴 항목에 드래그 이벤트 추가
    menuItems.forEach(menu => {
        menu.addEventListener("dragstart", onDragStartMenu);
        menu.addEventListener("dragend", onDragEndMenu);
    });

    // 장바구니 박스에 드래그 앤 드롭 이벤트 추가
    cartBox.addEventListener("dragover", onDragOverBox);
    cartBox.addEventListener("drop", onDropToCart);
});

function onDragStartMenu(event) {
    draggingMenu = this;
    this.classList.add("draggingMenu");
}

function onDragEndMenu(event) {
    draggingMenu = null;
    this.classList.remove("draggingMenu");
}

function onDragOverBox(event) {
    event.preventDefault();
}

function onDropToCart(event) {
    event.preventDefault();

    const itemName = draggingMenu.getAttribute("menuname");
    const itemPrice = parseInt(draggingMenu.getAttribute("price"));

    const cartItems = this.querySelector(".cart-items");
    let existingItem = cartItems.querySelector(`[data-name="${itemName}"]`);

    if (existingItem) {
        // 수량 증가
        const quantityElement = existingItem.querySelector(".quantity");
        let quantity = parseInt(quantityElement.textContent);
        quantity++;
        quantityElement.textContent = quantity;

        // 소계 업데이트
        const subtotalElement = existingItem.querySelector(".subtotal");
        subtotalElement.textContent = `₩${(quantity * itemPrice).toFixed(0)}`;
    } else {
        // 새 항목 추가
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.setAttribute("data-name", itemName);

        cartItem.innerHTML = `
            <span class="item-name">${itemName}</span>
            <span class="item-price">₩${itemPrice}</span>
            <span class="quantity">1</span>
            <button class="increase">+</button>
            <button class="decrease">-</button>
            <span class="subtotal">₩${itemPrice}</span>
        `;

        cartItems.appendChild(cartItem);

        // 수량 증가/감소 버튼 이벤트 추가
        cartItem.querySelector(".increase").addEventListener("click", () => updateQuantity(cartItem, itemPrice, 1));
        cartItem.querySelector(".decrease").addEventListener("click", () => updateQuantity(cartItem, itemPrice, -1));
    }

    updateTotal();
}

function updateQuantity(cartItem, itemPrice, change) {
    const quantityElement = cartItem.querySelector(".quantity");
    let quantity = parseInt(quantityElement.textContent) + change;

    if (quantity <= 0) {
        cartItem.remove();
    } else {
        quantityElement.textContent = quantity;
        const subtotalElement = cartItem.querySelector(".subtotal");
        subtotalElement.textContent = `₩${(quantity * itemPrice).toFixed(0)}`;
    }

    updateTotal();
}

function updateTotal() {
    const cartItems = document.querySelectorAll(".cart-item");
    let total = 0;

    cartItems.forEach(item => {
        const subtotal = parseInt(item.querySelector(".subtotal").textContent.replace("₩", ""));
        total += subtotal;
    });

    document.querySelector(".total-price").textContent = `Total: ₩${total.toFixed(0)}`;
}
