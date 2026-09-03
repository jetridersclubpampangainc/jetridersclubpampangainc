(function(){
'use strict';

var SUPABASE_URL='https://hwtkplolyunhuhjdqacb.supabase.co';
var SUPABASE_KEY='sb_publishable_h6Z7EK1Axb8cdH9lVxZsgw_-BEPyEXY';
var overrides={};
var applying=false;
var scheduled=false;

function normalStatus(value){
  var status=String(value||'inactive').toLowerCase();
  return ['active','inactive','provisionary','honorary'].indexOf(status)>=0?status:'inactive';
}

function statusLabel(value){
  var status=normalStatus(value);
  if(status==='provisionary')return 'PROVISIONARY';
  if(status==='honorary')return 'HONORARY';
  if(status==='active')return 'ACTIVE';
  return 'INACTIVE';
}

function ensureStyles(){
  if(document.getElementById('jrcp-member-status-styles'))return;
  var style=document.createElement('style');
  style.id='jrcp-member-status-styles';
  style.textContent='.status.honorary,.honorary{background:#9bd3ff!important;color:#002d4d!important}.member-status-live-note{margin:8px 0 0;color:#b8ffb8;font-size:12px}';
  document.head.appendChild(style);
}

function ensureHonoraryFilter(){
  var filter=document.getElementById('statusFilter');
  if(!filter||filter.querySelector('option[value="honorary"]'))return;
  var option=document.createElement('option');
  option.value='honorary';
  option.textContent='Honorary';
  filter.appendChild(option);
}

function updateVerificationRecord(id,name,status){
  try{
    if(typeof members!=='undefined'){
      members[id]=String(name||id).trim()+' - '+statusLabel(status);
    }
  }catch(error){
    console.warn('JETRIDERS verification status sync:',error.message);
  }
}

function updateCard(card){
  var id=String(card.getAttribute('data-id')||'').toUpperCase();
  var status=overrides[id];
  if(!status)return;

  if(card.dataset.status!==status)card.dataset.status=status;

  var badge=card.querySelector('.status');
  if(badge){
    var className='status '+status;
    var label=statusLabel(status);
    if(badge.className!==className)badge.className=className;
    if(badge.textContent!==label)badge.textContent=label;
  }

  var nameNode=card.querySelector('h3');
  updateVerificationRecord(id,nameNode?nameNode.textContent:id,status);
}

function updateTable(){
  var rows=document.querySelectorAll('#members tbody tr');
  rows.forEach(function(row){
    var cells=row.querySelectorAll('td');
    if(cells.length<5)return;
    var id=String(cells[2].textContent||'').trim().toUpperCase();
    var status=overrides[id];
    if(!status)return;

    var badge=cells[4].querySelector('.status');
    if(!badge){
      badge=document.createElement('span');
      cells[4].textContent='';
      cells[4].appendChild(badge);
    }

    var className='status '+status;
    var label=statusLabel(status);
    if(badge.className!==className)badge.className=className;
    if(badge.textContent!==label)badge.textContent=label;

    var name=cells[3]?cells[3].textContent:id;
    updateVerificationRecord(id,name,status);
  });
}

function addLiveNote(){
  var section=document.getElementById('members');
  if(!section||section.querySelector('.member-status-live-note'))return;
  var note=document.createElement('div');
  note.className='member-status-live-note';
  note.textContent='Member statuses are synchronized with the JETRIDERS admin system.';
  var controls=section.querySelector('.controls');
  if(controls)controls.insertAdjacentElement('afterend',note);
}

function applyOverrides(){
  if(applying)return;
  applying=true;
  try{
    ensureStyles();
    ensureHonoraryFilter();
    document.querySelectorAll('#members .member-card').forEach(updateCard);
    updateTable();
    addLiveNote();
    if(typeof window.filterMembers==='function')window.filterMembers();
  }finally{
    applying=false;
  }
}

function scheduleApply(){
  if(scheduled)return;
  scheduled=true;
  var run=function(){scheduled=false;applyOverrides();};
  if(window.requestAnimationFrame)window.requestAnimationFrame(run);
  else setTimeout(run,0);
}

async function loadOverrides(){
  try{
    var response=await fetch(SUPABASE_URL+'/rest/v1/rpc/get_member_statuses',{
      method:'POST',
      headers:{
        apikey:SUPABASE_KEY,
        Authorization:'Bearer '+SUPABASE_KEY,
        'Content-Type':'application/json'
      },
      body:'{}',
      cache:'no-store'
    });
    if(!response.ok)throw new Error('Status service unavailable');

    var data=await response.json();
    overrides={};
    (Array.isArray(data)?data:[]).forEach(function(item){
      var id=String(item.member_id||'').toUpperCase();
      if(id)overrides[id]=normalStatus(item.status);
    });
    applyOverrides();
  }catch(error){
    console.warn('JETRIDERS member status sync:',error.message);
  }
}

var target=document.getElementById('members')||document.body;
var observer=new MutationObserver(function(){
  if(Object.keys(overrides).length)scheduleApply();
});
observer.observe(target,{childList:true,subtree:true});

window.addEventListener('load',function(){
  loadOverrides();
  setTimeout(applyOverrides,1200);
});

setTimeout(loadOverrides,250);
})();
