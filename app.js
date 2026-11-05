const GEO={Odisha:{
 Kendrapara:{"Rajnagar":{"Dangmal GP":["Dangmal","Ekakula"]}},
 Puri:{"Brahmagiri":{"Satapada GP":["Satapada","Sipaulia"]}}
}};
const STATES=Object.keys(GEO);
const ROLES=[["Odisha Administrator","Sign in with your Odisha government office email. OTP is sent to the registered mobile.","Odisha"],["Odisha Nodal Officer","Use your Odisha disaster management nodal credentials.","Odisha"],["District Collector / Nodal Officer","Access covers all blocks in your district.","District"],["Block Officer","Verify damage and approve relief requests for your block.","Block"],["GP Officer","Register households and acknowledge relief for your GP.","GP"],["Field Surveyor","Use the ID issued by your Block Officer.","GP"],["Company / NGO","Use your verified organisation email.","Partner"],["Auditor","Read-only access to financial and audit records.","Odisha"]];
const DIS=[["DIS-2026-014","Kendrapara Cyclone ","Cyclone","Odisha",1,"2026-09-28","Severe",412,"Active","Kendrapara"],["DIS-2026-011","Puri Flood ","Flood","Odisha",1,"2026-10-05","High",268,"Active","Puri"],["DIS-2026-009","Rajnagar Coastal Surge ","Coastal flooding","Odisha",1,"2026-08-14","High",34,"Relief phase","Kendrapara"],["DIS-2026-007","Brahmagiri Flood ","Flood","Odisha",1,"2026-08-02","Moderate",520,"Closing","Puri"],["DIS-2026-004","Kendrapara Heavy Rainfall ","Heavy rainfall","Odisha",1,"2026-07-19","Moderate",41,"Closed","Kendrapara"]];
const NM=["Rupali Das","Bimal Nayak","Sunita Devi","Anil Sahu","Mamata Behera","Kabita Das","Rajesh Sahu","Pranati Behera","Hari Mohan Das","Lakshmi Sahoo"];
const VIC=NM.map((n,i)=>{const s="Odisha",d=Object.keys(GEO[s])[i%2],b=Object.keys(GEO[s][d])[0],g=Object.keys(GEO[s][d][b])[0],v=["Pending","Verified","Verified","Rejected"][i%4];return["DMP-OD-"+String(i+1).padStart(4,"0"),n,"98XXXXXX"+(10+i)+"",s,d,GEO[s][d][b][g][i%2],["House","Crop","Livestock","Business"][i%4],"2026-10-"+String(i+3).padStart(2,"0"),v,v=="Verified"?(i%2?"Distributed":"Pending"):"Pending"]});
const $=jQuery;let charts={},inited={};
function pageUrl(route,roleIndex){
 const files={dash:"dashboard",orgs:"organisations"};
 const role=roleIndex!==undefined?roleIndex:new URLSearchParams(location.search).get("role");
 return `${files[route]||route}.html${role===null||role===undefined?"":`?role=${encodeURIComponent(role)}`}`;
}
function toast(m){$("#tmsg").text(m);bootstrap.Toast.getOrCreateInstance("#tst",{delay:2200}).show()}
function opts(a,ph){return (ph?`<option value="">${ph}</option>`:"")+a.map(x=>`<option>${x}</option>`).join("")}
function cascade(s,d,b,g,v){const S=$(s),D=$(d),B=$(b),G=$(g),V=$(v);
 const dd=()=>D.html(opts(Object.keys(GEO[S.val()]))).trigger("change");
 const bb=()=>B.html(opts(Object.keys(GEO[S.val()][D.val()]||{}))).trigger("change");
 const gg=()=>G.html(opts(Object.keys((GEO[S.val()][D.val()]||{})[B.val()]||{}))).trigger("change");
 const vv=()=>V.html(opts(((GEO[S.val()][D.val()]||{})[B.val()]||{})[G.val()]||[]));
 S.on("change",dd);D.on("change",bb);B.on("change",gg);G.on("change",vv);dd()}
function kpi(a){return a.map(k=>`<div class="col-6 col-md-4 col-xl-3"><div class="card kpi ${k[3]||""} p-3 h-100 d-flex flex-row gap-3 align-items-center"><i class="bi bi-${k[2]}"></i><div><div class="v">${k[1]}</div><small class="text-muted">${k[0]}</small></div></div></div>`).join("")}
function chart(id,cfg){if(charts[id])charts[id].destroy();Chart.defaults.font.family="Inter";cfg.options=Object.assign({maintainAspectRatio:false,plugins:{legend:{display:cfg.type!="bar"&&cfg.type!="line",position:"bottom"}}},cfg.options||{});charts[id]=new Chart(id,cfg)}
const PAL=["#17365D","#245A91","#F28C28","#198754","#DC3545","#6c757d"];
function mapInit(id,zoom){const m=L.map(id).setView([20.2,84.5],zoom);L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(m);
 [["Kendrapara, Odisha","Cyclone",[20.5,86.4],36100,25800,9100,"₹3.1 Cr"],["Puri, Odisha","Flood",[19.8,85.8],24800,19300,4200,"₹2.4 Cr"],["Rajnagar, Kendrapara","Coastal flooding",[20.5,86.7],15200,12100,2100,"₹1.2 Cr"],["Brahmagiri, Puri","Flood",[19.8,85.6],18400,14900,2800,"₹1.6 Cr"]].forEach(p=>L.circleMarker(p[2],{radius:10,color:"#F28C28",fillColor:"#DC3545",fillOpacity:.8}).addTo(m).bindPopup(`<b>${p[0]}</b><br>${p[1]}<br>Affected: ${p[3].toLocaleString("en-IN")}<br>Registered: ${p[4].toLocaleString("en-IN")}<br>Relief pending: ${p[5].toLocaleString("en-IN")}<br>Distributed: ${p[6]}<br><small></small>`));return m}
