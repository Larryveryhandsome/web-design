
'use strict';
const TARGET=100000, MAX_MONEY=100000000, STORAGE_KEY='noon100k-mission-v1';
const OWNER_NAMES={wei:'阿衛',wife:'太太',both:'共同'};
const PHASES=[
{id:'p1',start:'09:00',end:'09:15',title:'盤成熟案件，驗證十萬元路徑',subtitle:'先看可交付與可留收益，不先做新商品。',tasks:[
{id:'t01',time:'09:00–09:05',owner:'wei',title:'列出最接近完成的 3–5 件既有案件',desc:'盤房仲、網頁、設計、剪輯的在談案件；只列已有需求與對方聯繫方式的真實案件。舊應收款另標，不列新增獲利。',output:'案件／決策人／目前障礙'},
{id:'t02',time:'09:00–09:05',owner:'wife',title:'盤點可在上午交付的作品與既有委託',desc:'先看已接案的修改、驗收及未售現成作品。婚禮未來檔期的預約可接單，但預收款不能算本次收益；已售畫作不重複計入。',output:'現有作品／可交付項目'},
{id:'t03',time:'09:05–09:10',owner:'wei',title:'核實前三案的決策與付款條件',desc:'逐案確認決策人是否可聯繫、服務是否真正能完成、客戶是否能在上午驗收與付款。沒有對方確認，就不要打勾成「成熟」。',output:'成熟案件三條件'},
{id:'t04',time:'09:05–09:10',owner:'wife',title:'核對成本、產能與可用交付資料',desc:'確認外包、材料、分潤、夫妻工時、固定費用分攤與稅費保留；確認所需作品和權限。也確認店務已有安排，不抽空原本營運。',output:'每案可留收益＋成本依據'},
{id:'t05',time:'09:10–09:15',owner:'both',title:'通過 09:15 可行性關卡，選定最多三件主攻案',desc:'把成熟候選收益加總。不到十萬元，就標記「目標尚無足夠案件支持」，優先做能完成的一筆；不能改用訂金湊達標。準備正確承攬主體、約定與收款資料。',output:'A／B／C 優先順序＋真實缺口'}]},
{id:'p2',start:'09:15',end:'09:45',title:'第一輪決策：只解決成交的最後障礙',subtitle:'聯絡已談過的人，不用三十分鐘說服陌生市場。',tasks:[
{id:'t06',time:'09:15–09:30',owner:'wei',title:'致電最成熟的兩位決策人',desc:'確認剩餘障礙是範圍、驗收、價格或付款安排。每通控制在具體問題，不用「幫我們衝十萬」當購買理由，不強迫客戶在不合理時間決定。',output:'下一步與對方確認的時間'},
{id:'t07',time:'09:15–09:30',owner:'wife',title:'聯繫已有詢價者與作品驗收人',desc:'傳實際作品或現有成果，只問眼前需要補什麼才能決定。沒有在談新人，就優先推進既有設計／剪輯案，不花時間廣撒婚禮合作邀請。',output:'驗收意見／具體採購需求'},
{id:'t08',time:'09:30–09:40',owner:'wei',title:'把範圍、總價、驗收與付款方式寫清楚',desc:'按原案件條件形成簡潔確認內容。房仲保留全部應做的查核與交易程序；尚不具備收費條件的案件不能提前算獲利。',output:'雙方可核對的書面約定'},
{id:'t09',time:'09:30–09:40',owner:'wife',title:'提供對應成果與交付清單',desc:'只展示本來就能完成的工作，確認素材合法可用、修改範圍、交件格式與交付對象。外包需先確認可配合，不代替廠商承諾。',output:'真實成果／驗收項目'},
{id:'t10',time:'09:40–09:45',owner:'both',title:'更新案件狀態，移開沒有明確下一步的案子',desc:'把進行中、改約後續、不適合分開。記下每案下一次聯繫時間；新商家方案或婚期訂金放後續接單，不寫入已賺。',output:'只保留可在上午完成的重點'}]},
{id:'p3',start:'09:45',end:'10:15',title:'完成第一筆交付與驗收',subtitle:'不再增加功能，把已答應的事做完整。',tasks:[
{id:'t11',time:'09:45–10:00',owner:'wei',title:'完成第一案最後的專業工作',desc:'按原範圍處理已成熟案件的說明、確認或文件。只做自己有權且有能力完成的事；房仲流程無法在上午完成，就如實排除本次收益。',output:'可驗收的已完成工作'},
{id:'t12',time:'09:45–10:00',owner:'wife',title:'完成已能收尾的作品、修改或交件',desc:'限本來已接近完成的工作，不現場開始做整套網站。檢查檔案、文字、連結與交付內容，保留品質，不以未來工作換目前入帳數字。',output:'交付檔案／成果連結'},
{id:'t13',time:'10:00–10:10',owner:'wei',title:'與客戶確認驗收，依約請款',desc:'清楚說明本次已完成的範圍與尚未完成部分。取得可保存的驗收確認；不要把整份大合約都當作本次已完成收入。',output:'本次收入範圍＋驗收時間'},
{id:'t14',time:'10:00–10:10',owner:'wife',title:'整理收款依據，確認實際入帳',desc:'核對正確收款主體與帳戶，實際查看入帳；口頭承諾與待處理匯款不算已收。保留原始資料，網頁只填代稱與核對摘要。',output:'實收金額／入帳時間'},
{id:'t15',time:'10:10–10:15',owner:'both',title:'登錄第一筆款項，扣掉完整成本',desc:'在「入帳與成本」填交付、收款、外包、分潤、工時與稅費。缺憑證、時段不符或成本未核對，先不列收入。不要只看入帳總額。',output:'第一筆可核對的淨收益'}]},
{id:'p4',start:'10:15',end:'10:45',title:'第二輪推進：重複有效步驟，不開新戰線',subtitle:'把剩下時間給已經最接近完成的案件。',tasks:[
{id:'t16',time:'10:15–10:30',owner:'wei',title:'回到第二順位成熟案件，處理單一阻礙',desc:'只解決客戶已提出的具體問題。沒有決策人、需要等工作日審批或尚待重要查核，就改約後續，不再占用上午主線。',output:'完成決定／明確改約'},
{id:'t17',time:'10:15–10:30',owner:'wife',title:'平行處理第二案交付與既有作品新交易',desc:'交付確實能做完的成果；未售現成作品有真實買方，才談新交易。未來婚期只做正常預約，不把檔期首款當作已完成服務。',output:'第二案成果與驗收條件'},
{id:'t18',time:'10:30–10:40',owner:'wei',title:'完成第二案驗收與應收確認',desc:'按完成比例與約定收費，不加未核實的新承諾。剩餘工作若無法上午完成，拆分可驗收部分也須取得客戶同意，不能為認列而假拆。',output:'真正完成部分的收費依據'},
{id:'t19',time:'10:30–10:45',owner:'wife',title:'核對第二案入帳、成本並更新流水帳',desc:'確認這不是上一筆款項或同一合約重複計入。記錄外包待付款與分潤；若已有成本但收入未符合條件，仍保守扣除成本。',output:'不重複的收入與成本紀錄'}]},
{id:'p5',start:'10:45',end:'11:15',title:'11:00 前校正：看實際缺口，不看樂觀預測',subtitle:'只保留有證據能完成的最後機會。',tasks:[
{id:'t20',time:'10:45–10:55',owner:'wei',title:'對照目標缺口與剩餘成熟案件',desc:'用「嚴格計入淨收益」看差額，不用合作總額或實收總額。若剩餘案的可留收益也不足，明確標記預期未達標，不臨時發明成交率。',output:'實際差額／最後主攻對象'},
{id:'t21',time:'10:45–10:55',owner:'wife',title:'檢查交付品質與漏列成本',desc:'抽查已交成果、文字、連結、修改範圍與工時。補上漏列的交通、包裝、廠商款與稅費；不把已知待付支出藏在「之後再算」。',output:'成本修正／品質確認'},
{id:'t22',time:'10:55–11:15',owner:'wei',title:'跟進已約好回覆的決策人',desc:'依先前約好的時間聯絡，只確認未解問題與合作決定；不群發倒數壓力訊息，不用不合理折價換取入帳。',output:'明確答覆，不再只寫有興趣'},
{id:'t23',time:'10:55–11:15',owner:'wife',title:'完成最後可交付案的實際工作',desc:'把時間留給明確驗收人與真實成果。若對方只要未來服務，正常報價排期，但預收款歸到「未來服務預收」。',output:'最後一批可驗收成果'}]},
{id:'p6',start:'11:15',end:'11:45',title:'最後結案：先核對，再算達標',subtitle:'不接超出產能的承諾，不把資料不齊的款項算進去。',tasks:[
{id:'t24',time:'11:15–11:30',owner:'wei',title:'確認最後一批驗收與依約收款',desc:'由客戶確認已完成工作，確認付款是否真的能在截止前完成。尚在流程中就如實標記，不以匯款截圖取代帳戶實際入帳。',output:'驗收與入帳的確切時間'},
{id:'t25',time:'11:15–11:30',owner:'wife',title:'完成交接與成本核對摘要',desc:'保留交件、驗收、成本及收款依據。聯絡資料只填必要代稱；原始憑證另外妥善保管，不把敏感資料塞進公開網頁。',output:'每案可回溯的證據'},
{id:'t26',time:'11:30–11:40',owner:'wei',title:'逐案對照流水帳與合約，排除重複',desc:'同一筆收款不可重複登錄；多期款不要每筆都重複加整份合約總額。上午前已賺得的尾款不算本次新增收益。',output:'已去重的合約與款項'},
{id:'t27',time:'11:30–11:45',owner:'wife',title:'補齊共同成本，檢查未完成服務義務',desc:'未來服務預收款保留履約資金；本次已發生成本照實列。確認夫妻工時、固定費用分攤與稅費沒有漏列或重複扣除。',output:'共同成本／全部支出核對'}]},
{id:'p7',start:'11:45',end:'11:59',title:'正式結算：金額與證據一起留下',subtitle:'達標需靠真正新收益；沒達標，也不改算法。',tasks:[
{id:'t28',time:'11:45–11:52',owner:'wei',title:'逐筆確認收入在時段內且具備交付依據',desc:'付款與新交付驗收都要落在本次 09:00:00–11:59:59。未到時間、未實收、未驗收、預收與舊款，一律不算合格收入。',output:'收入條件逐筆完成查核'},
{id:'t29',time:'11:45–11:52',owner:'wife',title:'逐筆確認成本與共同支出',desc:'核對每案材料、外包、分潤、工時、固定費用與稅費欄位，包括填 0 的項目。全部確認後才勾選共同成本核對。',output:'零遺漏成本檢查'},
{id:'t30',time:'11:52–11:59',owner:'both',title:'結算、匯出備份，確認後續履約排程',desc:'分開記合作總額、現金入帳、預收／舊款、保守淨收益與待履約責任。匯出完整備份與流水帳；不足十萬元就記實際成果，不宣布虛假達標。',output:'最終數字＋備份＋後續責任'}]}
];
const ALL_TASKS=PHASES.flatMap(p=>p.tasks), TASK_IDS=new Set(ALL_TASKS.map(t=>t.id));
const $=id=>document.getElementById(id);
const icon=(name,size=17)=>`<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>(value<0?'−$':'$')+Math.round(Math.abs(value||0)).toLocaleString('en-US');
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(new Date(s+'T00:00:00+08:00').getTime())&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const validDateTime=s=>!s||(typeof s==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s)&&validDate(s.slice(0,10))&&+s.slice(11,13)<24&&+s.slice(14,16)<60&&(!s.slice(17,19)||+s.slice(17,19)<60));
function toTime(s){return s&&validDateTime(s)?new Date(s+'+08:00').getTime():NaN;}
function bounds(date){return {start:toTime(date+'T09:00:00'),end:toTime(date+'T12:00:00')};}
function inMission(s,date,now=Date.now()){const t=toTime(s),b=bounds(date);return Number.isFinite(t)&&t>=b.start&&t<b.end&&t<=now;}
function taiwanDateTime(now=Date.now()){return new Date(now+8*3600e3).toISOString().slice(0,19);}
function uid(){return globalThis.crypto?.randomUUID?.()||'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);}
function initialState(date='2026-09-27'){return {schema:'noon100k-v1',version:1,missionDate:date,taskDays:{},leads:[],entries:[],commonDays:{},updatedAt:0};}
function strictMoney(value){const n=Number(value);if(!Number.isFinite(n)||n<0||n>MAX_MONEY||!Number.isInteger(n))throw new Error('金額必須為 0 到 100,000,000 的整數。');return n;}
function text(value,max=1200){return typeof value==='string'?value.slice(0,max):'';}
function validateBackup(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj)||obj.schema!=='noon100k-v1'||obj.version!==1||!validDate(obj.missionDate))throw new Error('這不是本頁支援的 v1 備份檔。');
 if(!Array.isArray(obj.leads)||!Array.isArray(obj.entries)||obj.leads.length>1000||obj.entries.length>1000)throw new Error('案件或款項資料格式不正確，或超過 1,000 筆。');
 const clean=initialState(obj.missionDate);clean.updatedAt=Number(obj.updatedAt)||0;
 if(obj.taskDays&&typeof obj.taskDays==='object')for(const [date,day] of Object.entries(obj.taskDays)){
  if(!validDate(date)||!day||typeof day!=='object')continue;clean.taskDays[date]={};
  for(const [id,v] of Object.entries(day))if(TASK_IDS.has(id)&&v&&typeof v==='object')clean.taskDays[date][id]={done:v.done===true,note:text(v.note,1500),doneAt:Number(v.doneAt)||0};
 }
 if(obj.commonDays&&typeof obj.commonDays==='object')for(const [date,v] of Object.entries(obj.commonDays))if(validDate(date)&&v&&typeof v==='object')clean.commonDays[date]={amount:strictMoney(v.amount??0),verified:v.verified===true};
 const used=new Set();
 clean.leads=obj.leads.map(v=>{if(!v||typeof v!=='object'||typeof v.id!=='string'||!v.id||used.has(v.id)||!validDate(v.missionDate))throw new Error('案件識別碼或日期不正確／重複。');used.add(v.id);return {id:text(v.id,100),missionDate:v.missionDate,name:text(v.name,100),owner:['wei','wife','both'].includes(v.owner)?v.owner:'both',kind:text(v.kind,80),potential:strictMoney(v.potential??0),status:['open','won','later','lost'].includes(v.status)?v.status:'open',next:text(v.next,800),decision:v.decision===true,deliver:v.deliver===true,payment:v.payment===true};});
 used.clear();
 clean.entries=obj.entries.map(v=>{if(!v||typeof v!=='object'||typeof v.id!=='string'||!v.id||used.has(v.id)||!validDate(v.missionDate))throw new Error('款項識別碼或日期不正確／重複。');used.add(v.id);
  const e={id:text(v.id,100),missionDate:v.missionDate,name:text(v.name,100),owner:['wei','wife','both'].includes(v.owner)?v.owner:'both',kind:['earned','deposit','old','other'].includes(v.kind)?v.kind:'other',proof:text(v.proof,1200),cashVerified:v.cashVerified===true,delivered:v.delivered===true,costVerified:v.costVerified===true};
  for(const key of ['contract','cash','revenue','external','split','labor','tax'])e[key]=strictMoney(v[key]??0);
  for(const key of ['paidAt','earnedAt','signedAt']){if(!validDateTime(v[key]||''))throw new Error('款項時間格式不正確。');e[key]=v[key]||'';}
  if(e.cash>e.contract||e.revenue>e.contract)throw new Error('實收或交付收入不能超過該案合約總額。');return e;
 });return clean;
}
let storageAvailable=true,loadError=false;
let state=initialState();
try{const raw=localStorage.getItem(STORAGE_KEY);if(raw)state=validateBackup(JSON.parse(raw));localStorage.setItem(STORAGE_KEY+'-probe','1');localStorage.removeItem(STORAGE_KEY+'-probe');}catch(error){storageAvailable=false;loadError=true;}
let ownerFilter='all',hideDone=false,editingLead=null,editingEntry=null,confirmCallback=null,toastTimer=null;
const openPhases=new Map(PHASES.map(p=>[p.id,true])),openNotes=new Set();
function taskDay(){return state.taskDays[state.missionDate]||(state.taskDays[state.missionDate]={});}
function taskState(id){return taskDay()[id]||(taskDay()[id]={done:false,note:'',doneAt:0});}
function common(){return state.commonDays[state.missionDate]||(state.commonDays[state.missionDate]={amount:0,verified:false});}
function currentLeads(){return state.leads.filter(v=>v.missionDate===state.missionDate);}
function currentEntries(){return state.entries.filter(v=>v.missionDate===state.missionDate);}
function showToast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3500);}
function saveState(){state.updatedAt=Date.now();try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));storageAvailable=true;$('storageStatus').textContent='本機已儲存';$('storageBanner').classList.add('hidden');}catch(error){storageAvailable=false;$('storageStatus').textContent='僅保留此分頁';$('storageBanner').classList.remove('hidden');} }
function costOf(e){return (e.external||0)+(e.split||0)+(e.labor||0)+(e.tax||0);}
function evaluateEntry(e,date,now=Date.now()){
 const same=e.missionDate===date,cost=same?costOf(e):0;
 const cashEligible=same&&e.cashVerified&&inMission(e.paidAt,date,now),signedEligible=same&&inMission(e.signedAt,date,now);
 let reason='可列入試算',eligible=true;
 if(!same){reason='其他執行日';eligible=false;}
 else if(e.kind==='deposit'){reason='預收款，不列收入';eligible=false;}
 else if(e.kind==='old'){reason='舊款回收，不列新收入';eligible=false;}
 else if(e.kind!=='earned'){reason='收入性質待核對';eligible=false;}
 else if(!e.cashVerified||!e.paidAt){reason='實際入帳待核對';eligible=false;}
 else if(!inMission(e.paidAt,date,now)){reason='入帳時段外／尚未到時';eligible=false;}
 else if(!e.delivered||!e.earnedAt){reason='本次交付尚未驗收';eligible=false;}
 else if(!inMission(e.earnedAt,date,now)){reason='交付時段外／尚未到時';eligible=false;}
 else if(!e.costVerified){reason='完整成本待核對';eligible=false;}
 else if(!e.proof?.trim()){reason='憑證核對摘要未填';eligible=false;}
 else if(e.cash<=0||e.revenue<=0){reason='沒有本次交付實收收入';eligible=false;}
 else if(e.cash>e.contract||e.revenue>e.contract){reason='金額超過合約，請核對';eligible=false;}
 const gross=eligible?Math.min(e.cash,e.revenue):0;
 return {eligible,gross,cost,net:gross-cost,reason,cash:cashEligible?e.cash:0,contract:signedEligible?e.contract:0,costVerified:e.costVerified===true};
}
function calculate(s,now=Date.now()){
 const entries=s.entries.filter(e=>e.missionDate===s.missionDate),rows=entries.map(e=>({entry:e,...evaluateEntry(e,s.missionDate,now)})),c=s.commonDays[s.missionDate]||{amount:0,verified:false};
 const gross=rows.reduce((a,v)=>a+v.gross,0),costs=rows.reduce((a,v)=>a+v.cost,0)+(c.amount||0),net=gross-costs;
 const checked=c.verified===true&&rows.every(v=>v.costVerified);
 return {rows,gross,costs,net,cash:rows.reduce((a,v)=>a+v.cash,0),contract:rows.reduce((a,v)=>a+v.contract,0),nonEarnedCash:rows.reduce((a,v)=>a+((v.entry.kind==='deposit'||v.entry.kind==='old')?v.cash:0),0),checked,achieved:checked&&net>=TARGET,gap:Math.max(0,TARGET-net)};
}
function renderMetrics(){
 const now=Date.now(),m=calculate(state,now),pct=Math.min(100,Math.max(0,m.net/TARGET*100));
 $('contractTotal').textContent=money(m.contract);$('cashTotal').textContent=money(m.cash);$('netTotal').textContent=money(m.net);$('mobileNet').textContent=money(m.net);$('gapTotal').textContent=money(m.gap);
 $('cashDetail').textContent=m.nonEarnedCash>0?`其中預收／舊款 ${money(m.nonEarnedCash)}，不是新收益`:'含預收／舊款，須另核對交付';
 $('netDetail').textContent=m.checked?'成本核對完成 · 仍為人工管理試算':'資料待核對 · 管理用保守試算';
 $('gapDetail').textContent=m.achieved?'依輸入紀錄達標，請保留原始憑證':m.net>=TARGET?'金額到線，成本尚未全核對':'尚未達標，不自動美化成果';
 $('netTotal').classList.toggle('red',m.net<0);$('netRing').style.setProperty('--pct',pct);$('netPercent').innerHTML=`${Math.floor(pct)}<span style="font-size:.48em">%</span>`;$('netRing').setAttribute('aria-label',`淨收益目標進度 ${Math.floor(pct)}%`);
 const ready=currentLeads().filter(l=>l.status==='open'&&l.decision&&l.deliver&&l.payment),potential=ready.reduce((a,l)=>a+l.potential,0);
 $('readyPotential').innerHTML=`${money(potential)}<small>成熟候選收益・不是已賺</small>`;
 const supported=potential+m.net>=TARGET;
 $('gateBadge').textContent=m.achieved?'依紀錄達標':supported?'有候選支持，非保證':ready.length?'候選收益不足':'尚未驗證';
 $('gateBadge').className='badge'+(supported||m.achieved?'':' warn');
 $('gateText').textContent=ready.length?`${ready.length} 件未完成案件具備三項前提。預估 ${money(potential)} 不會加入已賺金額；完成後標记案件，再逐筆記錄真實交付與入帳。`:'填入已有決策人、上午可交付、對方已確認付款安排的案件。此處只有預估，不加入上方獲利。';
 $('gateAdvice').textContent=m.achieved?'已達目標仍要完成剩餘承諾、保存憑證。':supported?'候選加目前收益足以支持目標，但仍有未成交、未入帳風險。':`仍缺 ${money(Math.max(0,TARGET-m.net-potential))} 案件支持；先做最能完成的一筆，不改用訂金湊。`;
 $('commonCheckHint').textContent=common().verified?'已勾選共同核對；每筆成本仍須各自確認。':'尚未確認：即使金額超標，也只顯示「待核對」。';
 updateClock(now,m);updateTaskProgress();
}
function updateClock(now=Date.now(),m=calculate(state,now)){
 const b=bounds(state.missionDate),before=now<b.start,active=now>=b.start&&now<b.end;
 let seconds=Math.max(0,Math.floor(((before?b.start:b.end)-now)/1000));
 const h=Math.floor(seconds/3600),min=Math.floor(seconds%3600/60),s=seconds%60;
 $('clock').textContent=(h>999?'999+':String(h).padStart(2,'0'))+':'+String(min).padStart(2,'0')+':'+String(s).padStart(2,'0');
 $('clockLabel').textContent=before?'距離作戰開始':active?'距離正式結算':'本次作戰已截止';
 $('clockNote').textContent=before?'09:00 開始 · 台灣時間':active?'12:00 前完成 · 台灣時間':m.achieved?'依輸入紀錄達標，保存憑證':'如實記錄結果，不改算法';
 $('statusText').textContent=before?'尚未開始':active?'執行中':'已截止';$('statusDot').style.background=active?'#315c46':before?'#ab8b52':'#899081';
 const d=new Date(state.missionDate+'T00:00:00+08:00'),weekday=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Taipei',weekday:'short'}).format(d).toUpperCase();
 $('hardDeadline').textContent=`${state.missionDate.slice(5).replace('-','.')} ${weekday} / 截止 11:59:59`;
 $('footerInfo').textContent=`${state.missionDate.replaceAll('-','.')} · UTC+8 · 全部金額為新臺幣 · 本機版 v1.0`;
 document.querySelectorAll('.phase').forEach(el=>{const p=PHASES.find(v=>v.id===el.dataset.phase);el.classList.toggle('current',active&&now>=toTime(state.missionDate+'T'+p.start+':00')&&now<toTime(state.missionDate+'T'+p.end+':00'));});
}
function updateTaskProgress(){
 const done=ALL_TASKS.filter(t=>taskState(t.id).done).length,total=ALL_TASKS.length,pct=Math.round(done/total*100);
 $('taskProgress').textContent=`${done} / ${total} 已完成`;$('taskFill').style.width=pct+'%';$('taskBar').setAttribute('aria-valuenow',pct);
 const next=ALL_TASKS.find(t=>!taskState(t.id).done);
 $('nextTaskTitle').textContent=next?'下一步：'+next.title:'所有代辦已完成，請確認款項與成本';
 $('nextTaskInfo').textContent=next?`${next.time} · ${OWNER_NAMES[next.owner]}`:'勾完代辦不等於收益達標，最後看真實入帳與交付。';
}
function renderTasks(){
 let shown=0;
 $('taskList').innerHTML=PHASES.map(p=>{
  const items=p.tasks.filter(t=>(ownerFilter==='all'||t.owner===ownerFilter||(ownerFilter!=='both'&&t.owner==='both'))&&(!hideDone||!taskState(t.id).done));if(!items.length)return '';shown+=items.length;
  const count=p.tasks.filter(t=>taskState(t.id).done).length;
  return `<details class="phase card" data-phase="${p.id}" ${openPhases.get(p.id)?'open':''}><summary class="phase-header"><span class="phase-time mono">${p.start}—${p.end}</span><div class="phase-title"><strong>${esc(p.title)}</strong><p>${esc(p.subtitle)}</p></div><span class="phase-count">${count} / ${p.tasks.length}</span>${icon('down',16).replace('<svg','<svg class="chevron"')}</summary><div class="phase-list">${items.map(t=>{
   const s=taskState(t.id),hasNote=!!s.note;
   return `<div class="task-row ${s.done?'is-done':''}" data-task-row="${t.id}"><label class="task-check"><input type="checkbox" data-task="${t.id}" id="check-${t.id}" ${s.done?'checked':''} aria-label="${esc(t.title)}"><span class="check-visual">${icon('check',15)}</span></label><div class="task-main"><div class="task-title">${esc(t.title)}</div><p class="task-desc">${esc(t.desc)}</p><div class="task-meta"><span class="owner ${t.owner==='wife'?'wife':t.owner==='both'?'both':''}">${OWNER_NAMES[t.owner]}</span><span class="task-time mono">${t.time}</span><span class="deliverable">產出：${esc(t.output)}</span></div><textarea class="task-note ${openNotes.has(t.id)?'':'hidden'}" maxlength="1500" data-note="${t.id}" aria-label="${esc(t.title)}的備註" placeholder="記下一步、客戶代稱或卡住的地方…">${esc(s.note)}</textarea></div><button class="task-note-button" data-toggle-note="${t.id}" aria-expanded="${openNotes.has(t.id)}">${hasNote?'有備註':'＋備註'}</button></div>`;
  }).join('')}</div></details>`;
 }).join('');
 $('taskEmpty').classList.toggle('hidden',shown>0);
 $('taskList').querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>openPhases.set(d.dataset.phase,d.open)));
 updateTaskProgress();updateClock();
}
function renderLeads(){
 const leads=currentLeads();
 if(!leads.length){$('leadsList').innerHTML=`<div class="card empty"><div class="empty-icon">${icon('case',23)}</div><h3>先填第一個真實、成熟的案件</h3><p>沒有預設客戶或虛構成交。把你們已談過、能在上午完成的案件放進來，才知道十萬元目標是否有根據。</p><button class="btn btn-light btn-small" data-action="new-lead">新增第一個案件</button></div>`;return;}
 const statuses={open:'進行中',won:'已完成本次處理',later:'改約後續',lost:'不適合／未成交'};
 $('leadsList').innerHTML='<div class="leads-grid">'+leads.map(l=>`<article class="lead-card"><div class="lead-top"><div><div class="lead-title">${esc(l.name)}</div><div class="lead-meta">${OWNER_NAMES[l.owner]} · ${esc(l.kind)}</div></div><span class="badge ${l.status==='open'?'warn':''}">${statuses[l.status]}</span></div><div class="lead-amount">${money(l.potential)}<small>預估可留，不是已賺</small></div><div class="lead-criteria"><span class="criterion ${l.decision?'yes':''}">${l.decision?'✓':'○'} 決策人確認</span><span class="criterion ${l.deliver?'yes':''}">${l.deliver?'✓':'○'} 上午可交付</span><span class="criterion ${l.payment?'yes':''}">${l.payment?'✓':'○'} 付款安排確認</span></div><div class="lead-next"><strong>下一步</strong><br>${esc(l.next).replaceAll('\n','<br>')}</div><div class="lead-actions"><button class="text-button" data-edit-lead="${esc(l.id)}">編輯案件</button><button class="text-button" data-record-lead="${esc(l.id)}">記實際款項</button><button class="text-button danger" data-delete-lead="${esc(l.id)}">刪除</button></div></article>`).join('')+'</div>';
}
function renderLedger(){
 const m=calculate(state);
 if(!m.rows.length){$('ledgerList').innerHTML=`<div class="empty"><div class="empty-icon">${icon('wallet',23)}</div><h3>目前已記錄款項：0 筆</h3><p>每筆都分開填實收、當日上午完成交付的收入與成本。預收款可以記，但不會灌進十萬元收益進度。</p><button class="btn btn-light btn-small" data-action="new-entry">記錄第一筆實際款項</button></div>`;return;}
 $('ledgerList').innerHTML=`<div class="table-wrap"><table><thead><tr><th>案件／本次性質</th><th>上午實收</th><th>合格收入</th><th>應扣成本</th><th>淨貢獻</th><th>查核狀態／操作</th></tr></thead><tbody>${m.rows.map(r=>{const e=r.entry,kind={earned:'新交付收入',deposit:'未來服務預收',old:'舊款回收',other:'待分類'}[e.kind];return `<tr><td><span class="table-name">${esc(e.name)}</span><span class="table-note">${OWNER_NAMES[e.owner]} · ${kind}</span><span class="table-note">${e.paidAt?'填列入帳 '+esc(e.paidAt.slice(11,19)):'未填入帳時間'}${e.cash!==r.cash?' · 填列金額 '+money(e.cash):''}</span></td><td class="money">${money(r.cash)}</td><td class="money">${money(r.gross)}</td><td class="money">${money(r.cost)}</td><td class="money ${r.net<0?'red':'green'}"><strong>${money(r.net)}</strong></td><td><span class="badge ${r.eligible?'':r.net<0?'red':'warn'}">${esc(r.reason)}</span>${!e.costVerified?'<span class="table-note">成本仍待核對</span>':''}<div style="display:flex;gap:12px;margin-top:7px"><button class="text-button" data-edit-entry="${esc(e.id)}">編輯</button><button class="text-button danger" data-delete-entry="${esc(e.id)}">刪除</button></div></td></tr>`;}).join('')}</tbody></table></div>`;
}
function renderAll(){
 $('missionDate').value=state.missionDate;$('commonCosts').value=common().amount;$('commonVerified').checked=common().verified;
 if(!storageAvailable)$('storageBanner').classList.remove('hidden');
 renderTasks();renderLeads();renderLedger();renderMetrics();
}
function openLead(lead=null){
 editingLead=lead?.id||null;$('leadForm').reset();$('leadDialogTitle').textContent=lead?'編輯成熟案件':'新增成熟案件';
 if(lead)for(const name of ['name','owner','kind','potential','status','next','decision','deliver','payment']){const el=$('leadForm').elements.namedItem(name);if(el.type==='checkbox')el.checked=!!lead[name];else el.value=lead[name]??'';}
 $('leadDialog').showModal();$('leadDialog').scrollTop=0;setTimeout(()=>$('leadName').focus(),50);
}
function readEntryForm(){
 const f=$('entryForm'),get=n=>f.elements.namedItem(n),e={id:editingEntry||uid(),missionDate:state.missionDate,name:get('name').value.trim(),owner:get('owner').value,kind:get('kind').value,proof:get('proof').value.trim()};
 for(const n of ['contract','cash','revenue','external','split','labor','tax'])e[n]=strictMoney(get(n).value||0);
 for(const n of ['paidAt','earnedAt','signedAt'])e[n]=get(n).value;
 for(const n of ['cashVerified','delivered','costVerified'])e[n]=get(n).checked;return e;
}
function updateEntryPreview(){try{const r=evaluateEntry(readEntryForm(),state.missionDate);$('entryPreview').textContent=money(r.net);$('entryPreviewReason').textContent=r.reason+(r.cost?'；本次成本仍扣除 '+money(r.cost):'');}catch(error){$('entryPreview').textContent='—';$('entryPreviewReason').textContent=error.message;}}
function openEntry(entry=null,lead=null){
 editingEntry=entry?.id||null;$('entryForm').reset();$('entryError').classList.add('hidden');$('entryDialogTitle').textContent=entry?'編輯實際款項':'記錄實際款項';
 if(entry){for(const name of ['name','owner','kind','contract','cash','revenue','paidAt','earnedAt','signedAt','external','split','labor','tax','proof','cashVerified','delivered','costVerified']){const el=$('entryForm').elements.namedItem(name);if(el.type==='checkbox')el.checked=!!entry[name];else el.value=entry[name]??'';}}
 else if(lead){$('entryName').value=lead.name;$('entryOwner').value=lead.owner;}
 updateEntryPreview();$('entryDialog').showModal();$('entryDialog').scrollTop=0;setTimeout(()=>$('entryName').focus(),50);
}
function askConfirm(title,message,callback){$('confirmTitle').textContent=title;$('confirmText').textContent=message;confirmCallback=callback;$('confirmDialog').showModal();}
function downloadFile(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
async function copyText(id){const value=$(id)?.textContent||'';try{if(!navigator.clipboard)throw new Error('fallback');await navigator.clipboard.writeText(value);showToast('話術已複製，請依客戶實際情況調整。');}catch(error){const t=document.createElement('textarea');t.value=value;t.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;';document.body.appendChild(t);t.select();try{const ok=document.execCommand('copy');showToast(ok?'話術已複製，請依客戶實際情況調整。':'請直接選取頁面話術並複製。');}catch(e){showToast('請直接選取頁面話術並複製。');}t.remove();}}
function csvCell(value){if(typeof value==='number')return String(value);let s=String(value??'');if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
function exportCSV(){
 const m=calculate(state),header=['執行日','案件','負責人','收入性質','合約總額（填列）','本筆實收（填列）','上午已確認實收','完成交付收入（填列）','合格計入收入','外包材料','分潤','工時固定分攤','稅費其他','本次應扣成本','保守淨貢獻','實際入帳時間 UTC+8','交付驗收時間 UTC+8','查核狀態','成本已核對','憑證摘要'];
 const rows=m.rows.map(r=>{const e=r.entry;return [state.missionDate,e.name,OWNER_NAMES[e.owner],{earned:'新交付',deposit:'預收款',old:'舊款',other:'待分類'}[e.kind],e.contract,e.cash,r.cash,e.revenue,r.gross,e.external,e.split,e.labor,e.tax,r.cost,r.net,e.paidAt,e.earnedAt,r.reason,e.costVerified?'是':'否',e.proof];});
 rows.push([state.missionDate,'本次共同成本','','','','','','','','','','','',common().amount,-common().amount,'','','',common().verified?'是':'否','']);
 rows.push([state.missionDate,'合計','','',m.contract,'',m.cash,'',m.gross,'','','','',m.costs,m.net,'','',m.achieved?'依輸入紀錄達標':m.net>=TARGET?'金額到線／待核對':'未達標',m.checked?'是':'否','管理用保守試算，非正式財務報表']);
 downloadFile(`NOON100K_流水帳_${state.missionDate}.csv`,'\uFEFF'+[header,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');showToast('流水帳已匯出；請與原始憑證一起保管。');
}
$('leadForm').addEventListener('submit',event=>{
 event.preventDefault();const f=event.currentTarget;if(!f.reportValidity())return;
 try{const get=n=>f.elements.namedItem(n),lead={id:editingLead||uid(),missionDate:state.missionDate,name:get('name').value.trim(),owner:get('owner').value,kind:get('kind').value,potential:strictMoney(get('potential').value),status:get('status').value,next:get('next').value.trim(),decision:get('decision').checked,deliver:get('deliver').checked,payment:get('payment').checked};
 if(!lead.name||!lead.next){showToast('請填案件名稱與具體下一步。');return;}
 if(editingLead)state.leads=state.leads.map(v=>v.id===editingLead?lead:v);else state.leads.push(lead);
 saveState();$('leadDialog').close();renderLeads();renderMetrics();showToast('案件已儲存；預估收益不會加入已賺金額。');
 }catch(error){showToast(error.message);}
});
$('entryForm').addEventListener('input',updateEntryPreview);$('entryForm').addEventListener('change',updateEntryPreview);
$('entryForm').addEventListener('submit',event=>{
 event.preventDefault();if(!$('entryForm').reportValidity())return;
 try{const e=readEntryForm();if(!e.name)throw new Error('請填案件代稱。');if(e.cash>e.contract||e.revenue>e.contract)throw new Error('本筆實收或本次交付收入不能高於該案合約總額。');if(e.kind!=='earned'&&e.revenue>0)throw new Error('預收、舊款與待分類款項的本次交付收入請填 0，或修正收入性質。');
 if(editingEntry)state.entries=state.entries.map(v=>v.id===editingEntry?e:v);else state.entries.push(e);
 common().verified=false;saveState();$('entryDialog').close();renderLedger();$('commonVerified').checked=false;renderMetrics();showToast('款項已儲存；共同成本核對已重設，請重新覆核。');
 }catch(error){$('entryError').textContent=error.message;$('entryError').classList.remove('hidden');$('entryDialog').scrollTop=0;}
});
$('taskList').addEventListener('change',event=>{
 const id=event.target.dataset.task;if(!id)return;const s=taskState(id);s.done=event.target.checked;s.doneAt=s.done?Date.now():0;saveState();renderTasks();const input=$('check-'+id);if(input)input.focus({preventScroll:true});
});
$('taskList').addEventListener('input',event=>{const id=event.target.dataset.note;if(!id)return;taskState(id).note=event.target.value.slice(0,1500);saveState();const b=document.querySelector(`[data-toggle-note="${id}"]`);if(b)b.textContent=event.target.value?'有備註':'＋備註';});
$('taskList').addEventListener('click',event=>{const button=event.target.closest('[data-toggle-note]');if(!button)return;const id=button.dataset.toggleNote;if(openNotes.has(id))openNotes.delete(id);else openNotes.add(id);const t=document.querySelector(`[data-note="${id}"]`);t.classList.toggle('hidden',!openNotes.has(id));button.setAttribute('aria-expanded',String(openNotes.has(id)));if(openNotes.has(id))t.focus();});
$('hideDone').addEventListener('change',event=>{hideDone=event.target.checked;renderTasks();});
document.querySelectorAll('[data-owner]').forEach(button=>button.addEventListener('click',()=>{ownerFilter=button.dataset.owner;document.querySelectorAll('[data-owner]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});renderTasks();}));
$('expandTasks').addEventListener('click',()=>{const willOpen=![...openPhases.values()].some(Boolean);PHASES.forEach(p=>openPhases.set(p.id,willOpen));$('expandTasks').textContent=willOpen?'收合全部時段':'展開全部時段';renderTasks();});
$('commonCosts').addEventListener('change',event=>{try{common().amount=strictMoney(event.target.value);common().verified=false;$('commonVerified').checked=false;saveState();renderMetrics();}catch(error){showToast(error.message);event.target.value=common().amount;}});
$('commonVerified').addEventListener('change',event=>{common().verified=event.target.checked;saveState();renderMetrics();});
$('missionDate').addEventListener('change',event=>{const selected=event.target.value;if(!validDate(selected)){event.target.value=state.missionDate;return;}if(selected===state.missionDate)return;const previous=state.missionDate;event.target.value=previous;askConfirm('切換執行日期',`改為 ${selected}？\n代辦、案件、成本與款項依日期分開保留；既有資料不會移到新日期。倒數與收入判定依新日期重新計算。`,()=>{state.missionDate=selected;openNotes.clear();saveState();renderAll();showToast('已切換執行日，資料按日期分開。');});});
document.addEventListener('click',event=>{
 const action=event.target.closest('[data-action]');if(action){if(action.dataset.action==='new-lead')openLead();if(action.dataset.action==='new-entry')openEntry();}
 const close=event.target.closest('[data-close]');if(close)$(close.dataset.close).close();
 const copy=event.target.closest('[data-copy]');if(copy)copyText(copy.dataset.copy);
 const editLead=event.target.closest('[data-edit-lead]');if(editLead)openLead(state.leads.find(l=>l.id===editLead.dataset.editLead));
 const record=event.target.closest('[data-record-lead]');if(record)openEntry(null,state.leads.find(l=>l.id===record.dataset.recordLead));
 const deleteLead=event.target.closest('[data-delete-lead]');if(deleteLead)askConfirm('刪除案件','只會刪除這個商機；相關入帳紀錄不會跟著刪除。確定要刪除嗎？',()=>{state.leads=state.leads.filter(l=>l.id!==deleteLead.dataset.deleteLead);saveState();renderLeads();renderMetrics();showToast('案件已刪除。');});
 const editEntry=event.target.closest('[data-edit-entry]');if(editEntry)openEntry(state.entries.find(e=>e.id===editEntry.dataset.editEntry));
 const deleteEntry=event.target.closest('[data-delete-entry]');if(deleteEntry)askConfirm('刪除款項紀錄','刪除會改變收入、成本與目標進度；建議先備份。確定刪除這筆紀錄？',()=>{state.entries=state.entries.filter(e=>e.id!==deleteEntry.dataset.deleteEntry);common().verified=false;$('commonVerified').checked=false;saveState();renderLedger();renderMetrics();showToast('紀錄已刪除，請重新核對共同成本。');});
});
$('confirmYes').addEventListener('click',()=>{const cb=confirmCallback;confirmCallback=null;$('confirmDialog').close();if(cb)cb();});
$('confirmDialog').addEventListener('close',()=>{if(!$('confirmDialog').open)confirmCallback=null;});
$('exportBackup').addEventListener('click',()=>{saveState();downloadFile(`NOON100K_完整備份_${state.missionDate}.json`,JSON.stringify(state,null,2),'application/json;charset=utf-8');showToast('完整備份已匯出，包含各日期紀錄與備註。');});
$('csvExport').addEventListener('click',exportCSV);
$('importBackup').addEventListener('click',()=>$('backupFile').click());
$('backupFile').addEventListener('change',async event=>{
 const file=event.target.files?.[0];event.target.value='';if(!file)return;
 try{if(file.size>5*1024*1024)throw new Error('備份檔超過 5MB，無法匯入。');const clean=validateBackup(JSON.parse((await file.text()).replace(/^\uFEFF/,'')));askConfirm('匯入並覆蓋本機資料',`將匯入 ${clean.missionDate} 的備份，以及其中的 ${clean.leads.length} 筆案件與 ${clean.entries.length} 筆款項。\n這會覆蓋此瀏覽器目前所有日期的紀錄，不是合併；另一台裝置也不會即時同步。請先保留現有備份。`,()=>{state=clean;openNotes.clear();saveState();renderAll();showToast('備份已匯入；憑證仍需自行查核。');});}catch(error){showToast('匯入失敗：'+error.message);}
});
$('resetData').addEventListener('click',()=>askConfirm('清除所有本機紀錄','這會清除所有執行日的勾選、備註、案件、款項與成本，無法復原。\n建議先「匯出完整備份」。確定清除？',()=>{state=initialState(state.missionDate);openNotes.clear();saveState();renderAll();showToast('本機紀錄已清除，所有金額歸零。');}));
let lastLedgerSignature='';
let printSnapshot=null;
function beforePrint(){if(printSnapshot)return;printSnapshot={owner:ownerFilter,hide:hideDone,phases:new Map(openPhases),notes:new Set(openNotes)};ownerFilter='all';hideDone=false;PHASES.forEach(p=>openPhases.set(p.id,true));ALL_TASKS.filter(t=>taskState(t.id).note).forEach(t=>openNotes.add(t.id));renderTasks();document.querySelectorAll('.offer details').forEach(d=>d.open=true);const m=calculate(state);$('reportHead').textContent=`執行日 ${state.missionDate} 09:00–11:59:59｜列印時間 ${taiwanDateTime().replace('T',' ')} UTC+8｜保守淨收益 ${money(m.net)}｜${m.achieved?'依輸入紀錄達標':m.net>=TARGET?'金額到線，待完整核對':'尚未達標'}。`;$('reportHead').classList.remove('hidden');}
function afterPrint(){if(!printSnapshot)return;ownerFilter=printSnapshot.owner;hideDone=printSnapshot.hide;openPhases.clear();printSnapshot.phases.forEach((v,k)=>openPhases.set(k,v));openNotes.clear();printSnapshot.notes.forEach(v=>openNotes.add(v));printSnapshot=null;renderTasks();}
$('printPage').addEventListener('click',()=>window.print());window.addEventListener('beforeprint',beforePrint);window.addEventListener('afterprint',afterPrint);
window.addEventListener('storage',event=>{if(event.key!==STORAGE_KEY||!event.newValue)return;try{if(document.querySelector('dialog[open]')||document.activeElement?.matches('input,textarea,select')){showToast('另一分頁更新了資料；請先儲存或備份目前編輯，再重新載入。');return;}state=validateBackup(JSON.parse(event.newValue));renderAll();showToast('已載入另一分頁的本機更新。');}catch(error){showToast('另一分頁的更新格式異常，未套用。');}});
let scrollPending=false;
window.addEventListener('scroll',()=>{if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{let current='overview';for(const id of ['overview','tasks','pipeline','ledger','offers','rules'])if($(id).getBoundingClientRect().top<170)current=id;document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));scrollPending=false;});},{passive:true});
// Pure calculation functions are exposed for transparent local testing; no external services are contacted.
window.Noon100K=Object.freeze({evaluateEntry,calculate,validateBackup,bounds,inMission,version:'1.0'});
renderAll();
if(loadError){$('storageBanner').classList.remove('hidden');$('storageBanner').textContent='本機儲存可能受限，或既有檔案無法讀取。尚未以預設資料覆寫；請優先保留舊備份，操作後也請匯出。';}
setInterval(()=>{renderMetrics();const signature=JSON.stringify(calculate(state).rows.map(r=>[r.entry.id,r.cash,r.gross,r.cost,r.reason]));if(signature!==lastLedgerSignature){lastLedgerSignature=signature;renderLedger();}if($('entryDialog').open)updateEntryPreview();},1000);
