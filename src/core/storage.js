const KEY='sowa9_state_v1';
export const emptyState=()=>({drivers:[...['زيباني','بغداد','بوسلاح','بلعربي'].map(name=>({name,status:'متاح'}))],weeks:[],assignments:[],relations:[],missedTurns:[]});
export function load(){try{return JSON.parse(localStorage.getItem(KEY))||emptyState()}catch{return emptyState()}}
export function save(state){localStorage.setItem(KEY,JSON.stringify(state));return state}
export function reset(){const s=emptyState();save(s);return s}
export function addWeek(state,week){state.weeks.push(week);return save(state)}
export function addAssignment(state,a){state.assignments.push(a);return save(state)}
export function addRelation(state,r){state.relations.push(r);return save(state)}
export function addMissedTurn(state,r){state.missedTurns.push(r);return save(state)}
export function exportJSON(state){return JSON.stringify(state,null,2)}
export function importJSON(text){const parsed=JSON.parse(text);if(!parsed||!Array.isArray(parsed.assignments))throw new Error('ملف غير صالح');save(parsed);return parsed}