let stage=2;const STG=["GP verification","Block verification","District approval","Relief sanction","Distribution"];
function wf(){$("#wf").html(STG.map((s,i)=>`<div class="step ${i<stage?"done":i==stage?"cur":""}"><b>${i<stage?'<i class="bi bi-check"></i>':i+1}</b>${s}</div>`).join(""))}
const views={
 home(){if(inited.h)return;inited.h=1;$("#activeCards").html(DIS.filter(d=>d[8]=="Active").map(d=>`<div class="col-md-4"><div class="card p-3 h-100 border-start border-4 border-warning"><div class="d-flex justify-content-between"><b>${d[1]}</b><span class="badge bg-danger">${d[6]}</span></div><small class="text-muted">${d[9]}, Odisha · ${d[4]} affected district${d[4]==1?"":"s"} · ${d[7]} villages</small><div class="mt-2"><span class="sample"></span></div></div></div>`).join(""))},
 login(){if(inited.l)return;inited.l=1;$("#roleSelect").html(ROLES.map((r,i)=>`<option value="${i}">${r[0]}</option>`).join(""));pick(0);
  $("#roleSelect").on("change",function(){pick(Number(this.value))});
  $("#togglePassword").on("click",function(){const input=$("#loginPassword"),show=input.attr("type")==="password";input.attr("type",show?"text":"password");$(this).attr("aria-label",show?"Hide password":"Show password").attr("aria-pressed",show).find("i").toggleClass("bi-eye",!show).toggleClass("bi-eye-slash",show)});
  $("#loginBtn").on("click",()=>{const role=Number($("#roleSelect").val());sessionStorage.setItem("odishaPortalRole",String(role));window.location.href=pageUrl("dash",role)})},
 dash(){const m=window.me||ROLES[0],lv=m[2];$("#urole").text(m[0]);$("#dtitle").text(lv=="District"?"Kendrapara district dashboard":lv=="Block"?"Rajnagar block dashboard":lv=="GP"?"Dangmal GP dashboard":lv=="Partner"?"Partner contributions dashboard":"Odisha disaster management dashboard");
  $("#kpis").html(kpi(lv=="Odisha"?[["Active disasters","2","cloud-lightning-rain","warn"],["Affected districts","2","pin-map"],["Affected villages","1,275","houses"],["Affected persons","94,500","people"],["Registered families","10","person-lines-fill"],["Relief distributed","₹8.3 Cr","box-seam"],["Sample partners","7","building"]]:[["Affected persons","18,400","people","warn"],["Registered families","3,950","person-lines-fill"],["Verified","68%","patch-check"],["Pending verification","1,240","hourglass-split","warn"],["Relief distributed","₹46 Cr","box-seam"],["Relief pending","₹12 Cr","clock-history"],["Villages affected","64","houses"],["Fund allocation","₹58 Cr","cash-stack"]]));
  if(!inited.s){inited.s=1;$("#fState").html(opts(STATES,"All Odisha"));$("#pend").html([["Food kit — Rupali Das","Dangmal"],["Shelter — Bimal Nayak","Ekakula"],["Cash aid — Sunita Devi","Satapada"],["Medical — Anil Sahu","Sipaulia"]].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td><span class="badge text-bg-warning">Pending</span></td><td class="text-end"><button class="btn btn-sm btn-success ap">Approve</button></td></tr>`).join(""));
   $("#pend").on("click",".ap",function(){$(this).closest("tr").find(".badge").attr("class","badge text-bg-success").text("Approved");$(this).remove();toast("Request approved (demo)")})}
  setTimeout(()=>{if(!inited.m){inited.m=mapInit("map",7)}
  chart("c1",{type:"bar",data:{labels:["Kendrapara","Puri"],datasets:[{data:[412,268],backgroundColor:"#245A91"}]},options:{indexAxis:"y"}});
  chart("c2",{type:"doughnut",data:{labels:["Flood","Cyclone","Landslide","Other"],datasets:[{data:[48,26,17,9],backgroundColor:PAL}]}});
  chart("c3",{type:"line",data:{labels:["Jun","Jul","Aug","Sep","Oct"],datasets:[{data:[3,5,8,6,7],borderColor:"#F28C28",tension:.3}]}});
  chart("c4",{type:"bar",data:{labels:["Govt","CSR","NGO","Public"],datasets:[{label:"Committed",data:[120,70,30,26],backgroundColor:"#17365D"},{label:"Utilised",data:[88,41,19,12],backgroundColor:"#F28C28"}]},options:{plugins:{legend:{display:true,position:"bottom"}}}})},60)},
 disasters(){if(inited.d)return;inited.d=1;$(".st").html(opts(STATES));
  $("#tDis").DataTable({data:DIS.map(d=>[...d.slice(0,6),`<span class="badge text-bg-${d[6]=="Severe"?"danger":d[6]=="High"?"warning":"info"}">${d[6]}</span>`,d[7],d[8],'<button class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i></button>']),responsive:true,pageLength:5})},
 victims(){if(inited.v)return;inited.v=1;$("#vS").html(opts(STATES,"Odisha"));
  const t=$("#tVic").DataTable({data:VIC.map(v=>[...v.slice(0,8),`<span class="badge text-bg-${v[8]=="Verified"?"success":v[8]=="Pending"?"warning":"danger"}">${v[8]}</span>`,v[9],`<a class="btn btn-sm btn-outline-primary" href="${pageUrl("profile")}">View</a>`]),pageLength:6});
  $("#vS").on("change",function(){const s=this.value;t.column(3).search(s?"^"+s+"$":"",true,false).draw();$("#vD").html(opts(s?Object.keys(GEO[s]):[],"All districts"))});
  $("#vD").on("change",function(){t.column(4).search(this.value).draw()});$("#vV").on("change",function(){t.column(8).search(this.value).draw()});$("#vR").on("change",function(){t.column(9).search(this.value).draw()})},
 register(){if(inited.r)return;inited.r=1;$("#rS").html(opts(STATES));cascade("#rS","#rD","#rB","#rG","#rV");$("#gpsBtn").on("click",()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>$("#gps").val(p.coords.latitude.toFixed(5)+", "+p.coords.longitude.toFixed(5)),()=>toast("Location permission denied")):0)},
 profile(){wf()},
 gis(){setTimeout(()=>{if(!inited.g){inited.g=mapInit("bigmap",5)}else inited.g.invalidateSize()},60)},
 funds(){$("#fk").html(kpi([["Government fund","₹320 Cr","bank"],["CSR commitments","₹140 Cr","building"],["Funds received","₹246 Cr","cash-stack"],["Allocated","₹198 Cr","diagram-2"],["Utilised","₹160 Cr","check2-circle"],["Available balance","₹86 Cr","wallet2","warn"]]));
  setTimeout(()=>{chart("c5",{type:"pie",data:{labels:["Government","CSR","Public donations","NGO"],datasets:[{data:[320,140,35,22],backgroundColor:PAL}]}});chart("c6",{type:"bar",data:{labels:["Jun","Jul","Aug","Sep","Oct"],datasets:[{data:[12,24,38,41,45],backgroundColor:"#245A91"}]}})},60)},
 geography(){gInit()},
 damage(){dInit()},
 relief(){rInit()},
 distribution(){sInit()},
 orgs(){oInit()},
 contributions(){cInit()},
 officers(){ofInit()},
 reports(){rpInit()},
 settings(){settingsInit()},
 stub(){}
};
const SETTINGS_KEY="ndm-relief-portal-settings";
const SETTING_ROLES=["Odisha Administrator","Odisha Nodal Officer","District Collector / Nodal Officer","Block Officer","GP Officer","Field Surveyor","Company / NGO","Auditor"];
const SETTING_MODULES=["Dashboard","Disasters","Geography","Victims","Damage","Relief","Distribution","Organisations","Contributions","Funds","GIS","Reports","Officers","Audit","Settings"];
function settingsInit(){
 if(inited.settings)return;
 inited.settings=1;
 let saved={};
 try{saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}")||{}}
 catch(error){console.error("Could not load saved portal settings.",error);toast("Saved settings could not be loaded.");}
 const notificationOptions=["Pending approvals","Disaster alerts","Distribution updates","Daily summary"];
 const securityOptions=["Email alert for new sign-ins","Notify me when permissions change"];
 const defaultAccess=(role,module)=>role==="Odisha Administrator"||role==="Odisha Nodal Officer"||role==="Auditor"||
  (role==="District Collector / Nodal Officer"&&!["Officers","Settings"].includes(module))||
  (role==="Block Officer"&&!["Funds","Audit","Settings"].includes(module))||
  (role==="GP Officer"&&["Dashboard","Victims","Damage","Relief","Distribution"].includes(module))||
  (role==="Field Surveyor"&&["Dashboard","Disasters","Victims","Damage"].includes(module))||
  (role==="Company / NGO"&&["Dashboard","Disasters","Relief","Distribution","Contributions","Reports"].includes(module));
 const checkMarkup=(items,prefix,selected)=>items.map((item,index)=>{
  const id=`${prefix}${index}`,checked=selected?selected.includes(item):true;
  return `<div class="form-check"><input class="form-check-input" type="checkbox" id="${id}" ${checked?"checked":""}><label class="form-check-label small" for="${id}">${item}</label></div>`;
 }).join("");
 const renderPermissions=(permissions)=>{
  $("#pmH").html(`<tr><th>Role</th>${SETTING_MODULES.map(module=>`<th>${module}</th>`).join("")}</tr>`);
  $("#pmB").html(SETTING_ROLES.map((role,roleIndex)=>`<tr><th scope="row">${role}</th>${SETTING_MODULES.map((module,moduleIndex)=>{
   const checked=permissions?Boolean(permissions[role]?.[module]):defaultAccess(role,module);
   return `<td><input class="form-check-input pm-check" type="checkbox" aria-label="${role}: ${module}" data-role="${roleIndex}" data-module="${moduleIndex}" ${checked?"checked":""}></td>`;
  }).join("")}</tr>`).join(""));
 };
 $("#stNot").html(checkMarkup(notificationOptions,"stNot",saved.notifications));
 $("#stSec").html(checkMarkup(securityOptions,"stSec",saved.security));
 renderPermissions(saved.permissions);
 if(saved.general)Object.entries(saved.general).forEach(([id,value])=>$(`#${id}`).val(value));
 if(saved.notificationSettings)Object.entries(saved.notificationSettings).forEach(([id,value])=>$(`#${id}`).val(value));
 if(saved.securitySettings)Object.entries(saved.securitySettings).forEach(([id,value])=>$(`#${id}`).val(value));
 $(".stSave").on("click",function(){
  const section=$(this).closest(".tab-pane").attr("id"),current=(()=>{
   try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}")||{}}
   catch(error){console.error("Could not read saved portal settings.",error);return {}}
  })();
  if(section==="st1"){
   current.general=Object.fromEntries(["stName","stDesignation","stEmail","stPortal","stHelpline","stLanguage","stTimezone","stDateFormat"].map(id=>[id,$(`#${id}`).val()]));
  }else if(section==="st2"){
   current.notifications=notificationOptions.filter((_,index)=>$(`#stNot${index}`).prop("checked"));
   current.notificationSettings=Object.fromEntries(["stSummaryTime","stStockLimit"].map(id=>[id,$(`#${id}`).val()]));
  }else if(section==="st3"){
   current.security=securityOptions.filter((_,index)=>$(`#stSec${index}`).prop("checked"));
   current.securitySettings=Object.fromEntries(["stTimeout","stExpiry"].map(id=>[id,$(`#${id}`).val()]));
  }else if(section==="st4"){
   current.permissions={};
   $("#pmB tr").each(function(roleIndex){
    const role=SETTING_ROLES[roleIndex];
    current.permissions[role]={};
    $(this).find(".pm-check").each(function(){
     current.permissions[role][SETTING_MODULES[Number(this.dataset.module)]]=this.checked;
    });
   });
  }
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(current));toast("Settings saved on this device.");}
  catch(error){console.error("Could not save portal settings.",error);toast("Settings could not be saved. Check browser storage and try again.");}
 });
 $("#pmReset").on("click",function(){
  renderPermissions(null);
  const current=(()=>{
   try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}")||{}}
   catch(error){console.error("Could not read saved portal settings.",error);return {}}
  })();
  delete current.permissions;
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(current));toast("Role permissions reset to defaults.");}
  catch(error){console.error("Could not reset role permissions.",error);toast("Default permissions are shown but could not be saved.");}
 });
 $("#pwSave").on("click",function(){
  const current=$("#pwC").val(),next=$("#pwN").val(),confirmPassword=$("#pwM").val();
  const error=!current||!next||!confirmPassword?"Complete all password fields.":next.length<8||!/[A-Za-z]/.test(next)||!/\d/.test(next)?"Use at least 8 characters, including a letter and a number.":next!==confirmPassword?"The new passwords do not match.":"Password changes require a connected authentication service; no password was changed.";
  $("#pwE").text(error);
  if(current&&next&&confirmPassword&&next.length>=8&&/[A-Za-z]/.test(next)&&/\d/.test(next)&&next===confirmPassword)toast("Password changes are unavailable in this prototype.");
 });
}
const LV=["State","District","Block","GP","Village"],GK=["S","D","B","G"];let DB=[],GL=0,GE=null;
(function(){let k=0;const id=p=>p+String(++k).padStart(3,"0");for(const s in GEO){DB.push({l:0,n:s,c:id("ST")});for(const d in GEO[s]){DB.push({l:1,n:d,c:id("DT"),S:s});for(const b in GEO[s][d]){DB.push({l:2,n:b,c:id("BL"),S:s,D:d});for(const g in GEO[s][d][b]){DB.push({l:3,n:g,c:id("GP"),S:s,D:d,B:b});GEO[s][d][b][g].forEach(v=>DB.push({l:4,n:v,c:id("VL"),S:s,D:d,B:b,G:g}))}}}}})();
const gP=r=>{const o={S:r.S,D:r.D,B:r.B,G:r.G};if(r.l<4)o[GK[r.l]]=r.n;return o};
const gCh=(l,p)=>[...new Set(DB.filter(x=>x.l==l&&GK.slice(0,l).every(k=>!p[k]||x[k]==p[k])).map(x=>x.n))];
function gSel(pre,ph){const p={};GK.forEach((k,i)=>{const e=$("#"+pre+k),cur=e.val(),o=gCh(i,p);e.html(opts(o,ph));if(cur&&o.includes(cur))e.val(cur);p[k]=e.val()})}
function gFmt(r){return r.l?GK.slice(0,r.l).map(k=>r[k]).join(" › "):"Odisha"}
function gCnt(r){const p=gP(r);return DB.filter(x=>x.l==4&&GK.every(k=>!p[k]||x[k]==p[k])).length}
function gRender(){const f={};GK.forEach(k=>f[k]=$("#gf"+k).val());
 $("#gTabs").html(LV.map((n,i)=>`<li class="nav-item d-flex align-items-center">${i?'':'<span class="small text-muted px-2">Odisha</span>'}<i class="bi bi-chevron-right small text-muted"></i><button class="nav-link text-nowrap ${i==GL?"active":""}" data-l="${i}">${n} <span class="badge bg-light text-dark">${DB.filter(x=>x.l==i).length}</span></button></li>`).join(""));
 $("#gk").html(kpi(["State","Districts","Blocks","Gram Panchayats","Villages"].map((n,i)=>[n,DB.filter(x=>x.l==i).length,["map","diagram-3","grid-3x3-gap","signpost-split","houses"][i]])));
 GK.forEach((k,i)=>$("#gf"+k).toggle(i<GL).parent().toggle(i<GL));$("#gAddL").text(LV[GL]);$("#gAdd").toggle(GL>0);
 const rows=DB.map((r,i)=>[r,i]).filter(([r])=>r.l==GL&&GK.every(k=>!f[k]||gP(r)[k]==f[k]));
 if($.fn.DataTable.isDataTable("#tGeo")){$("#tGeo").DataTable().destroy();$("#tGeo tbody").empty()}
 const t=$("#tGeo").DataTable({data:rows.map(([r,i])=>[r.c,r.n,gFmt(r),GL<4?gCnt(r):"—",GL===0?"—":`<div class="text-end text-nowrap"><button class="btn btn-sm btn-outline-primary ed" data-i="${i}" title="Edit"><i class="bi bi-pencil"></i></button> <button class="btn btn-sm btn-outline-danger dl" data-i="${i}" title="Delete"><i class="bi bi-trash"></i></button></div>`]),dom:"tip",pageLength:8,order:[[1,"asc"]]});
 t.search($("#gQ").val()).draw()}
