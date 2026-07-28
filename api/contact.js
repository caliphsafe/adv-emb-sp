
const crypto = require('crypto');
const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const flatten = value => Array.isArray(value) ? value.join(', ') : String(value ?? '');
module.exports = async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({message:'Method not allowed.'});
  try{
    const body=req.body||{};
    if(body.website) return res.status(200).json({reference:'AE-'+Date.now().toString().slice(-6)});
    const email=flatten(body.email).trim();
    const first=flatten(body.firstName).trim();
    const formType=flatten(body.formType)||'Website inquiry';
    if(!first||!email||!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({message:'Please provide a valid name and email address.'});
    const apiKey=process.env.RESEND_API_KEY;
    const to=process.env.CONTACT_TO_EMAIL||'mpimentel1363@gmail.com';
    const from=process.env.CONTACT_FROM_EMAIL||'Advanced Embroidery Website <onboarding@resend.dev>';
    if(!apiKey) return res.status(503).json({message:'The website email service has not been configured yet.'});
    const ignored=new Set(['attachment','website']);
    const rows=Object.entries(body).filter(([k,v])=>!ignored.has(k)&&flatten(v).trim()).map(([k,v])=>`<tr><th style="text-align:left;padding:8px 12px;border-bottom:1px solid #ddd;vertical-align:top">${escapeHtml(k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()))}</th><td style="padding:8px 12px;border-bottom:1px solid #ddd">${escapeHtml(flatten(v)).replace(/\n/g,'<br>')}</td></tr>`).join('');
    const reference='AE-'+crypto.randomBytes(3).toString('hex').toUpperCase();
    const payload={from,to:[to],reply_to:email,subject:`${formType} · ${first} ${flatten(body.lastName)} · ${reference}`,html:`<div style="font-family:Arial,sans-serif;color:#17202a"><h1 style="color:#0b2038">${escapeHtml(formType)}</h1><p>New website submission. Reference <strong>${reference}</strong>.</p><table style="border-collapse:collapse;width:100%">${rows}</table></div>`};
    if(body.attachment?.data&&body.attachment?.name){payload.attachments=[{filename:String(body.attachment.name).replace(/[^a-zA-Z0-9._-]/g,'_'),content:body.attachment.data}]}
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.message||'Email provider rejected the request.');
    return res.status(200).json({ok:true,reference});
  }catch(error){console.error(error);return res.status(500).json({message:'We could not send your request right now.'});}
}
