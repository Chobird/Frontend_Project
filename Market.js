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
        const imgName = draggingMenu.querySelector("img").src.split('/').pop().replace('.jpg', ''); // 이미지 파일 이름 추출
        draggingMenu.remove();
        box.appendChild(createMenu(itemName, itemPrice, imgName));
    } else if (box.classList.contains("cart-box") && draggingMenu.classList.contains("menu")) {
        const itemName = draggingMenu.getAttribute("menuname");
        const itemPrice = draggingMenu.getAttribute("price");
        const imgName = draggingMenu.getAttribute("img"); // img 속성 활용
        draggingMenu.remove();
        const existingItem = box.querySelector(`.cart-item[data-name="${itemName}"]`);
        if (existingItem) {
            updateQuantity(existingItem, itemPrice, 1);
        } else {
            box.querySelector(".cart-items").appendChild(createCartItem(itemName, itemPrice, imgName));
        }
    }

    updateTotal();
}


function createMenu(itemName, itemPrice, imgName) {
    const menu = document.createElement("div");
    menu.classList.add("menu");
    menu.setAttribute("menuname", itemName);
    menu.setAttribute("price", itemPrice);
    menu.setAttribute("img", imgName); // 이미지 이름 저장
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


function createCartItem(itemName, itemPrice, imgName) {
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.setAttribute("data-name", itemName);
    cartItem.setAttribute("img", imgName); // 이미지 이름 저장
    cartItem.setAttribute("draggable", "true");
    cartItem.innerHTML = `
        <img src="images/${imgName}.jpg" alt="${itemName}" class="cart-item-image">
        <div class="cart-item-details">
            <span class="item-name">${itemName}</span>
            <span class="item-price">₩${itemPrice}</span>
            <span class="quantity">1</span>
            <button class="increase">+</button>
            <button class="decrease">-</button>
            <span class="subtotal">₩${itemPrice}</span>
        </div>
    `;
    cartItem.querySelector(".increase").addEventListener("click", () => updateQuantity(cartItem, itemPrice, 1));
    cartItem.querySelector(".decrease").addEventListener("click", () => updateQuantity(cartItem, itemPrice, -1));
    cartItem.addEventListener("dragstart", onDragStartMenu);
    cartItem.addEventListener("dragend", onDragEndMenu);
    return cartItem;
}

function updateQuantity(cartItem, itemPrice, change) {
    const quantityElement = cartItem.querySelector(".quantity");
    let quantity = parseInt(quantityElement.textContent) + change;

    if (quantity <= 0) {
        const itemName = cartItem.getAttribute("data-name");
        const imgName = cartItem.getAttribute("img"); // 이미지 이름 가져오기
        cartItem.remove();
        if (imgName) {
            document.querySelector(".menu-box").appendChild(createMenu(itemName, itemPrice, imgName)); // 이미지 이름 전달
        } else {
            console.error("이미지 이름이 없습니다:", itemName);
        }
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

function handlePayment() {
    const cartItems = document.querySelectorAll(".cart-item");
    if (cartItems.length === 0) {
        alert("장바구니가 비어 있습니다!");
        return;
    }

    let receipt = "영수증\n";
    let total = 0;

    cartItems.forEach(item => {
        const itemName = item.querySelector(".item-name").textContent;
        const itemPrice = item.querySelector(".item-price").textContent.replace("₩", "");
        const quantity = item.querySelector(".quantity").textContent;
        const subtotal = item.querySelector(".subtotal").textContent.replace("₩", "");

        receipt += `${itemName} x ${quantity}개 - ₩${subtotal}\n`;
        total += parseInt(subtotal, 10);
    });

    receipt += `\n총 결제 금액: ₩${total}`;
    alert(receipt);

    resetAll(); // 초기화 함수 호출
}

function resetAll() {
    // 장바구니 초기화
    const cartItemsContainer = document.querySelector(".cart-items");
    cartItemsContainer.innerHTML = "";

    // 총액 초기화
    document.querySelector(".total-price").textContent = "총액: ₩0";

    // 메뉴 초기화 (필요하면 재로드)
    const menuBox = document.querySelector(".menu-box");
    menuBox.innerHTML = `
        <div draggable="true" menuname="불고기 버거" price="5000" class="menu" img="bulgogi_burger">
            <img src="images/bulgogi_burger.jpg" alt="불고기 버거">
            <p>불고기 버거 (₩5000)</p>
        </div>
        <div draggable="true" menuname="새우 버거" price="6000" class="menu" img="shrimp_burger">
            <img src="images/shrimp_burger.jpg" alt="새우 버거">
            <p>새우 버거 (₩6000)</p>
        </div>
        <div draggable="true" menuname="치킨 버거" price="7000" class="menu" img="chicken_burger">
            <img src="images/chicken_burger.jpg" alt="치킨 버거">
            <p>치킨 버거 (₩7000)</p>
        </div>
    `;

    // 메뉴 항목에 이벤트 리스너 다시 추가
    const menuItems = document.querySelectorAll(".menu");
    menuItems.forEach(menu => {
        menu.addEventListener("dragstart", onDragStartMenu);
        menu.addEventListener("dragend", onDragEndMenu);
    });
}
$(document).ready(function () {
    $("#addMenu").click(function () {
        const menuName = $("#menuName").val();
        const menuPrice = $("#menuPrice").val();
        const fileInput = $("#menuImage")[0].files[0];

        if (!menuName || !menuPrice || !fileInput) {
            alert("모든 필드를 입력해주세요!");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const menuHtml = `
                <div class="menu-item">
                    <img src="${e.target.result}" alt="${menuName}" style="max-width: 100px;">
                    <p>${menuName} (${menuPrice}원)</p>
                </div>
            `;
            $("#menuList").append(menuHtml);
        };

        reader.readAsDataURL(fileInput);

        // 폼 초기화
        $("#menuForm")[0].reset();
    });
});

let totalSales = 0;

function logSale(itemName, itemPrice, quantity) {
    const logEntry = `<p>${itemName} - ${quantity}개 (₩${itemPrice * quantity})</p>`;
    $("#salesLog").append(logEntry);

    totalSales += itemPrice * quantity;
    $("#totalSales").text(totalSales.toLocaleString());
}

$(document).on("click", ".menu", function () {
    const name = $(this).attr("menuname");
    const price = parseInt($(this).attr("price"));

    // 판매 내역에 기록 (여기선 1개를 판매했다고 가정)
    logSale(name, price, 1);
});

$("#resetSales").click(function () {
    $("#salesLog").empty();
    totalSales = 0;
    $("#totalSales").text(totalSales);
});

$(document).ready(function () {
    const menuArray = document.getElementsByClassName("menu");
    for (let menu of menuArray) {
        menu.addEventListener("dragstart", onDragStartMenu);
        menu.addEventListener("dragend", onDragEndMenu);
    }

    const paymentButton = $("#payment-button");
    if (paymentButton.length > 0) {
        paymentButton.on("click", handlePayment);
    } else {
        console.error("Payment button not found!");
    }
    const boxArray = document.getElementsByClassName("box");
    for (let box of boxArray) {
        box.addEventListener("dragover", onDragOverBox);
        box.addEventListener("dragleave", onDragLeaveBox);
        box.addEventListener("drop", onDropbox);
    }
});