function gInit(){if(inited.geo)return gRender();inited.geo=1;gSel("gf","All");gRender();
 $("#gTabs").on("click","button",function(){GL=+this.dataset.l;gRender()});
 $(".gf").on("change",()=>{gSel("gf","All");gRender()});$(".gmp").on("change",()=>gSel("gm"));
 $("#gQ").on("input",function(){$("#tGeo").DataTable().search(this.value).draw()});
 const open=()=>{$("#gmT").text((GE===null?"Add ":"Edit ")+LV[GL]);GK.forEach((k,i)=>$("#gm"+k).parent().toggle(i<GL));$(".gmp").prop("disabled",GE!==null);bootstrap.Modal.getOrCreateInstance("#gm").show()};
 $("#gAdd").on("click",()=>{if(GL===0)return toast("This portal is limited to Odisha. Select District to add a location.");GE=null;$("#gmN,#gmC").val("");gSel("gm");open()});
 $("#tGeo").on("click",".ed",function(){GE=+this.dataset.i;const r=DB[GE];if(r.l===0)return toast("The Odisha state scope cannot be changed.");$("#gmN").val(r.n);$("#gmC").val(r.c);GK.slice(0,r.l).forEach(k=>{gSel("gm");$("#gm"+k).val(r[k])});gSel("gm");open()});
 $("#gmSave").on("click",()=>{const n=$("#gmN").val().trim(),c=$("#gmC").val().trim();if(!n)return toast("Enter a name");
  if(GE===null){if(GL===0)return toast("This portal is limited to Odisha. Add a district under Odisha instead.");const par={};GK.slice(0,GL).forEach(k=>par[k]=$("#gm"+k).val());if(GK.slice(0,GL).some(k=>!par[k]))return toast("Select the parent location first");
   if(DB.some(x=>x.l==GL&&x.n.toLowerCase()==n.toLowerCase()&&GK.slice(0,GL).every(k=>x[k]==par[k])))return toast(n+" already exists here");
   DB.push({l:GL,n,c:c||["ST","DT","BL","GP","VL"][GL]+String(100+DB.length),...par});toast(LV[GL]+" added")}
  else{const r=DB[GE],old=r.n;if(GL<4&&old!=n)DB.forEach(x=>{if(x.l>GL&&x[GK[GL]]==old&&GK.slice(0,GL).every(k=>x[k]==r[k]))x[GK[GL]]=n});r.n=n;if(c)r.c=c;toast("Changes saved")}
  bootstrap.Modal.getInstance("#gm").hide();gSel("gf","All");gRender()});
 $("#tGeo").on("click",".dl",function(){const r=DB[+this.dataset.i];if(r.l===0)return toast("The Odisha state scope cannot be deleted.");const kids=DB.filter(x=>x.l>r.l&&x[GK[r.l]]==r.n&&GK.slice(0,r.l).every(k=>x[k]==r[k]));
  if(!confirm(`Delete ${r.n}${kids.length?" and "+kids.length+" linked records":""}?`))return;DB=DB.filter(x=>x!==r&&!kids.includes(x));gSel("gf","All");gRender();toast("Deleted")});
 $("#gTpl").on("click",function(){this.href=URL.createObjectURL(new Blob(["State,District,Block,GP,Village\nOdisha,Kendrapara,Rajnagar,Dangmal GP,Sample Village\n"],{type:"text/csv"}));this.download="geo-master-template.csv";setTimeout(()=>{this.href=pageUrl("geography");this.removeAttribute("download")},500)});
 $("#gImp").on("click",()=>{const f=$("#gFile")[0].files[0];if(!f)return $("#gImpMsg").html('<span class="text-danger">Choose a file first.</span>');
  if(!/\.csv$/i.test(f.name))return $("#gImpMsg").html('<span class="text-warning">Excel parsing needs a server or SheetJS. Save as CSV to try the import here.</span>');
  f.text().then(t=>{let n=0,skipped=0;t.trim().split(/\r?\n/).slice(1).forEach(line=>{const [s,d,b,g,v]=line.split(",").map(x=>x&&x.trim());if(!s||!d||!b||!g||!v||s!=="Odisha"){skipped++;return}
   const add=(l,nm,par)=>{if(!DB.some(x=>x.l==l&&x.n==nm&&GK.slice(0,l).every(k=>x[k]==par[k])))DB.push({l,n:nm,c:["ST","DT","BL","GP","VL"][l]+String(100+DB.length),...par})};
   add(0,s,{});add(1,d,{S:s});add(2,b,{S:s,D:d});add(3,g,{S:s,D:d,B:b});add(4,v,{S:s,D:d,B:b,G:g});n++});
   $("#gImpMsg").html(`<span class="text-${skipped?"warning":"success"}">${n} Odisha village row(s) imported.${skipped?` ${skipped} row(s) skipped; only Odisha locations are allowed.`:""}</span>`);gSel("gf","All");gRender()})});
}
const DC=["All","House","Crop","Livestock","Infrastructure","Property"];let DAc="All",DAi=null,dMap=null,dMk=null;
const DA=[["DA-1001","House","Dangmal, Kendrapara","Kendrapara","S. Mohanty",86000,20.5,86.9,"Pending"],["DA-1002","Crop","Ekakula, Kendrapara","Kendrapara","S. Mohanty",142000,20.6,86.9,"Pending"],["DA-1003","Livestock","Satapada, Puri","Puri","B. Sahoo",54000,19.8,85.5,"Verified"],["DA-1004","Infrastructure","Sipaulia, Puri","Puri","B. Sahoo",1250000,19.7,85.6,"Pending"],["DA-1005","House","Dangmal, Kendrapara","Kendrapara","S. Mohanty",112000,20.62,86.9,"Verified"],["DA-1006","Property","Ekakula, Kendrapara","Kendrapara","S. Mohanty",38000,20.68,86.96,"Pending"],["DA-1007","Crop","Satapada, Puri","Puri","B. Sahoo",96000,19.65,85.4,"Rejected"],["DA-1008","House","Sipaulia, Puri","Puri","B. Sahoo",74000,19.7,85.45,"Pending"]].map(a=>({id:a[0],c:a[1],v:a[2],d:a[3],o:a[4],loss:a[5],lat:a[6],lng:a[7],s:a[8]}));
const dBadge=s=>`<span class="badge text-bg-${s=="Verified"?"success":s=="Pending"?"warning":"danger"}">${s}</span>`;
const inr=n=>"₹"+n.toLocaleString("en-IN");
function dRender(){const n=c=>DA.filter(x=>x.c==c).length;
 $("#dTabs").html(DC.map(c=>`<li class="nav-item"><button class="nav-link text-nowrap ${c==DAc?"active":""}" data-c="${c}">${c} <span class="badge bg-light text-dark">${c=="All"?DA.length:n(c)}</span></button></li>`).join(""));
 $("#dk").html(kpi([["Houses damaged","4,820","house-exclamation","warn"],["Crop loss (acres)","12,450","flower1"],["Livestock lost","1,980","piggy-bank"],["Infrastructure sites","146","bridge"],["Estimated loss",inr(DA.reduce((a,x)=>a+x.loss,0)),"currency-rupee"],["Pending assessments",DA.filter(x=>x.s=="Pending").length,"hourglass-split","warn"]]));
 const rows=DA.filter(x=>DAc=="All"||x.c==DAc);
 $("#dRows").html(rows.length?rows.map(x=>`<tr><td>${x.id}</td><td>${x.c}</td><td>${x.v}</td><td>${x.o}</td><td class="text-end">${inr(x.loss)}</td><td>${dBadge(x.s)}</td><td class="text-end"><button class="btn btn-sm btn-outline-primary dv" data-id="${x.id}">Inspect</button></td></tr>`).join(""):'<tr><td colspan="7" class="text-center text-muted py-4">No assessments in this category.</td></tr>');
 const cats=DC.slice(1),ds=[...new Set(DA.map(x=>x.d))];
 chart("c7",{type:"doughnut",data:{labels:cats,datasets:[{data:cats.map(c=>+(DA.filter(x=>x.c==c).reduce((a,x)=>a+x.loss,0)/1e5).toFixed(1)),backgroundColor:PAL.concat("#9aa5b1")}]}});
 chart("c8",{type:"bar",data:{labels:ds,datasets:["Verified","Pending","Rejected"].map((s,i)=>({label:s,data:ds.map(d=>DA.filter(x=>x.d==d&&x.s==s).length),backgroundColor:["#198754","#F28C28","#DC3545"][i]}))},options:{scales:{x:{stacked:true},y:{stacked:true,ticks:{precision:0}}},plugins:{legend:{display:true,position:"bottom"}}}})}
