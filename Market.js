let draggingMenu = null;
let dragOverBox = null;
let dragOverMenu = null;

function onDragStartMenu(event){
    draggingMenu = this;
    this.classList.add("draggingMenu");
    console.log(`Started ${$(this).attr("menuname")} of ${this.parentNode.id} Dragging.`);
};

function onDragEndMenu(event){
    draggingMenu = null;
    this.classList.remove("draggingMenu");
    console.log(`Ended ${$(this).attr("menuname")} Dragging.`);
    if(dragOverBox != null){
        dragOverBox.classList.remove("overBox");
    }
    if(dragOverMenu != null){
        dragOverMenu.classList.remove("overMenu");
    }
}

function ondragoverMenu(event){
    dragOverMenu = this;
    this.classList.add("overMenu");
}

function onDragLeaveMenu(event){
    dragOverMenu = null;
    this.classList.remove("overMenu");
}

function ondropmenu(event){
    event.stopPropagation();
    this.parentNode.insertBefore(draggingMenu, this);
}

//============================================================
//Box event Handler zone
//============================================================
function onDragOverBox(event){
    event.preventDefault();
    dragOverBox = this;
    this.classList.add("overBox");
}

function onDragLeaveBox(event){
    dragOverBox = null;
    this.classList.remove("overBox");
}

function onDropbox(event) {
    event.preventDefault();
    this.appendChild(draggingMenu); // 복사 원할시 똑같은 코드를 HTML로 옮겨놓기
}

$(document).ready(function(){
    let menuArray = document.getElementsByClassName("menu");
    for(let menu of menuArray){
        menu.addEventListener("dragstart", onDragStartMenu);
        menu.addEventListener("dragend", onDragEndMenu);
        menu.addEventListener("dragover", ondragoverMenu);
        menu.addEventListener("dragleave", onDragLeaveMenu);
        menu.addEventListener("drop", ondropmenu);
    }
    let boxArray = document.getElementsByClassName("box");
    for(let box of boxArray){
        box.addEventListener("dragover", onDragOverBox);
        box.addEventListener("dragleave", onDragLeaveBox);
        box.addEventListener("drop", onDropbox);
    }
});