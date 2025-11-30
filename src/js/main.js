import { Popover } from 'bootstrap';

document.querySelectorAll('[data-bs-toggle="dropdown"]')
  .forEach(popover => {
    new Popover(popover)
  })
    

import Keycloak from 'keycloak-js';

function setup_keycloak(config) {
    const keycloak = new Keycloak(config);


    if (config['acr'] != undefined) {
        setup_acr(config['acr'], keycloak);
    }
    document.querySelectorAll('[data-ks-call]')
        .forEach(b => { b.onclick = function () { keycloak[b.dataset.ksCall]() } });

    keycloak.onReady = update_ui;
    keycloak.onAuthSuccess = update_ui;
    keycloak.onAuthLogout = update_ui;
    keycloak.onActionUpdate = update_ui;
    keycloak.onAuthError = update_ui;
    keycloak.onAuthRefreshError = update_ui;
    keycloak.onAuthRefreshSuccess = update_ui;
    keycloak.onTokenExpired = keycloak.updateToken;

    keycloak.init({
        onLoad: 'check-sso'
    }).then((authenticated) => {
        if (authenticated) {
            console.log('User is authenticated');
        } else {
            console.log('User is not authenticated');
        }
    });
}

function setup_acr(acrs, keycloak) {
    document.querySelectorAll('[data-ks-toggle="acr"]')
        .forEach(i => { i.classList.remove('d-none') });

    let list = document.querySelector('[data-ks-acr="list"]');
    let template = list.children[0];
    acrs.forEach(acr => {
        let node = template.cloneNode(true);
        node.querySelectorAll('[data-ks-acr="replace"]').forEach(b => {
            b.innerHTML = "ACR: " + acr;
            b.onclick = (e) => {
                keycloak.login({acr: { values: [acr], essential: true }});
            }
        });
        
        list.appendChild(node);
    });
    template.remove();
}

function update_ui() {

    if (this.authenticated) {
        document.body.classList.add('kc-authenticated')
    } else  {
        document.body.classList.remove('kc-authenticated')
    }

    document.querySelectorAll('[data-ks-update]')
        .forEach(b => { b.innerHTML = JSON.stringify(this[b.dataset.ksUpdate], null, 2); });
    document.querySelectorAll('[data-ks-acr="state"]')
        .forEach(b => { b.innerHTML = "ACR: " + this.tokenParsed.acr });
}

fetch("/keycloak.json").then((resp) => {
    return resp.json()
}).then(setup_keycloak);