function dInit(){if(inited.dmg)return dRender();inited.dmg=1;dRender();
 $("#dTabs").on("click","button",function(){DAc=this.dataset.c;dRender()});
 $("#dRows").on("click",".dv",function(){const x=DA.find(a=>a.id==this.dataset.id);DAi=x;$("#dmT").text(x.id+" · "+x.c+" assessment");$("#dmRem").val("");
  $("#dmInfo").html([["Village",x.v],["District",x.d],["Officer",x.o],["Estimated loss",inr(x.loss)],["GPS",x.lat+", "+x.lng],["Status",dBadge(x.s)]].map(r=>`<dt class="col-5">${r[0]}</dt><dd class="col-7">${r[1]}</dd>`).join(""));
  $("#dmApp,#dmRej").prop("disabled",x.s!="Pending");bootstrap.Modal.getOrCreateInstance("#dm2").show()});
 $("#dm2").on("shown.bs.modal",()=>{if(!dMap){dMap=L.map("dmMap");L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(dMap)}
  dMap.setView([DAi.lat,DAi.lng],11);if(dMk)dMk.remove();dMk=L.marker([DAi.lat,DAi.lng]).addTo(dMap);dMap.invalidateSize()});
 const set=s=>{DAi.s=s;bootstrap.Modal.getInstance("#dm2").hide();dRender();toast(DAi.id+" "+s.toLowerCase())};
 $("#dmApp").on("click",()=>set("Verified"));$("#dmRej").on("click",()=>set("Rejected"))}
