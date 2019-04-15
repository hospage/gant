/*-------------------------------------------------------Tools-------------------------------------------------------*/

/*
Implementación de la estructura Enum según la especificación ECMA ES6
La estructura define un intermediario llamado Proxy que verifica los cambios hechos fuera de la definición
del Enum, restringiendo el poder añadir o eliminar elementos del Enum en tiempo de ejecución
*/
function Enum(name, values) {
    function nameOf(value) {
        let keys = Object.keys(this);
        for (let index = 0; index < keys.length; index += 1) {
            let key = keys[index];
            if (this[key] === value) {
                return this[key];
            }
        }
    }
    const handler = {
        set:  function() {
            throw new TypeError('Enum is read only');
        },
        get: function(obj, prop) {
            if (prop === 'nameOf') {
                return nameOf.bind(obj);
            }
            if (!(prop in obj)) {
                throw new ReferenceError(`Unknown enum key "${prop}"`);
            }
            return Reflect.get(obj, prop);
        },
        deleteProperty: function() {
            throw new TypeError('Enum is read only');
        }
    };
    return new Proxy(values, handler);
}

/*-------------------------------------------------------Enums-------------------------------------------------------*/
/*
    29-Marzo-2019
    Definición const del Enum roleName utilizado para el rol que maneja cada objeto User
*/
const roleName = Enum('roleName', {
    ADMIN: "ADMINISTRATOR",           //Administrador_0
    PROGRAMMER: "PROGRAMMER",      //Programador_1
    ANALYST: "ANALYST"          //Analista_2
});

/*
    29-Marzo-2019
    Definición const del Enum taskType utilizado para asignar el tipo de tarea a cada objeto Task
*/
const taskType = Enum('taskType', {
    CONTAINER: "CONTAINER",     //Agrupador_0
    MILESTONE: "MILESTONE",     //Hito_1
    TASK: "TASK"           //Tarea_2
});

/*------------------------------------------------------Objects------------------------------------------------------*/

/*
27-Marzo-2019
Definición de la clase User para la definición de usuarios que controlan el Gant
Atributos:
      _name = nombre de la persona a asignar como usuario
      _role = rol de la persona (Definido según el Enum roleName) [roleName.ADMIN, roleName.PROGRAMMER, roleName.ANALYST]
*/
let User = (function(){
    let _name = new WeakMap(); //String
    let _role = new WeakMap(); //Usar Enum roleName para el atributo _role


    class User {
        constructor(name, role) {
            _name.set(this, name);
            _role.set(this, role);
        }

        getName(){
            return _name.get(this);
        }

        setName(newName){
            _name.set(this, newName);
        }

        getRole(){
            return _role.get(this);
        }

        setRole(role){
            _role.set(this, role);
        }
    }

    return User;

})();

