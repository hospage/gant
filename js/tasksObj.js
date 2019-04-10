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
                return `${name}.${key}`;
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
*/
const Task = (function(){
    const _parent = new WeakMap();
    const _beginDate = new WeakMap();
    const _endDate = new WeakMap();
    const _name = new WeakMap();
    const _type = new WeakMap();
    const _progress = new WeakMap();
    const _childrenTasks = new WeakMap();

    class Task {
        constructor(name, parent, beginDate, endDate,  type){
            this.setParent(parent);
            this.setType(type);
            this.setName(name);
            this.setBeginDate(beginDate);
            this.setEndDate(endDate);
            this.setProgress(this, 0.0);
            _childrenTasks.set(this, []);
        }

        getParent(){
            return _parent.get(this);
        }

        setParent(newParent){
            _parent.set(this, newParent)
        }

        getBeginDate(){
            return _beginDate.get(this);
        }

        setBeginDate(newDate){
            _beginDate.set(this, newDate);
        }

        getEndDate(){
            return _endDate.get(this);
        }

        setEndDate(newDate){
            _endDate.set(this, newDate);
        }

        getName(){
            return _name.get(this);
        }

        setName(newName){
            _name.set(this, newName);
        }

        getType(){
            return _type.get(this);
        }

        setType(newType){
            _type.set(this, newType);
        }

        getProgress(){
            return _progress.get(this);
        }

        setProgress(progress){
            _progress.set(this, progress);
        }

        getChildrenTasks(){
            return _childrenTasks.get(this);
        }

        pushTaskToChildrenTasks(newTask){
            this.getChildrenTasks().push(newTask);
        }

        /*
            31-Marzo-2019
            Obtiene el número de dias entre _beginDate y _endDate
            Argumentos: ninguno
            Retorna entero
        */
        getRemainingTime(){
            //Segundos dentro de un día
            let one_day=1000*60*60*24;

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

        calculateProgress(){

        }

        addTask(newTask){

        }

        drawTask(){

        }

        hideChildren(){

        }

        deleteTask(taskRef){

        }

        addUser(newUser){

        }

        createDisplay(){

          let contenedor = createElementComplete('div', '', 'contenedor', '');
          contenedor.draggable = "true";

          let box = document.createElement('div');


          let clase = 'tagName';

          let tags = [createElementComplete('div', '', clase, 'Nombre: '),
          createElementComplete('div', '', clase, 'Fecha Inicial: '),
          createElementComplete('div', '', clase, 'Fecha Final: '),
          createElementComplete('div', '', clase, 'Progreso: '),
          createElementComplete('div', '', clase, 'Tiempo Restante: '),
          createElementComplete('div', '', clase, 'Agregar Avance: ')];

          let loadBar = createElementComplete('div', '', 'loadBar', ' ');
          let loaded = createElementComplete('div', '', 'loaded', ' ');


          loaded.style.width = "20%";

          loadBar.appendChild(loaded);

          let fechaInicio = this.getBeginDate();
          fechaInicio = String(fechaInicio.getDate()) + "/" + String(fechaInicio.getMonth()) + "/" + String(fechaInicio.getFullYear());
          fechaInicio = String(fechaInicio);

          let fechaFin = this.getEndDate();
          let fechaFinStr = fechaFin.getDate() + "/" + fechaFin.getMonth() + "/" + fechaFin.getFullYear();

          let values = [
              createElementComplete('div', '', 'tagValue', String(this.getName())),
              createElementComplete('div', '', 'tagValue', fechaInicio),
              createElementComplete('div', '', 'tagValue', fechaFinStr),
              createElementComplete('div', '', 'tagValue', ''),
              createElementComplete('div', '', 'tagValue', this.getRemainingTime()),
              createElementComplete('div', '', 'tagValue', '')
          ];


          let lengths = ["150px","150px","150px", "400px","150px","150px"];


          values.forEach(function(item, index){
            item.style.width = lengths[index];
          });


          values[3].appendChild(loadBar);

          let top1 = tags.length/2;

          for(let i = 0; i < top1; i++){
            let m = document.createElement('div');
            let kl = createElementComplete('div', '', 'grouper', '');
            let kr = createElementComplete('div', '', 'grouper', '');
            kl.style.width = "250px";
            kr.style.width = "600px";


            let k1 = tags[i];
            let k2 = values[i];
            let k3 = tags[i + top1];
            let k4 = values[i + top1];
            kl.appendChild(k1);
            kl.appendChild(k2);
            kr.appendChild(k3);
            kr.appendChild(k4);

            m.appendChild(kl);
            m.appendChild(kr);

            box.appendChild(m);
          }

          contenedor.appendChild(box);


          return contenedor;
        }

        toString(){
            return "Name: " + this.getName() + "\nParent: " + this.getParent() + "\nBegin Date: " + this.getBeginDate()
                + "\nEnd Date: " + this.getEndDate() + "\nTask type: " + this.getType() + "\nProgress: " +
                this.getProgress().toString() + "%\n\n";
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

    class Gant {
        constructor(){
            _taskList.set(this, []);
            _formReference.set(this, this.createForm());
            _interfaceReference.set(this, this.drawInterface());
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
            return _taskList.get(this)[index];
        }

        pushTaskToTaskList(newTask){
            _taskList.get(this).push(newTask);
        }

        popTaskFromTaskList(index){
            _taskList.get(this).splice(index, 1);
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
            let object = this;

            submit.onclick = function(){
                let task = object.addTask();
                console.log(object.getTaskList().toString());
                console.log(object);
                this.parentNode.parentNode.removeChild(this.parentNode);
                document.body.firstChild.style.display = "none";
                object.getInterfaceReference().appendChild(task.createDisplay());

            };

            newForm.appendChild(Gant.createCloseX());
            newForm.appendChild(Gant.createGrid());
            newForm.appendChild(submit);

            Gant.stylizeForm(newForm);
            Gant.addDarkenerDiv();
            return newForm;
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
                document.body.firstChild.style.display = "none";
            });
            return newX;
        }

        addTask(){
            let formData = this.getFormReference();

            let taskName = formData.getElementsByClassName("taskName")[0];
            let type = formData.getElementsByClassName("typeSelector")[0];
            let beginDate = formData.getElementsByClassName("beginDate")[0];
            let endDate = formData.getElementsByClassName("endDate")[0];

            let task = new Task(taskName.value,
                null,
                DateUtilities.parseDate(beginDate.value),
                DateUtilities.parseDate(endDate.value),
                taskType.nameOf(type.options[type.selectedIndex].value));

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
            let divVar = createElementComplete("div", "", "", "");
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