const RT=[["pending","Pending requests"],["approved","Approved"],["rejected","Rejected"],["dist","Distribution"],["camps","Relief camps"],["stock","Emergency stock"]],RS={pending:"Pending",approved:"Approved",rejected:"Rejected"};let RTab="pending";
const RQ=[["Rupali Das","DMP-OD-0001","Dangmal","Food kit","5 kits"],["Bimal Nayak","DMP-OD-0002","Ekakula","Shelter","1 tarpaulin set"],["Sunita Devi","DMP-OD-0003","Satapada","Cash aid","₹25,000"],["Anil Sahu","DMP-OD-0004","Sipaulia","Medical","2 first-aid kits"],["Mamata Behera","DMP-OD-0005","Satapada","Drinking water","120 litres"],["Kabita Das","DMP-OD-0006","Dangmal","Clothing","6 sets"],["Rajesh Sahu","DMP-OD-0007","Ekakula","Cash aid","₹18,000"],["Pranati Behera","DMP-OD-0008","Dangmal","Food kit","4 kits"],["Hari Mohan Das","DMP-OD-0009","Sipaulia","Shelter","1 tent"]].map((a,i)=>({n:a[0],r:a[1],v:a[2],t:a[3],q:a[4],s:i<4?"Pending":i<6?"Approved":i<7?"Distributed":i<8?"Rejected":"Pending"}));
const CAMPS=[["Kendrapara Govt. School Camp","Dangmal",400,372],["Rajnagar Community Hall","Ekakula",250,140],["Puri Cyclone Shelter","Satapada",600,455],["Brahmagiri Relief Centre","Sipaulia",300,296]];
const STK=[["Rice (quintal)",420,200],["Drinking water (litres)",18000,20000],["Tarpaulin sets",260,300],["Medical kits",85,100],["Blankets",640,400]];
const rB=s=>`<span class="badge text-bg-${s=="Approved"?"primary":s=="Distributed"||s=="OK"?"success":s=="Rejected"?"danger":"warning"}">${s}</span>`;
function rTable(rows,act){return `<div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr><th>Person</th><th>Reg. ID</th><th>Village</th><th>Assistance</th><th>Requested</th><th>Status</th><th class="text-end">Action</th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td>${x.n}</td><td>${x.r}</td><td>${x.v}</td><td>${x.t}</td><td>${x.q}</td><td>${rB(x.s)}</td><td class="text-end text-nowrap">${act(x)}</td></tr>`).join(""):'<tr><td colspan="7" class="text-center text-muted py-4">Nothing here yet.</td></tr>'}</tbody></table></div>`}
function rRender(){const c=s=>RQ.filter(x=>x.s==s).length;
 $("#rTabs").html(RT.map(t=>`<li class="nav-item"><button class="nav-link text-nowrap ${t[0]==RTab?"active":""}" data-t="${t[0]}">${t[1]}${RS[t[0]]?` <span class="badge bg-light text-dark">${c(RS[t[0]])}</span>`:""}</button></li>`).join(""));
 $("#rk").html(kpi([["Pending requests",c("Pending"),"hourglass-split","warn"],["Approved",c("Approved"),"check2-circle"],["Distributed",c("Distributed"),"truck"],["Rejected",c("Rejected"),"x-circle"],["Camps occupied",CAMPS.reduce((a,x)=>a+x[3],0).toLocaleString("en-IN"),"tents"],["Low-stock items",STK.filter(x=>x[1]<x[2]).length,"exclamation-triangle","warn"]]));
 const id=x=>RQ.indexOf(x);let h="";
 if(RS[RTab]){const s=RS[RTab];h=rTable(RQ.filter(x=>x.s==s),x=>s=="Pending"?`<button class="btn btn-sm btn-success rq" data-i="${id(x)}" data-s="Approved">Approve</button> <button class="btn btn-sm btn-outline-danger rq" data-i="${id(x)}" data-s="Rejected">Reject</button>`:s=="Rejected"?`<button class="btn btn-sm btn-outline-secondary rq" data-i="${id(x)}" data-s="Pending">Reopen</button>`:"—")}
 else if(RTab=="dist")h=rTable(RQ.filter(x=>x.s=="Approved"||x.s=="Distributed"),x=>x.s=="Approved"?`<button class="btn btn-sm btn-gov rq" data-i="${id(x)}" data-s="Distributed">Mark distributed</button>`:'<i class="bi bi-check-circle-fill text-success"></i>');
 else if(RTab=="camps")h='<div class="row g-3">'+CAMPS.map(k=>{const p=Math.round(k[3]/k[2]*100);return `<div class="col-md-6 col-xl-3"><div class="border rounded-3 p-3 h-100"><b class="small">${k[0]}</b><div class="small text-muted mb-2">${k[1]}</div><div class="progress mb-1" style="height:8px"><div class="progress-bar ${p>90?"bg-danger":p>75?"bg-warning":"bg-success"}" style="width:${p}%"></div></div><small>${k[3]} / ${k[2]} people (${p}%)</small></div></div>`}).join("")+"</div>";
 else h=`<div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Item</th><th style="min-width:160px">Stock level</th><th class="text-end">In stock</th><th>Status</th><th class="text-end">Update</th></tr></thead><tbody>${STK.map((k,i)=>`<tr><td>${k[0]}</td><td><div class="progress" style="height:8px"><div class="progress-bar ${k[1]<k[2]?"bg-danger":"bg-success"}" style="width:${Math.min(100,Math.round(k[1]/(k[2]*1.5)*100))}%"></div></div></td><td class="text-end">${k[1].toLocaleString("en-IN")}</td><td>${rB(k[1]<k[2]?"Low":"OK")}</td><td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-secondary sk" data-i="${i}" data-d="-50">−</button> <button class="btn btn-sm btn-outline-secondary sk" data-i="${i}" data-d="50">+</button></td></tr>`).join("")}</tbody></table></div>`;
 $("#rPanel").html(h)}
function rInit(){if(inited.rel)return rRender();inited.rel=1;rRender();
 $("#rTabs").on("click","button",function(){RTab=this.dataset.t;rRender()});
 $("#rPanel").on("click",".rq",function(){RQ[+this.dataset.i].s=this.dataset.s;rRender();toast("Status: "+this.dataset.s)})
  .on("click",".sk",function(){const k=STK[+this.dataset.i];k[1]=Math.max(0,k[1]+(+this.dataset.d)*(k[1]>1000?20:1));rRender()})}
const STY=["Food kit","Drinking water","Shelter","Medical","Clothing","Cash aid"],VT=[["Dangmal",420],["Ekakula",310],["Satapada",260],["Sipaulia",380]];
let SD=[["2026-10-12","Dangmal","Food kit",210,"S. Mohanty","Acknowledged"],["2026-10-13","Ekakula","Drinking water",180,"S. Mohanty","Acknowledged"],["2026-10-14","Dangmal","Shelter",95,"S. Mohanty","Pending"],["2026-10-15","Satapada","Cash aid",120,"B. Sahoo","Acknowledged"],["2026-10-16","Sipaulia","Medical",60,"B. Sahoo","Pending"],["2026-10-17","Ekakula","Clothing",140,"S. Mohanty","Pending"],["2026-10-18","Satapada","Food kit",230,"B. Sahoo","Acknowledged"]].map((a,i)=>({id:"DST-"+(2001+i),d:a[0],v:a[1],t:a[2],h:a[3],o:a[4],a:a[5]}));
function sRender(){const q=$("#sQ").val().toLowerCase(),t=$("#sT").val(),a=$("#sA").val(),sum=f=>SD.filter(f).reduce((s,x)=>s+x.h,0);
 $("#sk").html(kpi([["Households served",sum(()=>1).toLocaleString("en-IN"),"people"],["Dispatches logged",SD.length,"truck"],["Acknowledged",SD.filter(x=>x.a=="Acknowledged").length,"patch-check"],["Awaiting acknowledgement",SD.filter(x=>x.a=="Pending").length,"hourglass-split","warn"]]));
 $("#sVil").html(VT.map(v=>{const d=sum(x=>x.v==v[0]),p=Math.min(100,Math.round(d/v[1]*100));return `<div class="mb-3"><div class="d-flex justify-content-between small"><b>${v[0]}</b><span>${d} / ${v[1]} (${p}%)</span></div><div class="progress" style="height:8px"><div class="progress-bar ${p>=80?"bg-success":p>=40?"bg-warning":"bg-danger"}" style="width:${p}%"></div></div></div>`}).join(""));
 const rows=SD.filter(x=>(!q||(x.v+x.o+x.id).toLowerCase().includes(q))&&(!t||x.t==t)&&(!a||x.a==a));
 $("#sRows").html(rows.length?rows.map(x=>`<tr><td>${x.id}</td><td>${x.d}</td><td>${x.v}</td><td>${x.t}</td><td class="text-end">${x.h}</td><td>${x.o}</td><td><span class="badge text-bg-${x.a=="Pending"?"warning":"success"}">${x.a}</span></td><td class="text-end">${x.a=="Pending"?`<button class="btn btn-sm btn-outline-success sa" data-id="${x.id}">Mark acknowledged</button>`:"—"}</td></tr>`).join(""):'<tr><td colspan="8" class="text-center text-muted py-4">No records match these filters.</td></tr>');
 chart("c9",{type:"bar",data:{labels:STY,datasets:[{data:STY.map(s=>sum(x=>x.t==s)),backgroundColor:"#245A91"}]},options:{scales:{y:{ticks:{precision:0}}}}})}
function sInit(){if(inited.dst)return sRender();inited.dst=1;$("#sT").html(opts(STY,"All assistance types"));$("#mT2").html(opts(STY));$("#mV2").html(opts(VT.map(v=>v[0])));$("#mD2").val(new Date().toISOString().slice(0,10));sRender();
 $("#sQ").on("input",sRender);$("#sT,#sA").on("change",sRender);
 $("#sRows").on("click",".sa",function(){SD.find(x=>x.id==this.dataset.id).a="Acknowledged";sRender();toast("Acknowledgement recorded")});
 $("#mSave2").on("click",()=>{const h=+$("#mH2").val(),o=$("#mO2").val().trim();if(!h||h<1)return toast("Enter households served");if(!o)return toast("Enter the officer name");
  SD.push({id:"DST-"+(2001+SD.length),d:$("#mD2").val(),v:$("#mV2").val(),t:$("#mT2").val(),h,o,a:"Pending"});bootstrap.Modal.getInstance("#dsm").hide();$("#mH2,#mO2").val("");sRender();toast("Distribution recorded")})}
const OC=["Private Company","Public Sector Company","NGO","Charitable Trust","Foundation","Corporate CSR Partner"];
let OD=[["Example Steel Ltd","Private Company","A. Rao",25,18.5,3200,"Verified"],["Sample Power Corporation","Public Sector Company","M. Iyer",40,40,5400,"Verified"],["Demo Seva Sangh","NGO","K. Pradhan",3.2,2.1,1200,"Verified"],["Sample Relief Trust","Charitable Trust","N. Bora",1.5,0,0,"Pending"],["Example Care Foundation","Foundation","S. Menon",6,2.4,850,"Verified"],["Demo Infra CSR Wing","Corporate CSR Partner","T. Das",12,0,0,"Pending"],["Sample Traders Pvt Ltd","Private Company","R. Khan",0.5,0,0,"Rejected"]].map((a,i)=>({id:i,n:a[0],c:a[1],p:a[2],cm:a[3],rc:a[4],b:a[5],s:a[6]}));
const cr=n=>"₹"+(+n.toFixed(1))+" Cr";
function oRender(){const q=$("#oQ").val().toLowerCase(),c=$("#oC").val(),s=$("#oS").val(),sum=k=>OD.reduce((a,x)=>a+x[k],0);
 $("#ok").html(kpi([["Registered organisations",OD.length,"building"],["Verified",OD.filter(x=>x.s=="Verified").length,"patch-check"],["Pending verification",OD.filter(x=>x.s=="Pending").length,"hourglass-split","warn"],["Committed",cr(sum("cm")),"hand-thumbs-up"],["Received",cr(sum("rc")),"cash-stack"],["Beneficiaries supported",sum("b").toLocaleString("en-IN"),"people"]]));
 const rows=OD.filter(x=>(!q||(x.n+x.p).toLowerCase().includes(q))&&(!c||x.c==c)&&(!s||x.s==s));
 $("#oRows").html(rows.length?rows.map(x=>`<tr><td><b>${x.n}</b></td><td>${x.c}</td><td>${x.p}</td><td class="text-end">${cr(x.cm)}</td><td class="text-end">${cr(x.rc)}</td><td class="text-end">${x.b.toLocaleString("en-IN")}</td><td><span class="badge text-bg-${x.s=="Verified"?"success":x.s=="Pending"?"warning":"danger"}">${x.s}</span></td><td class="text-end text-nowrap">${x.s=="Pending"?`<button class="btn btn-sm btn-success os" data-i="${x.id}" data-s="Verified">Verify</button> <button class="btn btn-sm btn-outline-danger os" data-i="${x.id}" data-s="Rejected">Reject</button>`:x.s=="Rejected"?`<button class="btn btn-sm btn-outline-secondary os" data-i="${x.id}" data-s="Pending">Reopen</button>`:"—"}</td></tr>`).join(""):'<tr><td colspan="8" class="text-center text-muted py-4">No organisations match these filters.</td></tr>')}
function oInit(){if(inited.org)return oRender();inited.org=1;$("#oC").html(opts(OC,"All categories"));$("#oT").html(opts(OC));oRender();
 $("#oQ").on("input",oRender);$("#oC,#oS").on("change",oRender);
 $("#oRows").on("click",".os",function(){OD[+this.dataset.i].s=this.dataset.s;oRender();toast("Organisation "+this.dataset.s.toLowerCase())});
 $("#oSave").on("click",()=>{const n=$("#oN").val().trim(),p=$("#oP").val().trim(),e=$("#oE").val().trim(),m=$("#oM").val().trim(),pan=$("#oPan").val().trim().toUpperCase();let er="";
  if(!n||!p)er="Enter the organisation name and contact person.";else if(!/^\S+@\S+\.\S+$/.test(e))er="Enter a valid email address.";else if(!/^[6-9]\d{9}$/.test(m))er="Enter a 10-digit mobile number.";else if(pan&&!/^[A-Z]{5}\d{4}[A-Z]$/.test(pan))er="PAN must look like AAAAA0000A.";
  $("#oErr").text(er);if(er)return;OD.push({id:OD.length,n,c:$("#oT").val(),p,cm:0,rc:0,b:0,s:"Pending"});
  bootstrap.Modal.getInstance("#om").hide();$("#om input:not([type=file]),#om textarea").val("");oRender();toast("Submitted for verification")})}
const CS=["Proposed","Submitted","Under Review","Approved","Committed","Partially Received","Fully Received","Utilised","Closed"];let CF="";
let CT=[["Example Steel Ltd","Kendrapara Cyclone","Kendrapara","Cash",15000000,15000000,"Utilised"],["Example Steel Ltd","Puri Flood","Kendrapara","Relief materials",10000000,3500000,"Partially Received"],["Sample Power Corporation","Kendrapara Cyclone","Rajnagar","Rebuilding support",40000000,40000000,"Fully Received"],["Demo Seva Sangh","Puri Flood","Puri","Medical supplies",3200000,2100000,"Partially Received"],["Example Care Foundation","Brahmagiri Flood","Puri","Cash",6000000,0,"Committed"],["Demo Infra CSR Wing","Kendrapara Cyclone","Rajnagar","Services",12000000,0,"Under Review"],["Sample Relief Trust","Puri Flood","Kendrapara","Cash",1500000,0,"Proposed"]].map((a,i)=>({id:"CON-"+(3001+i),o:a[0],x:a[1],l:a[2],t:a[3],p:a[4],r:a[5],s:a[6]}));
const csvE=v=>{v=String(v);if(/^[=+\-@]/.test(v))v="'"+v;return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
function cRender(){const sum=(f,k)=>CT.filter(f).reduce((a,x)=>a+x[k],0),cnt=s=>CT.filter(x=>x.s==s).length;
 $("#ck").html(kpi([["Contributions",CT.length,"journal-text"],["Proposed value",inr(sum(()=>1,"p")),"hand-thumbs-up"],["Received",inr(sum(()=>1,"r")),"cash-stack"],["Awaiting review",cnt("Submitted")+cnt("Under Review")+cnt("Proposed"),"hourglass-split","warn"]]));
 $("#cFlow").html(CS.map(s=>`<button class="btn btn-sm ${s==CF?"btn-gov":"btn-outline-secondary"} cf" data-s="${s}">${s} <span class="badge bg-light text-dark">${cnt(s)}</span></button>`).join(""));
 const rows=CT.filter(x=>!CF||x.s==CF);
 $("#cRows").html(rows.length?rows.map(x=>`<tr><td>${x.id}</td><td>${x.o}</td><td>${x.x}<div class="small text-muted">${x.l}</div></td><td>${x.t}</td><td class="text-end">${inr(x.p)}</td><td class="text-end">${inr(x.r)}</td><td><span class="badge text-bg-${["Utilised","Closed","Fully Received"].includes(x.s)?"success":["Proposed","Submitted","Under Review"].includes(x.s)?"warning":"primary"}">${x.s}</span></td><td class="text-end">${x.s=="Closed"?"—":`<button class="btn btn-sm btn-outline-primary ca" data-id="${x.id}">Move to ${CS[CS.indexOf(x.s)+1]}</button>`}</td></tr>`).join(""):'<tr><td colspan="8" class="text-center text-muted py-4">No contributions at this stage.</td></tr>');
 const orgs=[...new Set(CT.map(x=>x.o))];
 $("#cRep").html(orgs.map(o=>{const l=CT.filter(x=>x.o==o);return `<tr><td>${o}</td><td class="text-end">${l.length}</td><td class="text-end">${inr(l.reduce((a,x)=>a+x.p,0))}</td><td class="text-end">${inr(l.reduce((a,x)=>a+x.r,0))}</td><td class="text-end"><button class="btn btn-sm btn-outline-secondary cs" data-o="${o}"><i class="bi bi-download"></i> CSV</button></td></tr>`}).join(""))}
function cInit(){if(inited.con)return cRender();inited.con=1;gSel("cm");$("#cmO").html(opts(OD.filter(x=>x.s=="Verified").map(x=>x.n)));$("#cmDt").val(new Date().toISOString().slice(0,10));cRender();
 $(".cmp").on("change",()=>gSel("cm"));
 $("#cFlow").on("click",".cf",function(){CF=CF==this.dataset.s?"":this.dataset.s;cRender()});
 $("#cRows").on("click",".ca",function(){const x=CT.find(a=>a.id==this.dataset.id);x.s=CS[CS.indexOf(x.s)+1];if(x.s=="Partially Received")x.r=Math.max(x.r,Math.round(x.p/2));if(x.s=="Fully Received")x.r=x.p;cRender();toast(x.id+": "+x.s)});
 $("#cRep").on("click",".cs",function(){const o=this.dataset.o,h=["ID","Disaster","Location","Type","Proposed","Received","Status"],l=CT.filter(x=>x.o==o);
  const csv=[["Statement: "+o],h,...l.map(x=>[x.id,x.x,x.l,x.t,x.p,x.r,x.s])].map(r=>r.map(csvE).join(",")).join("\n"),a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=o.replace(/\W+/g,"-").toLowerCase()+"-statement.csv";a.click();toast("Statement downloaded")});
 $("#cmSave").on("click",()=>{const p=+$("#cmA").val(),r=+$("#cmR").val()||0;let er="";if(!$("#cmO").val())er="Select a verified organisation.";else if(!p||p<1)er="Enter the proposed amount.";else if(r>p)er="Received amount cannot exceed the proposed amount.";
  $("#cmErr").text(er);if(er)return;CT.push({id:"CON-"+(3001+CT.length),o:$("#cmO").val(),x:$("#cmX").val().replace(/^DIS-\S+\s/,""),l:$("#cmG").val()||$("#cmD").val()||"—",t:$("#cmT").val(),p,r,s:"Proposed"});
  bootstrap.Modal.getInstance("#cm").hide();$("#cmA").val("");$("#cmR").val(0);cRender();toast("Contribution saved as proposed")})}
const OR=ROLES.filter(r=>r[0]!="Company / NGO"),DEP={Odisha:0,District:2,Block:3,GP:4};
let OF=[["Anita Rao","OD-0001","Commissioner","Revenue & Disaster Management Department","98XXXXXX01","anita.rao@example.gov.in","Odisha Administrator","Odisha","Active"],["Biswajit Mohanty","OD-0112","State Relief Commissioner","Revenue & Disaster Management Department","98XXXXXX12","b.mohanty@example.gov.in","Odisha Nodal Officer","Odisha","Active"],["Pallavi Behera","OD-0207","Additional Commissioner","Odisha State Disaster Management Authority","98XXXXXX23","p.behera@example.gov.in","Odisha Nodal Officer","Odisha","Active"],["Ranjit Sahu","OD-0318","District Collector","District Administration","98XXXXXX34","r.sahu@example.gov.in","District Collector / Nodal Officer","Odisha › Kendrapara","Active"],["Sasmita Sahoo","OD-0421","Block Development Officer","Block Office","98XXXXXX45","s.sahoo@example.gov.in","Block Officer","Odisha › Puri › Brahmagiri","Inactive"],["Dipak Nayak","OD-0530","GP Secretary","Gram Panchayat","98XXXXXX56","d.nayak@example.gov.in","GP Officer","Odisha › Kendrapara › Rajnagar › Dangmal GP","Active"],["Manoj Behera","OD-0644","Field Surveyor","Block Office","98XXXXXX67","m.behera@example.gov.in","Field Surveyor","Odisha › Kendrapara › Rajnagar › Dangmal GP","Active"]].map((a,i)=>({id:i,n:a[0],e:a[1],ds:a[2],dp:a[3],m:a[4],em:a[5],ro:a[6],j:a[7],s:a[8]}));
function ofRender(){const q=$("#ofQ").val().toLowerCase(),r=$("#ofRl").val(),s=$("#ofSt").val();
 $("#ofk").html(kpi([["Total officers",OF.length,"person-badge"],["Active",OF.filter(x=>x.s=="Active").length,"person-check"],["Inactive",OF.filter(x=>x.s=="Inactive").length,"person-slash","warn"],["Roles in use",new Set(OF.map(x=>x.ro)).size,"diagram-3"]]));
 const rows=OF.filter(x=>(!q||(x.n+x.e+x.em).toLowerCase().includes(q))&&(!r||x.ro==r)&&(!s||x.s==s));
 $("#ofRows").html(rows.length?rows.map(x=>`<tr><td><b>${x.n}</b><div class="small text-muted">${x.e} · ${x.em}</div></td><td>${x.ds}<div class="small text-muted">${x.dp}</div></td><td>${x.ro}</td><td class="small">${x.j}</td><td>${x.m}</td><td><span class="badge text-bg-${x.s=="Active"?"success":"secondary"}">${x.s}</span></td><td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-${x.s=="Active"?"warning":"success"} oft" data-i="${x.id}" title="${x.s=="Active"?"Deactivate":"Activate"}"><i class="bi bi-${x.s=="Active"?"person-slash":"person-check"}"></i></button> <button class="btn btn-sm btn-outline-primary ofr" data-i="${x.id}" title="Reset password"><i class="bi bi-key"></i></button> <button class="btn btn-sm btn-outline-secondary ofl" data-i="${x.id}" title="Login activity"><i class="bi bi-clock-history"></i></button></td></tr>`).join(""):'<tr><td colspan="7" class="text-center text-muted py-4">No officers match these filters.</td></tr>')}
