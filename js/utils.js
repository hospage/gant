//crea un elemento html con su id, clase y texto interior
function createElementComplete(element, identifier, className, innerText){
  let t = document.createElement(element);

  if(identifier !== ''){
      t.id = identifier;
  }
  if(className !== ''){
      t.className = className;
  }
  if(innerText !== ''){
    t.appendChild(document.createTextNode(String(innerText)));
  }

  return t;
}

//modifica el texto interior de un elemento html

function modifyInnerTextId(identifier, text){
  let t1 = document.getElementById(identifier);
  t1.innerHTML = text;
}


//obtiene el texto interior de un elemento html

function getInnerTextId(identifier){
  let t = document.getElementById(identifier);
  return t.innerHTML;
}


//agrega un arreglo de hijos a un padre

function appendElements(identifier, children){
    let t = document.getElementById(identifier);
    children.forEach(function(elemento){
        t.appendChild(elemento);
    });
}

//agrega un hijo a un padre

function appendElement(identifier, child){
  let t1 = document.getElementById(identifier);

  t1.appendChild(child);
}


function removeElement(id) {
    let elem = document.getElementById(id);
    return elem.parentNode.removeChild(elem);
}

function createTextNodes(array) {
    let t = [];
    if (array !== []) {
        array.forEach(function (item) {
            t.push(document.createTextNode(String(item)));
        });
    }

    return t;
}

function getTextWidth(element) {
    let testElem = element.cloneNode(true);
    testElem.style.position = "absolute";
    testElem.style.visibility = "hidden";
    testElem.style.width = "auto";
    testElem.style.height = "auto";
    testElem.style.whiteSpace = "nowrap";
    document.body.appendChild(testElem);
    let width = testElem.scrollWidth;
    document.body.removeChild(testElem);
    return width;
}
