let draggingMenu = null;

document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".menu");
    const cartBox = document.querySelector(".cart-box");
    const menuBox = document.querySelector(".menu-box");

    // 메뉴 항목 드래그 이벤트 추가
    menuItems.forEach(menu => {
        menu.addEventListener("dragstart", onDragStartMenu);
        menu.addEventListener("dragend", onDragEndMenu);
    });

    // 장바구니 및 메뉴 박스에 드래그 앤 드롭 이벤트 추가
    [cartBox, menuBox].forEach(box => {
        box.addEventListener("dragover", onDragOverBox);
        box.addEventListener("drop", onDropToBox);
    });

    // 장바구니 항목 드래그 활성화
    enableCartItemDrag();
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
    event.currentTarget.classList.add("overBox");
}

function onDropToBox(event) {
    event.preventDefault();
    event.currentTarget.classList.remove("overBox");

    const box = event.currentTarget;

    if (box.classList.contains("menu-box")) {
        // 장바구니에서 메뉴로 이동
        if (draggingMenu.classList.contains("cart-item")) {
            const itemName = draggingMenu.getAttribute("data-name");
            const itemPrice = draggingMenu.querySelector(".item-price").textContent.replace("₩", "").trim();

            // 장바구니에서 해당 항목 제거
            draggingMenu.remove();

            // 메뉴 항목으로 추가
            const newMenu = document.createElement("div");
            newMenu.classList.add("menu");
            newMenu.setAttribute("menuname", itemName);
            newMenu.setAttribute("price", itemPrice);
            newMenu.setAttribute("draggable", "true");

            newMenu.innerHTML = `
                <img src="images/${itemName.replace(/\s/g, "_").toLowerCase()}.jpg" alt="${itemName}">
                <p>${itemName} (₩${itemPrice})</p>
            `;

            // 드래그 이벤트 추가
            newMenu.addEventListener("dragstart", onDragStartMenu);
            newMenu.addEventListener("dragend", onDragEndMenu);

            box.appendChild(newMenu);
        }
    } else if (box.classList.contains("cart-box")) {
        // 메뉴에서 장바구니로 이동
        if (draggingMenu.classList.contains("menu")) {
            const itemName = draggingMenu.getAttribute("menuname");
            const itemPrice = parseInt(draggingMenu.getAttribute("price"));
            const cartItems = box.querySelector(".cart-items");

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
                cartItem.setAttribute("draggable", "true");

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

            // 메뉴에서 항목 제거
            draggingMenu.remove();
        }
    }

    updateTotal();
}

function enableCartItemDrag() {
    const cartItems = document.querySelectorAll(".cart-item");
    cartItems.forEach(item => {
        item.setAttribute("draggable", "true");
        item.addEventListener("dragstart", onDragStartMenu);
        item.addEventListener("dragend", onDragEndMenu);
    });
}

function updateQuantity(cartItem, itemPrice, change) {
    const quantityElement = cartItem.querySelector(".quantity");
    let quantity = parseInt(quantityElement.textContent) + change;

    if (quantity <= 0) {
        // 수량이 0이 되면 장바구니에서 제거하고 메뉴로 복귀
        const itemName = cartItem.getAttribute("data-name");
        cartItem.remove();

        const menuBox = document.querySelector(".menu-box");
        const newMenu = document.createElement("div");
        newMenu.classList.add("menu");
        newMenu.setAttribute("menuname", itemName);
        newMenu.setAttribute("price", itemPrice);
        newMenu.setAttribute("draggable", "true");

        newMenu.innerHTML = `
            <img src="images/${itemName.replace(/\s/g, "_").toLowerCase()}.jpg" alt="${itemName}">
            <p>${itemName} (₩${itemPrice})</p>
        `;

        // 드래그 이벤트 추가
        newMenu.addEventListener("dragstart", onDragStartMenu);
        newMenu.addEventListener("dragend", onDragEndMenu);

        menuBox.appendChild(newMenu);
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
