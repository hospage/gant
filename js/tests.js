/*
    31-Marzo-2019
    Pruebas de creación de un objeto User y un objeto Task
*/
let userTest = new User("Juan", roleName.ADMIN);
let taskTest = new Task("tarea1", null, new Date(2019, 2, 1), new Date(2019, 2, 8), taskType.TASK);
console.log(userTest.getName());
console.log(userTest.getRole());
console.log(taskTest.getBeginDate().getMonth());