function ofDepth(){const d=DEP[OR.find(r=>r[0]==$("#ofRo").val())[2]];GK.forEach((k,i)=>$("#of"+k).closest(".ofj").toggle(i<d));$("#ofJh").text(d?"Jurisdiction":"Jurisdiction: all of Odisha");return d}
function ofInit(){if(inited.off)return ofRender();inited.off=1;$("#ofRl").html(opts(OR.map(r=>r[0]),"All roles"));$("#ofRo").html(opts(OR.map(r=>r[0])));gSel("of");ofDepth();ofRender();
 $("#ofQ").on("input",ofRender);$("#ofRl,#ofSt").on("change",ofRender);$(".ofp").on("change",()=>gSel("of"));$("#ofRo").on("change",ofDepth);
 $("#ofAdd").on("click",()=>{$("#ofm input").val("");$("#ofErr").text("");gSel("of");ofDepth();bootstrap.Modal.getOrCreateInstance("#ofm").show()});
 $("#ofRows").on("click",".oft",function(){const x=OF[+this.dataset.i];x.s=x.s=="Active"?"Inactive":"Active";ofRender();toast(x.n+" is now "+x.s.toLowerCase())})
  .on("click",".ofr",function(){const x=OF[+this.dataset.i],a=new Uint8Array(10);crypto.getRandomValues(a);const pw=[...a].map(b=>"ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"[b%54]).join("");
   $("#ofaT").text("Password reset");$("#ofaB").html(`<p class="small">Temporary password for <b>${x.n}</b>. Share it through a secure channel. The officer must change it at first login.</p><div class="input-group"><input class="form-control font-monospace" readonly value="${pw}"><button class="btn btn-outline-secondary" onclick="navigator.clipboard&&navigator.clipboard.writeText('${pw}');toast('Copied')">Copy</button></div>`);bootstrap.Modal.getOrCreateInstance("#ofa").show()})
  .on("click",".ofl",function(){const x=OF[+this.dataset.i];$("#ofaT").text("Login activity · "+x.n);
   $("#ofaB").html('<ul class="list-unstyled small mb-0">'+[["Today, 09:12","Signed in","OTP verified"],["Today, 09:40","Approved 6 relief requests","Pending queue"],["Yesterday, 17:05","Signed out","Session ended"],["Yesterday, 10:22","Signed in","OTP verified"],["29 Oct, 14:48","Failed sign-in","Wrong password"]].map(l=>`<li class="py-2 border-bottom d-flex justify-content-between gap-2"><span><b>${l[1]}</b><br><span class="text-muted">${l[2]}</span></span><span class="text-muted text-nowrap">${l[0]}</span></li>`).join("")+'</ul><div class="small text-muted mt-2">Sample log</div>');bootstrap.Modal.getOrCreateInstance("#ofa").show()});
 $("#ofSave").on("click",()=>{const n=$("#ofN").val().trim(),e=$("#ofE").val().trim(),m=$("#ofM").val().trim(),em=$("#ofEm").val().trim(),d=ofDepth(),par=GK.slice(0,d).map(k=>$("#of"+k).val());let er="";
  if(!n||!e)er="Enter the officer name and employee ID.";else if(OF.some(x=>x.e.toLowerCase()==e.toLowerCase()))er="This employee ID already has a login.";else if(!/^[6-9]\d{9}$/.test(m))er="Enter a 10-digit mobile number.";else if(!/^\S+@\S+\.\S+$/.test(em))er="Enter a valid official email.";else if(par.some(p=>!p))er="Select the full jurisdiction for this role.";
  $("#ofErr").text(er);if(er)return;OF.push({id:OF.length,n,e,ds:$("#ofDs").val().trim()||"—",dp:$("#ofDp").val().trim()||"—",m:m.slice(0,2)+"XXXXXX"+m.slice(-2),em,ro:$("#ofRo").val(),j:d?par.join(" › "):"Odisha",s:$("#ofAs").val()});
  bootstrap.Modal.getInstance("#ofm").hide();ofRender();toast("Officer login created")})}
