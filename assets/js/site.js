
(() => {
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const menuBtn = $('#menuButton');
  const mobilePanel = $('#mobilePanel');
  if(menuBtn && mobilePanel){menuBtn.addEventListener('click',()=>{const open=mobilePanel.classList.toggle('open');menuBtn.setAttribute('aria-expanded', String(open));document.body.classList.toggle('no-scroll',open)});$$('a',mobilePanel).forEach(a=>a.addEventListener('click',()=>{mobilePanel.classList.remove('open');document.body.classList.remove('no-scroll');menuBtn.setAttribute('aria-expanded','false')}));}
  $$('.faq-question').forEach(btn=>btn.addEventListener('click',()=>{const item=btn.closest('.faq-item');item.classList.toggle('open');btn.setAttribute('aria-expanded',String(item.classList.contains('open')))}));
  $$('[data-wizard]').forEach(wizard=>{
    const steps=$$('.wizard-step',wizard);let current=0;const progress=$('.wizard-progress span',wizard);
    const show=(n)=>{steps.forEach((s,i)=>s.classList.toggle('active',i===n));current=n;if(progress)progress.style.width=`${((n+1)/steps.length)*100}%`;wizard.scrollIntoView({behavior:'smooth',block:'start'})};
    const validate=()=>{const required=$$('[required]',steps[current]);for(const el of required){if(el.type==='radio'){const named=$$(`input[name="${CSS.escape(el.name)}"]`,steps[current]);if(!named.some(x=>x.checked)){named[0].focus();return false}}else if(!el.checkValidity()){el.reportValidity();return false}}return true};
    $$('[data-next]',wizard).forEach(b=>b.addEventListener('click',()=>{if(validate()&&current<steps.length-1)show(current+1)}));
    $$('[data-back]',wizard).forEach(b=>b.addEventListener('click',()=>{if(current>0)show(current-1)}));show(0);
  });
  const fileToPayload = file => new Promise((resolve,reject)=>{if(!file)return resolve(null);if(file.size>2500000)return reject(new Error('Please upload a file smaller than 2.5 MB.'));const reader=new FileReader();reader.onload=()=>resolve({name:file.name,type:file.type||'application/octet-stream',data:String(reader.result).split(',')[1]});reader.onerror=()=>reject(new Error('We could not read that file.'));reader.readAsDataURL(file)});
  $$('.js-ajax-form').forEach(form=>form.addEventListener('submit',async e=>{e.preventDefault();const submit=$('[type="submit"]',form);const status=$('.form-status',form);if(submit)submit.disabled=true;if(status){status.className='form-status show';status.textContent='Sending…'}try{const fd=new FormData(form);const data={};for(const [k,v] of fd.entries()){if(v instanceof File){if(v.size)data.attachment=await fileToPayload(v)}else if(data[k])data[k]=Array.isArray(data[k])?[...data[k],v]:[data[k],v];else data[k]=v}const res=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const out=await res.json().catch(()=>({}));if(!res.ok)throw new Error(out.message||'Your request could not be sent.');if(status){status.className='form-status show success';status.innerHTML=`Thank you. Your request was sent successfully. Reference: <strong>${out.reference||'AE'}</strong>`}form.reset();form.dispatchEvent(new Event('reset-complete'));}catch(err){if(status){status.className='form-status show error';status.textContent=err.message+' You can also call 508-678-8993 or email mpimentel1363@gmail.com.'}}finally{if(submit)submit.disabled=false}}));
  const langBtns=$$('.lang-switch button');langBtns.forEach(btn=>btn.addEventListener('click',()=>{langBtns.forEach(b=>b.classList.toggle('active',b===btn));$$('.language-panel').forEach(p=>p.classList.toggle('active',p.dataset.lang===btn.dataset.lang))}));
  const uniformForm=$('#uniformForm');if(uniformForm){const calc=()=>{let total=0,items=[];$$('[data-price]',uniformForm).forEach(i=>{const q=Math.max(0,Number(i.value)||0);if(q){total+=q*Number(i.dataset.price);items.push(`${i.dataset.product} ${i.dataset.size}: ${q}`)}});$('#uniformTotal').textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(total);const hidden=$('#uniformSummary');if(hidden)hidden.value=items.join('\n')+`\nEstimated total: $${total.toFixed(2)}`};$$('[data-price]',uniformForm).forEach(i=>i.addEventListener('input',calc));uniformForm.addEventListener('reset-complete',()=>setTimeout(calc));calc()}

  const rushDates=$$('[data-rush-date]');
  const dateOnly=(date)=>new Date(date.getFullYear(),date.getMonth(),date.getDate());
  const rushDetails=(value)=>{
    if(!value)return {charge:'No rush charge indicated',window:'Date not selected',message:'Orders needed 10–15 calendar days from today carry a $50 rush charge. Orders needed in fewer than 10 days carry a $100 rush charge, subject to availability.',state:''};
    const selected=new Date(`${value}T00:00:00`);
    const days=Math.ceil((dateOnly(selected)-dateOnly(new Date()))/86400000);
    if(days<0)return {charge:'Date requires review',window:'Past date selected',message:'Please select a future date. Call 508-678-8993 if the date is urgent.',state:'error'};
    if(days<10)return {charge:'$100 rush charge',window:`${days} day${days===1?'':'s'} from request`,message:'This requested date is fewer than 10 days away. A $100 rush charge applies if the order can be accepted.',state:'active'};
    if(days<=15)return {charge:'$50 rush charge',window:`${days} days from request`,message:'This requested date is 10–15 days away. A $50 rush charge applies if the order can be accepted.',state:'active'};
    return {charge:'No rush charge indicated',window:`${days} days from request`,message:'This date is currently outside the rush-charge window. Final timing is confirmed after the project is reviewed.',state:'clear'};
  };
  rushDates.forEach(input=>{
    const form=input.closest('form');
    const guidance=form?.querySelector('[data-rush-guidance]');
    const charge=form?.querySelector('[data-rush-charge]');
    const windowField=form?.querySelector('[data-rush-window]');
    const update=()=>{const details=rushDetails(input.value);if(guidance){guidance.textContent=details.message;guidance.dataset.state=details.state}if(charge)charge.value=details.charge;if(windowField)windowField.value=details.window};
    input.min=new Date().toISOString().split('T')[0];
    input.addEventListener('change',update);
    input.addEventListener('input',update);
    form?.addEventListener('reset-complete',()=>setTimeout(update));
    update();
  });

  const project = new URLSearchParams(location.search).get('project');
  if(project){
    const map={business:'Business or staff apparel',school:'School or organization',team:'Team or department',event:'Event or personal order',program:'School or organization'};
    const wanted=map[project];
    if(wanted){const radio=[...document.querySelectorAll('input[name="projectType"]')].find(x=>x.value===wanted);if(radio)radio.checked=true;}
  }
  const year=$('#year');if(year)year.textContent=new Date().getFullYear();
})();
