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

        getRole(){
            return _role.get(this);
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
      _childrenTasks = arreglo de tareas que contiene las tareas hijo dado un padre
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
    const _progressBar = new WeakMap();
    const _previousTask = new WeakMap();
    class Task {
        constructor(name, parent, beginDate, endDate, type, idString, gant, previousTask) {
            _childrenTasks.set(this, []);
            _beginDate.set(this, beginDate);
            _endDate.set(this, endDate);
            this.setParent(parent);
            this.setPreviousTask(previousTask);
            this.setType(type);
            this.setName(name);
            this.setDisplayReference(this.createDisplay());
            this.setGant(gant);
            this.setIdString(idString);
            this.setProgress(0.0);
        }

        /*
            14-Abril-2019
            Obtiene atributo _parent
            Argumentos: ninguno
            Retorna objeto Task
        */
        getParent() {
            return _parent.get(this);
        }

        /*
            14-Abril-2019
            Asigna valor al atributo _parent
            Argumentos:
                newParent = objeto Task a asignar como _parent
            Void
        */
        setParent(newParent) {
            _parent.set(this, newParent)
        }

        /*
            14-Abril-2019
            Obtiene atributo _previousTask
            Argumentos: ninguno
            Retorna objeto Task
        */
        getPreviousTask() {
            return _previousTask.get(this);
        }

        /*
            14-Abril-2019
            Asigna valor al atributo _previousTask
            Argumentos:
                newTask = objeto Task a asignar como _previousTask
            Void
        */
        setPreviousTask(newTask) {
            _previousTask.set(this, newTask);
        }

        /*
            14-Abril-2019
            Obtiene atributo _beginDate
            Argumentos: ninguno
            Retorna objeto Date
        */
        getBeginDate() {
            return _beginDate.get(this);
        }

        /*
            14-Abril-2019
            Asigna valor al atributo _beginDate
            Argumentos:
                newDate = objeto Date a asignar como fecha inicial
            Void
        */
        setBeginDate(newDate) {
            _beginDate.set(this, newDate);
            this.getDisplayReference()
                .getElementsByClassName("register")[1]
                .getElementsByClassName("grouper")[0]
                .getElementsByClassName("tagValue")[0]
                .innerHTML = DateUtilities.dateToString(this.getBeginDate());
        }

        /*
            14-Abril-2019
            Obtiene atributo _endDate
            Argumentos: ninguno
            Retorna objeto Date
        */
        getEndDate() {
            return _endDate.get(this);

        }

        /*
            14-Abril-2019
            Asigna valor al atributo _endDate
            Argumentos:
                newDate = objeto Date a asignar como fecha final
            Void
        */
        setEndDate(newDate) {
            _endDate.set(this, newDate);
            this.getDisplayReference()
                .getElementsByClassName("register")[2]
                .getElementsByClassName("grouper")[0]
                .getElementsByClassName("tagValue")[0]
                .innerHTML = DateUtilities.dateToString(this.getEndDate());
        }

        /*
            14-Abril-2019
            Obtiene atributo _name
            Argumentos: ninguno
            Retorna objeto String
        */
        getName() {
            return _name.get(this);
        }

        /*
            14-Abril-2019
            Asigna valor al atributo _name
            Argumentos:
                newName = objeto String a asignar como nombre
            Void
        */
        setName(newName) {
            _name.set(this, newName);
        }

        /*
            14-Abril-2019
            Obtiene atributo _type
            Argumentos: ninguno
            Retorna Enum taskType
        */
        getType() {
            return _type.get(this);
        }

        /*
            14-Abril-2019
            Asigna valor al atributo _type
            Argumentos:
                newType = Enum taskType a asignar como tipo
            Void
        */
        setType(newType) {
            _type.set(this, newType);
        }

        /*
            14-Abril-2019
            Obtiene atributo _progress
            Argumentos: ninguno
            Retorna flotante 0 <= x <= 1
        */
        getProgress() {
            return _progress.get(this);
        }

        /*
            14-Abril-2019
            Asigna valor al atributo _progress
            Argumentos:
                progress = flotante 0 <= x <= 1 a asignar como progreso
            Void
        */
        setProgress(progress) {
            let nextTasks = this.getNextTasks();
            _progress.set(this, progress);
            if(nextTasks.length !== 0 && progress !== 1) {
                nextTasks.forEach(function (item) {
                    item.setProgress(0.0);
                })
            }
            this.updateProgressBarWidth();
        }

        /*
            14-Abril-2019
            Obtiene atributo _progressBar
            Argumentos: ninguno
            Retorna referencia a la barra de progreso en el DOM
        */
        getProgressBar(){
            return _progressBar.get(this);
        }

        /*
            14-Abril-2019
            Obtiene atributo _progressBar
            Argumentos:
                newProgressRer = referencia a la barra de progreso dentro del DOM
            Void
        */
        setProgressBar(newProgressRef){
            _progressBar.set(this, newProgressRef);
        }

        /*
            14-Abril-2019
            Actualiza longitud de la barra de progreso
            Argumentos: ninguno
            Void
        */
        updateProgressBarWidth(){
            this.getProgressBar().style.width = (this.getProgress() * 100) + "%";
        }

        /*
            14-Abril-2019
            Obtiene atributo _childrenTasks
            Argumentos: ninguno
            Retorna arreglo de objetos Task
        */
        getChildrenTasks() {
            return _childrenTasks.get(this);
        }

        getChildTaskIndex(task) {
            let arr = this.getChildrenTasks();
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === task)
                    return i;
            }
            return arr.length;
        }

        /*
            14-Abril-2019
            Agrega objeto Task al arreglo de Tasks, acomodando el Task dentro del DOM
            según se requiera.
            Argumentos:
                newTask = objeto Task a agregar al arreglo _childrenTasks
            Void
        */
        pushTaskToChildrenTasks(newTask) {
            let childrenArr = this.getChildrenTasks();
            let parent = newTask.getParent();

            if (childrenArr.length === 0)
                this.setType(taskType.CONTAINER);

            for (let i = 0; i < childrenArr.length; i++) {
                if (childrenArr[i] === newTask)
                    return;
            }

            this.getChildrenTasks().push(newTask);
            this.updateDate();
            this.updateProgress();

            if (parent != null)
                parent.popTaskFromChildrenTasks(newTask);
            newTask.setParent(this);
        }

        /*
            14-Abril-2019
            Elimina objeto Task del arreglo de Tasks, eliminando el Task dentro del DOM
            según se requiera.
            Argumentos:
                index = índice del Task a eliminar dentro del arreglo
            Void
        */
        popTaskFromChildrenTasksIndex(index) {
            let childrenArr = this.getChildrenTasks();

            childrenArr[index].setParent(null);
            childrenArr.splice(index, 1);
            if(childrenArr.length === 0)
                this.setType(taskType.TASK);

            this.updateProgress();
            this.updateDate();
        }

        /*
            14-Abril-2019
            Elimina objeto Task del arreglo de Tasks, eliminando el Task dentro del DOM
            según se requiera.
            Argumentos:
                task = objeto Task a eliminar dentro del arreglo
            Void
        */
        popTaskFromChildrenTasks(task) {
            this.popTaskFromChildrenTasksIndex(this.getChildTaskIndex(task));
        }

        getNextTasks() {
            let nextTasks = [];
            let object = this;
            this.getGant().getTaskList().forEach(function (item) {
                if(object === item.getPreviousTask())
                    nextTasks.push(item);
            });
            return nextTasks;
        }

        /*
            14-Abril-2019
            Asigna valor al atributo _displayReference
            Argumentos:
                newDisplayReference = referencia a un elemento del DOM
            Void
        */
        setDisplayReference(newDisplayReference) {
            _displayReference.set(this, newDisplayReference);
        }

        /*
            14-Abril-2019
            Obtiene atributo _displayReference
            Argumentos: ninguno
            Retorna referencia al display de Task dentro del DOM
        */
        getDisplayReference() {
            return _displayReference.get(this);
        }

        /*
            14-Abril-2019
            Asigna valor al atributo _idString
            Argumentos:
                newString = Objeto String
            Void
        */
        setIdString(newString) {
            _idString.set(this, newString);
        }

        /*
            14-Abril-2019
            obtiene atributo _displayReference
            Argumentos: ninguno
            Retorna objeto String, el ID de Task
        */
        getIdString() {
            return _idString.get(this);
        }

        /*
            14-Abril-2019
            Asigna valor al atributo _gant
            Argumentos:
                newGant = objeto Gant
            Void
        */
        setGant(newGant) {
            _gant.set(this, newGant);
        }

        /*
            14-Abril-2019
            Obtiene atributo _displayReference
            Argumentos: ninguno
            Retorna objeto Gant
        */
        getGant() {
            return _gant.get(this);
        }

        /*
            31-Marzo-2019
            Obtiene el número de dias entre _beginDate y _endDate, sin contar los fines de semana.
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

        /*
            14-Abril-2019
            Cambia el texto que representa el número de días restantes dentro del DOM
            Argumentos:
                newInt = valor entero de días a desplegar
            Void
        */
        setRemainingDaysText(newInt){
            this.getDisplayReference()
                .getElementsByClassName("register")[1]
                .getElementsByClassName("grouper")[1]
                .getElementsByClassName("tagValue")[0]
                .innerHTML = newInt + " día(s)";
        }

        /*
            14-Abril-2019
            Revisa si el Task ingresado es predecesor del objeto
            Argumentos:
                task = objeto Task para hacer el chequeo
            Retorna booleano (true si task es predecesor del objeto. false de lo contrario.)
        */
        isDescendant(task) {
            let parentTask = this.getParent();
            if (parentTask === null)
                return false;
            else if (parentTask === task)
                return true;
            else
                parentTask.isDescendant(task);
        }

        /*
            16-Abril-2019
            Obtiene el nivel de la tarea dentro de la jerarquía de tareas.
            (0 = tarea raíz)
            Argumentos: ninguno
            Retorna entero
        */
        getTaskLevel(){
            if(this.getParent() === null)
                return 0;
            return this.getParent().getTaskLevel() + 1;
        }

        /*
            14-Abril-2019
            Actualiza _beginDate y _endDate dependiendo si Task tiene hijos o no.
            El algoritmo toma el menor valor de _beginDate y el mayor valor de _endDate
            entre todos los hijos y los asigna a sus propios _beginDate y _endDate,
            respectivamente. Si no tiene hijos, los valores no son modificados.
            Argumentos: ninguno
            Void
        */
        updateDate(){
            let arr = this.getChildrenTasks();
            if(arr.length !== 0) {
                let beginDate = arr[0].getBeginDate();
                let endDate = arr[0].getEndDate();
                arr.forEach(function (item) {
                    if(DateUtilities.leastDate(beginDate, item.getBeginDate()) === item.getBeginDate())
                        beginDate = item.getBeginDate();
                    if(DateUtilities.leastDate(endDate, item.getEndDate()) === endDate)
                        endDate = item.getEndDate();
                });
                this.setBeginDate(beginDate);
                this.setEndDate(endDate);
                this.setRemainingDaysText(this.getRemainingTime());
            }
            if(this.getParent() !== null)
                this.getParent().updateDate();
        }

        /*
            14-Abril-2019
            Actualiza el progreso total de una tarea. Si la tarea tiene padre, se llama
            recursivamente la función hasta encontrar al predecesor más lejano, y luego se
            llama la función recursiveUpdateProgress() a dicho predecesor
            Argumentos: ninguno
            Void
        */
        updateProgress(){
            if(this.getParent() != null){
                this.getParent().updateProgress();
            }
            else{
                this.recursiveUpdateProgress();
            }
        }

        /*
            14-Abril-2019
            Actualiza recursivamente el progreso de una tarea. Si la tarea no tiene hijos,
            el progreso no se modifica y se retorna dicho progreso. En caso contrario,
            se llama recursivamente a la función con los hijos de la tarea, se obtienen
            sus progresos, se pondera según su tiempo en días y se suman las ponderaciones.
            Argumentos: ninguno
            Void
        */
        recursiveUpdateProgress() {
            if (this.getType() === taskType.CONTAINER) {
                let arr = this.getChildrenTasks();
                let progreso_total = 0.0000;
                let dias_totales = 0;
                arr.forEach(function (item) {
                    dias_totales += item.getRemainingTime();
                });
                arr.forEach(function (item) {
                    progreso_total += (item.getRemainingTime() / dias_totales) * item.recursiveUpdateProgress();
                });
                this.setProgress(progreso_total);
                return progreso_total;
            } else if (this.getType() === taskType.TASK) {
                return this.getProgress();
            } else {
                return 1;
            }
        }

        /*
            14-Abril-2019
            Crea los Divs contenedores de los valores de información de Task dentro del DOM.
            Argumentos:
                classTags = Objeto String que define el nombre  la clase de las etiquetas.
                classValues = Objeto String que define el nombre de la clase de los valores
            Retorna un arreglo contenedor de todos los Divs
        */
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

        /*
            14-Abril-2019
            Crea la barra de progreso de Task
            Argumentos: ninguno
            Retorna Div contenedor de la barra de progreso
        */
        createLoadBar() {
            let loadBar = createElementComplete('div', 'barra_progreso_'+this.getName(), 'loadBar', '');
            let loaded = createElementComplete('div', '', 'loaded', "\xa0");
            this.setLoadBarListeners(loadBar);
            loaded.style.width = "0%";
            this.setProgressBar(loaded);
            loadBar.appendChild(loaded);
            return loadBar;
        }

        /*
            14-Abril-2019
            Asigna Listeners a la barra de progreso del Task
            Argumentos: ninguno
            Void
        */
        setLoadBarListeners(loadBar) {
            let object = this;
            loadBar.onclick = function (ev) {
                if(object.getPreviousTask() === null || object.getPreviousTask().getProgress() === 1) {
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

                        object.setProgress(progressFloat);
                        object.updateProgress();
                    }
                }
                else {

                }
            };
        }

        /*
            14-Abril-2019
            Asigna Listeners al contenedor de Task en el DOM para arrastrar Task
            hacia otros Task
            Argumentos:
                container = contenedor de Task dentro del DOM
            Void
        */
        setDragListeners(container){
            let object = this;
            container.ondragstart = function (ev) {
                object.dragTask(ev);
            };

            container.ondragover = function (ev) {
                ev.preventDefault();
            };

            container.ondrop = function (ev) {
                object.dropTask(ev);
            };
        }

        /*
            14-Abril-2019
            Agrega valores de información de Task en su contenedor en el DOM
            Argumentos:
                container = contenedor de Task dentro del DOM
            Void
        */
        appendDisplayItems(container) {
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

        /*
            14-Abril-2019
            Crea contenedor de Task dentro del DOM
            Argumentos: ninguno
            Retorna contenedor de Task
        */
        createDisplay() {
            let contenedor = document.createElement('div');
            contenedor.className = 'tarea';
            contenedor.draggable = true;

            contenedor.appendChild(this.createDeleteButton());
            contenedor.appendChild(this.createHideButton());

            this.setDragListeners(contenedor);
            let box = document.createElement('div');
            box.style.marginLeft = "30px";
            this.appendDisplayItems(box);

            contenedor.appendChild(box);

            return contenedor;
        }

        /*
            14-Abril-2019
            Asigna Listeners al contenedor de Task en el DOM para arrastrar Task
            hacia otros Task
            Argumentos:
                container = contenedor de Task dentro del DOM
            Void
        */
        createContainer(){
            let container = createElementComplete('div', '', 'contenedor', '');
            container.draggable = true;

            container.appendChild(this.createDeleteButton());
            container.appendChild(this.createHideButton());

            this.setDragListeners(container);
            return container;
        }

        /*
            14-Abril-2019
            Oculta los hijos del Task dentro del DOM
            Argumentos: ninguno
            Void
        */
        hideChildren(){
            let arr = this.getChildrenTasks();
            if (arr.length !== 0){
                arr.forEach(function(item){
                   item.hideTask();
                });
            }
        }

        /*
            14-Abril-2019
            Oculta el Task y los hijos del Task dentro del DOM, recursivamente.
            Argumentos: ninguno
            Void
        */
        hideTask(){
            let arr = this.getChildrenTasks();
            if (arr.length !== 0){
                arr.forEach(function(item){
                    item.hideTask();
                });
            }
            this.getDisplayReference().style.display = "none";
        }

        /*
            14-Abril-2019
            Muestra los hijos del Task dentro del DOM
            Argumentos: ninguno
            Void
        */
        displayChildren(){
            let arr = this.getChildrenTasks();
            if(arr.length !== 0){
                arr.forEach(function (item) {
                    item.displayTask();
                })
            }
        }

        /*
            14-Abril-2019
            Muestra el Task y los hijos del Task dentro del DOM, recursivamente.
            Argumentos: ninguno
            Void
        */
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

        /*
            14-Abril-2019
            Define acciones a realizar al comenzar a arrastrar un Task.
            Argumentos: ninguno
            Void
        */
        dragTask(event) {
            event.dataTransfer.setData("text/idString", this.getIdString());
            event.dataTransfer.effectAllowed = "move";
        }

        /*
            14-Abril-2019
            Define acciones a realizar al soltar un task sobre otro
            Argumentos: ninguno
            Void
        */
        dropTask(event) {
            event.preventDefault();
            let originTask = this.getGant().getTaskFromIdString(event.dataTransfer.getData("text/idString"));
            if (originTask !== this && originTask.getPreviousTask() !== this && !this.isDescendant(originTask)) {
                this.pushTaskToChildrenTasks(originTask);
                originTask.updateTaskInDOM();
            }
        }

        /*
            14-Abril-2019
            Actualiza contenedor de Task dentro del DOM, según si hubo
            cambio de padre o no.
            Argumentos: ninguno
            Void
        */
        updateTaskInDOM() {
            let parent = this.getParent();
            if (parent !== null) {
                let parentRef = parent.getDisplayReference();
                let displayRef = this.getDisplayReference();
                let margin = parentRef.style.marginLeft;
                let barraRefPadre = document.getElementById('barra_progreso_'+parent.getName()).style.marginLeft;
                let barraRef = document.getElementById('barra_progreso_'+this.getName());
                let parent_margin = margin !== "" ? parseInt(margin) : 0;
                displayRef.parentNode.removeChild(displayRef);
                parentRef.parentNode.insertBefore(displayRef, parentRef.nextElementSibling);
                barraRef.style.marginLeft = 350 + barraRefPadre + "px";
                this.getChildrenTasks().forEach(function(item){
                    item.updateTaskInDOM();
                });
                parentRef.id = 'tarea_padre';
            }
            this.updateProgress();
        }

        /*
            14-Abril-2019
            Crea botón para ocultar una tarea
            Argumentos: ninguno
            Retorna Div botón
        */
        createHideButton(){
            let newX = createElementComplete("div", "", "showBtn", 'V');
            Task.stylizeHideButton(newX);
            this.setHideButtonListener(newX);
            return newX;
        }

        /*
            14-Abril-2019
            ASigna Listeners a un botón para ocultar tarea
            Argumentos:
                hideBtn = Div a asignar los Listeners
            Void
        */
        setHideButtonListener(hideBtn){
            let object = this;
            hideBtn.addEventListener("click", function(){
            let hideTextTransition = "all 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0s";
            let showTextTransition = "all 0.5s cubic-bezier(0.6, -0.28, 0.74, 0.05) 0s";
            let data = hideBtn.parentNode.childNodes[2].childNodes[1];
            data.style.transition = hideTextTransition;

            if(this.className === "showBtn")
                object.toggleTextVisibility(
                    data,
                    this,
                    "0",
                    "hidden",
                    "rotate(-90deg)",
                    "hideBtn",
                    "30px",
                    hideTextTransition,
                    true
                );
            else
                object.toggleTextVisibility(
                    data,
                    this,
                    "1",
                    "visible",
                    null,
                    "showBtn",
                    "100px",
                    showTextTransition,
                    false
                );
            });
        }

        /*
            14-Abril-2019
            Cambia estilo de valores de información de Task dentro del DOM
            Argumentos:
                data =  Referencia al div contenedor de los valores a estilizar
                hideBtn = Referencia al botón que oculta y muestra los valores
                opacity = valor de opacidad para data
                visibility = valor de visibilidad para data
                transform = transformación a realizar sobre el botón
                className = clase a asignar al botón
                maxHeight = altura máxima a cambiar el contenedor del botón
                transition = valor de transición para data
                hide = booleano. Si se ocultará data, true. Sino, false.
            Void
        */
        toggleTextVisibility(data, hideBtn, opacity, visibility, transform, className, maxHeight, transition, hide){
            data.style.transition = transition;
            data.style.opacity = opacity;
            data.style.visibility = visibility;

            hideBtn.style.transform = transform;
            hideBtn.className = className;
            hideBtn.parentNode.style.maxHeight = maxHeight;

            if (hide)
                this.hideChildren();
            else
                this.displayChildren();
        }

        /*
            14-Abril-2019
            Elimina la propia referencia del Task dentro del Gant
            Argumentos: ninguno
            Void
        */
        removeSelf(){
            if(this.getChildrenTasks().length !== 0){
                this.getChildrenTasks().forEach(function(item){
                    item.removeSelf();
                    item.getDisplayReference().parentNode.removeChild(item.getDisplayReference());
                });
            }
            if(this.getParent() !== null)
                this.getParent().popTaskFromChildrenTasks(this);
        }

        /*
            14-Abril-2019
            Crea botón para eliminar el propio Task
            Argumentos: ninguno
            Retorna Div botón
        */
        createDeleteButton(){
          let newX = createElementComplete("div", "", "", '×');
          Task.stylizeDeleteButton(newX);

          let object = this;
          newX.addEventListener("click", function(){
            object.removeSelf();
            object.getDisplayReference().parentNode.removeChild(object.getDisplayReference());
            object.getGant().popTaskFromTaskList(object);
          });
          return newX;
        }

        /*
            14-Abril-2019
            Estiliza botón de ocultar tarea
            Argumentos:
                btn = botón a asignar estilo
            Void
        */
        static stylizeHideButton(btn){
            btn.style.fontSize = "30px";
            btn.style.color = "black";
            btn.style.display = "block";
            btn.style.cssFloat = "left";
            btn.style.cursor = "pointer";
            btn.style.position = "absolute";
            btn.style.height = btn.style.lineHeight = "20px";
            btn.style.WebkitTransitionDuration = "0.5s";
        }

        /*
            14-Abril-2019
            Estiliza botón de eliminar tarea misma
            Argumentos:
                btn = botón a asignar estilo
            Void
        */
        static stylizeDeleteButton(btn){
            btn.style.fontSize = "40px";
            btn.style.color = "black";
            btn.style.cssFloat = "right";
            btn.style.cursor = "pointer";
            btn.style.position = "";
            btn.style.marginTop = "-10px";
        }

        /*
            14-Abril-2019
            método toString para representar objeto Task como Cadena
            Argumentos: ninguno
            Retorna objeto String
        */
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
        _formReference = referencia al form para agregar tarea
        _interfaceReference = referencia a la interfaz del Gant
        _taskCounter = contador que guarda la cantidad de Tasks que han sido creados
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
            _interfaceReference.set(this, this.createInterface());
            _taskCounter.set(this, 0);
        }

        /*
            14-Abril-2019
            Obtiene atributo _formReference
            Argumentos: ninguno
            Retorna elemento Form
        */
        getFormReference(){
            return _formReference.get(this);
        }

        /*
            14-Abril-2019
            Obtiene atributo _interfaceReference
            Argumentos: ninguno
            Retorna elemento Div
        */
        getInterfaceReference(){
            return _interfaceReference.get(this);
        }

        /*
            14-Abril-2019
            Obtiene atributo _taskList
            Argumentos: ninguno
            Retorna arreglo de objetos Task
        */
        getTaskList(){
            return _taskList.get(this);
        }

        /*
            14-Abril-2019
            Obtiene objeto Task dentro de _taskList a partir de su idString
            Argumentos:
                idString = id a buscar dentro de _taskList
            Retorna objeto Task si el id se encuentra en _taskList. De lo contrario,
            retorna null
        */
        getTaskFromIdString(idString){
            let tasks = this.getTaskList();
            for (let i = 0; i < tasks.length; i++){
                if(tasks[i].getIdString() === idString)
                    return tasks[i];
            }
            return null;
        }

        /*
            14-Abril-2019
            Agrega objeto Task a _taskList
            Argumentos:
                newTask = objeto Task a agregar al arreglo
            Void
        */
        pushTaskToTaskList(newTask){
            this.getTaskList().push(newTask);
        }

        /*
            14-Abril-2019
            Elimina objeto Task del arreglo de Tasks, eliminando el Task dentro del DOM
            según se requiera.
            Argumentos:
                index = índice del Task a eliminar dentro del arreglo
            Void
        */
        popTaskFromTaskListIndex(index) {
            this.getTaskList().splice(index, 1);
        }

        /*
            14-Abril-2019
            Elimina objeto Task del arreglo de Tasks, eliminando el Task dentro del DOM
            según se requiera.
            Argumentos:
                task = objeto Task a eliminar dentro del arreglo
            Void
        */
        popTaskFromTaskList(task) {
            this.popTaskFromTaskListIndex(this.getTaskIndex(task));
        }

        getTaskIndex(task) {
            let arr = this.getTaskList();
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === task)
                    return i;
            }
            return arr.length;
        }

        /*
            14-Abril-2019
            Obtiene atributo _taskCounter
            Argumentos: ninguno
            Retorna entero con el conteo de Task que han sido creados
        */
        getTaskCounter(){
            return _taskCounter.get(this);
        }

        /*
            14-Abril-2019
            Incrementa atributo _taskCounter
            Argumentos: ninguno
            Void
        */
        increaseTaskCounter(){
            _taskCounter.set(this, _taskCounter.get(this) + 1)
        }

        /*
            14-Abril-2019
            Crea interfaz del Gant
            Argumentos: ninguno
            Retorna Div contenedor de la interfaz
        */
        createInterface(){
            let newInterface = createElementComplete("div", "gantInterface", "contenedorMaestro", "");

            let newButton = Gant.createBtn("Nueva tarea");
            let object = this;
            newButton.addEventListener("click", function(){
                let firstElem = document.body.firstChild;
                firstElem.style.display = "inline-block";
                this.parentNode.appendChild(object.getFormReference());
                object.updateSelectPredecessor();
            });

            newInterface.appendChild(newButton);

            return newInterface;
        }

        /*
            14-Abril-2019
            Crea Form para ingresar los datos para agregar una nueva tarea
            Argumentos: ninguno
            Retorna elemento Form
        */
        createForm(){
            let newForm = createElementComplete('form', 'taskForm', '', '');
            let submit = Gant.createBtn("Agregar Tarea");
            submit.className = "addTask";
            this.assignSubmitOnClick(submit);

            newForm.appendChild(this.createCloseX());
            newForm.appendChild(this.createGrid());
            newForm.appendChild(submit);

            Gant.stylizeForm(newForm);
            Gant.addDarkenerDiv();
            return newForm;
        }

        /*
            14-Abril-2019
            Asigna listeners al botón de agregar tarea para recibir la información
            ingresada
            Argumentos:
                btn = botón a definir como botón para agregar tarea
            Void
        */
        assignSubmitOnClick(btn){
            let object = this;
            btn.onclick = function(){
                let task = object.addTask();
                if(task != null) {
                    this.parentNode.parentNode.removeChild(this.parentNode);
                    document.getElementById("darkenerDiv").style.display = "none";
                    object.getInterfaceReference().appendChild(task.getDisplayReference());
                    object.resetInputs();
                }
            };
        }

        resetInputs(){
            let beginDate = this.getFormReference().getElementsByClassName("beginDate")[0];
            let endDate = this.getFormReference().getElementsByClassName("endDate")[0];
            let name = this.getFormReference().getElementsByClassName("taskName")[0];

            beginDate.disabled = false;
            beginDate.value = "";
            endDate.value = "";
            name.value = "";
        }

        /*
            14-Abril-2019
            Crea campos para ingresar la información para crear tareas
            Argumentos: ninguno
            Retorna div contenedor de todos los campos de ingreso de información
        */
        createGrid(){
            let izquierdas = createTextNodes(["Nombre: ",
            "Fecha de Inicio: ",
            "Fecha de término: ",
            "Tipo de tarea: ",
            "Tarea Anterior:"]);

            let derechas = [
                Gant.createTextInput("taskName"),
                Gant.createDatePicker("beginDate"),
                Gant.createDatePicker("endDate"),
                Gant.createTypeSelector("typePicker"),
                this.createPredecessorPicker("predecesor")
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

        /*
          La siguiente funcion toma por Argumentos
          el nombre de la clase de un elemento del tipo select
          el cual sera el medio de ingreso de la tarea predecesora
        */
        createPredecessorPicker(){
          let picker = createElementComplete('select', '', 'predSelect', '');
          picker.style.marginLeft = "8px";

          picker.appendChild(createElementComplete('option', '', '', ' '));

          this.getTaskList().forEach(function(item){
              let option = createElementComplete('option', '', '', item.getName());
              option.value = item.getIdString();
              picker.appendChild(option);
          });

          this.setPredecessorPickerListener(picker);
          return picker;
        }

        setPredecessorPickerListener(picker){
            let object = this;
            picker.addEventListener("change", function(){
                let selectedOption = picker.options[picker.selectedIndex].value;
                let predecessor = selectedOption === '' ? null : object.getTaskFromIdString(selectedOption);
                let formData = object.getFormReference();

                if(predecessor !== null){
                    let newDate = new Date(predecessor.getEndDate());

                    formData.getElementsByClassName("beginDate")[0].value =
                        DateUtilities.dateToString(newDate);

                    newDate.setDate(newDate.getDate() + 1);
                    formData.getElementsByClassName("endDate")[0].value =
                        DateUtilities.dateToString(newDate);

                    console.log(formData.getElementsByClassName("beginDate")[0].disabled);
                    formData.getElementsByClassName("beginDate")[0].disabled = true;
                }
                else
                    formData.getElementsByClassName("beginDate")[0].disabled = false;

            });
        }

        /*
          la siguiente funcion agrega el nombre de las tareas actuales
          al elemento select del Input
        */
        updateSelectPredecessor(){
          let picker = this.getInterfaceReference().getElementsByClassName('predSelect')[0];
            picker.innerHTML = "";
            picker.appendChild(createElementComplete('option', '', '', ' '));
            this.getTaskList().forEach(function(item){
                let option = createElementComplete('option', '', '', item.getName());
                option.value = item.getIdString();
                picker.appendChild(option);
          });
        }

        /*
            14-Abril-2019
            Crea un elemento Input
            Argumentos: ninguno
            Retorna elemento Input
        */
        static createTextInput(className){
            let textInput = createElementComplete('input', '', className, '');
            textInput.type = "text";
            return textInput;
        }

        /*
            14-Abril-2019
            Crea un elemento Input donde se puede seleccionar la fecha en un date picker
            Argumentos: ninguno
            Retorna elemento Input
        */
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

        /*
            14-Abril-2019
            Crea un elemento Select para seleccionar el tipo de tarea
            Argumentos: ninguno
            Retorna elemento Select
        */
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

        /*
            14-Abril-2019
            Crea un elemento button
            Argumentos: ninguno
            Retorna elemento button
        */
        static createBtn(string){
            let newButton = document.createElement("input");
            newButton.type = "button";
            newButton.value = string;
            return newButton;
        }

        /*
            14-Abril-2019
            Crea botón X para cerrar el Form de ingreso de datos.
            Argumentos: ninguno
            Retorna elemento Div
        */
        createCloseX(){
            let newX = createElementComplete("div", "", "", '×');
            let object = this;
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
                object.resetInputs();
            });
            return newX;
        }

        /*
            14-Abril-2019
            Agrega un Task a _taskList según la información ingresada
            en el Form
            Argumentos: ninguno
            Retorna nueva Task creada
        */
        addTask(){
            let formData = this.getFormReference();
            let taskName = formData.getElementsByClassName("taskName")[0];
            let beginDateString = formData.getElementsByClassName("beginDate")[0];
            let endDateString = formData.getElementsByClassName("endDate")[0];

            if (beginDateString === "" || endDateString === "" || taskName.value.replace(/\s/g, '') === '')
                return;

            let type = formData.getElementsByClassName("typeSelector")[0];
            let predPicker = formData.getElementsByClassName("predSelect")[0];
            let beginDate = DateUtilities.parseDate(beginDateString.value);
            let endDate = DateUtilities.parseDate(endDateString.value);
            let predecessor = predPicker.options[predPicker.selectedIndex].value === '' ?
                null
                : this.getTaskFromIdString(predPicker.options[predPicker.selectedIndex].value);

            if(DateUtilities.leastDate(beginDate, endDate) === endDate)
                return;

            let task = new Task(
                taskName.value,
                null,
                beginDate,
                endDate,
                taskType.nameOf(type.options[type.selectedIndex].value),
                "task#" + this.getTaskCounter(),
                this,
                predecessor
            );

            this.increaseTaskCounter();
            this.pushTaskToTaskList(task);
            return task;
        }

        /***************************************Estilos***************************************/

        /*
            14-Abril-2019
            Estiliza elemento Form
            Argumentos:
                form = elemento Form a estilizar
            Void
        */
        static stylizeForm(form){
            form.style.position = "fixed";
            form.style.opacity = "1";
            form.style.zIndex = "100";
            form.style.left = "50%";
            form.style.top = "50%";
            form.style.transform = "translate(-50%, -50%)";
        }

        /*
            14-Abril-2019
            Crea div para oscurecer la pantalla y lo inserta en el body
            Argumentos: ninguno
            Void
        */
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
