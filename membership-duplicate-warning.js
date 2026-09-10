(function(){
'use strict';

var SUPABASE_URL='https://hwtkplolyunhuhjdqacb.supabase.co';
var SUPABASE_KEY='sb_publishable_h6Z7EK1Axb8cdH9lVxZsgw_-BEPyEXY';
var form=document.getElementById('memberForm');
var submitBtn=document.getElementById('submitBtn');
var statusBox=document.getElementById('statusBox');

if(!form||!submitBtn||form.dataset.duplicateGuard==='1')return;
form.dataset.duplicateGuard='1';

var bypassOnce=false;
var checking=false;
var forwarded=false;

var style=document.createElement('style');
style.textContent='\
#duplicateWarning{display:none;margin:14px 0 0;padding:15px;border-radius:12px;background:#fff4d6;border:2px solid #e2a600;color:#5b3b00;line-height:1.5}\
#duplicateWarning.show{display:block}\
#duplicateWarning strong{color:#7a3500}\
#duplicateWarning .duplicate-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}\
#duplicateWarning button{width:100%;padding:12px;border:0;border-radius:10px;font-weight:800;cursor:pointer}\
#duplicateWarning .duplicate-edit{background:#fff;color:#6b4600;border:1px solid #d8a62d}\
#duplicateWarning .duplicate-submit{background:#b42318;color:#fff}\
#duplicateWarning .duplicate-meta{margin-top:8px;padding:9px 11px;background:rgba(255,255,255,.72);border-radius:8px;font-size:13px}\
@media(max-width:600px){#duplicateWarning .duplicate-actions{grid-template-columns:1fr}}';
document.head.appendChild(style);

var warning=document.createElement('div');
warning.id='duplicateWarning';
warning.setAttribute('role','alert');
warning.setAttribute('aria-live','assertive');
if(statusBox&&statusBox.parentNode){statusBox.parentNode.insertBefore(warning,statusBox);}else{form.appendChild(warning);}

function val(id){
 var el=document.getElementById(id);
 return el?el.value.trim():'';
}

function escapeHtml(value){
 return String(value||'').replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch];});
}

function statusLabel(value){
 var status=String(value||'').toLowerCase();
 if(status==='pending')return 'PENDING';
 if(status==='needs_info')return 'NEEDS INFO';
 if(status==='approved')return 'APPROVED';
 if(status==='rejected')return 'REJECTED';
 return String(value||'UNKNOWN').toUpperCase();
}

function reasonLabel(value){
 if(value==='same_member_id')return 'the same existing Member ID';
 if(value==='same_name_and_mobile')return 'the same full name and mobile number';
 if(value==='same_name_and_email')return 'the same full name and email address';
 return 'matching application details';
}

function formatDate(value){
 if(!value)return 'Unknown date';
 var date=new Date(value);
 if(isNaN(date.getTime()))return String(value);
 return date.toLocaleString('en-PH',{year:'numeric',month:'short',day:'2-digit',hour:'numeric',minute:'2-digit'});
}

function hideWarning(){
 warning.className='';
 warning.innerHTML='';
}

function forwardSubmission(){
 bypassOnce=true;
 hideWarning();
 if(typeof form.requestSubmit==='function')form.requestSubmit();
 else form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
}

function showDuplicate(match){
 var ref=escapeHtml(match.reference_no||'Existing application');
 var status=escapeHtml(statusLabel(match.application_status));
 var reason=escapeHtml(reasonLabel(match.match_reason));
 var submitted=escapeHtml(formatDate(match.submitted_at));
 var strongAdvice=String(match.application_status||'').toLowerCase()==='approved'
   ? 'This application is already approved. Please contact the JETRIDERS admin instead of submitting another entry.'
   : 'Please do not submit another entry unless you are correcting information or an admin asked you to resubmit.';

 warning.innerHTML=''
  +'<strong>⚠ Possible duplicate application found</strong>'
  +'<div>A previous application matched '+reason+'.</div>'
  +'<div class="duplicate-meta"><b>Reference:</b> '+ref+'<br><b>Status:</b> '+status+'<br><b>Submitted:</b> '+submitted+'</div>'
  +'<div style="margin-top:9px">'+escapeHtml(strongAdvice)+'</div>'
  +'<div class="duplicate-actions"><button type="button" class="duplicate-edit">Review / Edit Information</button><button type="button" class="duplicate-submit">Submit Anyway</button></div>';
 warning.className='show';
 warning.scrollIntoView({behavior:'smooth',block:'center'});
 warning.querySelector('.duplicate-edit').onclick=function(){
   hideWarning();
   var target=document.getElementById('existing_member_id')||document.getElementById('full_name');
   if(target)target.focus();
 };
 warning.querySelector('.duplicate-submit').onclick=function(){
   forwarded=true;
   forwardSubmission();
 };
}

async function checkDuplicate(){
 var payload={
  p_application_type:val('application_type'),
  p_existing_member_id:val('existing_member_id')||null,
  p_full_name:val('full_name'),
  p_mobile_number:val('mobile_number'),
  p_email:val('email')||null
 };

 var response=await fetch(SUPABASE_URL+'/rest/v1/rpc/check_membership_duplicate',{
  method:'POST',
  headers:{
   apikey:SUPABASE_KEY,
   Authorization:'Bearer '+SUPABASE_KEY,
   'Content-Type':'application/json'
  },
  body:JSON.stringify(payload),
  cache:'no-store'
 });

 if(!response.ok){
  var details;
  try{details=await response.json();}catch(error){details={message:'Duplicate check unavailable'};}
  throw new Error(details.message||details.details||'Duplicate check unavailable');
 }

 var data=await response.json();
 return Array.isArray(data)&&data.length?data[0]:{duplicate_found:false};
}

form.addEventListener('submit',async function(event){
 if(bypassOnce){
  bypassOnce=false;
  return;
 }

 if(checking){
  event.preventDefault();
  event.stopImmediatePropagation();
  return;
 }

 if(!form.checkValidity())return;
 if(!val('full_name')||!val('mobile_number'))return;
 if(val('application_type')==='old_member'&&!val('existing_member_id'))return;

 event.preventDefault();
 event.stopImmediatePropagation();
 checking=true;
 forwarded=false;
 var originalText=submitBtn.textContent;
 submitBtn.disabled=true;
 submitBtn.textContent='Checking for duplicate application...';
 hideWarning();

 try{
  var match=await checkDuplicate();
  if(match&&match.duplicate_found){
   showDuplicate(match);
  }else{
   forwarded=true;
   forwardSubmission();
  }
 }catch(error){
  console.warn('JETRIDERS duplicate warning check:',error.message);
  forwarded=true;
  forwardSubmission();
 }finally{
  checking=false;
  if(!forwarded){
   submitBtn.disabled=false;
   submitBtn.textContent=originalText||'Submit for Admin Review';
  }
 }
},true);

['application_type','existing_member_id','full_name','mobile_number','email'].forEach(function(id){
 var el=document.getElementById(id);
 if(el)el.addEventListener('input',hideWarning);
});
})();