const esc=s=>String(s).replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
const REP=[
 {t:"Odisha disaster summary",d:"Every declared disaster in Odisha with reach and status.",c:["Disaster","Type","District","Villages affected","Severity","Status"],ch:[0,3],r:()=>DIS.map(d=>[d[1],d[2],d[9],d[7],d[6],d[8]])},
 {t:"District-wise disaster report",d:"Disasters, districts and villages across Odisha.",c:["District","Disasters","Affected districts","Villages affected"],ch:[0,3],r:()=>{const o={};DIS.forEach(d=>{const s=o[d[9]]=o[d[9]]||[d[9],0,0,0];s[1]++;s[2]+=d[4];s[3]+=d[7]});return Object.values(o)}},
 {t:"District-wise victim report",d:"Registered, verified and relieved beneficiaries by district.",c:["State","District","Registered","Verified","Relief distributed"],ch:[1,2],r:()=>{const o={};VIC.forEach(v=>{const s=o[v[3]+"|"+v[4]]=o[v[3]+"|"+v[4]]||[v[3],v[4],0,0,0];s[2]++;if(v[8]=="Verified")s[3]++;if(v[9]=="Distributed")s[4]++});return Object.values(o)}},
 {t:"Village-wise damage report",d:"Assessed damage and estimated loss by village.",c:["Village","District","Category","Estimated loss (₹)","Status"],ch:[0,3],r:()=>DA.map(x=>[x.v,x.d,x.c,x.loss,x.s])},
 {t:"Relief distribution report",d:"Dispatches and acknowledgement status.",c:["Date","Village","Assistance","Households","Officer","Acknowledgement"],ch:[1,3],r:()=>SD.map(x=>[x.d,x.v,x.t,x.h,x.o,x.a])},
 {t:"Company contribution report",d:"Pledged and received contributions by organisation.",c:["Organisation","Disaster","Type","Proposed (₹)","Received (₹)","Status"],ch:[0,4],r:()=>CT.map(x=>[x.o,x.x,x.t,x.p,x.r,x.s])},
 {t:"Fund utilisation report",d:"Funds received, allocated and utilised by source.",c:["Source","Received (₹ Cr)","Allocated (₹ Cr)","Utilised (₹ Cr)","Balance (₹ Cr)"],ch:[0,3],r:()=>[["Government",120,110,88],["CSR",70,60,41],["Public donations",35,30,12],["NGO contributions",21,18,19]].map(a=>[a[0],a[1],a[2],a[3],a[1]-a[3]])},
 {t:"Officer performance report",d:"Requests handled and turnaround by officer.",c:["Officer","Role","Requests handled","Avg. turnaround (hrs)","Status"],ch:[0,2],r:()=>OF.map((x,i)=>[x.n,x.ro,40+(i*17)%90,6+(i*5)%20,x.s])},
 {t:"Pending applications",d:"Applications waiting for verification.",c:["Reg. ID","Name","State","District","Applied","Days pending"],ch:[3,5],r:()=>VIC.filter(v=>v[8]=="Pending").map(v=>[v[0],v[1],v[3],v[4],v[7],Math.max(1,Math.round((new Date("2026-11-02")-new Date(v[7]))/864e5))])},
 {t:"Audit reports",d:"Open and closed audit findings.",c:["Audit ID","Area","Finding","Severity","Status"],ch:null,r:()=>[["AUD-101","Fund utilisation","Utilisation certificate pending for 2 allocations","Medium","Open"],["AUD-102","Relief distribution","Acknowledgement missing for 4 dispatches","Low","In progress"],["AUD-103","Beneficiary data","Duplicate registration check passed","None","Closed"],["AUD-104","CSR receipts","Payment proof missing for 1 contribution","High","Open"]]}];
