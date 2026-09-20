let state=null, map=null, user=null, mapLayers=[], activeFilter="ALL";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(window.__toastTimer); window.__toastTimer=setTimeout(()=>t.classList.remove("show"),2600);
}
function openModal(id){ $("#"+id).classList.add("open"); }
function closeModal(id){ $("#"+id).classList.remove("open"); }

function switchView(view){
  $$(".view").forEach(v=>v.classList.remove("active"));
  $("#view-"+view).classList.add("active");
  $$(".nav").forEach(n=>n.classList.toggle("active", n.dataset.view===view));
  const titles={command:"COMMAND CENTER",requests:"REQUEST QUEUE",resources:"RESOURCE NETWORK",network:"FIELD NETWORK",alerts:"ALERTS & SIGNALS"};
  $("#pageTitle").textContent=titles[view]||"COMMAND CENTER";
  if(view==="command" && map) setTimeout(()=>map.invalidateSize(),80);
}
$$(".nav[data-view]").forEach(n=>n.onclick=()=>switchView(n.dataset.view));

async function loadState(){
  try{
    const res=await fetch("/api/state");
    if(!res.ok) throw new Error();
    state=await res.json(); renderAll();
  }catch(e){ toast("Could not refresh demo data"); }
}

function renderAll(){
  const s=state.stats;
  $("#sIncidents").textContent=s.active_incidents;
  $("#sRequests").textContent=s.open_requests;
  $("#sResources").textContent=s.resources_ready;
  $("#sTeams").textContent=s.teams_deployed;
  $("#sMatch").textContent=s.avg_match;

  $("#queueList").innerHTML=state.requests.slice(0,5).map(r=>`
    <button class="queue-item queue-click" onclick="focusRequest('${r.id}')">
      <div class="q-score">${r.priority}</div>
      <div class="q-main"><b>${r.id} · ${r.need}</b><small>${r.location} · ${r.qty} · ${r.age}</small></div>
      <div class="q-status ${r.priority>=90?'hot':''}">${r.status}</div>
    </button>`).join("");

  $("#activityList").innerHTML=state.activity.slice(0,5).map(a=>`
    <div class="activity-row"><time>${a.time}</time><span>${a.text}</span><i></i></div>`).join("");

  renderRequests();
  $("#resourceGrid").innerHTML=state.resources.map((r,i)=>`
    <button class="resource-card resource-click" onclick="focusResource('${r.id}')">
      <span class="ready">${r.status}</span><span class="label">${r.id}</span>
      <h3>${r.name}</h3><div class="big">${r.available}</div>
      <p>${r.unit} · ${r.owner} · ${r.near}</p>
      <div class="bar"><i style="width:${45+(i*9)%45}%"></i></div>
    </button>`).join("");

  $("#alertsList").innerHTML=state.alerts.map(a=>`
    <button class="alert-row alert-click" onclick="focusAlert('${a.id}')">
      <span class="alert-level ${a.level.toLowerCase()}">${a.level}</span>
      <div><b>${a.title}</b><small>${a.area} · ${a.source}</small></div>
      <span class="alert-time">${a.time}</span>
    </button>`).join("");
  plotMap();
}

function renderRequests(){
  const filtered=state.requests.filter(r=>{
    if(activeFilter==="ALL") return true;
    if(activeFilter==="URGENT") return r.priority>=90 || r.status==="URGENT";
    return r.type===activeFilter;
  });
  $("#requestTable").innerHTML=`<div class="req-row head"><span>ID</span><span>TYPE</span><span>NEED / LOCATION</span><span>PRIORITY</span><span>STATUS</span><span>ACTION</span></div>`+
    filtered.map(r=>`<div class="req-row">
      <button class="req-id req-link" onclick="focusRequest('${r.id}')">${r.id}</button>
      <span class="type">${r.type}</span>
      <span><b>${r.need}</b><small class="subline">${r.location} · ${r.qty}</small></span>
      <span class="priority">${r.priority}</span>
      <span class="status ${r.priority>=90?'urgent':''}">${r.status}</span>
      <button class="dispatch" onclick="dispatchReq('${r.id}')" ${r.status==="DISPATCHED"?'disabled':''}>${r.status==="DISPATCHED"?'DISPATCHED':'DISPATCH'}</button>
    </div>`).join("") || `<div class="empty">No requests match this filter.</div>`;
}

