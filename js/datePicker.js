const addYear = 30;     //Límite de años superior a agregar al selector de año
let dateElem = new Date();      //Objeto Date para obtener la fecha actual


window.onload = function(){
    let a = document.getElementsByTagName("input");
    for (let i = 0; i < a.length; i++) {
        a[i].value = "";
    }
};



/*
    Asigna un datePicker onclick a cada input en el documento con className "inputDate"
    Argumentos:
        inputElem = Input de entrada a asignar el elemento calendario
    Void
*/

function inputOnClick(inputElem){
    let divVar = document.createElement("div");
    divVar.style.display = "inline-block";
    inputElem.parentNode.replaceChild(divVar, inputElem);
    divVar.appendChild(inputElem);

    let cal = new Calendar();
    inputElem.parentNode.insertBefore(cal.getCalendarReference(), inputElem.nextSibling);
    cal.setInputEvent();
    cal.getCalendarReference().style.display = "inline-table";
    cal.getCalendarReference().style.backgroundPosition = inputElem.style.backgroundPosition;

}



/*
    13-Marzo-2019
    Objeto Calendar que describe el módulo del calendario
    Atributos:
        calendarReference = referencia al elemento Calendario dentro del objeto
        yearPicker = referencia al elemento Select para seleccionar el año en el calendario
        monthTh = referencia al elemento th que contiene al mes seleccionado
        date = cadena que contiene la fecha del último dia clickado
        reminderArray = arreglo conteniendo recordatorios agregados.
            {diaDeRecordatorio, mesDeRecordatorio, añoDeRecordatorio, recordatorio}
*/
function Calendar(){
    let calendarReference;
    let yearPicker;
    let monthTh;
    let date;
    let reminderArray = [];



    /*
        13-Marzo-2019
        Agrega el valor de entrada al atributo reminderArray
        Argumentos:
            value = valor de entrada a agregar
        Void
   */
    this.pushValueReminder = function(value){
        reminderArray.push(value);
    };



    /*
       13-Marzo-2019
       Elimina el indice ingresado del arreglo reminderArray
       Argumentos:
           index = indice del valor a eliminar
       Void
    */
    this.popValueReminder = function(index){
        reminderArray.splice(index, 1);
    };



    /*
       13-Marzo-2019
       Busca el recordatorio ingresado dentro del arreglo reminderArray y devuelve su indice
       Argumentos:
           reminder = valor recordatorio a buscar
       Si el recordatorio se encuentra dentro del arreglo, retorna indice del recordatorio ingresado;
       sino, retorna -1
    */
    this.getIndexOfReminder = function(reminder){
        for (let i = 0; i < reminderArray.length; i++) {
            if (reminderArray[i][0] === reminder[0] && reminderArray[i][1] === reminder[1]
                && reminderArray[i][2] === reminder[2] && reminderArray[i][3] === reminder[3]){
                return i;
            }
        }
        return -1;
    };



    /*
        13-Marzo-2019
        Retorna referencia del calendario
        Argumentos: ninguno
        Retorna elemento calendario
    */
    this.getCalendarReference = function(){
        return calendarReference;
    };



    /*
        13-Marzo-2019
        Retorna arreglo de recordatorios
        Argumentos: ninguno
        Retorna atributo reminderArray
    */
    this.getReminderArray = function(){
        return reminderArray;
    };



    /*
        13-Marzo-2019
        Busca año actual seleccionado
        Argumentos: ninguno
        Retorna año seleccionado en el picker
    */
    this.getPickerYear = function(){
        return getCurrentYear() + addYear - yearPicker.selectedIndex;
    };


    /*
        13-Marzo-2019
        Regresa referencia del Th que contiene al mes
        Argumentos: ninguno
        Retorna elemento Th
    */
    this.getMonthTh = function(){
        return monthTh;
    };


    /*
        13-Marzo-2019
        Regresa index del año actual dentro del picker
        Argumentos: ninguno
    */
    this.getIndexYear = function(year){
        return getCurrentYear() + addYear - year;
    };


    /*
        28-Marzo-2019
        Modifica el atributo Date del objeto Calendar
        Argumentos:
            newDate = valor nuevo para el atributo
        Void
    */
    this.setDate = function(newDate){
        date = newDate;
    };


    /*
        11-Marzo-2019
        Genera calendario y retorna su referencia
        Argumentos: ninguno
        Retorna elemento calendario
    */
    this.generateCalendar = function(){
        let calendar = this.createTable();
        calendar.className = "datePicker";
        calendar.appendChild(this.createThead());
        calendar.appendChild(this.createTbody());
        calendarReference = calendar;
        this.updateCalendar(getCurrentYear(), getCurrentMonth());
    };



    /*
        11-Marzo-2019
        Actualiza calendario
        Argumentos:
            calendar = referencia al calendario a actualizar
            year = año a actualizar
            month = mes a actualizar
        Void
    */
    this.updateCalendar = function(year, month){
        calendarReference.rows[1].cells[1].innerHTML = getMonthString(month);
        this.clearTd();
        this.fillTd(year, month);
        this.updateListenersTd();
        this.hideUnusedTr();
        this.refreshReminders();
    };



    /*
        13-Marzo-2019
        Limpia las celdas del calendario
        Argumentos: ninguno
        Void
    */
    this.clearTd = function(){
        for (let i = 3; i < 9; i++) {
            for (let j = 0; j < 7; j++) {
                calendarReference.rows[i].cells[j].innerHTML = "";
            }
        }
    };


    /*
        13-Marzo-2019
        Llena las celdas del calendario dependiendo del año y mes
        Argumentos:
            year = año de entrada
            month = día de entrada
        Void
     */

    this.fillTd = function(year, month){
        let tdvar;
        for(let i = 3, j = getDayFromYear(year, month, 1), k = 1; k <= getDaysOfMonth(year, month);){
            tdvar = calendarReference.rows[i].cells[j];

            if(this.getPickerYear() === getCurrentYear() && this.getMonthTh().innerHTML === getMonthString(getCurrentMonth())
                && k === getCurrentDay()){
                let divVar = document.createElement("div");
                this.stylizeCurrentDate(divVar);
                divVar.appendChild(document.createTextNode("" + k));
                tdvar.appendChild(divVar);
            }

            else{
                tdvar.innerHTML = "" + k;
            }

            j++; k++;
            if(j === 7){
                j = 0; i++;
            }
        }
    };



    /*
        13-Marzo-2019
        Actualiza los listeners de las celdas del calendario.
        Asigna listeners si la celda contiene información
        Borra listeners si la celda no contiene información
        Argumentos: ninguno
        Void
    */
    this.updateListenersTd = function(){
        let tdvar;
        for (let i = 3; i < 9; i++) {
            for (let j = 0; j < 7; j++) {
                tdvar = calendarReference.rows[i].cells[j];
                if(tdvar.innerText !== ""){
                    this.setHoverListeners(tdvar, "rgba(255, 255, 255, 0.2)");
                    this.setClickChange(tdvar);
                }
                else{
                    let elClone = tdvar.cloneNode(false);
                    tdvar.parentNode.replaceChild(elClone, tdvar);
                }
            }
        }
    };



    /*
        13-Marzo-2019
        Oculta filas vacías
        Argumentos: ninguno
        Void
    */
    this.hideUnusedTr = function(){
        if(calendarReference.rows[8].cells[0].innerHTML === ""){
            calendarReference.rows[8].style.display = "none";
        }
        else {
            calendarReference.rows[8].style.display = "contents";
        }
    };



    /*
        11-Marzo-2019
        Crea tabla y estilo de tabla
        Argumentos: ninguno
        Retorna elemento tabla
    */
    this.createTable = function(){
        let calendario = document.createElement("table");

        //Estilización del calendario.
        this.stylizeTable(calendario);

        calendario.className = "datePicker";
        return calendario;
    };



    /*
        11-Marzo-2019
        Crea elemento thead y retorna su referencia.
        Argumentos: ninguno
        Retorna elemento thead
    */
    this.createThead = function(){
        let thead = document.createElement("thead");
        thead.appendChild(this.createTr("year"));
        thead.appendChild(this.createTr("month"));
        thead.appendChild(this.createTr("days"));
        return thead;
    };



    /*
        11-Marzo-2019
        Crea elemento tbody y retorna su referencia.
        Argumentos: ninguno
        Retorna elemento tbody
    */
    this.createTbody = function(){
        let tbody = document.createElement("tbody");
        for (let i = 0; i < 6; i++) {
            tbody.appendChild(this.createTr("date"));
        }
        return tbody;
    };



    /*
        11-Marzo-2019
        Crea elemento th y retorna su referencia.
        Argumentos:
            colsp = numero de columnas a abarcar
            isDays = indica si el Th es el encabezado de días o no
        Retorna elemento th
    */
    this.createTh = function(colsp, isDays = false, innerHtml = ""){
        let thvar = document.createElement("th");
        thvar.setAttribute("colspan", colsp);
        this.stylizeTh(thvar);

        if (isDays) {
            thvar.style.height = "70px";
            thvar.style.fontSize = "30px";
        }
        if (innerHtml !== ""){
            thvar.appendChild(document.createTextNode(innerHtml));
        }

        return thvar;
    };



    /*
        11-Marzo-2019
        Crea elemento tr según el tipo de fila a crear.
        Argumentos:
                type = tipo de tr a crear ["year", "month", "days", "date", other]
        Retorna elemento tr
    */
    this.createTr = function(type){
        let trvar = document.createElement("tr");
        switch (type) {
            //Asigna nodos hijos a la fila del año del calendario
            case "year":
                trvar.style.backgroundColor = "#3A4043";
                trvar.appendChild(this.createTh(7).appendChild(this.createSel()).parentNode);
                this.setInputChange();
                break;
            //Asigna nodos hijos a la fila del mes del calendario
            case "month":
                trvar.style.backgroundColor = "#2E323F";
                trvar.appendChild(this.createTh(1).appendChild(this.createA("&lt;", "javascript:", "left")).parentNode);
                monthTh = trvar.appendChild(this.createTh(5));
                trvar.appendChild(this.createTh(1).appendChild(this.createA("&gt;", "javascript:", "right")).parentNode);
                break;
            //Asigna nodos hijos a la fila de los días de la semana del calendario
            case "days":
                trvar.style.backgroundColor = "#2E323F";
                for (let i = 0; i < 7; i++) {
                    trvar.appendChild(this.createTh(1, true, getDayLetter(i)));
                }
                break;
            //Asigna celdas de fecha al Tbody del calendario
            case "date":
                trvar = document.createElement("tr");
                for (let i = 0; i < 7; i++) {
                    trvar.appendChild(this.createTd());
                }
                break;
            default:
                return document.createElement("tr");
        }
        return trvar;
    };



    /*
        12-Marzo-2019
        Crea elemento td y retorna su referencia
        Argumentos: ninguno
        Retorna elemento td
    */
    this.createTd = function(){
        let tdvar = document.createElement("td");
        this.stylizeTd(tdvar);
        return tdvar;
    };



    /*
        11-Marzo-2019
        Crea elemento select y retorna su referencia
        Argumentos: ninguno
        Retorna elemento seleccion
    */
    this.createSel = function(){
        let selectBox, options;

        //Creación y asignación de estilo de la caja de selección de año
        selectBox = document.createElement("select");
        selectBox.name = "birth-year";
        selectBox.className = "yearSelection";

        //Eventos del mouse para cambiar el estilo de la caja de selección
        //this.setHoverListeners(selectBox, "rgba(255, 255, 255, 0.1)");

        //Adjunta las posibles opciones de la caja de selección del año
        for(let i = getCurrentYear() + addYear; i !== 1900; i--){
            options = document.createElement("option");
            options.value = options.innerHTML = "" + i;
            if (i === getCurrentYear()){
                options.setAttribute("selected", null);
            }
            selectBox.appendChild(options);
        }
        yearPicker = selectBox;
        this.stylizeSel(selectBox);
        return selectBox;
    };



    /*
        11-Marzo-2019
        Crea elemento a y retorna su referencia
        Argumentos: ninguno
        Retorna elemento a
    */
    this.createA = function(text, href, className){
        let saverLink;

        //Creación y asignación de estilo del elemento utilizado para los botones del calendario
        saverLink = document.createElement("a");
        saverLink.href = href;
        saverLink.innerHTML = text;
        saverLink.href = href;
        saverLink.className = className;

        this.stylizeA(saverLink);

        this.setClickChange(saverLink, "rgb(70, 70, 70)"); //Asigna evento Click al link

        return saverLink;
    };



    /*
        11-Marzo-2019
        Crea elemento P y retorna su referencia
        Argumentos:
            str = cadena a asignar al elemento P
        Retorna elemento P
    */
    this.createP = function(str){
        let pSaver = document.createElement("p");
        pSaver.appendChild(document.createTextNode(str));
        this.stylizeP(pSaver);
        this.setTextReminderEvent(pSaver);
        this.setEditDeleteP(pSaver);
        return pSaver;
    };



    /*
        10-marzo-2019
        Coloca los recordatorios guardados dentro del arreglo de recordatorios en el calendario.
        Sin argumentos de entrada
        Void
    */
    this.refreshReminders = function(){
        reminderArray.forEach(element =>{
            let month, year;
            if(getMonthNumber(element[1]) === (month = getMonthNumber(this.getMonthTh().innerHTML)) &&
                element[2] === (year = this.getPickerYear())){
                let text = this.createP(element[3]);

                let row = 3 + Math.floor((parseInt(element[0]) + getDayFromYear(year, month, 1) - 1)/7);

                let cell = getDayFromYear(year, month, parseInt(element[0]));
                calendarReference.rows[row].cells[cell].appendChild(text);
            }
        })
    };



    /*
        13-Marzo-2019
        Agrega listener para detectar cambio de año en el input y actualiza el calendario en dicho caso
        Argumentos: ninguno
        Void
    */
    this.setInputChange = function(){
        let object = this;
        yearPicker.addEventListener("change", function(){
            object.updateCalendar(object.getPickerYear(), getMonthNumber(object.getMonthTh().innerHTML));
        })
    };



    /*
        11-Marzo-2019
        Asigna listeners onMouseDown y onMouseUp a diversos elementos del calendario
        Argumentos:
            element = elemento a asignar;
            color = color de cambio al clickar;
        Void
    */
    this.setClickChange = function(element, color = ""){
        if (element.className === "left"){
            this.changeLeftMonth(element, color);
        }
        else if(element.className === "right"){
            this.changeRightMonth(element, color)
        }
        else{
            this.getDateFromClick(element);
        }


        //Regresa al color original si se ingresa un color como entrada
        if(color !== "") {
            let originalColor = element.style.backgroundColor;
            element.addEventListener("mouseup", function(){
                this.style.backgroundColor = originalColor;
            });
        }
    };



    /*
        13-Marzo-2019
        Agrega Listener a elemento A con className "left" para cambio de mes en el calendario
        Argumentos:
            element = elemento a asignar el Listener
            color = cambio de color al clickar
        Void
    */
    this.changeLeftMonth = function(element, color){
        let object = this;
        element.addEventListener("mousedown", function(){
            let year = object.getPickerYear();
            let month = getMonthNumber(object.getMonthTh().innerHTML);
            month--;
            if(month === 0){
                year--;
                month = 12;
            }
            yearPicker.selectedIndex = object.getIndexYear(year);
            object.updateCalendar(year, month);
            this.style.backgroundColor = color;
        });
    };



    /*
        13-Marzo-2019
        Agregar Listener a elemento A con className "right" para cambio de mes en el calendario
        Argumentos:
            element = elemento a asignar el Listener
            color = cambio de color al clickar
        Void
    */
    this.changeRightMonth = function(element, color){
        let object = this;
        element.addEventListener("mousedown", function(){
            let year = object.getPickerYear();
            let month = getMonthNumber(object.getMonthTh().innerHTML);
            month++;
            if(month === 13){
                year++;
                month = 1;
            }
            yearPicker.selectedIndex = object.getIndexYear(year);
            object.updateCalendar(year, month);
            this.style.backgroundColor = color;
        });
    };



    /*
        13-Marzo-2019
        Agrega Listener a elemento Td para asignación de fecha al inputDate
        Argumentos:
            element = elemento a asignar el Listener
        Void
    */
    this.getDateFromClick = function(element){
        let object = this;
        element.addEventListener("mousedown", function (event) {
            if (event.target !== this && event.target.tagName !== "DIV")
                return;
            let auxVar = element.childNodes[0];
            object.setDate((auxVar.tagName === "DIV" ? auxVar.innerText : auxVar.nodeValue) +
                "/" + object.getMonthTh().innerHTML + "/" + object.getPickerYear());
            object.setInputDate();
            let inputX = object.getCalendarReference().previousElementSibling;
            inputX.onclick = function(){
                inputOnClick(inputX);
            };
            object.getCalendarReference().style.display = "none";
            object.getCalendarReference().parentNode.removeChild(object.getCalendarReference());
            inputX.parentNode.parentNode.replaceChild(inputX, inputX.parentNode);
        })
    };



    /*
        11-Marzo-2019
        Asigna listener para cambiar el color de elemento onHover
        Argumentos:
            element = elemento a asignar el Listener;
            color = color de cambio;
        Void
    */
    this.setHoverListeners = function(element, color){
        let origColor = element.style.backgroundColor;
        element.addEventListener("mouseenter", function () {
            this.style.backgroundColor = color;
        });
        element.addEventListener("mouseleave", function () {
            this.style.backgroundColor = origColor;
        });
        if (element.tagName === "TD"){
                let object = this;
                element.addEventListener("mouseenter", function () {
                    if (object.getCalendarReference().getElementsByTagName("input").length === 0) {
                        let inputSaver = document.createElement("input");
                        object.stylizeInput(inputSaver);
                        object.setInputReminderEvent(inputSaver);
                        this.appendChild(inputSaver);
                    }
                });
                element.addEventListener("mouseleave", function () {
                    if (element.getElementsByTagName("input").length !== 0) {
                        this.removeChild(this.getElementsByTagName("input")[0]);
                    }
                });
        }
    };



    /*
        13-Marzo-2019
        Cambia valor del input asociado con el calendario
        Argumentos: ninguno
        Void
        */
    this.setInputDate = function(){
        calendarReference.previousElementSibling.value = date;
    };



    /*
        13-Marzo-2019
        Agrega eventos de click al input asociado con el calendario
        Argumentos: ninguno
        Void
    */
    this.setInputEvent = function(){
        calendarReference.previousElementSibling.onclick = function() {
            calendarReference.style.display = "inline-table";
        }
    };


    /*
        13-Marzo-2019
        Agrega eventos de click al input para agregar recordatorios
        Argumentos:
            inputElement = elemento al que se desean agregar los eventos
        Void
    */
    this.setInputReminderEvent = function(inputElement){
        let object = this;
        inputElement.addEventListener("keyup", function (event) {
            if (event.key === "Enter"){
                if(document.activeElement === this){
                    if (!isEmpty(this.value)) {
                        let textVar = object.createP(this.value);
                        this.parentNode.replaceChild(textVar, this);
                        let auxVar = textVar.parentNode.childNodes[0];
                        object.pushValueReminder([
                            auxVar.tagName === "DIV" ? auxVar.innerText : auxVar.nodeValue,
                            object.getMonthTh().innerText,
                            object.getPickerYear(), textVar.innerText
                        ]);
                        console.log(object.getReminderArray());
                    }
                    else {
                        this.parentNode.replaceChild(this.cloneNode(false), this);
                    }
                }

            }
        });
    };



    /*
        13-Marzo-2019
        Agrega eventos de click a text para seleccionar y eliminar recordatorios
        Argumentos:
            textElement = elemento Text al que se desean agregar los eventos
        Void
    */
    this.setTextReminderEvent = function(textElement){

        let arr = this.getCalendarReference().getElementsByTagName("p");

        /*
            Agrega habilitador de borrado al clickar sobre el recordatorio
            Argumentos: ninguno
            Void
         */
        textElement.addEventListener("click", function(){
            if (this.style.boxShadow === "red 0px 0px 0px 3px"){
                this.style.boxShadow = "0px 0px 0px 0px black";
            }
            else {
                for (let i = 0; i < arr.length; i++) {
                    arr[i].style.boxShadow = "0px 0px 0px 0px black";
                }
                this.style.boxShadow = "0px 0px 0px 3px red";
            }
        });

    };



    /*
        Agrega opciones de editar y borrar recordatorios en el calendario
        Argumentos:
        textElement = Elemento a asignar el evento
        Void
    */
    this.setEditDeleteP = function(textElement){

        let object = this;
        textElement.addEventListener("dblclick", function(){
            if (this.style.boxShadow === "red 0px 0px 0px 3px"){
                let index = object.getIndexOfReminder([this.parentNode.childNodes[0].nodeValue, object.getMonthTh().innerText,
                    object.getPickerYear(), this.innerText]);
                this.parentNode.removeChild(this);
                object.popValueReminder(index);
            }
            else{
                let index = object.getIndexOfReminder([this.parentNode.childNodes[0].nodeValue, object.getMonthTh().innerText,
                    object.getPickerYear(), this.innerText]);
                let inputSaver = document.createElement("input");
                object.popValueReminder(index);
                object.stylizeInput(inputSaver);
                inputSaver.value = this.innerText;
                object.setInputReminderEvent(inputSaver);
                this.parentNode.replaceChild(inputSaver, this);


            }
        })

    };



    /***************Hojas de estilo***************/



    this.stylizeTh = function(thElement){
        thElement.style.height = "30px";
        thElement.style.fontSize = "35px";
        thElement.style.color = "white";
        thElement.style.msUserSelect = "none";
        thElement.style.webkitUserSelect = "none";
        thElement.style.userSelect = "none";
    };



    /*
        13-Marzo-2019
        Estiliza elementos Td del calendario
        Argumentos:
            tdElement = referencia al elemento Td a estilizar
        Void
    */
    this.stylizeTd = function(tdElement){
        tdElement.style.padding = "0.5em 0";
        tdElement.style.height = "40px";
        tdElement.style.fontSize = "20px";
        tdElement.style.backgroundColor = "#3A4043";
        tdElement.style.textAlign = "center";
        tdElement.style.verticalAlign = "top";
        tdElement.style.color = "white";
        tdElement.style.msUserSelect = "none";
        tdElement.style.webkitUserSelect = "none";
        tdElement.style.userSelect = "none";
    };



    /*
        13-Marzo-2019
        Estiliza Td conteniendo fecha actual del sistema
        Argumentos:
            divElement = referencia al elemento Div a estilizar
        Void
    */
    this.stylizeCurrentDate = function(divElement){
        divElement.style.backgroundColor = "rgba(255, 255, 255, 0.13)";
        divElement.style.boxShadow = "rgba(0, 0, 0, 0.1) 2px 2px 8px 2px";
        divElement.style.width = "70%";
        divElement.style.borderRadius = "20px";
        divElement.style.margin = "0 15%";
        divElement.style.position = "relative";
        divElement.style.top = "-5px";
        divElement.style.paddingTop = "5px";
        divElement.style.msUserSelect = "none";
        divElement.style.webkitUserSelect = "none";
        divElement.style.userSelect = "none";
    };



    /*
        13-Marzo-2019
        Estiliza Tabla que contiene el calendario
        Argumentos:
            tableElement = referencia al elemento Table a estilizar
        Void
    */
    this.stylizeTable = function(tableElement){
        tableElement.style.position = "absolute";
        tableElement.style.display = "none";
        tableElement.style.tableLayout = "fixed";
        tableElement.style.width = "35%";
        tableElement.style.height = "auto";
        tableElement.style.borderRadius = "15px";
        tableElement.style.borderCollapse = "collapse";
        tableElement.style.backgroundColor = "transparent";
        tableElement.style.fontFamily = "'Overpass', sans-serif";
    };



    /*
        14-Marzo-2019
        Estiliza elementos Input dentro del calendario
        Argumentos:
            inputElement = referencia al elemento input a estilizar
        Void
    */
    this.stylizeInput = function (inputElement) {
        inputElement.style.width = "95%";
        inputElement.style.backgroundColor = "rgb(150, 150, 150)";
        inputElement.style.border = "2px black";
        inputElement.style.borderRadius = "10px";
        inputElement.style.transition = "0.4s";
    };


    /*
        13-Marzo-2019
        Estiliza elementos A del calendario
        Argumentos:
            aElement = referencia al elemento A a estilizar
        Void
    */
    this.stylizeA = function(aElement){

        aElement.style.margin = "2%";
        aElement.style.padding = "0.3em 0.2em 0.1em";
        aElement.style.color = "white";
        aElement.style.borderRadius = "15px";
        aElement.style.fontSize = "1.1em";
        aElement.style.backgroundColor = "#016FF2";
        aElement.style.textDecoration = "none";
        aElement.style.display = "block";
        aElement.style.transition = "0.2s";
        aElement.style.boxShadow = "black";
        aElement.style.msUserSelect = "none";
        aElement.style.webkitUserSelect = "none";
        aElement.style.userSelect = "none";

        this.setHoverListeners(aElement, "rgb(90, 90, 90)"); //Asigna evento Hover al link


        aElement.onfocus = function(){                  //Elimina líneas de contorno al clickar
            this.style.outline = "none";
            this.style.backgroundColor = "rgb(90, 90, 90)";
        };
        aElement.onblur = function(){
            this.style.backgroundColor = "#016FF2";
        }
    };



    /*
        13-Marzo-2019
        Estiliza elementos Select del calendario
        Argumentos:
            selElement = referencia al elemento Select a estilizar
        Void
    */
    this.stylizeSel = function(selElement){
        selElement.style.webkitAppearance = "button";
        selElement.style.webkitBorderRadius = "2px";
        selElement.style.boxShadow = "rgba(0, 0, 0, 0.2) 2px 2px 10px 5px";
        selElement.style.webkitUserSelect = "none";
        selElement.style.textAlign = "center";
        selElement.style.border = "0px solid #AAA";
        selElement.style.borderRadius = "10px";
        selElement.style.color = "transparent";
        selElement.style.textShadow = "2px 2px #FFF";
        selElement.style.fontSize = "inherit";
        selElement.style.margin = "20px";
        selElement.style.overflow = "hidden";
        selElement.style.padding = "1px 10px 5px 5px";
        selElement.style.textOverflow = "ellipsis";
        selElement.style.whiteSpace = "nowrap";
        selElement.style.width = "35%";
        selElement.style.backgroundColor = "inherit";
        selElement.style.transition = "0.2s";
        this.setHoverListeners(selElement, "rgba(0, 0, 0, 0.2");

        selElement.onfocus = function(){                  //Elimina líneas de contorno al clickar
            this.style.outline = "none";
            this.style.backgroundColor = "rgba(0, 0, 0, 0.2";
        };

        selElement.onblur = function(){
            this.style.backgroundColor = "inherit";
        }
    };


    /*
        14-Marzo-2019
        Estiliza elementos P del calendario
        Argumentos:
            pElement = referencia al elemento P a estilizar
        Void
    */
    this.stylizeP = function(pElement){
        pElement.style.width = "70%";
        pElement.style.marginLeft = "10%";
        pElement.style.padding = "5px";
        pElement.style.borderRadius = "15px";
        pElement.style.backgroundColor = "#016FF2";
        pElement.style.fontSize = "13px";
        pElement.style.transition = "box-shadow 0.1s linear";
        pElement.style.msUserSelect = "none";
        pElement.style.webkitUserSelect = "none";
        pElement.style.userSelect = "none";
    };



    /***************Fin Hojas de estilo***************/


    /*
        13-Marzo-2019
        Lanza constructor del calendario
    */
    this.generateCalendar();
}