/*
28-Marzo-2019
Definición de clase Task para el manejador de tareas
Atributos:
      _parent = Referencia a la tarea padre del objeto (Si no tiene tarea padre, se asigna como NULL)
      _beginDate = Fecha de inicio de la tarea (Date)
      _endDate = Fecha de finalización de la tarea (Date)
      _name = nombre de la tarea (String)
      _type = tipo de tarea (Definido según el Enum taskType) [taskType.CONTAINER, taskType.MILESTONE, taskType.TASK]
      _progress = Flotante que define el progreso de la tarea. (0-1) [valor de 0.0 al crearse la tarea]
      _childrenTasks = un arreglo de tareas que contiene las tareas hijo dado un padre
      _displayReference = referencia del objeto hacia el documento HTML
      _idString = id de la tarea
      _gant = gant al que pertenece la tarea
*/
const Task = (function(){
    const _parent = new WeakMap();
    const _beginDate = new WeakMap();
    const _endDate = new WeakMap();
    const _name = new WeakMap();
    const _type = new WeakMap();
    const _progress = new WeakMap();
    const _childrenTasks = new WeakMap();
    const _displayReference = new WeakMap();
    const _idString = new WeakMap();
    const _gant = new WeakMap();
    class Task {
        constructor(name, parent, beginDate, endDate, type, idString, gant) {
            this.setParent(parent);
            this.setType(type);
            this.setName(name);
            this.setBeginDate(beginDate);
            this.setEndDate(endDate);
            this.setProgress(0.0);
            this.setDisplayReference(this.createDisplay());
            this.setGant(gant);
            this.setIdString(idString);
            _childrenTasks.set(this, []);
        }

        //Obtiene la tarea padre de un hijo
        getParent() {
            return _parent.get(this);
        }

        //Define el padre de una tarea
        setParent(newParent) {
            _parent.set(this, newParent)
        }

        //Obtiene la fecha de inicio de una tarea
        getBeginDate() {
            return _beginDate.get(this);
        }

        //Define la fecha de inicio de una tarea
        setBeginDate(newDate) {
            _beginDate.set(this, newDate);
        }

        //Obtiene la fecha final de una tarea
        getEndDate() {
            return _endDate.get(this);
        }

        //Encapsula la fecha final de una tarea
        setEndDate(newDate) {
            _endDate.set(this, newDate);
        }

        //Obtiene el nombre de una tarea
        getName() {
            return _name.get(this);
        }

        //Encapsula el nombre de una tarea
        setName(newName) {
            _name.set(this, newName);
        }

        //Obtiene el tipo de un objeto tarea (contenedor, hito, tarea)
        getType() {
            return _type.get(this);
        }

        //Encapsula el tipo de un objeto tarea
        setType(newType) {
            _type.set(this, newType);
        }

        //Obtiene el progreso de una tarea
        getProgress() {
            return _progress.get(this);
        }

        //Encapsula el progreso de una tarea
        setProgress(progress) {
            _progress.set(this, progress);
        }

        //Obtiene el arreglo de tareas que son hijos
        getChildrenTasks() {
            return _childrenTasks.get(this);
        }

        isDescendant(task) {
            let parentTask = this.getParent();
            if (parentTask === null)
                return false;
            else if (parentTask === task)
                return true;
            else
                parentTask.isDescendant(task);
        }

        pushTaskToChildrenTasks(newTask) {
            if (this.getChildrenTasks().length === 0)
                this.setType(taskType.CONTAINER);

            let childrenArr = this.getChildrenTasks();
            let parent = newTask.getParent();
            for (let i = 0; i < childrenArr.length; i++) {
                if (childrenArr[i] === newTask)
                    return;
            }
            this.getChildrenTasks().push(newTask);
            if (parent != null) {
                parent.popTaskFromChildrenTasks(newTask);
                if(parent.getChildrenTasks().length === 0)
                    parent.setType(taskType.TASK);
            }
            newTask.setParent(this);
        }

        popTaskFromChildrenTasksIndex(index) {
            this.getChildrenTasks().splice(index, 1);
        }

        //Encapsula la referencia del objeto
        setDisplayReference(newDisplayReference) {
            _displayReference.set(this, newDisplayReference);
        }

        //Obtiene la referencia de un objeto del tipo tarea
        getDisplayReference() {
            return _displayReference.get(this);
        }

        //Encapsula el id de una tarea
        setIdString(newString) {
            _idString.set(this, newString);
        }

        //Obtiene el id de una tarea
        getIdString() {
            return _idString.get(this);
        }

        //Encapsula el GANT al que pertenece
        setGant(newGant) {
            _gant.set(this, newGant);
        }

        //Obtiene el GANT al que pertenece
        getGant() {
            return _gant.get(this);
        }

        popTaskFromChildrenTasks(task) {
            this.popTaskFromChildrenTasksIndex(this.getChildTaskIndex(task));
        }

        getChildTaskIndex(task) {
            let arr = this.getChildrenTasks();
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === task)
                    return i;
            }
            return arr.length;
        }

        getParentChildren() {
            if (this.getParent() !== null)
                return this.getParent().getChildrenTasks();
        }

        /*
            31-Marzo-2019
            Obtiene el número de dias entre _beginDate y _endDate
            Argumentos: ninguno
            Retorna entero
        */
        getRemainingTime() {
            //Segundos dentro de un día
            let one_day = 1000 * 60 * 60 * 24;

            //Conversión de ambas fechas a días
            let date1 = Math.round(this.getBeginDate().getTime() / one_day);
            let date2 = Math.round(this.getEndDate().getTime() / one_day);

            //Suma los días correspondientes si la fecha de inicio ingresada es un sábado o un domingo
            date1 = this.getBeginDate().getDay() === 6 ? date1 + 2 :
                this.getBeginDate().getDay() === 0 ? date1 + 1 :
                    date1;

            //Resta los días correspondientes si la fecha de finalización ingresada es un sábado o un domingo
            date2 = this.getEndDate().getDay() === 6 ? date2 - 1 :
                this.getEndDate().getDay() === 0 ? date2 - 2 :
                    date2;

            return 1 + date2 - date1 - Math.floor((date2 - date1) / 7) * 2;
        }

        //Calcula el progreso total de una tarea, tomando en cuenta si es contenedor o tarea
        updateProgress() {
            if (this.getType() === taskType.CONTAINER) {
                let arr = this.getChildrenTasks();
                let progreso_total = 0.0000;
                let dias_totales = this.getRemainingTime();
                arr.forEach(function (item) {
                    progreso_total += (item.getRemainingTime() / dias_totales) * item.updateProgress();
                });
                this.setProgress(progreso_total);
                return progreso_total;
            } else if (this.getType() === taskType.TASK) {
                return this.getProgress();
            } else {
                return 1;
            }
        }

        updateParentProgress(){
            if(this.getParent() != null){
                this.getParent().updateParentProgress();
            }
            else{
                this.updateProgress();
            }
        }

        addTask(newTask) {

        }

        deleteTask(taskRef) {

        }

        addUser(newUser) {

        }

        createTaskDivs(classTags, classValues) {
            let itemsArray = [
                [
                    createElementComplete('div', '', classTags, 'Nombre: '),
                    createElementComplete('div', '', classValues, String(this.getName())),
                    "150px"
                ],
                [
                    createElementComplete('div', '', classTags, 'Fecha Inicial: '),
                    createElementComplete('div', '', classValues, DateUtilities.dateToString(this.getBeginDate())),
                    "150px"
                ],
                [
                    createElementComplete('div', '', classTags, 'Fecha Final: '),
                    createElementComplete('div', '', classValues, DateUtilities.dateToString(this.getEndDate())),
                    "150px"
                ],
                [
                    createElementComplete('div', '', classTags, 'Progreso: '),
                    createElementComplete('div', '', classValues, ''),
                    "400px"
                ],
                [
                    createElementComplete('div', '', classTags, 'Tiempo Restante: '),
                    createElementComplete('div', '', classValues, this.getRemainingTime() + " día(s)"),
                    "150px"
                ],
                [
                    createElementComplete('div', '', classTags, ''),
                    createElementComplete('div', '', classValues, ''),
                    "150px"
                ]
            ];

            itemsArray.forEach(function (item) {
                item[1].style.width = item[2];
            });

            itemsArray[3][1].appendChild(this.createLoadBar());
            itemsArray[4][1].style.padding = '20px 0px 0px 0px';
            itemsArray[4][1].style.position = 'absolute';

            return itemsArray;
        }

        createLoadBar() {
            let loadBar = createElementComplete('div', '', 'loadBar', '');
            let loaded = createElementComplete('div', '', 'loaded', "\xa0");
            this.setLoadBarListeners(loadBar);
            loaded.style.width = "0%";
            loadBar.appendChild(loaded);
            return loadBar;
        }

        setLoadBarListeners(loadBar) {
            let object = this;
            loadBar.onclick = function (ev) {
                if (object.getType() === taskType.TASK) {
                    ev.stopPropagation();
                    let xPos = this.getBoundingClientRect().left;
                    let xEnd = this.getBoundingClientRect().right;
                    let xMouse = ev.clientX;

                    let progressFloat = (parseFloat(xMouse) - xPos) / (xEnd - xPos);
                    if (progressFloat < 0.02)
                        progressFloat = 0;
                    else if (progressFloat > 0.98)
                        progressFloat = 1;

                    console.log(xEnd - parseFloat(xPos));

                    this.childNodes[0].style.width = (progressFloat * 100) + "%";
                    object.setProgress(progressFloat);
                    object.updateParentProgress();
                    console.log(object.getProgress());
                }
            };
        }

        arrangeDisplayItems(container) {
            let itemsArray = this.createTaskDivs('tagName', 'tagValue');
            let top1 = itemsArray.length / 2;

            let o = createElementComplete('div', '', 'register', '');
            let pl = createElementComplete('div', '', 'grouper', '');
            let pr = createElementComplete('div', '', 'grouper', '');
            pl.style.width = "250px";
            pr.style.width = "600px";

            pl.appendChild(itemsArray[0][0]);
            pl.appendChild(itemsArray[0][1]);
            pr.appendChild(itemsArray[top1][0]);
            pr.appendChild(itemsArray[top1][1]);

            o.appendChild(pl);
            o.appendChild(pr);

            container.appendChild(o);

            let parameters = createElementComplete('div', '', '', '');
            parameters.style.transition = "1.3s";
            parameters.style.opacity = "1";

            for (let i = 1; i < top1; i++) {
                let m = createElementComplete('div', '', 'register', '');
                let kl = createElementComplete('div', '', 'grouper', '');
                let kr = createElementComplete('div', '', 'grouper', '');
                kl.style.width = "250px";
                kr.style.width = "600px";


                let k1 = itemsArray[i][0];
                let k2 = itemsArray[i][1];
                let k3 = itemsArray[i + top1][0];
                let k4 = itemsArray[i + top1][1];
                kl.appendChild(k1);
                kl.appendChild(k2);
                kr.appendChild(k3);
                kr.appendChild(k4);

                m.appendChild(kl);
                m.appendChild(kr);

                parameters.appendChild(m);
            }

            container.appendChild(parameters);
        }

        createDisplay() {
            let contenedor = createElementComplete('div', '', 'contenedor', '');
            let object = this;
            let box = document.createElement('div');
            box.style.marginLeft = "30px";
            contenedor.draggable = "true";
            contenedor.WebkitTransitionDuration = "1s";

            contenedor.appendChild(object.createDeleteButton());

            contenedor.appendChild(this.createHideButton());

            contenedor.ondragstart = function (ev) {
                object.dragTask(ev);
            };

            contenedor.ondragover = function (ev) {
                ev.preventDefault();
            };

            contenedor.ondrop = function (ev) {
                object.dropTask(ev);
            };

            this.arrangeDisplayItems(box);
            contenedor.appendChild(box);

            return contenedor;

        }

        hideChildren(){
            let arr = this.getChildrenTasks();
            if (arr.length !== 0){
                arr.forEach(function(item){
                   item.hideTask();
                });
            }
        }

        hideTask(){
            let arr = this.getChildrenTasks();
            if (arr.length !== 0){
                arr.forEach(function(item){
                    item.hideTask();
                });
            }
            this.getDisplayReference().style.display = "none";
        }

        displayChildren(){
            let arr = this.getChildrenTasks();
            if(arr.length !== 0){
                arr.forEach(function (item) {
                    item.displayTask();
                })
            }
        }

        displayTask(){
            let arr = this.getChildrenTasks();
            if(arr.length !== 0){
                arr.forEach(function (item) {
                    item.displayChildren();
                    item.getDisplayReference().style.display = "block";
                })
            }
            this.getDisplayReference().style.display = "block";
        }

        dragTask(event) {
            event.dataTransfer.setData("text/idString", this.getIdString());
            event.dataTransfer.effectAllowed = "move";
        }

        dropTask(event) {
            event.preventDefault();
            let originTask = this.getGant().getTaskFromIdString(event.dataTransfer.getData("text/idString"));
            if (originTask !== this && !this.isDescendant(originTask)) {
                this.pushTaskToChildrenTasks(originTask);
                originTask.updateTask();
            }
        }

        updateTask() {
            let parent = this.getParent();
            if (parent !== null) {
                let parentRef = parent.getDisplayReference();
                let displayRef = this.getDisplayReference();
                let margin = parentRef.style.marginLeft;
                let parent_margin = margin !== "" ? parseInt(margin) : 0;
                displayRef.parentNode.removeChild(displayRef);
                parentRef.parentNode.insertBefore(displayRef, parentRef.nextElementSibling);
                this.getDisplayReference().style.marginLeft = 100 + parent_margin + "px";
                this.getChildrenTasks().forEach(function(item){
                    item.updateTask();
                });
            }
            this.updateParentProgress();
        }

        createHideButton(){
            let newX = createElementComplete("div", "hide", "show", 'V');
            newX.style.fontSize = "30px";
            newX.style.color = "black";
            newX.style.display = "block";
            newX.style.cssFloat = "left";
            newX.style.cursor = "pointer";
            newX.style.position = "absolute";
            newX.style.height = newX.style.lineHeight = "20px";
            newX.style.WebkitTransitionDuration = "1s";

            let object = this;

            newX.addEventListener("click", function(){
              if(this.className === "show"){
                console.log(this);
                this.parentNode.childNodes[2].childNodes[1].style.opacity = "0";
                this.parentNode.childNodes[2].childNodes[1].style.visibility = "hidden";
                this.className = "hidden";
                this.parentNode.style.maxHeight = "30px";
                object.hideChildren();
              }
              else{
                this.className = "show";
                this.parentNode.childNodes[2].childNodes[1].style.opacity = "1";
                this.parentNode.childNodes[2].childNodes[1].style.visibility = "visible";
                this.parentNode.style.maxHeight = "100px";
                object.displayChildren();
              }
            });
            return newX;
        }

        createDeleteButton(){
          let newX = createElementComplete("div", "", "", '×');
          newX.style.fontSize = "40px";
          newX.style.color = "black";
          newX.style.cssFloat = "right";
          newX.style.cursor = "pointer";
          newX.style.position = "";
          newX.style.marginTop = "-10px";

          let object = this;

          newX.addEventListener("click", function(){
            object.removeChildren();
            object.getDisplayReference().parentNode.removeChild(object.getDisplayReference());
          });

          return newX;
        }

        removeChildren(){
          if(this.getChildrenTasks() != []){
            this.getChildrenTasks().forEach(function(item){
              item.removeChildren();
              item.getDisplayReference().parentNode.removeChild(item.getDisplayReference());
            });
          }
        }

        //Obtiene todos los atributos de una tarea y los pone en una cadena
        toString() {
            return "Name: " + this.getName() + "\nParent: " + this.getParent().getIdString() + "\nBegin Date: " + String(this.getBeginDate())
                + "\nEnd Date: " + String(this.getEndDate()) + "\nTask type: " + String(this.getType()) + "\nProgress: " +
                String(this.getProgress()) + "%\n\n";
        }

    }

    return Task;
})();

