/* Ngampus Bareng — shared demo data & komponen lintas layar */
const PARTICIPANT_CATEGORIES=[
  {id:'Seleksi Akademik',desc:'Peserta seleksi dengan pengawasan ketat. Mode Strict dapat diaktifkan.'},
  {id:'Program',desc:'Peserta bimbel / lembaga. Mendapat akses TO & drilling program.'},
  {id:'Reguler',desc:'Peserta retail. Mengakses katalog TO Reguler dan paket.'}
];

const CAMPUSES=[
  {id:'ui',name:'Universitas Indonesia',city:'Depok',prodis:[
    {id:'ui-ilkom',name:'Ilmu Komputer',jenjang:'S-1'},
    {id:'ui-stat',name:'Statistika',jenjang:'S-1'},
    {id:'ui-adm',name:'Administrasi Perkantoran',jenjang:'D-4'},
    {id:'ui-akun',name:'Akuntansi',jenjang:'D-3'}
  ]},
  {id:'itb',name:'Institut Teknologi Bandung',city:'Bandung',prodis:[
    {id:'itb-if',name:'Teknik Informatika',jenjang:'S-1'},
    {id:'itb-mat',name:'Matematika',jenjang:'S-1'},
    {id:'itb-ti',name:'Teknologi Informasi',jenjang:'D-4'},
    {id:'itb-elektro',name:'Teknik Elektronika',jenjang:'D-3'}
  ]},
  {id:'ugm',name:'Universitas Gadjah Mada',city:'Yogyakarta',prodis:[
    {id:'ugm-ked',name:'Kedokteran',jenjang:'S-1'},
    {id:'ugm-man',name:'Manajemen',jenjang:'S-1'},
    {id:'ugm-sv',name:'Sekolah Vokasi',jenjang:'D-4'},
    {id:'ugm-sek',name:'Kearsipan',jenjang:'D-3'}
  ]},
  {id:'ipb',name:'IPB University',city:'Bogor',prodis:[
    {id:'ipb-agr',name:'Agribisnis',jenjang:'S-1'},
    {id:'ipb-kom',name:'Ilmu Komputer',jenjang:'S-1'},
    {id:'ipb-d3',name:'Manajemen Agribisnis',jenjang:'D-3'}
  ]},
  {id:'its',name:'Institut Teknologi Sepuluh Nopember',city:'Surabaya',prodis:[
    {id:'its-sipil',name:'Teknik Sipil',jenjang:'S-1'},
    {id:'its-stat',name:'Statistika',jenjang:'S-1'},
    {id:'its-d4',name:'Teknologi Rekayasa',jenjang:'D-4'},
    {id:'its-d3',name:'Teknik Mesin',jenjang:'D-3'}
  ]},
  {id:'unpad',name:'Universitas Padjadjaran',city:'Bandung',prodis:[
    {id:'unpad-farm',name:'Farmasi',jenjang:'S-1'},
    {id:'unpad-akun',name:'Akuntansi',jenjang:'S-1'},
    {id:'unpad-d3',name:'Akuntansi Vokasi',jenjang:'D-3'}
  ]},
  {id:'undip',name:'Universitas Diponegoro',city:'Semarang',prodis:[
    {id:'undip-hukum',name:'Hukum',jenjang:'S-1'},
    {id:'undip-eko',name:'Ekonomi',jenjang:'S-1'},
    {id:'undip-d3',name:'Perpajakan',jenjang:'D-3'}
  ]},
  {id:'ub',name:'Universitas Brawijaya',city:'Malang',prodis:[
    {id:'ub-psi',name:'Psikologi',jenjang:'S-1'},
    {id:'ub-tif',name:'Teknik Informatika',jenjang:'S-1'},
    {id:'ub-d3',name:'Administrasi Bisnis',jenjang:'D-3'}
  ]}
];
const MIN_D3_FOR_4=1;
const findCampus=id=>CAMPUSES.find(c=>c.id===id);
const findProdi=(cid,pid)=>{const c=findCampus(cid);return c&&c.prodis.find(p=>p.id===pid);};
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const sv=(id,k,d='')=>ST.V[id+'.'+k]!==undefined?ST.V[id+'.'+k]:d;