/*--------------------------------Utilidades--------------------------------*/



/*
    07-Marzo-2019
    Remueve espacios en blanco de una cadena y devuelve su longitud
    Entradas:
        str = cadena a analizar
    Regresa el tamaño de la cadena de entrada eliminando espacios en blanco
*/
function isEmpty(str){
    return !str.replace(/\s+/, '').length;
}



/*
    10-Marzo-2019
    Regresa el mes según el número dado
    Argumentos:
        month = mes a analizar
    Regresa cadena con el nombre del mes
*/
function getMonthString(month) {
    switch (month) {
        case 1:
        return "Enero";
        case 2:
        return "Febrero";
        case 3:
        return "Marzo";
        case 4:
        return "Abril";
        case 5:
        return "Mayo";
        case 6:
        return "Junio";
        case 7:
        return "Julio";
        case 8:
        return "Agosto";
        case 9:
        return "Septiembre";
        case 10:
        return "Octubre";
        case 11:
        return "Noviembre";
        default:
        return "Diciembre";
    }
}



/*
    10-Marzo-2019
    Regresa el número de mes según la cadena dada
    Argumentos:
        month = cadena del mes a analizar
    Regresa entero con el número del mes
*/
function getMonthNumber(month) {
    switch (month) {
        case "Enero":
            return 1;
        case "Febrero":
            return 2;
        case "Marzo":
            return 3;
        case "Abril":
            return 4;
        case "Mayo":
            return 5;
        case "Junio":
            return 6;
        case "Julio":
            return 7;
        case "Agosto":
            return 8;
        case "Septiembre":
            return 9;
        case "Octubre":
            return 10;
        case "Noviembre":
            return 11;
        default:
            return 12;
    }
}