function plotMap(){
  if(!map){
    map=L.map("map",{zoomControl:false,attributionControl:true}).setView([28.62,77.27],11);
    L.control.zoom({position:"bottomright"}).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  }
  mapLayers.forEach(x=>map.removeLayer(x)); mapLayers=[];
  if(!state) return;
  state.requests.forEach(r=>{
    const color=r.priority>=90?"#ff4f63":r.priority>=75?"#ffc857":"#52e5d3";
    const marker=L.circleMarker([r.lat,r.lng],{radius:r.priority>=90?10:7,color,fillColor:color,fillOpacity:.75,weight:2});
    marker.bindTooltip(`<b>${r.id}</b><br>${r.need}<br>${r.location}<br>Priority ${r.priority}`);
    marker.on("click",()=>focusRequest(r.id));
    marker.addTo(map); mapLayers.push(marker);
  });
  state.resources.forEach(r=>{
    const marker=L.circleMarker([r.lat,r.lng],{radius:5,color:"#6aa9ff",fillColor:"#6aa9ff",fillOpacity:.9,weight:1});
    marker.bindTooltip(`<b>${r.name}</b><br>${r.owner}<br>${r.available} ${r.unit}`);
    marker.on("click",()=>focusResource(r.id));
    marker.addTo(map); mapLayers.push(marker);
  });
}

function focusRequest(id){
  const r=state.requests.find(x=>x.id===id); if(!r) return;
  switchView("command");
  if(map){ map.setView([r.lat,r.lng],13); toast(`${r.id} · ${r.status} · priority ${r.priority}`); }
}
function focusResource(id){
  const r=state.resources.find(x=>x.id===id); if(!r) return;
  switchView("command");
  if(map){ map.setView([r.lat,r.lng],13); toast(`${r.name} · ${r.available} ${r.unit} · ${r.status}`); }
}
function focusAlert(id){
  const a=state.alerts.find(x=>x.id===id); if(a) toast(`${a.level}: ${a.title} · ${a.area}`);
}

async function dispatchReq(id){
  const r=state.requests.find(x=>x.id===id);
  if(r?.status==="DISPATCHED") return;
  const res=await fetch("/api/dispatch/"+id,{method:"POST"});
  if(res.ok){ toast(id+" dispatched — demo action recorded"); await loadState(); }
}

$$(".filter").forEach(btn=>btn.onclick=()=>{
  $$(".filter").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
  activeFilter=btn.dataset.filter; renderRequests();
});

$("#loginBtn").onclick=()=>openModal("authModal");
$("#reportBtn").onclick=()=>openModal("needModal");
$("#helpBtn").onclick=()=>openModal("helpModal");

$$(".role").forEach(btn=>btn.onclick=()=>{
  $$(".role").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
  const data={
    coordinator:["coordinator@relieflink.demo","Manage the response queue, resources, routes and dispatches."],
    affected:["affected@relieflink.demo","Report an urgent need, share location and track verification."],
    ngo:["ngo@relieflink.demo","Publish your available resources and receive matched missions."]
  }[btn.dataset.role];
  $("#email").value=data[0]; $("#password").value="demo123"; $("#roleCopy").textContent=data[1];
});

$("#doLogin").onclick=async()=>{
  const res=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email:$("#email").value.trim(),password:$("#password").value})});
  if(!res.ok){toast("Invalid demo credentials");return}
  const data=await res.json(); user=data.user; closeModal("authModal");
  $("#userLabel").textContent=user.name.toUpperCase();
  $(".avatar").textContent=user.role==="ngo"?"N":user.role==="affected"?"R":"C";
  toast("Signed in as "+user.role.toUpperCase());
  if(user.role==="affected") openModal("needModal");
  if(user.role==="ngo") switchView("network");
};

$("#submitNeed").onclick=async()=>{
  const body={name:$("#needName").value||"Demo Resident",phone:$("#needPhone").value||"0000000000",
    need_type:$("#needType").value,location:$("#needLocation").value||"Delhi",
    details:$("#needDetails").value,people:Number($("#needPeople").value||1)};
  const res=await fetch("/api/needs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(res.ok){closeModal("needModal");$("#needDetails").value="";toast("Request submitted — awaiting verification");await loadState();}
};

$("#addResourceBtn").onclick=()=>openModal("resourceModal");
$("#submitResource").onclick=async()=>{
  const body={name:$("#resName").value||"General relief supplies",owner:$("#resOwner").value||"Demo NGO",
    available:Number($("#resAvailable").value||1),unit:$("#resUnit").value,near:$("#resNear").value||"Delhi",status:$("#resStatus").value};
  const res=await fetch("/api/resources",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(res.ok){closeModal("resourceModal");toast("Resource added to the network");await loadState();switchView("resources");}
};

document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m) closeModal(m.id)}));
document.addEventListener("keydown",e=>{if(e.key==="Escape") $$(".modal.open").forEach(m=>closeModal(m.id));});
setInterval(()=>$("#clock").textContent=new Date().toLocaleTimeString("en-IN",{hour12:false}),1000);
loadState();
