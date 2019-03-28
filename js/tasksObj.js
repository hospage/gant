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
        set (obj, prop, value) {
            throw new TypeError('Enum is read only');
        },
        get (obj, prop) {
            if (prop === 'nameOf') {
                return nameOf.bind(obj);
            }
            if (!(prop in obj)) {
                throw new ReferenceError(`Unknown enum key "${prop}"`);
            }
            return Reflect.get(obj, prop);
        },
        deleteProperty (obj, prop) {
            throw new TypeError('Enum is read only');
        }
    };
    return new Proxy(values, handler);
}

/*-------------------------------------------------------Enums-------------------------------------------------------*/
const roleName = Enum('roleName', {
    ADMIN: "ADMINISTRATOR",           //Administrador_0
    PROGRAMMER: "PROGRAMMER",      //Programador_1
    ANALYST: "ANALYST"          //Analista_2
});

const taskType = Enum('taskType', {
    CONTAINER: "CONTAINER",     //Agrupador_0
    MILESTONE: "MILESTONE",     //Hito_1
    TASK: "TASK"           //Tarea_2
});

/*------------------------------------------------------Objects------------------------------------------------------*/

/*
Definición de clase User para la definición de usuarios que controlan el taskManager
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
Definición de clase Task para el manejador de tareas
Atributos:
      _parent = Referencia a la tarea padre del objeto (Si no tiene tarea padre, se asigna como NULL)
      _beginDate = Fecha de inicio de la tarea
      _endDate = Fecha de finalización (tentativa) de la tarea
      _name = nombre de la tarea
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
        constructor(parent, beginDate, endDate, name, type){
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

        getRemainingTime(){
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
    }

    return Task;
})();


/*---------------------------------------------Code----------------------------------------------*/


let a = new User("Juan", roleName.ADMIN);

console.log(a.getName());
console.log(a.getRole());