/* ---------- try out configuration ---------- */
const SCORING_METHODS=['IRT','+1/0/0','+4/−1/0'];
const TO_EVENTS=[
  {id:'regular',name:'Try Out Reguler #5',type:'Reguler',method:'IRT'},
  {id:'akbar',name:'TO Akbar Januari',type:'Akbar',method:'IRT'},
  {id:'pretest',name:'Pretest Diagnostik',type:'Reguler',method:'+1/0/0'},
  {id:'um',name:'TO UM Kampus',type:'Reguler',method:'+4/−1/0'},
  {id:'program',name:'TO Program Batch 2 · Minggu 3',type:'Program',method:'IRT'}
];
const toEvents=()=>[...TO_EVENTS,...(Array.isArray(ST.G.customToEvents)?ST.G.customToEvents:[])];
const toEvent=id=>toEvents().find(e=>e.id===id)||TO_EVENTS[0];
function createToEvent(){
  const custom=ST.G.customToEvents=Array.isArray(ST.G.customToEvents)?ST.G.customToEvents:[];
  const event={id:`draft-${Date.now().toString(36)}-${custom.length+1}`,name:'',type:'Reguler',method:'IRT',custom:true,published:false};
  custom.push(event);
  ST.G.toConfigs=ST.G.toConfigs||{};
  ST.G.toConfigs[event.id]={scoring:'IRT',subtes:[]};
  save();
  return event;
}
function saveToEvent(id,updates){
  const event=(ST.G.customToEvents||[]).find(e=>e.id===id);
  if(!event)return false;
  Object.assign(event,updates);
  save();
  return true;
}
function getToConfig(id){
  const event=toEvent(id);
  const saved=ST.G.toConfigs&&ST.G.toConfigs[event.id];
  if(saved&&Array.isArray(saved.subtes))return {
    scoring:event.type==='Akbar'?'IRT':saved.scoring||event.method,
    subtes:saved.subtes
  };
  return {
    scoring:event.method,
    subtes:SUB.map(([code,name,questions,minutes])=>({code,name,questions,minutes:Number(String(minutes).replace(',','.'))}))
  };
}
function saveToConfig(id,config){
  ST.G.toConfigs=ST.G.toConfigs||{};
  ST.G.toConfigs[id]=config;
  save();
}
const scoringLabel=method=>method==='IRT'?'IRT':method;
const toQuestionCount=config=>config.subtes.reduce((sum,s)=>sum+(Number(s.questions)||0),0);
const toDuration=config=>config.subtes.reduce((sum,s)=>sum+(Number(s.minutes)||0),0);
const scoreSummary=(method,total)=>method==='IRT'?'612':method==='+1/0/0'?`87 dari ${total}`:String(Math.min(10,total)*4-Math.min(100,Math.max(0,total-Math.min(10,total))));
function scoreBreakdown(config,method){
  const total=toQuestionCount(config);
  let correctLeft=method==='+1/0/0'?Math.min(87,total):method==='+4/−1/0'?Math.min(10,total):null;
  let wrongLeft=method==='+4/−1/0'?Math.min(100,total-(correctLeft||0)):null;
  return config.subtes.map((sub,i)=>{
    const questions=Number(sub.questions)||0;
    const correct=correctLeft===null?Math.round(questions*.6):Math.min(questions,correctLeft);
    if(correctLeft!==null)correctLeft-=correct;
    const wrong=wrongLeft===null?0:Math.min(questions-correct,wrongLeft);
    if(wrongLeft!==null)wrongLeft-=wrong;
    const score=method==='IRT'?String(560+i*13):method==='+1/0/0'?String(correct):String(correct*4-wrong);
    return {questions,correct,wrong,blank:questions-correct-wrong,score};
  });
}

