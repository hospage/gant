//crea un elemento html con su id, clase y texto interior
function createElementComplete(element, identifier, className, innerText){
  let t = document.createElement(element);

  if(identifier !== '' && className !== ''){
    t.className = className;
    t.id = identifier;
  }
  else{
    if(identifier !== ''){
      t.identifier = String(className);
    }
    else if(className !== '') {
      t.className = String(className);
    }
  }

  if(innerText !== ''){
    let txt = document.createTextNode(String(innerText));
    t.appendChild(txt);
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
