class Footer extends HTMLElement {
    constructor() {
        super();
    };

    connectedCallback() {
        this.innerHTML = `
        <div class="footer">
        <label class="switchlabel" for="switch">Theme</label>
        <label id="switch" class="switch">
        <input id="checkbox" type="checkbox">
        <span class="slider round"></span>
        </label>
        </div>
        `;
    }
}

customElements.define('footer-component', Footer);

const slider = document.getElementById('checkbox');
if (sessionStorage.getItem('theme') === 'dark'){
    slider.checked = true;
}

slider.addEventListener('click', (e) => {
    const theme = document.getElementById('theme');
    if (slider.checked){
        theme.setAttribute('href', 'dark.css');
        sessionStorage.setItem('theme','dark');
    }
    else{
        theme.setAttribute('href', 'light.css');
        sessionStorage.setItem('theme','light');
    }
})