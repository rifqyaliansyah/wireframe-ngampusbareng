/* Ngampus Bareng — wireframe engine (vanilla JS, no build) */
const S = {}, ORDER = [];
const GROUPS = [
  ['map','Indeks'],['pub','A · Website publik'],['auth','B · Autentikasi & profil'],['stu','C · Platform siswa'],
  ['to','Try Out (PRD)'],['k','Kondisi khusus (PRD)'],['buy','Pembelian & hak akses'],['learn','Belajar & Journey'],
  ['adm','D · Admin (Tim NB)'],['adto','Admin — Bank soal & TO (PRD)'],['prog','F · Program / B2B'],['tut','E · Tutor & mentor'],['fd','G · Fondasi platform']
];
function def(s){ S[s.id]=s; ORDER.push(s.id); }

/* ---------- state ---------- */
const LS='nb-wf-v2';
const DEFAULT_G={
  role:'reguler', strict:true,
  user:{name:'Raka Pratama',email:'raka@email.com',id:'NB-2027-0012'},
  targets:[], targetDraft:null, targetOpen:'',
  users:null, reports:[], security:{screenshot:0,fullscreen:0},
  formMode:'add', formReturn:'AM-07', editUser:null, lastSavedName:'', lastAction:'add'
};
const _stored=JSON.parse(localStorage.getItem(LS)||'{}');
let ST=Object.assign({cur:'SM-00', V:{}, dev:'both', flow:null, step:0, hot:false, idx:true}, _stored);
ST.V=Object.assign({}, _stored.V||{});
ST.G=Object.assign({}, DEFAULT_G, _stored.G||{});
ST.G.security=Object.assign({}, DEFAULT_G.security, (_stored.G||{}).security||{});
ST.G.user=Object.assign({}, DEFAULT_G.user, (_stored.G||{}).user||{});
const save=()=>localStorage.setItem(LS, JSON.stringify(ST));
let CUR=null;
function v(key){ const s=CUR; const d=s.variants&&s.variants[key]; const val=ST.V[s.id+'.'+key]; return val!==undefined?val:(d?d.opts[0]:undefined); }
function setV(id,key,val){ ST.V[id+'.'+key]=val; }
function gv(path,def){ const val=String(path).split('.').reduce((o,k)=>o==null?undefined:o[k],ST.G); return val===undefined?def:val; }
function setG(path,val){ const ks=String(path).split('.'); const last=ks.pop(); let o=ST.G; ks.forEach(k=>{ if(o[k]==null||typeof o[k]!=='object')o[k]={}; o=o[k]; }); o[last]=val; save(); }
const isProgram=()=>gv('role')==='program';
const strictAdmin=()=>!!gv('strict');
const strictFor=mode=>strictAdmin()&&mode==='Persis UTBK';
function normalizeRoleState(){
  if(isProgram())return;
  if(ST.V['TO-01.filter']==='Program')ST.V['TO-01.filter']='Semua';
  if(ST.V['TO-02.jenis']==='Program')ST.V['TO-02.jenis']='Reguler';
  if(ST.V['TO-05.jenis']==='Program')ST.V['TO-05.jenis']='Reguler';
  if(ST.V['DB-01.state']==='Peserta program')ST.V['DB-01.state']='Sudah punya hasil';
}

