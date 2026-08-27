(function(){
 const btn=document.querySelector('.mobile-toggle'), nav=document.querySelector('.nav-links');
 if(btn&&nav){btn.addEventListener('click',()=>nav.classList.toggle('open'));nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')))}
 document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
 const contact=document.querySelector('[data-contact-form]'); if(contact){contact.action=(window.ADVANCED_CONFIG||{}).contactEndpoint||contact.action;}
})();