/* ---------- peserta manual ---------- */
const SAMPLE_USERS=[
  {id:'NB-2027-0001',name:'Raka Pratama',email:'raka@email.com',phone:'0812-3456-7890',school:'SMA Negeri 1 Jakarta',category:'Reguler',source:'Registrasi mandiri',program:'—',package:'6 bln (+1)',target:'UI · Ilmu Komputer',to:'4',joined:'01 Des',status:'Aktif'},
  {id:'NB-2027-0002',name:'Dina Pratiwi',email:'dina@email.com',phone:'0813-2211-3344',school:'SMA A',category:'Program',source:'Registrasi mandiri',program:'Camp UTBK · Batch 2',package:'Program',target:'—',to:'6',joined:'05 Des',status:'Aktif'},
  {id:'NB-2027-0003',name:'Fajar Nugroho',email:'fajar@email.com',phone:'0857-8899-1122',school:'SMA Z',category:'Program',source:'Import program',program:'SMA Z · Kelas 12A',package:'Sponsor',target:'—',to:'2',joined:'10 Des',status:'Aktif'},
  {id:'NB-2027-0004',name:'Nadia Salma',email:'nadia@email.com',phone:'0821-3344-5566',school:'SMA Negeri 3 Bandung',category:'Seleksi Akademik',source:'Manual admin',program:'Seleksi Akademik 2027',package:'Seleksi Akademik',target:'ITB · Teknik Informatika',to:'3',joined:'12 Des',status:'Aktif'}
];
function ensureUsers(){
  if(!Array.isArray(ST.G.users)||!ST.G.users.length)ST.G.users=SAMPLE_USERS.map(u=>({...u}));
  return ST.G.users;
}
const usersList=()=>ensureUsers();
function nextUserId(){
  const n=usersList().length+1;
  return 'NB-2027-'+String(n).padStart(4,'0');
}
function resetUserForm(){
  ['name','email','phone','school','category'].forEach(k=>ST.V['AM-08.'+k]='');
  ST.V['AM-08.error']='';
}
function openUserForm(mode,returnTo,id){
  ensureUsers();
  const u=id?usersList().find(x=>x.id===id):null;
  ST.G.formMode=mode==='edit'?'edit':'add';
  ST.G.formReturn=returnTo||'AM-07';
  ST.G.editUser=u?u.id:null;
  const vals=u||{name:'',email:'',phone:'',school:'',category:(returnTo==='AM-07'?'Seleksi Akademik':'Reguler')};
  ['name','email','phone','school','category'].forEach(k=>ST.V['AM-08.'+k]=vals[k]||'');
  ST.V['AM-08.error']='';
  save(); nav('AM-08');
}
function saveUserForm(){
  const f={name:sv('AM-08','name').trim(),email:sv('AM-08','email').trim(),phone:sv('AM-08','phone').trim(),school:sv('AM-08','school').trim(),category:sv('AM-08','category')};
  let err='';
  if(!f.name)err='Nama lengkap wajib diisi.';
  else if(!/^\S+@\S+\.\S+$/.test(f.email))err='Format email belum valid.';
  else if(!/^[0-9+\-\s()]{8,}$/.test(f.phone))err='Nomor HP minimal 8 digit (angka / + / -).';
  else if(!f.school)err='Asal sekolah wajib diisi.';
  else if(!f.category)err='Pilih kategori peserta.';
  if(err){ST.V['AM-08.error']=err;save();return;}
  const ret=ST.G.formReturn||'AM-07';
  ST.G.lastAction=ST.G.editUser?'edit':'add';
  if(ST.G.editUser){
    const u=usersList().find(x=>x.id===ST.G.editUser);
    if(u)Object.assign(u,f,{status:'Aktif'});
  }else{
    usersList().push({id:nextUserId(),...f,source:'Manual admin',program:f.category==='Program'?'Belum dihubungkan':f.category==='Seleksi Akademik'?'Seleksi Akademik 2027':'—',package:f.category==='Reguler'?'Belum ada':f.category, target:'—',to:'0',joined:'Hari ini',status:'Undangan terkirim'});
  }
  ST.V[ret+'.saved']='1';
  ST.V['AM-08.error']='';
  ST.G.lastSavedName=f.name;
  ST.G.editUser=null;
  ST.G.formMode='add';
  save();
  nav(ret);
}

