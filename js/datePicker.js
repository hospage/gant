


/*
    29-Marzo-2019
    función utilizada como generador del calendario.
    (Asignar solamente a elementos Input)
    Argumentos:
        inputElem = Input de entrada a asignar el elemento calendario
    Void
*/
function generateCalendar(inputElem){
    let divVar = document.createElement("div");
    inputElem.parentNode.replaceChild(divVar, inputElem);
    divVar.appendChild(inputElem);

    let cal = new Calendar(inputElem.value);
    inputElem.parentNode.insertBefore(cal.getCalendarReference(), inputElem.nextSibling);
    cal.setInputEvent();
    cal.getCalendarReference().style.display = "inline-table";
    cal.getCalendarReference().style.backgroundPosition = inputElem.style.backgroundPosition;

}

/*
    13-Marzo-2019
    Objeto Calendar que describe el módulo del calendario
    Atributos:
        const ADD_YEAR = número de años a sumar al año actual para definir el límite superior de años del Select
        _calendarReference = referencia al elemento Calendario dentro del objeto
        _yearPicker = referencia al elemento Select para seleccionar el año en el calendario
        _monthTh = referencia al elemento th que contiene al mes seleccionado
        _date = cadena que contiene la fecha del último dia al que se le hizo click
        _reminderArray = arreglo conteniendo recordatorios agregados.
                        {diaDeRecordatorio, mesDeRecordatorio, añoDeRecordatorio, recordatorio}
*/
let Calendar = (function(){
    const ADD_YEAR = 30;     //Límite de años superior a agregar al selector de año

    let _calendarReference = new WeakMap();
    let _yearPicker = new WeakMap();
    let _monthTh = new WeakMap();
    let _date = new WeakMap();
    let _reminderArray = new WeakMap();

    class Calendar {
        constructor(inputString) {
            _reminderArray.set(this, []);

            let calendar = Calendar.createTable();
            calendar.className = "datePicker";
            calendar.appendChild(this.createThead());
            calendar.appendChild(this.createTbody());
            _calendarReference.set(this, calendar);
            this.setClickOutsideCalendar();
            if(inputString !== ""){
                this.updateCalendar(
                    Number.parseInt(inputString.split("/")[2]),
                    DateUtilities.getMonthNumber(inputString.split("/")[1])
                )
            }
            else{
                this.updateCalendar(DateUtilities.getCurrentYear(), DateUtilities.getCurrentMonth());
            }
        }

        /*
            28-Marzo-2019
            Regresa el valor del atributo _date
            Argumentos: ninguno
            retorna String
        */
        getDate(){
            return _date.get(this);
        }

        /*
            13-Marzo-2019
            Retorna referencia del calendario
            Argumentos: ninguno
            Retorna elemento calendario
        */
        getCalendarReference(){
            return _calendarReference.get(this);
        };

        /*
            13-Marzo-2019
            Retorna arreglo de recordatorios
            Argumentos: ninguno
            Retorna atributo reminderArray
        */
        getReminderArray(){
            return _reminderArray.get(this);
        };

        /*
            13-Marzo-2019
            Regresa index del año actual dentro del picker
            Argumentos: ninguno
            Retorna entero del año actual
        */
        static getIndexYear(year){
            return DateUtilities.getCurrentYear() + ADD_YEAR - year;
        };

        /*
            29-Marzo-2019
            Selecciona el año ingresado en el select del año en el calendario
            Argumentos:
                year = Año a seleccionar
            Void
        */
        setSelectedYear(year){
            this.getYearPicker().selectedIndex = Calendar.getIndexYear(year);
        }

        /*
            13-Marzo-2019
            Regresa referencia del Th que contiene al mes
            Argumentos: ninguno
            Retorna elemento Th
        */
        getMonthTh(){
            return _monthTh.get(this);
        };

        /*
            28-Marzo-2019
            Modifica el atributo Date del objeto Calendar
            Argumentos:
                newDate = valor nuevo para el atributo
            Void
        */
        setDate(newDate){
            _date.set(this, newDate);
        };

        /*
            28-Marzo-2019
            Modifica la referencia al Th que contiene el mes del calendario
            Argumentos:
                newTh = nueva referencia para el atributo _setMonthTh
            Void
        */
        setMonthTh(newTh){
            _monthTh.set(this, newTh);
        }

        /*
            28-Marzo-2019
            Modifica la referencia al select que contiene el año del calendario
            Argumentos:
                newSel = nueva referencia para el atributo _yearPicker
            Void
        */
        setYearPicker(newSel){
            _yearPicker.set(this, newSel);
        }

        /*
            11-Marzo-2019
            Crea elemento th y retorna su referencia.
            Argumentos:
                colspan = numero de columnas a abarcar
                isDays = indica si el Th es el encabezado de días o no
            Retorna elemento th
        */
        static createTh(colspan, isDays = false, innerHtml = ""){
            let thVar = document.createElement("th");
            thVar.setAttribute("colspan", colspan);
            Calendar.stylizeTh(thVar);

            if (isDays) {
                Calendar.stylizeThDays(thVar);
            }
            if (innerHtml !== ""){
                thVar.appendChild(document.createTextNode(innerHtml));
            }

            return thVar;
        };

        /*
        13-Marzo-2019
        Agrega el valor de entrada al atributo _reminderArray
        Argumentos:
            value = valor de entrada a agregar
        Void
        */
        pushValueReminder(value){
            _reminderArray.get(this).push(value);
        };

        /*
           13-Marzo-2019
           Elimina el índice ingresado del arreglo _reminderArray
           Argumentos:
               index = índice del valor a eliminar
           Void
        */
        popValueReminder(index){
            _reminderArray.get(this).splice(index, 1);
        };

        /*
           13-Marzo-2019
           Busca el recordatorio ingresado dentro del arreglo _reminderArray y devuelve su índice
           Argumentos:
               reminder = valor recordatorio a buscar
           Si el recordatorio se encuentra dentro del arreglo, retorna índice del recordatorio ingresado;
           sino, retorna -1
        */
        getIndexOfReminder(reminder){
            for (let i = 0, arr = this.getReminderArray(); i < arr.length; i++) {
                if (arr[i][0] === reminder[0] && arr[i][1] === reminder[1]
                    && arr[i][2] === reminder[2] && arr[i][3] === reminder[3]){
                    return i;
                }
            }
            return -1;
        };

        /*
            13-Marzo-2019
            Busca año actual seleccionado
            Argumentos: ninguno
            Retorna año seleccionado en el picker
        */
        getSelectedYear(){
            return DateUtilities.getCurrentYear() + ADD_YEAR - this.getYearPicker().selectedIndex;
        };

        /*
            11-Marzo-2019
            Actualiza calendario
            Argumentos:
                year = año a actualizar
                month = mes a actualizar
            Void
        */
        updateCalendar(year, month){
            this.setSelectedYear(year);
            this.getCalendarReference().rows[1].cells[1].innerHTML = DateUtilities.getMonthString(month);
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
        clearTd(){
            for (let i = 3; i < 9; i++) {
                for (let j = 0; j < 7; j++) {
                    this.getCalendarReference().rows[i].cells[j].innerHTML = "";
                }
            }
        };

        /*
            29-Marzo-2019
            Detecta si el botón presionado en el evento es el click izquierdo
            Argumentos:
                event = evento a analiza
             Retorna true si se presionó el click izquierdo. En caso contrario, retorna false.
        */
        static detectLeftButton(event) {
            if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
                return false;
            } else if ('buttons' in event) {
                return event.buttons === 1;
            } else if ('which' in event) {
                return event.which === 1;
            } else {
                return (event.button === 1 || event.type ===  'click');
            }
        }

        /*
            13-Marzo-2019
            Oculta filas vacías
            Argumentos: ninguno
            Void
        */
        hideUnusedTr(){
            let cal = this.getCalendarReference();
            if(cal.rows[8].cells[0].innerHTML === ""){
                cal.rows[8].style.display = "none";
            }
            else {
                cal.rows[8].style.display = "contents";
            }
        };

        /*
            11-Marzo-2019
            Crea tabla y estilo de tabla
            Argumentos: ninguno
            Retorna elemento tabla
        */
        static createTable(){
            let calendario = document.createElement("table");

            //Estilización del calendario.
            Calendar.stylizeTable(calendario);

            calendario.className = "datePicker";
            return calendario;
        };

        /*
            11-Marzo-2019
            Crea elemento thead y retorna su referencia.
            Argumentos: ninguno
            Retorna elemento thead
        */
        createThead(){
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
        createTbody(){
            let tbody = document.createElement("tbody");
            for (let i = 0; i < 6; i++) {
                tbody.appendChild(this.createTr("date"));
            }
            return tbody;
        };

        /*
            12-Marzo-2019
            Crea elemento td y retorna su referencia
            Argumentos: ninguno
            Retorna elemento td
        */
        static createTd(){
            let tdVar = document.createElement("td");
            Calendar.stylizeTd(tdVar);
            return tdVar;
        };

        /*
            11-Marzo-2019
            Crea elemento a y retorna su referencia
            Argumentos: ninguno
            Retorna elemento a
        */
        createA(text, href, className){
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
        createP(str){
            let pSaver = document.createElement("p");
            pSaver.appendChild(document.createTextNode(str));
            Calendar.stylizeP(pSaver);
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
        refreshReminders(){
            this.getReminderArray().forEach(element =>{
                let month, year;
                if(DateUtilities.getMonthNumber(element[1]) === (month = DateUtilities.getMonthNumber(this.getMonthTh().innerHTML)) &&
                    element[2] === (year = this.getSelectedYear())){
                    let text = this.createP(element[3]);
                    let row = 3 + Math.floor((parseInt(element[0]) + DateUtilities.getDayFromYear(year, month, 1) - 1)/7);
                    let cell = DateUtilities.getDayFromYear(year, month, parseInt(element[0]));

                    this.getCalendarReference().rows[row].cells[cell].appendChild(text);
                }
            })
        };

        /*
            28-Marzo-2019
            Retorna el atributo _yearPicker del objeto
            Argumentos: ninguno
            Retorna elemento Select
        */
        getYearPicker(){
            return _yearPicker.get(this);
        }

        /*
            13-Marzo-2019
            Llena las celdas del calendario dependiendo del año y mes
            Argumentos:
                year = año de entrada
                month = día de entrada
            Void
        */
        fillTd(year, month){
            let tdVar;
            for(let i = 3, j = DateUtilities.getDayFromYear(year, month, 1), k = 1; k <= DateUtilities.getDaysOfMonth(year, month);){
                tdVar = this.getCalendarReference().rows[i].cells[j];
                if(this.getSelectedYear() === DateUtilities.getCurrentYear() && this.getMonthTh().innerHTML === DateUtilities.getMonthString(DateUtilities.getCurrentMonth())
                    && k === DateUtilities.getCurrentDay()){
                    let divVar = document.createElement("div");
                    Calendar.stylizeCurrentDate(divVar);
                    divVar.appendChild(document.createTextNode("" + k));
                    tdVar.appendChild(divVar);
                }
                else{
                    tdVar.innerHTML = "" + k;
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
        updateListenersTd(){
            let tdVar;
            for (let i = 3; i < 9; i++) {
                for (let j = 0; j < 7; j++) {
                    tdVar = this.getCalendarReference().rows[i].cells[j];
                    if(tdVar.innerText !== ""){
                        this.setHoverListeners(tdVar, "#595959");
                        this.setClickChange(tdVar);
                    }
                    else{
                        let elClone = tdVar.cloneNode(false);
                        tdVar.parentNode.replaceChild(elClone, tdVar);
                    }
                }
            }
        };

        /*
        11-Marzo-2019
        Crea elemento tr según el tipo de fila a crear.
        Argumentos:
                type = tipo de tr a crear ["year", "month", "days", "date", other]
        Retorna elemento tr
    */
        createTr(type){
            let trVar = document.createElement("tr");
            switch (type) {
                //Asigna nodos hijos a la fila del año del calendario
                case "year":
                    trVar.style.backgroundColor = "#3A4043";
                    trVar.appendChild(Calendar.createTh(7).appendChild(this.createSel()).parentNode);
                    this.setInputChange();
                    break;
                //Asigna nodos hijos a la fila del mes del calendario
                case "month":
                    trVar.style.backgroundColor = "#2E323F";
                    trVar.appendChild(Calendar.createTh(1).appendChild(this.createA("&lt;", "javascript:", "left")).parentNode);
                    this.setMonthTh(trVar.appendChild(Calendar.createTh(5)));
                    trVar.appendChild(Calendar.createTh(1).appendChild(this.createA("&gt;", "javascript:", "right")).parentNode);
                    break;
                //Asigna nodos hijos a la fila de los días de la semana del calendario
                case "days":
                    trVar.style.backgroundColor = "#2E323F";
                    for (let i = 0; i < 7; i++) {
                        trVar.appendChild(Calendar.createTh(1, true, DateUtilities.getDayLetter(i)));
                    }
                    break;
                //Asigna celdas de fecha al Tbody del calendario
                case "date":
                    trVar = document.createElement("tr");
                    for (let i = 0; i < 7; i++) {
                        trVar.appendChild(Calendar.createTd());
                    }
                    break;
                default:
                    return document.createElement("tr");
            }
            return trVar;
        };

        /*
            11-Marzo-2019
            Asigna listener para cambiar el color de elemento onHover
            Argumentos:
                element = elemento a asignar el Listener;
                color = color de cambio;
            Void
        */
        setHoverListeners(element, color){
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
                        Calendar.stylizeInput(inputSaver);
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
        setInputDate(){
            this.getCalendarReference().previousElementSibling.value = this.getDate();
        };

        /*
            13-Marzo-2019
            Agrega eventos de click al input asociado con el calendario
            Argumentos: ninguno
            Void
        */
        setInputEvent(){
            let object = this;
            this.getCalendarReference().previousElementSibling.onclick = function() {
                object.getCalendarReference().style.display = "inline-table";
            }
        };

        /*
            13-Marzo-2019
            Agrega eventos de click al input para agregar recordatorios
            Argumentos:
                inputElement = elemento al que se desean agregar los eventos
            Void
        */
        setInputReminderEvent(inputElement){
            let object = this;
            inputElement.addEventListener("keyup", function (event) {
                if (event.key === "Enter"){
                    if(document.activeElement === this){
                        if (this.value.replace(/\s+/, '').length) {
                            let textVar = object.createP(this.value);
                            this.parentNode.replaceChild(textVar, this);
                            let auxVar = textVar.parentNode.childNodes[0];
                            object.pushValueReminder([
                                auxVar.tagName === "DIV" ? auxVar.innerText : auxVar.nodeValue,
                                object.getMonthTh().innerText,
                                object.getSelectedYear(), textVar.innerText
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
        setTextReminderEvent(textElement){

            let arr = this.getCalendarReference().getElementsByTagName("p");

            /*
                Agrega habilitador de borrado al hacer click sobre el recordatorio
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
            19-Marzo-2019
            Agrega opciones de editar y borrar recordatorios en el calendario
            Argumentos:
            textElement = Elemento a asignar el evento
            Void
        */
        setEditDeleteP(textElement){
            let object = this;

            textElement.addEventListener("dblclick", function(){
                if (this.style.boxShadow === "red 0px 0px 0px 3px"){
                    let index = object.getIndexOfReminder([
                        this.parentNode.childNodes[0].nodeValue,
                        object.getMonthTh().innerText,
                        object.getSelectedYear(), this.innerText
                    ]);
                    this.parentNode.removeChild(this);
                    object.popValueReminder(index);
                }
                else{
                    let index = object.getIndexOfReminder([
                        this.parentNode.childNodes[0].nodeValue,
                        object.getMonthTh().innerText,
                        object.getSelectedYear(), this.innerText
                    ]);
                    let inputSaver = document.createElement("input");
                    object.popValueReminder(index);
                    Calendar.stylizeInput(inputSaver);
                    inputSaver.value = this.innerText;
                    object.setInputReminderEvent(inputSaver);
                    this.parentNode.replaceChild(inputSaver, this);
                }
            })

        };

        /*
            11-Marzo-2019
            Crea elemento select y retorna su referencia
            Argumentos: ninguno
            Retorna elemento select
        */
        createSel(){
            let selectBox, options;

            //Creación y asignación de estilo de la caja de selección de año
            selectBox = document.createElement("select");
            selectBox.name = "birth-year";
            selectBox.className = "yearSelection";
            this.stylizeSel(selectBox);

            //Eventos del mouse para cambiar el estilo de la caja de selección

            //Adjunta las posibles opciones de la caja de selección del año
            for(let i = DateUtilities.getCurrentYear() + ADD_YEAR; i !== 1950; i--){
                options = document.createElement("option");
                options.value = options.innerHTML = "" + i;
                if (i === DateUtilities.getCurrentYear()){
                    options.setAttribute("selected", null);
                }
                options.style.color = "black";
                selectBox.appendChild(options);
            }
            this.setYearPicker(selectBox);

            return selectBox;
        };

        /*
            13-Marzo-2019
            Agrega listener para detectar cambio de año en el input y actualiza el calendario en dicho caso
            Argumentos: ninguno
            Void
        */
        setInputChange(){
            let object = this;
            this.getYearPicker().addEventListener("change", function(){
                object.updateCalendar(object.getSelectedYear(), DateUtilities.getMonthNumber(object.getMonthTh().innerHTML));
            })
        };

        /*
            11-Marzo-2019
            Asigna listeners onMouseDown y onMouseUp a diversos elementos del calendario
            Argumentos:
                element = elemento a asignar;
                color = color de cambio al hacer click;
            Void
        */
        setClickChange(element, color = ""){
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
            29-Marzo-2019
            Elimina el calendario al hacer click fuera de éste
            Argumentos: Ninguno
            Void
        */
        setClickOutsideCalendar(){
            let object = this;
            document.onmousedown = function(event){
                let element = event.target;
                if (!document.body.contains(object.getCalendarReference())){
                    return
                }
                if(element.closest("table") !== object.getCalendarReference()){
                    object.deleteCalendarFromDom();
                }
            }
        }

        /*
            13-Marzo-2019
            Agrega Listener a elemento A con className "left" para cambio de mes en el calendario
            Argumentos:
                element = elemento a asignar el Listener
                color = cambio de color al hacer click
            Void
        */
        changeLeftMonth(element, color){
            let object = this;
            element.addEventListener("mousedown", function(){
                let year = object.getSelectedYear();
                let month = DateUtilities.getMonthNumber(object.getMonthTh().innerHTML);
                if(month === 0)
                    year--;
                month = --month % 12;
                object.setSelectedYear(year);
                object.updateCalendar(year, month);
                this.style.backgroundColor = color;
            });
        };

        /*
            13-Marzo-2019
            Agregar Listener a elemento A con className "right" para cambio de mes en el calendario
            Argumentos:
                element = elemento a asignar el Listener
                color = cambio de color al hacer click
            Void
        */
        changeRightMonth(element, color){
            let object = this;
            element.addEventListener("mousedown", function(){
                let year = object.getSelectedYear();
                let month = DateUtilities.getMonthNumber(object.getMonthTh().innerHTML);
                if (month === 11)
                    year++;
                month = ++month % 12;
                object.setSelectedYear(year);
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
        getDateFromClick(element){
            let object = this;
            element.onmousedown = function (event) {
                if ((event.target !== this && event.target.tagName !== "DIV") || !Calendar.detectLeftButton(event))
                    return;
                let auxVar = element.childNodes[0];
                object.setDate((auxVar.tagName === "DIV" ? auxVar.innerText : auxVar.nodeValue) +
                    "/" + object.getMonthTh().innerHTML + "/" + object.getSelectedYear());
                object.setInputDate();
                object.deleteCalendarFromDom();
            }
        };

        deleteCalendarFromDom(){
            let cal = this.getCalendarReference();
            let inputX = cal.previousElementSibling;
            inputX.onclick = function(){
                generateCalendar(inputX);
            };
            cal.parentNode.removeChild(cal);
            inputX.parentNode.parentNode.replaceChild(inputX, inputX.parentNode);
        }

        /*********************************************  Hojas de estilo  *********************************************/

        static stylizeThDays(inputTh){
            inputTh.style.height = "38px";
            inputTh.style.fontSize = "13px";
        }

        static stylizeTh(thElement){
            thElement.style.fontSize = "15px";
            thElement.style.color = "white";
            thElement.style.msUserSelect = "none";
            thElement.style.webkitUserSelect = "none";
            thElement.style.userSelect = "none";
        };

        /*
            13-Marzo-2019
            Estiliza Tabla que contiene el calendario
            Argumentos:
                tableElement = referencia al elemento Table a estilizar
            Void
        */
        static stylizeTable(tableElement){
            tableElement.style.position = "absolute";
            tableElement.style.display = "none";
            tableElement.style.tableLayout = "fixed";
            tableElement.style.width = "280px";
            tableElement.style.height = "auto";
            tableElement.style.borderRadius = "15px";
            tableElement.style.borderCollapse = "collapse";
            tableElement.style.backgroundColor = "transparent";
            tableElement.style.fontFamily = "'Overpass', sans-serif";
        };

        /*
            13-Marzo-2019
            Estiliza elementos Td del calendario
            Argumentos:
                tdElement = referencia al elemento Td a estilizar
            Void
        */
        static stylizeTd(tdElement){
            tdElement.style.padding = "0.5em 0";
            tdElement.style.height = "20px";
            tdElement.style.fontSize = "12px";
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
        static stylizeCurrentDate(divElement){
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
            14-Marzo-2019
            Estiliza elementos Input dentro del calendario
            Argumentos:
                inputElement = referencia al elemento input a estilizar
            Void
        */
        static stylizeInput(inputElement) {
            inputElement.style.height = "6px";
            inputElement.style.margin = "0.4em auto";
            inputElement.style.width = "80%";
            inputElement.style.textAlign = "center";
            inputElement.style.padding = "2px";
            inputElement.style.borderRadius = "10px";
            inputElement.style.fontSize = "6px";
            inputElement.style.backgroundColor = "rgb(150, 150, 150)";
            inputElement.style.border = "0px none";
            inputElement.style.transition = "0.4s";
            inputElement.style.display = "block";
        };

        /*
            14-Marzo-2019
            Estiliza elementos P del calendario
            Argumentos:
                pElement = referencia al elemento P a estilizar
            Void
        */
        static stylizeP(pElement){
            pElement.style.height = "6px";
            pElement.style.margin = "0% auto";
            pElement.style.marginTop = "0.4em";
            pElement.style.width = "80%";
            pElement.style.textAlign = "center";
            pElement.style.padding = "2px";
            pElement.style.borderRadius = "10px";
            pElement.style.fontSize = "6px";
            pElement.style.backgroundColor = "#016FF2";
            pElement.style.transition = "box-shadow 0.1s linear";
            pElement.style.msUserSelect = "none";
            pElement.style.webkitUserSelect = "none";
            pElement.style.userSelect = "none";
        };

        /*
            13-Marzo-2019
            Estiliza elementos Select del calendario
            Argumentos:
                selElement = referencia al elemento Select a estilizar
            Void
        */
        stylizeSel(selElement){
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
            selElement.style.margin = "10px";
            selElement.style.overflow = "hidden";
            selElement.style.padding = "1px 10px 5px 5px";
            selElement.style.textOverflow = "ellipsis";
            selElement.style.whiteSpace = "nowrap";
            selElement.style.width = "35%";
            selElement.style.backgroundColor = "inherit";
            selElement.style.transition = "0.2s";
            this.setHoverListeners(selElement, "rgba(0, 0, 0, 0.2");

            selElement.onfocus = function(){                  //Elimina líneas de contorno al hacer click
                this.style.outline = "none";
                this.style.backgroundColor = "rgba(0, 0, 0, 0.2";
            };

            selElement.onblur = function(){
                this.style.backgroundColor = "inherit";
            }
        };

        /*
            13-Marzo-2019
            Estiliza elementos A del calendario
            Argumentos:
                aElement = referencia al elemento A a estilizar
            Void
        */
        stylizeA(aElement){
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


            aElement.onfocus = function(){                  //Elimina líneas de contorno al hacer click
                this.style.outline = "none";
                this.style.backgroundColor = "rgb(90, 90, 90)";
            };
            aElement.onblur = function(){
                this.style.backgroundColor = "#016FF2";
            }
        };

        /*******************************************  Fin Hojas de estilo  *******************************************/
    }

    return Calendar;
})();



/*
+
    Objeto DateUtilities utilizado para organizar las funciones de fecha necesarias dentro del objeto Calendar
    Atributos:
        (static) dateElem: Objeto Date que obtiene la fecha actual
*/
class DateUtilities {


    static get dateElem(){
        return new Date();
    }

    /*
        10-Marzo-2019
        Regresa el mes según el número dado
        Argumentos:
            month = mes a analizar
        Regresa cadena con el nombre del mes
    */
    static getMonthString(month) {
        switch (month) {
            case 0:
                return "Enero";
            case 1:
                return "Febrero";
            case 2:
                return "Marzo";
            case 3:
                return "Abril";
            case 4:
                return "Mayo";
            case 5:
                return "Junio";
            case 6:
                return "Julio";
            case 7:
                return "Agosto";
            case 8:
                return "Septiembre";
            case 9:
                return "Octubre";
            case 10:
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
    static getMonthNumber(month) {
        switch (month) {
            case "Enero":
                return 0;
            case "Febrero":
                return 1;
            case "Marzo":
                return 2;
            case "Abril":
                return 3;
            case "Mayo":
                return 4;
            case "Junio":
                return 5;
            case "Julio":
                return 6;
            case "Agosto":
                return 7;
            case "Septiembre":
                return 8;
            case "Octubre":
                return 9;
            case "Noviembre":
                return 10;
            default:
                return 11;
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
    static getDayFromYear(year, month, day){
        let days = ( (DateUtilities.isLeap(year) ? year - 1 : year) + (Math.floor(year / 4)) + (Math.floor(year / 400)) - (Math.floor(year / 100))) % 7;
        for (let i = 1; i < month; i++) {
            days = (days + DateUtilities.getDaysOfMonth(year, i)) % 7;
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
   static getDaysOfMonth(year, month) {
        if (month < 7){
            if (month % 2 === 0){
                return 31;
            }
            else if (month === 1 && DateUtilities.isLeap(year)){
                return 29;
            }
            else if (month === 1){
                return 28;
            }
            else{
                return 30;
            }
        }
        else{
            if (month % 2 === 1){
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
   static isLeap(year){
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }



    /*
        12-Marzo-2019
        Regresa letra del día de la semana según el índice.
        Argumentos:
            day = numero de día a retornar
        Retorna la letra correspondiente al dia i
     */
    static getDayLetter(day) {
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
    static getCurrentYear(){
        return DateUtilities.dateElem.getFullYear();
    }



    /*
        14-Marzo-2019
        Regresa mes actual
        Argumentos: ninguno
        Retorna entero con el número del mes actual
     */
    static getCurrentMonth(){
        return DateUtilities.dateElem.getMonth();
    }



    /*
        14-Marzo-2019
        Regresa día actual
        Argumentos: ninguno
        Retorna entero con la fecha del día actual
     */
    static getCurrentDay(){
        return DateUtilities.dateElem.getDate();
    }

    /*
        31-Marzo-2019
        Convierte cadena de entrada en objeto Date
        Argumentos:
            dateString = fecha en formato DD/Month/YYYY
        Retorna elemento Date
    */
    static parseDate(dateString){
        return new Date(
            parseInt(dateString.split("/")[2]),
            DateUtilities.getMonthNumber(dateString.split("/")[1]),
            parseInt(dateString.split("/")[0])
        )
    }

}