let RI=0,RPc=null;
function rpRender(){const R=REP[RI],si=R.c.indexOf("State"),q=$("#rpQ").val().toLowerCase(),s=$("#rpS").val();
 $("#rpList").html(REP.map((x,i)=>`<a href="${pageUrl("reports")}" class="list-group-item list-group-item-action ${i==RI?"active":""}" data-i="${i}">${x.t}</a>`).join(""));
 $("#rpT").text(R.t);$("#rpD").text(R.d);$("#rpS").prop("disabled",si<0).toggleClass("opacity-50",si<0);
 const rows=R.r().filter(r=>(si<0||!s||r[si]==s)&&(!q||r.join(" ").toLowerCase().includes(q)));RPc={t:R.t,c:R.c,rows};
 $("#rpH").html("<tr>"+R.c.map(h=>`<th>${esc(h)}</th>`).join("")+"</tr>");
 $("#rpB").html(rows.length?rows.map(r=>"<tr>"+r.map(v=>`<td>${typeof v=="number"?v.toLocaleString("en-IN"):esc(v)}</td>`).join("")+"</tr>").join(""):`<tr><td colspan="${R.c.length}" class="text-center text-muted py-4">No rows match these filters.</td></tr>`);
 $("#rpN").text(rows.length+" row(s) · generated 2 Nov 2026 · "+(si<0?" · State filter not available for this report":""));
 $("#c10").parent().toggle(!!R.ch&&rows.length>0);
 if(R.ch&&rows.length){const g={};rows.forEach(r=>g[r[R.ch[0]]]=(g[r[R.ch[0]]]||0)+(+r[R.ch[1]]||0));chart("c10",{type:"bar",data:{labels:Object.keys(g),datasets:[{label:R.c[R.ch[1]],data:Object.values(g),backgroundColor:"#245A91"}]},options:{plugins:{legend:{display:true,position:"bottom"}}}})}}
function rpDl(name,txt,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()}
function rpInit(){if(inited.rep)return rpRender();inited.rep=1;$("#rpS").html(opts(STATES,"Odisha"));rpRender();
 $("#rpList").on("click","a",function(e){e.preventDefault();RI=+this.dataset.i;$("#rpQ").val("");$("#rpS").val("");rpRender()});
 $("#rpQ").on("input",rpRender);$("#rpS").on("change",rpRender);
 const nm=()=>RPc.t.toLowerCase().replace(/\W+/g,"-");
 $("#rpPdf").on("click",()=>print());
 $("#rpCsv").on("click",()=>rpDl(nm()+".csv",[[RPc.t],RPc.c,...RPc.rows].map(r=>r.map(csvE).join(",")).join("\n"),"text/csv"));
 $("#rpXls").on("click",()=>rpDl(nm()+".xls",`<html><meta charset="utf-8"><body><table border="1"><tr>${RPc.c.map(h=>`<th>${esc(h)}</th>`).join("")}</tr>${RPc.rows.map(r=>"<tr>"+r.map(v=>`<td>${esc(v)}</td>`).join("")+"</tr>").join("")}</table></body></html>`,"application/vnd.ms-excel"))}
function pick(i){$("#roleSelect").val(i);$("#linfo").text(ROLES[i][1])}
function route(){let h=document.body.dataset.view||"home";if(!views[h])h="home";
 const app=!["home","login"].includes(h);
 $("#pubhead,#pub").toggleClass("d-none",app);$("#shell").toggleClass("d-none",!app);
 $("[data-view]").addClass("d-none").filter(`[data-view=${h}]`).removeClass("d-none");
 if(app){const currentFile=location.pathname.split("/").pop();$("#menu .nav-link").removeClass("active").filter(function(){return this.href.split("?")[0].endsWith("/"+currentFile)}).addClass("active");$("#menu .sub .active").closest(".collapse").addClass("show").prev('[data-bs-toggle="collapse"]').attr("aria-expanded","true");}
 if(h==="stub")$("#stubt").text(document.body.dataset.title||"Module");
 views[h]();window.scrollTo(0,0);bootstrap.Offcanvas.getInstance("#sb")?.hide()}
$(document).on("change",".pv",function(){const p=$(this).siblings(".prev").empty();[...this.files].slice(0,5).forEach(f=>p.append($("<img>").attr("src",URL.createObjectURL(f))))});
const roleParam=new URLSearchParams(location.search).get("role");const storedRole=sessionStorage.getItem("odishaPortalRole");const roleIndex=Number.parseInt(roleParam===null?(storedRole||"") : roleParam,10);if(roleIndex>=0&&roleIndex<ROLES.length)window.me=ROLES[roleIndex];
$("#approve").on("click",()=>{if(stage<5){stage++;wf();$("#wfmsg").text(stage<5?"Moved to: "+STG[stage]:"All stages complete")}});
$("#reject").on("click",()=>$("#wfmsg").text("Rejected at "+STG[Math.min(stage,4)]));
$("[data-view]").addClass("d-none");route();
