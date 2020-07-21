const template = document.createElement('template');
template.innerHTML = ` <h2 class='x'>NAME</h2>  
<div><slot name="testslot" /></div>
<div> <slot /></div>`

class TestWC extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.querySelector('h2.x').innerText = this.getAttribute('name');

    }

    connectedCallback() {

    }
}

window.customElements.define('test-wc', TestWC);