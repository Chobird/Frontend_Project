let draggingMenu = null;
let dragOverBox = null;

function onDragStartMenu(event) {
    draggingMenu = this; // 드래그 중인 메뉴 항목을 변수에 저장
    this.classList.add("draggingMenu"); // 드래그 중인 메뉴 항목에 스타일 추가
    console.log("onDragStartMenu called, draggingMenu: ", draggingMenu); // 디버깅 로그 추가
}

function onDragEndMenu(event) {
    console.log("onDragEndMenu called, resetting draggingMenu");
    this.classList.remove("draggingMenu");
    // draggingMenu 초기화를 제거하거나 지연 처리
    setTimeout(() => draggingMenu = null, 100); // drop 이후에 초기화
}

function onDragOverBox(event) {
    event.preventDefault();
    dragOverBox = this;
    this.classList.add("overBox");
}

function onDragLeaveBox(event) {
    dragOverBox = null;
    this.classList.remove("overBox");
}

function onDropbox(event) {
    event.preventDefault();

    if (!draggingMenu) {
        console.error("Error: draggingMenu is null");
        return;
    }

    this.classList.remove("overBox");
    const box = this;

    if (box.classList.contains("menu-box") && draggingMenu.classList.contains("cart-item")) {
        const itemName = draggingMenu.getAttribute("data-name");
        const itemPrice = draggingMenu.querySelector(".item-price").textContent.replace("₩", "");
        const imgName = draggingMenu.getAttribute("img");
        draggingMenu.remove();
        const newMenu = createMenu(itemName, itemPrice);
        box.appendChild(newMenu); // 새 메뉴 추가
    } else if (box.classList.contains("cart-box") && draggingMenu.classList.contains("menu")) {
        const itemName = draggingMenu.getAttribute("menuname");
        const itemPrice = draggingMenu.getAttribute("price");
        draggingMenu.remove();
        const existingItem = box.querySelector(`.cart-item[data-name="${itemName}"]`);
        if (existingItem) {
            updateQuantity(existingItem, itemPrice, 1);
        } else {
            const newCartItem = createCartItem(itemName, itemPrice);
            box.querySelector(".cart-items").appendChild(newCartItem); // 새 장바구니 항목 추가
        }
    }

    updateTotal();
}

function createMenu(itemName, itemPrice, imgName) {
    const menu = document.createElement("div");
    menu.classList.add("menu");
    menu.setAttribute("menuname", itemName);
    menu.setAttribute("price", itemPrice);
    menu.setAttribute("img", imgName); // img 속성 추가
    menu.setAttribute("draggable", "true");
    menu.innerHTML = `
        <img src="images/${imgName}.jpg" alt="${itemName}">
        <p>${itemName} (₩${itemPrice})</p>
    `;
    menu.addEventListener("dragstart", onDragStartMenu);
    menu.addEventListener("dragend", onDragEndMenu);
    return menu;
}

function sanitizeFileName(name) {
    return name
        .replace(/\s+/g, "_") // 공백을 밑줄로 변경
        .replace(/[^a-zA-Z0-9_-]/g, "") // 허용되지 않는 문자는 제거
        .toLowerCase(); // 소문자로 변환
}


function createCartItem(itemName, itemPrice) {
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.setAttribute("data-name", itemName);
    cartItem.setAttribute("draggable", "true"); // 드래그 가능 설정
    cartItem.innerHTML = `
        <span class="item-name">${itemName}</span>
        <span class="item-price">₩${itemPrice}</span>
        <span class="quantity">1</span>
        <button class="increase">+</button>
        <button class="decrease">-</button>
        <span class="subtotal">₩${itemPrice}</span>
    `;

    // 버튼 이벤트 리스너 추가
    cartItem.querySelector(".increase").addEventListener("click", () => updateQuantity(cartItem, itemPrice, 1));
    cartItem.querySelector(".decrease").addEventListener("click", () => updateQuantity(cartItem, itemPrice, -1));

    // 드래그 이벤트 리스너 추가
    cartItem.addEventListener("dragstart", onDragStartMenu);
    cartItem.addEventListener("dragend", onDragEndMenu);
    return cartItem;
}


function updateQuantity(cartItem, itemPrice, change) {
    const quantityElement = cartItem.querySelector(".quantity");
    let quantity = parseInt(quantityElement.textContent) + change;

    if (quantity <= 0) {
        const itemName = cartItem.getAttribute("data-name");
        cartItem.remove();
        document.querySelector(".menu-box").appendChild(createMenu(itemName, itemPrice));
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
        total += parseInt(item.querySelector(".subtotal").textContent.replace("₩", ""));
    });
    document.querySelector(".total-price").textContent = `총액: ₩${total.toFixed(0)}`;
}

$(document).ready(function () {
    const menuArray = document.getElementsByClassName("menu");
    for (let menu of menuArray) {
        menu.addEventListener("dragstart", onDragStartMenu);
        menu.addEventListener("dragend", onDragEndMenu);
    }

    const boxArray = document.getElementsByClassName("box");
    for (let box of boxArray) {
        box.addEventListener("dragover", onDragOverBox);
        box.addEventListener("dragleave", onDragLeaveBox);
        box.addEventListener("drop", onDropbox);
    }
});