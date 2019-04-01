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
      _progress = Entero? Flotante? que define el progreso de la tarea. (0-100?)(0-1?) [valor de 0 al crearse la tarea]
*/
let Task = (function(){
    let _parent = new WeakMap();
    let _beginDate = new WeakMap();
    let _endDate = new WeakMap();
    let _name = new WeakMap();
    let _type = new WeakMap();
    let _progress = new WeakMap();

    class Task {
        constructor(name, parent, beginDate, endDate,  type){
            _parent.set(this, parent);
            _beginDate.set(this, beginDate);
            _endDate.set(this, endDate);
            _name.set(this, name);
            _type.set(this, type);
            _progress.set(this, 0);
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

        getName(){
            return _name.get(this);
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

    class Gant {
        constructor(){
            _taskList.set(this, []);
            _formReference.set(this, this.createForm());
        }

        getFormReference(){
            return _formReference.get(this);
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

        }

        createForm(){
            let newForm = document.createElement("form");
            newForm.id = "taskForm";

            newForm.appendChild(document.createTextNode("Nombre:"));
            newForm.appendChild(Gant.createTextInput("taskName"));
            newForm.appendChild(document.createElement("br"));

            newForm.appendChild(document.createTextNode("Padre:"));
            newForm.appendChild(Gant.createTextInput("parent"));
            newForm.appendChild(document.createElement("br"));

            newForm.appendChild(document.createTextNode("Fecha de inicio:"));
            newForm.appendChild(Gant.createDatePicker("beginDate"));
            newForm.appendChild(document.createElement("br"));

            newForm.appendChild(document.createTextNode("Fecha de término:"));
            newForm.appendChild(Gant.createDatePicker("endDate"));
            newForm.appendChild(document.createElement("br"));

            newForm.appendChild(document.createTextNode("Tipo de tarea:"));
            newForm.appendChild(Gant.createTypeSelector("typePicker"));
            newForm.appendChild(document.createElement("br"));

            let submit = Gant.createSubmitBtn();
            let object = this;
            submit.onclick = function(){
                object.addTask();
                console.log(object.getTaskList().toString());
            };

            newForm.appendChild(submit);

            return newForm;
        }

        static createTextInput(name){
            let textInput = document.createElement("input");
            textInput.type = "text";
            textInput.className = name;
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
            let taskTypeSel = document.createElement("select");
            let optionAux;
            taskTypeSel.className = "typeSelector";

            optionAux = document.createElement("option");
            optionAux.value = "TASK";
            optionAux.appendChild(document.createTextNode("Tarea"));
            taskTypeSel.appendChild(optionAux);

            optionAux = document.createElement("option");
            optionAux.value = "CONTAINER";
            optionAux.appendChild(document.createTextNode("Contenedor"));
            taskTypeSel.appendChild(optionAux);

            optionAux = document.createElement("option");
            optionAux.value = "MILESTONE";
            optionAux.appendChild(document.createTextNode("Hito"));
            taskTypeSel.appendChild(optionAux);

            return taskTypeSel;
        }

        static createSubmitBtn(){
            let newSubmit = document.createElement("input");
            newSubmit.type = "button";
            newSubmit.value = "Crear tarea";
            return newSubmit;
        }

        addTask(){
            let formData = this.getFormReference();

            let taskName = formData.getElementsByClassName("taskName")[0];
            let parent = formData.getElementsByClassName("parent")[0];
            let type = formData.getElementsByClassName("typeSelector")[0];
            let beginDate = formData.getElementsByClassName("beginDate")[0];
            let endDate = formData.getElementsByClassName("endDate")[0];

            this.pushTaskToTaskList(new Task(
                taskName.value,
                parent.value,
                DateUtilities.parseDate(beginDate.value),
                DateUtilities.parseDate(endDate.value),
                taskType.nameOf(type.options[type.selectedIndex].value)
                )
            );
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
    launcherBtn.parentNode.replaceChild(newGant.getFormReference(), launcherBtn);
}