/* ---------- target kampus & prodi ---------- */
function targetDraft(){
  if(!Array.isArray(ST.G.targetDraft)||!ST.G.targetDraft.length){
    const saved=ST.G.targets||[];
    ST.G.targetDraft=saved.length?saved.map(t=>({campus:t.campus,prodi:t.prodi})):[{campus:'',prodi:''}];
  }
  return ST.G.targetDraft;
}
function validateTargets(items){
  const rows=items.map((it,i)=>({...it,idx:i,c:findCampus(it.campus),p:findProdi(it.campus,it.prodi)}));
  const errors=[];
  if(items.length>4)errors.push('Maksimal 4 pilihan prodi.');
  if(!rows.some(r=>r.campus||r.prodi))errors.push('Pilih minimal 1 prodi target.');
  const inc=rows.find(r=>(r.campus&&!r.p)||(!r.campus&&r.prodi));
  if(inc)errors.push('Lengkapi kampus dan prodi pada pilihan ke-'+(inc.idx+1)+'.');
  const filled=rows.filter(r=>r.p);
  const n=filled.length;
  const counts={s1:filled.filter(r=>r.p.jenjang==='S-1').length,d4:filled.filter(r=>r.p.jenjang==='D-4').length,d3:filled.filter(r=>r.p.jenjang==='D-3').length};
  if(n===3){
    if(counts.s1+counts.d4>2)errors.push('Pilihan ke-3: maksimal 2 pilihan S-1/D-4.');
    if(counts.d3<1)errors.push('Pilihan ke-3: wajib minimal 1 pilihan D-3 (atau semua D-3).');
  }
  if(n===4){
    if(counts.s1+counts.d4>2)errors.push('Pilihan ke-4: maksimal 2 pilihan S-1/D-4.');
    if(counts.d3<MIN_D3_FOR_4)errors.push('Pilihan ke-4: wajib menyertakan minimal '+MIN_D3_FOR_4+' pilihan D-3.');
  }
  return {ok:!errors.length,n,counts,errors};
}
function targetAction(str){
  const d=targetDraft();
  const [act,a,b]=String(str).split(':');
  if(act==='add'){if(d.length<4)d.push({campus:'',prodi:''});ST.G.targetOpen='';ST.V['AU-04.saved']='';}
  else if(act==='remove'){const i=+a;if(d.length>1)d.splice(i,1);ST.G.targetOpen='';ST.V['AU-04.saved']='';}
  else if(act==='open'){const key=a+':'+b;ST.G.targetOpen=ST.G.targetOpen===key?'':key;}
  else if(act==='close'){ST.G.targetOpen='';}
  else if(act==='pickcampus'){const i=+a;d[i].campus=b;d[i].prodi='';ST.G.targetOpen='';ST.V['AU-04.saved']='';}
  else if(act==='pickprodi'){const i=+a;d[i].prodi=b;ST.G.targetOpen='';ST.V['AU-04.saved']='';}
  else if(act==='save'){
    const r=validateTargets(d);
    if(!r.ok){ST.V['AU-04.error']=r.errors[0]||'Target belum valid.';}
    else{ST.G.targets=d.map(x=>({campus:x.campus,prodi:x.prodi}));ST.G.targetDraft=null;ST.G.targetOpen='';ST.V['AU-04.saved']='1';ST.V['AU-04.error']='';}
  }
  else if(act==='demo'){
    const presets={
      '1':[{campus:'ui',prodi:'ui-ilkom'}],
      '3v':[{campus:'ui',prodi:'ui-ilkom'},{campus:'itb',prodi:'itb-if'},{campus:'ui',prodi:'ui-akun'}],
      '3x':[{campus:'ui',prodi:'ui-ilkom'},{campus:'itb',prodi:'itb-if'},{campus:'ugm',prodi:'ugm-ked'}],
      '4v':[{campus:'ui',prodi:'ui-ilkom'},{campus:'itb',prodi:'itb-if'},{campus:'ui',prodi:'ui-akun'},{campus:'ugm',prodi:'ugm-sek'}]
    };
    if(presets[a])ST.G.targetDraft=presets[a].map(x=>({...x}));
    ST.G.targetOpen='';ST.V['AU-04.saved']='';ST.V['AU-04.error']='';
  }
  save();
}
function targetLabel(){
  const t=(ST.G.targets||[])[0];
  if(!t)return 'Universitas X — Prodi Y';
  const c=findCampus(t.campus),p=findProdi(t.campus,t.prodi);
  return (c?c.name:'Kampus')+' — '+(p?p.name:'Prodi');
}
function targetRowsHTML(){
  const ts=ST.G.targets||[];
  if(!ts.length)return '<div class="sm">Belum ada target. <u data-nav="AU-04" style="cursor:pointer">Pilih kampus & prodi</u></div>';
  return ts.map((t,i)=>{
    const c=findCampus(t.campus),p=findProdi(t.campus,t.prodi);
    return `<div class="row nw target-row"><span class="mono sm">${i+1}</span><div style="flex:1"><b>${esc(c?c.name:'—')}</b><div class="sm">${esc(p?p.name:'—')}</div></div>${p?tag(p.jenjang,'g'):''}</div>`;
  }).join('');
}
function pickField(label,idx,type,valueHTML,placeholder,listHTML,enabled=true){
  const open=gv('targetOpen')===idx+':'+type;
  return `<div class="fld picker"><label>${label}</label><div class="inp pick-field ${enabled?'':'dis'}" ${enabled?`data-target="open:${idx}:${type}"`:''} style="cursor:${enabled?'pointer':'default'}">${valueHTML||`<span class="muted">${placeholder}</span>`}<span class="pick-caret">▾</span></div>
  ${open?`<div class="pick-drop"><input class="inp" data-filter placeholder="Cari ${type==='campus'?'kampus':'prodi'}…"><div class="pick-list">${listHTML}</div></div>`:''}</div>`;
}
function targetPickerHTML(){
  const d=targetDraft();
  const val=validateTargets(d);
  const saved=ST.V['AU-04.saved']==='1';
  const cards=d.map((it,i)=>{
    const c=findCampus(it.campus),p=findProdi(it.campus,it.prodi);
    const campusList=CAMPUSES.map(x=>`<div class="pick-item" data-pick-item data-target="pickcampus:${i}:${x.id}"><div><b>${x.name}</b><div class="sm">${x.city} · ${x.prodis.length} prodi</div></div><span class="sm">›</span></div>`).join('');
    const prodiList=c?c.prodis.map(x=>`<div class="pick-item" data-pick-item data-target="pickprodi:${i}:${x.id}"><div><b>${x.name}</b><div class="sm">${x.jenjang} · ${c.name}</div></div><span class="sm">›</span></div>`).join(''):'<div class="sm" style="padding:8px">Pilih kampus terlebih dahulu.</div>';
    const campusVal=c?`<span><b>${c.name}</b> <span class="sm">· ${c.city}</span></span>`:'';
    const prodiVal=p?`<span><b>${p.name}</b> ${tag(p.jenjang,'g')}</span>`:'';
    return `<div class="box ${i===0?'dk':''}">
      <div class="row"><b>Pilihan ${i+1}</b>${i===0?tag('Prioritas utama'):''}<span class="sp"></span>${d.length>1?`<button class="btn sm g" data-target="remove:${i}">Hapus</button>`:''}</div>
      <div class="g2 mt">
        ${pickField('Kampus (PTN)',i,'campus',campusVal,'⌕ cari kampus',campusList)}
        ${pickField('Program studi',i,'prodi',prodiVal,c?'⌕ cari prodi':'Pilih kampus dulu',prodiList,!!c)}
      </div>
    </div>`;
  }).join('');
  const errs=val.errors.length?val.errors.map(e=>`<div class="val-msg">• ${e}</div>`).join(''):'';
  return `<div class="row" style="align-items:flex-end"><div><div class="kick">Target kampus & prodi</div><div class="h1">Kampus impianmu</div></div><span class="sp"></span><span class="tag ${val.ok?'k':'d'}">${val.n}/4 pilihan</span></div>
  <div class="sm">Pilih 1–4 prodi. Database contoh: ${CAMPUSES.length} PTN · ${CAMPUSES.reduce((n,c)=>n+c.prodis.length,0)} prodi.</div>
  ${saved?`<div class="banner ok"><b>✓ Target tersimpan.</b><span class="sm">${esc(targetLabel())}</span><span class="sp"></span><button class="btn p sm" data-nav="DB-01">Ke dashboard</button></div>`:''}
  ${cards}
  <div class="row"><button class="btn ${d.length>=4?'dis':''}" data-target="add">+ Tambah pilihan</button><span class="sm">Maksimal 4 pilihan</span><span class="sp"></span><span class="sm">S-1 ${val.counts.s1} · D-4 ${val.counts.d4} · D-3 ${val.counts.d3}</span></div>
  <div class="valbox ${val.ok?'ok':'err'}"><div class="row nw"><b>${val.ok?'✓ Kombinasi jenjang valid':'Periksa pilihan target'}</b><span class="sp"></span><span class="sm">${val.n} pilihan</span></div><div class="sm">Aturan: 1–2 pilihan bebas · 3 pilihan maksimal 2 S-1/D-4 + minimal 1 D-3 · 4 pilihan minimal ${MIN_D3_FOR_4} D-3.</div>${errs||'<div class="val-msg ok">Tidak ada masalah. Target siap disimpan.</div>'}</div>
  <div class="row sm" style="align-items:center"><span>Skenario demo:</span><button class="chip" data-target="demo:1">1 pilihan</button><button class="chip" data-target="demo:3v">3 valid</button><button class="chip" data-target="demo:3x">3 tidak valid</button><button class="chip" data-target="demo:4v">4 valid</button></div>
  <div class="row"><button class="btn g" data-nav="AU-03?step=Sekolah">‹ Kembali</button><span class="sp"></span><button class="btn p ${val.ok?'':'dis'}" data-target="save">Simpan target</button></div>`;
}

