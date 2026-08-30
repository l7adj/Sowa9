// Sowa9 — محرك العدالة والتدوير التاريخي
export const DRIVERS = ['زيباني','بغداد','بوسلاح','بلعربي'];
export const MISSIONS = [
  {id:'dunya',name:'دنيا برك',order:1,day:'الأحد',start:'12:00',end:'22:00',drivers:2,night:false},
  {id:'garden',name:'غاردن سيتي',order:1,day:'الأحد',start:'17:00',end:'00:00',drivers:2,night:true},
  {id:'bahja',name:'البحر – بهجة',order:2,day:'الثلاثاء',start:'09:00',end:'22:00',drivers:1,night:false,notes:'خارجي ومتعب بسبب الحرارة؛ بهجة أصعب'},
  {id:'club',name:'البحر – كلوب',order:2,day:'الثلاثاء',start:'12:00',end:'22:00',drivers:3,night:false,notes:'خارجي ومتعب بسبب الحرارة'},
  {id:'bondage',name:'بونداج زرالدة',order:3,day:'الأربعاء',start:'04:30',end:'10:00',drivers:2,night:false},
  {id:'guard',name:'حراسة',order:3,day:'الأربعاء',start:'17:00',end:'00:00',drivers:1,night:true,notes:'داخلي ومريح، لكنه يُحسب عملًا ليليًا'},
  {id:'raids',name:'مداهمات',order:4,day:'الخميس',start:'19:30',end:'05:00',drivers:2,night:true,notes:'عمل خارجي ليلي'},
  {id:'delivery',name:'توصيل',order:4,day:'الخميس',periods:[['20:00','21:30'],['06:30','08:00']],drivers:1,night:false},
  {id:'barajat',name:'براجات',order:5,day:'الجمعة',start:'06:00',end:'12:00',drivers:1,night:false,notes:'داخلي ومريح'},
  {id:'forest',name:'الغابة',order:5,day:'الجمعة',drivers:4,night:false,forest:true,periods:{
    Alpha:[['17:00','23:00'],['05:00','11:00'],['11:00','17:00']],
    MO:[['17:00','22:00'],['07:00','12:00'],['12:00','17:00']]
  }}
];

export function parseDT(value){ return new Date(value); }
export function hoursBetween(a,b){ return Math.max(0,(parseDT(b)-parseDT(a))/3600000); }

// كل سجل عمل يجب أن يحتوي على تاريخ ووقت حقيقيين.
export function buildRestPeriods(assignments){
  const byDriver = {};
  assignments.forEach(a => (byDriver[a.driver] ||= []).push(a));
  const out=[];
  for(const [driver,list] of Object.entries(byDriver)){
    list.sort((a,b)=>parseDT(a.end)-parseDT(b.end));
    for(let i=1;i<list.length;i++){
      const prev=list[i-1], next=list[i];
      const start=parseDT(prev.end), end=parseDT(next.start);
      if(end>start) out.push({driver,from:prev.end,to:next.start,hours:hoursBetween(prev.end,next.start),afterMission:prev.mission,beforeMission:next.mission});
    }
  }
  return out;
}

// تاريخ كامل: لا توجد نافذة زمنية ثابتة. آخر دور من كل سائق هو مرجع الدور.
export function rankCandidates({drivers, history, missionId, role, unavailable=[]}){
  const eligible=drivers.filter(d=>!unavailable.includes(d));
  return eligible.map(driver=>{
    const records=history.filter(x=>x.driver===driver);
    const same=records.filter(x=>x.missionId===missionId && (!role || x.role===role));
    const allSameMission=records.filter(x=>x.missionId===missionId);
    const lastRole=same.length?same.reduce((a,b)=>a.end>b.end?a:b):null;
    const lastMission=allSameMission.length?allSameMission.reduce((a,b)=>a.end>b.end?a:b):null;
    const lastAny=records.length?records.reduce((a,b)=>a.end>b.end?a:b):null;
    const missed=history.filter(x=>x.driver===driver && x.missedTurn && x.missedMissionId===missionId);
    const borrowed=history.filter(x=>x.driver===driver && (x.relation==='borrowed'||x.relation==='lent'));
    return {driver,lastRole,lastMission,lastAny,missedCount:missed.length,borrowCount:borrow.length};
  }).sort((a,b)=>{
    // الدور الفائت مشروعًا يعاد إلى صاحبه لاحقًا، لكن غير المتاح الآن لا يدخل.
    if(a.missedCount!==b.missedCount) return b.missedCount-a.missedCount;
    const ta=a.lastRole?parseDT(a.lastRole.end).getTime():-Infinity;
    const tb=b.lastRole?parseDT(b.lastRole.end).getTime():-Infinity;
    if(ta!==tb) return ta-tb;
    const ma=a.lastMission?parseDT(a.lastMission.end).getTime():-Infinity;
    const mb=b.lastMission?parseDT(b.lastMission.end).getTime():-Infinity;
    if(ma!==mb) return ma-mb;
    return a.driver.localeCompare(b.driver,'ar');
  });
}

export function suggest({drivers=DRIVERS,history=[],missionId,role,unavailable=[]}){
  const ranked=rankCandidates({drivers,history,missionId,role,unavailable});
  return {selected:ranked[0]||null,candidates:ranked};
}

export function forestRoles(type){
  if(type==='Alpha') return [
    {role:'Alpha بداية',start:'17:00',end:'23:00'},
    {role:'Alpha وسط',start:'05:00',end:'11:00'},
    {role:'Alpha نهاية',start:'11:00',end:'17:00',sameAs:'Alpha بداية'}
  ];
  return [
    {role:'MO بداية',start:'17:00',end:'22:00'},
    {role:'MO صباح',start:'07:00',end:'12:00'},
    {role:'MO نهاية',start:'12:00',end:'17:00'}
  ];
}
