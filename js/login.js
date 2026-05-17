function changeForm(form1, form2) {
    let nodisplay = document.getElementById(form1);
    let display = document.getElementById(form2);
    nodisplay.classList.add('d-none');
    display.classList.remove('d-none');
    checkActualForm(form1, form2);
}

function checkActualForm(form1, form2) {
    if (form2 == 'login') {
        document.getElementById('signup-btn').classList.remove('d-none');
    } else {
        document.getElementById('signup-btn').classList.add('d-none');
    }
}