/*
    25-Febrero-2019
    Busca el día de la semana de la fecha especificada.
    Argumentos:
        year = año de búsqueda
        month = mes de búsqueda
        day = día del mes de búsqueda
    Retorna un número entre 0 y 6 correspondiente al dia de la
    semana que corresponde a la fecha.

*/
function getDayFromYear(year, month, day){
    let days = ( (isLeap(year) ? year - 1 : year) + (Math.floor(year / 4)) + (Math.floor(year / 400)) - (Math.floor(year / 100))) % 7;
    for (i = 1; i < month; i++) {
        days = (days + getDaysOfMonth(year, i)) % 7;
    }

    days = ((days + day + 6) % 7);
    return days;
}



/*
    25-Febrero-2019
    Busca el número de días del mes dependiendo del año y el mes
    Argumentos:
        year = año de búsqueda
        month = mes de búsqueda
    Retorna el número de días del mes y año especificados

*/
function getDaysOfMonth(year, month) {
    if (month < 8){
        if (month % 2 === 1){
            return 31;
        }
        else if (month === 2 && isLeap(year)){
        return 29;
        }
        else if (month === 2){
            return 28;
        }
        else{
            return 30;
        }
    }
    else{
        if (month % 2 === 0){
            return 31;
        }
        else{
            return 30;
        }
    }
}