/* ---------- helpers ---------- */
const W=[92,78,85,64,96,70,88,55,81,74];
function lines(n,max=100,dark){let o='';for(let i=0;i<n;i++)o+=`<i class="ln${dark&&i==0?' d':''}" style="width:${Math.round(W[(i+n)%10]*max/100)}%"></i>`;return o;}
const ph=(t,h=120,st='')=>`<div class="ph" style="height:${h}px;${st}"><span>${t}</span></div>`;
const go=id=>` data-go="${id}"`;
const btn=(t,id,c='')=>`<button class="btn ${c}"${id?go(id):''}>${t}</button>`;
const tag=(t,c='')=>`<span class="tag ${c}">${t}</span>`;
const tbd=(t='Belum ditentukan')=>`<span class="tbd">${t}</span>`;
const rule=t=>`<span class="rule">${t}</span>`;
const ic=(c='')=>`<span class="ic">${c}</span>`;
const box=(title,body,extra='',cls='')=>`<div class="box ${cls}"${extra}>${title?`<div class="ch"><b>${title}</b></div>`:''}${body}</div>`;
const fld=(l,p='',c='')=>`<div class="fld"><label>${l}</label><div class="inp ${c}">${p}</div></div>`;
const chk=(t,on)=>`<div class="chk ${on?'on':''}"><i></i>${t}</div>`;
const bar=p=>`<div class="bar"><i style="width:${p}%"></i></div>`;
const nanti=(t)=>`<div class="nanti">${t}</div>`;
const seg=(key,opts,cur,id)=>`<div class="seg">${opts.map(o=>`<span class="${o==cur?'on':''}" data-set="${(id||CUR.id)}.${key}=${o}">${o}</span>`).join('')}</div>`;
const tabs=(key,opts,cur)=>`<div class="tabs">${opts.map(o=>`<span class="${o==cur?'on':''}" data-set="${CUR.id}.${key}=${o}">${o}</span>`).join('')}</div>`;
const steps=(arr,cur)=>`<div class="steps">${arr.map((s,i)=>`${i?'<span class="dv"></span>':''}<div class="s ${i==cur?'on':i<cur?'dn':''}"><span class="n">${i<cur?'✓':i+1}</span>${s}</div>`).join('')}</div>`;
const table=(head,rows,goFn)=>`<div class="tw"><table class="t"><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr${goFn?go(goFn(i)):''}>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const SUB=[['PU','Penalaran Umum',30,'30'],['PPU','Pengetahuan & Pemahaman Umum',20,'15'],['PBM','Pemahaman Bacaan & Menulis',20,'25'],['PK','Pengetahuan Kuantitatif',20,'20'],['LBI','Literasi Bahasa Indonesia',30,'42,5'],['LBE','Literasi Bahasa Inggris',20,'20'],['PM','Penalaran Matematika',20,'42,5']];

/* ---------- shells ---------- */
function pubNav(){return `<div class="pnav"><div class="logo"${go('PB-01')}>NB</div><b class="hide-m">Ngampus Bareng</b>
<div class="navl hide-m"><a${go('PB-04')}>Tentang</a><a${go('PB-01')}>Try Out</a><a${go('PB-02')}>Paket</a><a${go('PB-03')}>FAQ</a><a${go('PB-05')} class="muted">Blog</a></div><span class="sp"></span>
${btn('Masuk','AU-01','sm g')}${btn('Daftar','AU-02','sm p')}<span class="ic show-m" style="display:none">≡</span></div>`;}
function pubFoot(){return `<div class="foot"><div class="g4"><div class="col"><div class="logo">NB</div>${lines(2,80)}</div>
<div class="col sm"><b>Produk</b><a${go('PB-01')}>Try Out</a><a${go('PB-02')}>Paket</a><a${go('PB-04')}>Tentang</a></div>
<div class="col sm"><b>Bantuan</b><a${go('PB-03')}>FAQ</a><a${go('BT-01')}>Kontak CS</a></div>
<div class="col sm"><b>Legal</b><span>Kebijakan privasi</span><span>Syarat & ketentuan</span></div></div><hr style="margin:16px 0 8px"><span class="sm">© Ngampus Bareng</span></div>`;}
function shell(o){ // generic app shell
  const nav=o.nav.map(n=>n.grp?`<div class="grp">${n.grp}</div>`:`<a class="${n.id==o.on?'on':''}"${go(n.go)}>${ic(n.i||'')}${n.t}${n.s?` <span class="sp"></span><span class="sm">${n.s}</span>`:''}</a>`).join('');
  return `<div class="app"><aside class="snav hide-m"><div class="row nw"><div class="logo"${go(o.home)}>NB</div><div><b>Ngampus Bareng</b><div class="sm">${o.role}</div></div></div><nav>${nav}</nav></aside>