/*
    29-Marzo-2019
    Definición del objeto Gant encargado de manejar la interfaz y todas las tareas del manejador
    Atributos:
        _taskList = arreglo de todos los objetos Task que maneja Gant
*/

let Gant = (function () {
    let _taskList = new WeakMap();
    let _formReference = new WeakMap();
    let _interfaceReference = new WeakMap();
    let _taskCounter = new WeakMap();

    class Gant {
        constructor(){
            _taskList.set(this, []);
            _formReference.set(this, this.createForm());
            _interfaceReference.set(this, this.drawInterface());
            _taskCounter.set(this, 0);
        }

        getFormReference(){
            return _formReference.get(this);
        }

        getInterfaceReference(){
            return _interfaceReference.get(this);
        }

        getTaskList(){
            return _taskList.get(this);
        }

        getTaskFromTaskList(index){
            return this.getTaskList()[index];
        }

        getTaskFromIdString(idString){
            let tasks = this.getTaskList();
            for (let i = 0; i < tasks.length; i++){
                if(tasks[i].getIdString() === idString)
                    return tasks[i];
            }
            return null;
        }

        pushTaskToTaskList(newTask){
            this.getTaskList().push(newTask);
        }

        getTaskCounter(){
            return _taskCounter.get(this);
        }

        increaseTaskCounter(){
            _taskCounter.set(this, _taskCounter.get(this) + 1)
        }

        drawInterface(){
            let newInterface = createElementComplete("div", "gantInterface", "contenedorMaestro", "");

            let newButton = Gant.createBtn("Nueva tarea");
            let object = this;
            newButton.addEventListener("click", function(){
                document.body.firstChild.style.display = "inline-block";
                this.parentNode.appendChild(object.getFormReference());
            });

            newInterface.appendChild(newButton);

            return newInterface;
        }

        createForm(){
            let newForm = createElementComplete('form', 'taskForm', '', '');
            let submit = Gant.createBtn("Agregar Tarea");
            submit.className = "addTask";
            this.assignSubmitOnClick(submit);

            newForm.appendChild(Gant.createCloseX());
            newForm.appendChild(Gant.createGrid());
            newForm.appendChild(submit);

            Gant.stylizeForm(newForm);
            Gant.addDarkenerDiv();
            return newForm;
        }

        assignSubmitOnClick(btn){
            let object = this;
            btn.onclick = function(){
                let task = object.addTask();
                if(task != null) {
                    this.parentNode.parentNode.removeChild(this.parentNode);
                    document.getElementById("darkenerDiv").style.display = "none";
                    object.getInterfaceReference().appendChild(task.getDisplayReference());
                }
            };
        }
        static createGrid(){
            let izquierdas = [
                document.createTextNode("Nombre: "),
                document.createTextNode("Fecha de Inicio: "),
                document.createTextNode("Fecha de término: "),
                document.createTextNode("Tipo de tarea: ")
            ];

            let derechas = [
                Gant.createTextInput("taskName"),
                Gant.createDatePicker("beginDate"),
                Gant.createDatePicker("endDate"),
                Gant.createTypeSelector("typePicker")
            ];

            let parent = createElementComplete('div', '', 'inputDialog', '');

            izquierdas.forEach(function(item, index){
              let tagHolder = createElementComplete('div', '', 'tagHolder', '');
              let t1 = createElementComplete('div', '', 'tagIdentifier', '');
              let t2 = createElementComplete('div', '', 'tagValue', '');
              t2.style.width = "250px";

              t1.appendChild(item);
              t2.appendChild(derechas[index]);

              tagHolder.appendChild(t1);
              tagHolder.appendChild(t2);

              parent.appendChild(tagHolder);
            });

            return parent;
        }

        static createTextInput(className){
            let textInput = createElementComplete('input', '', className, '');
            textInput.type = "text";
            return textInput;
        }

        static createDatePicker(name){
            let dateInput = document.createElement("input");
            dateInput.type = "text";
            dateInput.className = name;
            dateInput.readOnly = true;
            dateInput.onclick = function(){
                generateCalendar(dateInput);
            };
            return dateInput;
        }

        static createTypeSelector(){
            let taskTypeSel = createElementComplete('select', '', 'typeSelector', '');
            taskTypeSel.style.margin = "0px 0px 0px 8px";
            let optionAux = [
                createElementComplete('option', '', '', 'Tarea'),
                createElementComplete('option', '', '', 'Contenedor'),
                createElementComplete('option', '', '', 'Hito')
            ];
            let values = [taskType.TASK, taskType.CONTAINER, taskType.MILESTONE];

            optionAux.forEach(function(item, index){
                item.value = values[index];
                taskTypeSel.appendChild(item);
            });

            return taskTypeSel;
        }

        static createBtn(string){
            let newButton = document.createElement("input");
            newButton.type = "button";
            newButton.value = string;
            return newButton;
        }

        static createCloseX(){
            let newX = createElementComplete("div", "", "", '×');
            newX.style.fontSize = "40px";
            newX.style.color = "black";
            newX.style.display = "block";
            newX.style.cssFloat = "left";
            newX.style.cursor = "pointer";
            newX.style.position = "fixed";
            newX.style.height = newX.style.lineHeight = "20px";

            newX.addEventListener("click", function(){
                this.parentNode.parentNode.removeChild(this.parentNode);
                document.getElementById("darkenerDiv").style.display = "none";
            });
            return newX;
        }

        addTask(){
            let formData = this.getFormReference();

            let taskName = formData.getElementsByClassName("taskName")[0];
            let type = formData.getElementsByClassName("typeSelector")[0];
            let beginDateString = formData.getElementsByClassName("beginDate")[0];
            let endDateString = formData.getElementsByClassName("endDate")[0];
            if(beginDateString === "" || endDateString === "")
                return;

            let beginDate = DateUtilities.parseDate(beginDateString.value);
            let endDate = DateUtilities.parseDate(endDateString.value);

            if(DateUtilities.leastDate(beginDate, endDate) === endDate)
                return;

            let task = new Task(
                taskName.value,
                null,
                beginDate,
                endDate,
                taskType.nameOf(type.options[type.selectedIndex].value),
                "task#" + this.getTaskCounter(),
                this
            );

            this.increaseTaskCounter();
            this.pushTaskToTaskList(task);
            return task;
        }

        /***************************************Estilos***************************************/
        static stylizeForm(newForm){
            newForm.style.position = "fixed";
            newForm.style.opacity = "1";
            newForm.style.zIndex = "100";
            newForm.style.left = "50%";
            newForm.style.top = "50%";
            newForm.style.transform = "translate(-50%, -50%)";
        }

        static addDarkenerDiv(){
            let divVar = createElementComplete("div", "darkenerDiv", "", "");
            divVar.style.background = "#000";
            divVar.style.display = "none";
            divVar.style.opacity = "0.5";
            divVar.style.position = "fixed";
            divVar.style.left = divVar.style.top = "0";
            divVar.style.width = "100%";
            divVar.style.height = "100%";
            divVar.style.zIndex = "100";
            document.body.insertBefore(divVar, document.body.firstChild);
        }

    }
    return Gant;

})();


/*---------------------------------------------Code----------------------------------------------*/

/*
    31-Marzo-2019
    Función lanzadora de la creación del objeto Gant
    Argumentos: ninguno
    Void
*/
function generateGant(launcherBtn){
    let newGant = new Gant();
    launcherBtn.parentNode.replaceChild(newGant.getInterfaceReference(), launcherBtn);
}