/*
    25-Febrero-2019
    Analiza si el año es bisiesto o no
    Argumentos:
        year = año a analizar
    Retorna true si el año es bisiesto. De lo contrario, retorna False.

*/
function isLeap(year){
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}



/*
    12-Marzo-2019
    Regresa letra del día de la semana según indice.
    Argumentos:
        day = numero de día a retornar
    Retorna la letra correspondiente al dia i
 */
function getDayLetter(day) {
    switch(day){
        case 0:
            return "D";
        case 1:
            return "L";
        case 2:
            return "M";
        case 3:
            return "X";
        case 4:
            return "J";
        case 5:
            return "V";
        case 6:
            return "S";
        default:
            return "UNDEFINED";
    }
}



/*
    14-Marzo-2019
    Regresa año actual
    Argumentos: ninguno
    Retorna entero con el año actual
 */
function getCurrentYear(){
    return dateElem.getFullYear();
}



/*
    14-Marzo-2019
    Regresa mes actual
    Argumentos: ninguno
    Retorna entero con el número del mes actual
 */
function getCurrentMonth(){
    return dateElem.getMonth() + 1;
}



/*
    14-Marzo-2019
    Regresa día actual
    Argumentos: ninguno
    Retorna entero con la fecha del día actual
 */
function getCurrentDay(){
    return dateElem.getDate();
}