<div class="amain"><div class="atop"><div class="logo show-mf"${go(o.home)} style="display:none">NB</div><b class="h3">${o.title||''}</b><span class="sp"></span>${o.topR||''}<span class="ic" title="Notifikasi">◔</span><div class="av"${go(o.acct||o.home)}></div></div>
<div class="acont">${o.body}</div>${o.bnav?`<div class="bnav">${o.bnav.map(n=>`<a class="${n.id==o.on?'on':''}"${go(n.go)}>${ic()}${n.t}</a>`).join('')}</div>`:''}</div></div>`;}
const STU_NAV=[{id:'db',t:'Beranda',go:'DB-01',i:'⌂'},{id:'to',t:'Try Out',go:'TO-01',i:'✎'},{id:'bl',t:'Belajar',go:'BL-01',i:'▶'},{id:'jr',t:'Journey',go:'JR-01',i:'↗'},{id:'pk',t:'Paket saya',go:'PK-01',i:'▢'},{id:'bt',t:'Bantuan',go:'BT-01',i:'?'},{id:'ak',t:'Akun',go:'AK-01',i:'◯'}];
const STU_B=[{id:'db',t:'Beranda',go:'DB-01'},{id:'to',t:'Try Out',go:'TO-01'},{id:'bl',t:'Belajar',go:'BL-01'},{id:'jr',t:'Journey',go:'JR-01'},{id:'ak',t:'Akun',go:'AK-01'}];
const stu=(on,title,body,topR='')=>{const nav=isProgram()?[...STU_NAV,{id:'pg',t:'Program saya',go:'PG-S1',i:'◎'}]:STU_NAV;return shell({role:isProgram()?'Siswa · Program':'Siswa',home:'DB-01',acct:'AK-01',nav,bnav:STU_B,on,title,body,topR:topR||`<span class="tag ${isProgram()?'k':'hide-m'}"${isProgram()?go('PG-S1'):''}>${isProgram()?'Peserta Program':'Peserta Reguler'}</span><span class="tag hide-m"${go('PK-01')}>Kuota TO: 3</span>`});};
const ADM_NAV=[{grp:'Ringkasan'},{id:'dash',t:'Dashboard',go:'AM-01',i:'⌂'},{grp:'Bisnis'},{id:'usr',t:'Pengguna',go:'AM-02'},{id:'sel',t:'Seleksi Akademik',go:'AM-07',i:'◎'},{id:'jual',t:'Penjualan',go:'AM-03'},{id:'pkt',t:'Paket, harga, bundling',go:'AM-04'},{id:'vch',t:'Voucher & referral',go:'AM-05'},
{grp:'Akademik'},{id:'bank',t:'Bank soal',go:'AD-01'},{id:'imp',t:'Import massal',go:'AD-02'},{id:'susun',t:'Penyusun TO',go:'AD-04'},{id:'lap',t:'Hasil & laporan TO',go:'AD-05'},{id:'kont',t:'Konten belajar',go:'AM-06'},
{grp:'Program'},{id:'prog',t:'Program B2B',go:'PG-01'},{grp:'Sistem'},{id:'fd',t:'Fondasi',go:'FD-01'}];
const adm=(on,title,body,topR='')=>shell({role:'Admin · Tim NB',home:'AM-01',nav:ADM_NAV,on,title,body,topR});
const pageHead=(kick,title,right='')=>`<div class="row nw" style="align-items:flex-end"><div><div class="kick">${kick}</div><div class="h1">${title}</div></div><span class="sp"></span>${right}</div>`;

/* ---------- render ---------- */
const $=s=>document.querySelector(s);
function stepRef(str){const [id,q]=str.split('?');const sets={};(q||'').split('&').filter(Boolean).forEach(p=>{const [k,val]=p.split('=');sets[k]=decodeURIComponent(val);});return {id,sets};}
function nav(str){const {id,sets}=stepRef(str); if(!S[id]){console.warn('no screen',id);return;} for(const k in sets) setV(id,k,sets[k]); ST.cur=id;
  if(ST.flow){const f=FLOWS[ST.flow]; const i=f.steps.findIndex(x=>stepRef(x).id==id && Object.entries(stepRef(x).sets).every(([k,val])=>ST.V[id+'.'+k]==val)); if(i>=0)ST.step=i;}
  save(); render(); $('.stage').scrollTop=0;}
function render(){
  const s=S[ST.cur]||S['SM-00']; CUR=s;
  document.getElementById('app').classList.toggle('noidx',!ST.idx);
  document.body.classList.toggle('hot',ST.hot);
  // index
  const q=($('#q')&&$('#q').value||'').toLowerCase();
  $('#idxList').innerHTML=GROUPS.map(([g,gl])=>{const items=ORDER.filter(id=>S[id].group==g&&(!q||(id+' '+S[id].name).toLowerCase().includes(q)));
    if(!items.length)return '';return `<div class="idx-g"><h6>${gl}</h6>${items.map(id=>`<div class="idx-i ${id==s.id?'on':''}" data-nav="${id}"><code>${id}</code><span>${S[id].name}</span>${S[id].st?`<em>${S[id].st}</em>`:''}</div>`).join('')}</div>`;}).join('');
  // header
  $('#hcode').textContent=s.id; $('#hname').textContent=s.name;
  $('#hst').innerHTML=s.st?tag(s.st+(s.rel?` · ${s.rel}`:''),s.st=='Ya'?'k':'d'):(s.rel?tag(s.rel,'g'):'');
  $('#dev').innerHTML=['Keduanya','Laptop','HP'].map((d,i)=>{const k=['both','desk','mob'][i];return `<span class="${ST.dev==k?'on':''}" data-dev="${k}">${d}</span>`}).join('');
  $('#hot').classList.toggle('on',ST.hot);
  // variants
  const vs=s.variants||{};
  const roleCtl=`<div class="ctl"><span>Peran demo</span><div class="seg">${[['reguler','Peserta Reguler'],['program','Peserta Program']].map(([k,t])=>`<span class="${gv('role')==k?'on':''}" data-role="${k}">${t}</span>`).join('')}</div></div>`;
  const strictCtl=`<div class="ctl"><span>Mode strict</span><span class="tag ${strictAdmin()?'k':'d'}" data-nav="AD-04?tahap=Pengaturan" style="cursor:pointer">${strictAdmin()?'ON':'OFF'} · atur</span></div>`;
  $('#vbar').innerHTML=roleCtl+strictCtl+Object.keys(vs).map(k=>`<div class="ctl"><span>${vs[k].label}</span>${seg(k,vs[k].opts,v(k))}</div>`).join('')+(s.demoJump?`<div class="ctl"><span>Jalan pintas demo</span><div class="seg"><span data-nav="${s.demoJump.to}">${s.demoJump.label} ›</span></div></div>`:'');
  // notes
  $('#notes').innerHTML=(s.notes||[]).map(n=>`<li>${n}</li>`).join('');
  // flow
  if(ST.flow&&FLOWS[ST.flow]){const f=FLOWS[ST.flow];$('#flowbar').innerHTML=`<b>Alur ${f.n}: ${f.t}</b><span class="sp" style="flex:0 0 8px"></span>${f.steps.map((x,i)=>`${i?'<span class="ar">→</span>':''}<span class="st ${i==ST.step?'on':''}" data-fstep="${i}">${stepRef(x).id}${f.lab&&f.lab[i]?' '+f.lab[i]:''}</span>`).join('')}<span class="sp"></span><button data-fnav="-1">‹ Sebelumnya</button><button data-fnav="1">Berikutnya ›</button><button data-fexit>Keluar alur</button>`;}
  else $('#flowbar').innerHTML='';
  // frames
  const html=s.render();
  const fr=[];
  if(s.only!='mob'&&ST.dev!='mob') fr.push(`<div><div class="flab">LAPTOP · 1180</div><div class="frame desk">${html}</div></div>`);
  if(s.only!='desk'&&ST.dev!='desk') fr.push(`<div><div class="flab">HP · 390</div><div class="frame mob">${s.renderM?s.renderM():html}</div></div>`);
  if(!fr.length) fr.push(`<div><div class="flab">LAPTOP · 1180</div><div class="frame desk">${html}</div></div>`);
  $('#frames').innerHTML=fr.join('');
  fit();
}
function fit(){const f=$('#frames'),w=$('#fwrap'),st=$('.stage');f.style.transform='none';const nw=f.scrollWidth,nh=f.scrollHeight;const av=st.clientWidth-48;const sc=Math.min(1,av/nw);f.style.transform=`scale(${sc})`;w.style.width=nw*sc+'px';w.style.height=nh*sc+'px';}
document.addEventListener('click',e=>{
  const t=e.target;
  const role=t.closest('[data-role]'); if(role){ST.G.role=role.dataset.role;normalizeRoleState();save();render();return;}
  const usr=t.closest('[data-user]'); if(usr){const [act,a,b]=usr.dataset.user.split(':');if(act==='save'){saveUserForm();render();}else openUserForm(act,a,b);return;}
  const tg=t.closest('[data-target]'); if(tg){targetAction(tg.dataset.target);render();return;}
  const gs=t.closest('[data-gset]'); if(gs){const [k,val]=gs.dataset.gset.split('=');setG(k,val===undefined?!gv(k):(val==='1'||val==='on'||val==='true'));render();return;}
  const rp=t.closest('[data-report]'); if(rp){sendReport();render();return;}
  const sec=t.closest('[data-sec]'); if(sec){if(sec.dataset.sec==='screenshot')setG('security.screenshot',(gv('security.screenshot')||0)+1);ST.V['TO-08.sec']=sec.dataset.sec;save();render();return;}
  const sv=t.closest('[data-set]'); if(sv){e.preventDefault();if(sv.dataset.saving)markSaving();sv.dataset.set.split('|').forEach(p=>{const [lhs,val]=p.split('=');const [id,...k]=lhs.split('.');setV(id,k.join('.'),val);});save();render();if(!sv.dataset.go)return;}
  const g=t.closest('[data-go]'); if(g&&g.closest('.frame')){e.preventDefault();nav(g.dataset.go);return;}
  const n=t.closest('[data-nav]'); if(n){ST.flow=null;nav(n.dataset.nav);return;}
  const d=t.closest('[data-dev]'); if(d){ST.dev=d.dataset.dev;save();render();return;}
  const fs=t.closest('[data-fstep]'); if(fs){ST.step=+fs.dataset.fstep;nav(FLOWS[ST.flow].steps[ST.step]);return;}
  const fn=t.closest('[data-fnav]'); if(fn){const f=FLOWS[ST.flow];ST.step=Math.max(0,Math.min(f.steps.length-1,ST.step+ +fn.dataset.fnav));nav(f.steps[ST.step]);return;}
  if(t.closest('[data-fexit]')){ST.flow=null;save();render();return;}
  const fl=t.closest('[data-flow]'); if(fl){ST.flow=fl.dataset.flow;ST.step=0;if(FLOWS[ST.flow].role){ST.G.role=FLOWS[ST.flow].role;normalizeRoleState();}nav(FLOWS[ST.flow].steps[0]);return;}
  if(t.closest('#hot')){ST.hot=!ST.hot;save();render();return;}
  if(t.closest('#tidx')){ST.idx=!ST.idx;save();render();return;}
});
function markSaving(){window.NB_SAVING=true;clearTimeout(window.NB_ST);window.NB_ST=setTimeout(()=>{window.NB_SAVING=false;const d=new Date();window.NB_SAVED_AT=String(d.getHours()).padStart(2,'0')+'.'+String(d.getMinutes()).padStart(2,'0')+'.'+String(d.getSeconds()).padStart(2,'0');render();},700);}
document.addEventListener('input',e=>{
  const f=e.target.closest('[data-filter]');
  if(f){const q=(e.target.value||'').toLowerCase();const drop=f.closest('.pick-drop');if(drop)drop.querySelectorAll('[data-pick-item]').forEach(it=>{it.style.display=it.textContent.toLowerCase().includes(q)?'':'none';});return;}
  const i=e.target.closest('[data-inp]'); if(i){const [id,...k]=i.dataset.inp.split('.');setV(id,k.join('.'),i.value);save();}
});
document.addEventListener('change',e=>{const i=e.target.closest('[data-inp]');if(!i)return;const [id,...k]=i.dataset.inp.split('.');setV(id,k.join('.'),i.value);markSaving();save();render();});
document.addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;const i=ORDER.indexOf(ST.cur);if(e.key=='ArrowDown'||e.key=='j'){ST.flow=null;nav(ORDER[Math.min(ORDER.length-1,i+1)]);}if(e.key=='ArrowUp'||e.key=='k'){ST.flow=null;nav(ORDER[Math.max(0,i-1)]);}});
window.addEventListener('resize',fit);
window.addEventListener('load',()=>{ $('#q').addEventListener('input',render); render(); });