/* ---------- laporan soal ---------- */
const LAPOR_REASONS=['Typo / kesalahan penulisan soal','Gambar / rumus tidak muncul','Opsi jawaban bermasalah','Lainnya'];
function sendReport(){
  const reason=ST.V['TO-08.reason'];
  const text=(ST.V['TO-08.reportText']||'').trim();
  if(!reason){ST.V['TO-08.reportError']='Pilih salah satu alasan laporan.';save();return;}
  if(reason==='Lainnya'&&!text){ST.V['TO-08.reportError']='Jelaskan masalahnya pada kolom teks.';save();return;}
  ST.G.reports=ST.G.reports||[];
  ST.G.reports.unshift({id:'LAP-'+(1024+ST.G.reports.length),to:'Try Out Reguler #4',sub:'Pengetahuan Kuantitatif',no:5,reason,text,time:'14:32'});
  ST.V['TO-08.reportSent']='1';
  ST.V['TO-08.report']='';ST.V['TO-08.reason']='';ST.V['TO-08.reportText']='';ST.V['TO-08.reportError']='';
  save();
}

/* ---------- keamanan ---------- */
function watermarkHTML(){
  const u=ST.G.user||{};
  const txt=esc(u.name||'Peserta')+' · '+esc(u.email||'email')+' · '+esc(u.id||'ID');
  return `<div class="wm" aria-hidden="true">${Array.from({length:18},()=>`<span>${txt}</span>`).join('')}</div>`;
}
