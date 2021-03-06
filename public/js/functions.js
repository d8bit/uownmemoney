
(function() {
    'use strict';
    resetForm('add_expense_form');
})();

function deleteAllExpenses() {

    var response = confirm("Delete ALL expenses?");
    if (true === response) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(this.responseText);
                if ('' !== response.trim()) {
                    logError(response);
                    alertify.error('Expense not added');
                } else {
                    listExpenses();
                    setTotal();
                    alertify.success('Expenses deleted');
                }
            }
        };
        xhttp.open("GET", "deleteAllExpenses", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send();
    }

}

function addExpense() {

    if (!inputsAreValid()) {
        return false;
    }

    let data = serialize('add_expense_form');
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);
            if ('' !== response.trim()) {
                logError(response);
                alertify.error('Expense not added');
            } else {
                listExpenses();
                setTotal();
                alertify.success('Expense added');
                resetForm('add_expense_form');
            }
        }
    };
    xhttp.open("POST", "addExpense", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send(data);

    return false;
}

function resetForm(form_name) {
    let form = document.querySelector('#' + form_name);
    if (null !== form) {
        form.reset();
        setDate();
    }
}

function serialize(form_id) {
    let response = '';
    let text_inputs = document.querySelectorAll('#' + form_id +' input[type=text]');
    text_inputs.forEach(function(element) {
        let name = encodeURI(element.name);
        let value = encodeURI(element.value);
        response += name + '=' + value + '&';
    });
    let number_inputs = document.querySelectorAll('#' + form_id +' input.number');
    number_inputs.forEach(function(element) {
        let name = encodeURI(element.name);
        let value = encodeURI(element.value);
        response += name + '=' + value + '&';
    });
    let date_inputs = document.querySelectorAll('#' + form_id +' input[type=date]');
    date_inputs.forEach(function(element) {
        let name = encodeURI(element.name);
        let value = encodeURI(element.value);
        response += name + '=' + value + '&';
    });
    let check_inputs = document.querySelectorAll('#' + form_id +' input[type=checkbox]:checked');
    check_inputs.forEach(function(element) {
        let name = encodeURI(element.name);
        let value = encodeURI(element.value);
        response += name + '=' + value + '&';
    });
    let select_inputs = document.querySelectorAll('#' + form_id +' select');
    select_inputs.forEach(function(element) {
        let name = encodeURI(element.name);
        let value = encodeURI(element.value);
        response += name + '=' + value + '&';
    });
    let hidden_inputs = document.querySelectorAll('#' + form_id +' input[type=hidden]');
    hidden_inputs.forEach(function(element) {
        let name = encodeURI(element.name);
        let value = encodeURI(element.value);
        response += name + '=' + value + '&';
    });


    return response;
}

function getCurrentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd='0'+dd;
    }

    if (mm < 10) {
        mm='0'+mm;
    }

    today = yyyy+'-'+mm+'-'+dd;
    return today;
}

function listExpenses() {
    let html = '';
    let user_id = document.querySelector('#user_id').value;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if ('' !== this.responseText) {
                let expenses_list = JSON.parse(this.responseText);
                expenses_list.forEach(function (element) {
                    let date = formatDate(element.date);
                    let shared = parseInt(element.shared);

                    html += '<div class="col-xs-12 expense"><div class="col-xs-9">'+element.name+': '+element.amount+' € ('+element.paid_by.name+' '+date.toLocaleString()+')';

                    if (shared === 0) {
                        html += ' - thief!! -';
                    }
                    html += '</div><div class="col-xs-2 deleteButton" onclick="return deleteExpense('+element.id+')">X</div></div>';
                });
                document.querySelector('#expenses').innerHTML = html;
            }
        }
    };

    xhttp.open("GET", "expenses/" + user_id, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
}

function deleteExpense(expense_id) {
    var r = confirm("Are you shure?");
    if (r === true) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(this.responseText);
                if ('' !== response.trim()) {
                    alert(response);
                } else {
                    listExpenses();
                    setTotal();
                }
            }
        };

        xhttp.open("GET", "deleteExpense/" + expense_id, true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send();
    }
}

function setTotal() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if ('' !== this.responseText) {
                let total = JSON.parse(this.responseText);
                let html = total.user + " has a debt of " + total.amount+" €";
                document.querySelector('#total').innerHTML = html;
            }
        }
    };

    xhttp.open("GET", "total", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
}

function formatDate(date) {

    var t = date.split(/[- :]/);

    // Apply each element to the Date function
    var my_date = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);

    // let my_date = new Date(date);
    return my_date.getDate()+'/'+my_date.getMonth()+'/'+my_date.getFullYear();
}

function setDate() {
    var date = document.querySelector('#date');
    if (null !== date) {
        date.value = getCurrentDate();
        document.querySelector('#paid_by').value = document.querySelector('#user_id').value;
    }
}

function viewExpensesDetails() {
    let classList = document.querySelector('#expenses').className;
    if (classList.indexOf('hidden') !== -1) {
        document.querySelector('#expenses').className = 'panel-body';
    } else {
        document.querySelector('#expenses').className = 'panel-body hidden';
    }
}

function logError(message) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if ('' !== this.responseText) {
                console.log(this.responseText);
            }
        }
    };

    let data = '?message=' + encodeURI(message);
    xhttp.open("GET", "log" + data, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send();
}

function inputsAreValid() {
    let description = document.querySelector('#name').value;
    let amount = document.querySelector('#amount').value;
    if ('' === description) {
        alertify.warning('Add a description');
        return false;
    }
    if ('' === amount) {
        alertify.warning('Add an amount');
        return false;
    }
    return true;
}

function mask() {
    // Avoid multiple dots
    document.querySelector('input.number').addEventListener('keydown', function(event) {
        let value = event.target.value;
        let code = event.keyCode;
        if (-1 !== value.indexOf('.') && code === 190) {
            event.preventDefault();
            return false;
        }
    });

    // Allow only numbers and dots
    // Using keypress to avoid not valid characters in mobile devices
    document.querySelector('input.number').addEventListener('keypress', function(event) {
        let code = event.charCode;
        if (isValidKeyCode(code)) {
            return true;
        }
        event.preventDefault();
    });

}

function isValidKeyCode(keyCode) {
    let dotKeyCode = 46;
    if (dotKeyCode === keyCode) {
        return true;
    }
    if (isNumber(keyCode)) {
        return true;
    }
    return false;
}

function isNumber(keyCode) {
    return (keyCode >= 48 && keyCode <=57);
}

window.addEventListener('load', function() {
    document.querySelector('#details').addEventListener('click', function() {
        viewExpensesDetails();
    });
});


listExpenses();
setTotal();
mask();
