/* 游戏规则、存档、验证、音效与展示逻辑
 * 此文件由源码自动生成；永久修改请编辑 miniprogram/ 中对应文件后重新构建。
 */
window.__gameModules=Object.assign(window.__gameModules||{}, {
"game/captcha": function(require,module,exports){
// Local story mini-games. No network verification or personal data is collected.
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function random(c){c.seed=(Math.imul(c.seed,1664525)+1013904223)>>>0;return c.seed/4294967296;}
function shuffle(c,items){for(let i=items.length-1;i>0;i--){const j=Math.floor(random(c)*(i+1));const t=items[i];items[i]=items[j];items[j]=t;}return items;}
function neighbor(a,b,size){return Math.abs(Math.floor(a/size)-Math.floor(b/size))+Math.abs(a%size-b%size)===1;}
const PIPE_COLORS=['#c76684','#ad688e','#ce806f','#a96573','#bc785c'];
const PIPE_ROUTE=[0,1,2,3,4,9,8,7,6,5,10,11,12,13,14,19,18,17,16,15,20,21,22,23,24];
const PIPE_LENGTHS=[3,4,5,6,7];
function pipeBoard(c){
 const owner=Array(25).fill(-1),links=Array.from({length:25},()=>({up:false,right:false,down:false,left:false}));
 c.paths.forEach((path,color)=>{
  path.forEach(id=>owner[id]=color);
  for(let i=1;i<path.length;i++){
   const a=path[i-1],b=path[i],direction=b-a;
   if(direction===-5){links[a].up=true;links[b].down=true;}
   if(direction===5){links[a].down=true;links[b].up=true;}
   if(direction===-1){links[a].left=true;links[b].right=true;}
   if(direction===1){links[a].right=true;links[b].left=true;}
  }
 });
 c.tiles=Array.from({length:25},(_,id)=>{
  const endpoint=c.endpoints.findIndex(pair=>pair.indexOf(id)>=0),color=endpoint>=0?endpoint:owner[id];
  return {id,value:endpoint>=0?String(endpoint+1):'',image:'',selected:owner[id]>=0,order:0,style:'',active:false,
   color:color>=0?PIPE_COLORS[color]:'',endpoint:endpoint>=0,up:links[id].up,right:links[id].right,down:links[id].down,left:links[id].left,
   label:endpoint>=0?'第 '+(endpoint+1)+' 组端点':owner[id]>=0?'已连接的管道':'空白格'};
 });
}
function createPipes(c){
 c.heading='Connect matching colors';c.instruction='连好 5 组同色端点';
 c.hint='从任一带数字的圆点开始，逐格点击相邻白格。点回上一格可撤回；管道不能交叉，并要填满网格。颜色相近，请看数字。';
 c.board=Array(25).fill('');c.endpoints=[];c.paths=Array.from({length:5},()=>[]);c.activeColor=-1;
 const transform=Math.floor(random(c)*8),rot=transform%4,flip=transform>=4;
 const position=id=>{let x=id%5,y=Math.floor(id/5);if(flip)x=4-x;for(let n=0;n<rot;n++){const old=x;x=4-y;y=old;}return y*5+x;};
 let offset=0;PIPE_LENGTHS.forEach(length=>{const route=PIPE_ROUTE.slice(offset,offset+length).map(position);c.endpoints.push([route[0],route[route.length-1]]);offset+=length;});
 pipeBoard(c);
}
function winner(board,mark){return LINES.some(line=>line.every(i=>board[i]===mark));}
function render(c){
 if(c.kind==='numberlink'){pipeBoard(c);return;}
 c.tiles=c.board.map((value,id)=>({id,value,image:'',selected:false,order:0,style:'',active:c.kind==='mole'&&id===c.active,
  label:c.kind==='tic'?'第 '+(id+1)+' 格 '+(value||'空位'):c.kind==='mole'?'第 '+(id+1)+' 个洞':'格子'}));
}
function create(day,seed){
 const c={day,seed:(seed===undefined?Date.now():seed)>>>0,kind:['words','numberlink','tic','mole','photos'][day-1],tiles:[],answer:[],selected:[],board:[],failed:false,ready:false,running:false,active:-1,hits:0,target:8,moves:0,
  heading:'Select all squares with...',instruction:'',hint:'完成后点击 Verify。点错或漏点，本轮需重试。',status:''};
 if(c.kind==='words'){
  c.heading='Select the words in order';c.instruction='请按语序依次点击「你」「是」「人」「类」';
  c.tiles=['人','你','类','是'].map((value,id)=>({id,value,image:'',selected:false,order:0,style:'',label:value}));c.answer=[1,3,0,2];
 }else if(c.kind==='numberlink'){
  createPipes(c);
 }else if(c.kind==='tic'){
  c.heading='Win this Tic Tac Toe';c.instruction='你执 X · 先防守，再连成三格';c.hint='点击空格落子，对手自动下 O。赢下残局才可通过，输棋或平局需重试。';
  c.board=['X','','O','','O','','','','X'];
  const turns=Math.floor(random(c)*4);for(let n=0;n<turns;n++)c.board=[6,3,0,7,4,1,8,5,2].map(i=>c.board[i]);
  if(random(c)<.5)c.board=[2,1,0,5,4,3,8,7,6].map(i=>c.board[i]);render(c);
 }else if(c.kind==='mole'){
  c.heading='Tap every mole that appears';c.instruction='打中 8 只地鼠，不要漏';c.hint='点「开始挑战」后，每只地鼠停留 1.3 秒。点空洞或漏打均失败。';
  c.board=Array(9).fill('');c.sequence=[];for(let n=0;n<c.target;n++){let next=Math.floor(random(c)*9);if(next===c.sequence[n-1])next=(next+1)%9;c.sequence.push(next);}render(c);
 }else{
  c.instruction='吉娃娃 · Chihuahua';c.hint='选中所有吉娃娃，别把松饼也选进去。确认没有漏选后点击 Verify。';
  const ids=shuffle(c,Array.from({length:16},(_,i)=>i));
  c.tiles=ids.map((photo,id)=>({id,value:'',image:'/assets/captcha-pet-'+photo+'.jpg',selected:false,order:0,style:'',label:'选择第 '+(id+1)+' 张图片'}));
  c.answer=ids.map((photo,id)=>[1,3,4,6,9,11,12,14].indexOf(photo)>=0?id:-1).filter(id=>id>=0);
 }
 return c;
}
function fail(c){c.failed=true;c.running=false;c.active=-1;c.status='本轮已结束，请点击 Verify 查看结果。';if(c.kind==='mole')render(c);return 'wrong';}
function tactical(board,mark){for(let i=0;i<9;i++)if(!board[i]){const copy=board.slice();copy[i]=mark;if(winner(copy,mark))return i;}return -1;}
function select(c,id){
 if(c.failed||c.ready)return 'ignored';
 if(!Number.isInteger(id)||!c.tiles[id])return fail(c);
 if(c.kind==='words'){
  if(id!==c.answer[c.selected.length])return fail(c);
  c.selected.push(id);c.tiles[id].selected=true;c.tiles[id].order=c.selected.length;c.ready=c.selected.length===4;
 }else if(c.kind==='numberlink'){
  let color=c.activeColor;
  if(color<0){
   color=c.endpoints.findIndex((pair,index)=>pair.indexOf(id)>=0&&c.paths[index].length===0);
   if(color<0)return fail(c);
   c.paths[color]=[id];c.activeColor=color;
  }else{
   const path=c.paths[color],last=path[path.length-1];
   if(path.length>1&&id===path[path.length-2])path.pop();
   else {
    if(!neighbor(last,id,5)||c.paths.some(p=>p.indexOf(id)>=0)||c.endpoints.some((pair,index)=>index!==color&&pair.indexOf(id)>=0))return fail(c);
    path.push(id);
    if(c.endpoints[color].indexOf(id)>=0)c.activeColor=-1;
   }
  }
  c.moves++;c.ready=c.paths.every((path,index)=>path.length>1&&c.endpoints[index].indexOf(path[0])>=0&&c.endpoints[index].indexOf(path[path.length-1])>=0&&path[0]!==path[path.length-1])&&c.paths.reduce((sum,path)=>sum+path.length,0)===25;
  render(c);
 }else if(c.kind==='tic'){
  if(c.board[id])return fail(c);c.board[id]='X';c.moves++;
  if(winner(c.board,'X'))c.ready=true;
  else {
   let next=tactical(c.board,'O');if(next<0)next=tactical(c.board,'X');
   if(next<0){const empty=c.board.map((v,i)=>v?-1:i).filter(i=>i>=0);next=empty[Math.floor(random(c)*empty.length)];}
   if(next!==undefined)c.board[next]='O';
   if(winner(c.board,'O')||c.board.every(Boolean)){render(c);return fail(c);}
  }render(c);
 }else if(c.kind==='mole'){
  if(!c.running)return 'ignored';if(id!==c.active)return fail(c);
  c.hits++;c.active=-1;c.ready=c.hits===c.target;c.running=!c.ready;render(c);
 }else{
  // Wrong selections cannot be undone to erase a mistake within this attempt.
  if(c.tiles[id].selected)return fail(c);c.tiles[id].selected=true;c.selected.push(id);
  if(c.answer.indexOf(id)<0)return fail(c);
 }
 c.status=c.ready?'挑战完成，请点击 Verify。':c.kind==='numberlink'?'已连好 '+c.paths.filter((path,index)=>path.length>1&&c.endpoints[index].indexOf(path[path.length-1])>=0&&path[0]!==path[path.length-1]).length+' / 5 组 · 已填 '+c.paths.reduce((sum,path)=>sum+path.length,0)+' / 25 格':c.kind==='mole'?'已打中 '+c.hits+' / '+c.target:c.kind==='tic'?'轮到你下 X':'';
 return c.ready?'success':'pending';
}
function start(c){if(c.kind!=='mole'||c.running||c.failed||c.ready)return false;c.running=true;nextMole(c);return true;}
function nextMole(c){if(c.kind==='mole'&&c.running&&!c.failed){c.active=c.sequence[c.hits];c.status='已打中 '+c.hits+' / '+c.target;render(c);}}
function expire(c){if(c.kind==='mole'&&c.running)fail(c);}
function complete(c){return !c.failed&&(c.kind==='photos'?c.selected.length===c.answer.length&&c.answer.every(id=>c.selected.indexOf(id)>=0):c.ready);}
module.exports={create,select,start,nextMole,expire,complete};


},
"game/engine": function(require,module,exports){
const content = require('./content');
const smsStories = require('./sms-stories');
const VERSION = 2;
function clone(x) { return JSON.parse(JSON.stringify(x)); }
function clamp(n) { return Math.round(Math.max(0, Math.min(100, n)) * 100) / 100; }
function day(s) { return Math.min(5, Math.floor(s.turn / 3) + 1); }
function slot(s) { return s.turn % 3; }
function random(s) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; }
function setupDay(s) {
  s.daily = { verified: false, post: false, date: false, sms: false, smsReplies: {}, talked: false, talkMessage: '', talkChoice: '', talkReply: '', cards: [], likes: [] };
  const pool = content.posts.map(p => p.id).filter(id => !s.feed.some(p => p.postId === id));
  for (let i=0;i<3;i++) s.daily.cards.push(pool.splice(Math.floor(random(s)*pool.length),1)[0]);
  const invites = content.chats.filter(c => c.id !== s.chatId);
  s.chatId = invites[Math.floor(random(s)*invites.length)].id;
}
function create(seed) {
  const s={version:VERSION,seed:(seed===undefined?Date.now():seed)>>>0,turn:0,phase:'playing',exposure:10,sanity:100,affection:50,postCount:0,managerHandled:false,smsMemory:{manager:0,teammate:0,unknown:0},retaliationTurn:-1,history:[],feed:[],ending:null,daily:null,chatId:'',captchaEnabled:null};
  setupDay(s);return s;
}
function endingFor(s,final) {
  if(s.sanity<=0)return 'A';
  if(!final)return null;
  if(s.affection<=30&&s.postCount>=5)return 'D';
  if(s.exposure>=75&&s.affection>=45)return 'B';
  if(s.exposure<=45&&s.affection>=65&&s.sanity>=40)return 'C';
  return 'E';
}
function end(s,final) { const id=endingFor(s,final);if(id){s.ending=id;s.phase='ending';}return !!id; }
function effect(s,o) {
  const multiplier=s.exposure>70?2:1;
  s.exposure=clamp(s.exposure+(o.exposure||0));s.affection=clamp(s.affection+(o.affection||0));
  s.sanity=clamp(s.sanity+(o.sanity||0)*((o.sanity||0)<0?multiplier:1));end(s,false);
}
function log(s,before,title,note) {
  s.history.push({id:s.history.length+1,day:day(s),slot:['晨间','午间','晚间'][slot(s)],title,note:note||'',exposure:Math.round((s.exposure-before.exposure)*100)/100,affection:Math.round((s.affection-before.affection)*100)/100,sanity:Math.round((s.sanity-before.sanity)*100)/100});
}
function active(s) { if(s.phase!=='playing')throw new Error('这一局已经结束，请开启新的一局。'); }
function advance(s) {
  const night=slot(s)===2, revenge=s.retaliationTurn===s.turn;
  if(s.phase!=='ending'&&(night||revenge)) {
    const before=clone(s);effect(s,{sanity:-s.exposure*.25*(revenge?2:1)});
    log(s,before,revenge?'网暴反扑':'夜间结算',revenge?'上一次回骂引来了双倍网暴。':'这一晚，你仍然被网上的声音消耗。');
    if(revenge)s.retaliationTurn=-1;
  }
  s.turn++;
  if(end(s,s.turn===15))return;
  if(night)setupDay(s);
}
function verify(s,success,skipped) {
  if(slot(s)!==0||s.daily.post)throw new Error('今天的微光行动已结束。');
  if(s.daily.verified)return;
  const before=clone(s);
  if(success){if(!skipped)effect(s,{sanity:s.sanity>60?2:0});s.daily.verified=true;if(!skipped)log(s,before,'通过安全验证','已进入微光。');}
  else throw new Error('验证未通过，请按提示重试。');
}
function post(s,index) {
  if(slot(s)!==0||s.daily.post)throw new Error('一天只能进行一次微光行动。');
  if(!s.daily.verified)throw new Error('请先完成安全验证。');
  if(!Number.isInteger(index)||index<0||index>2)throw new Error('请选择一张行动卡。');
  const p=content.posts.find(p=>p.id===s.daily.cards[index]);
  const before=clone(s);effect(s,p);s.daily.post=true;s.postCount++;
  s.feed.unshift({id:'my-'+day(s),postId:p.id,day:day(s),title:p.title,caption:p.caption});
  log(s,before,p.title,p.result||'你按下了发送键。会被发现吗？');advance(s);
}
function date(s,id) {
  if(slot(s)!==1||s.daily.date)throw new Error('约会选择只在午间开放，每天一次。');
  const invite=content.chats.find(c=>c.id===s.chatId), option=invite.options.find(o=>o.id===id);
  if(!option)throw new Error('这个选项不存在。');
  if(option.intimate&&s.affection<30)throw new Error('他暂时拒绝了这个亲密安排，请选择其他回应。');
  const before=clone(s);effect(s,option);s.daily.date=true;
  log(s,before,option.title,option.reply);advance(s);
}
function smsKind(s) { return s.exposure>50&&!s.managerHandled?'manager':s.exposure>70?'harassment':'ordinary'; }
function sms(s,id) {
  if(slot(s)!==2||s.daily.sms)throw new Error('短信行动只在晚间开放，每天一次。');
  const kind=smsKind(s),before=clone(s);let option;
  if(id==='skip') option={title:'不回复，结束今天',reply:'你把手机倒扣在床头。今晚就到这里。'};
  else if(kind==='manager')option=content.manager.find(o=>o.id===id);
  else if(kind==='harassment')option=content.harassment.find(o=>o.id===id);
  else option=content.ordinarySms.find(o=>o.id===id);
  if(!option)throw new Error('请选择当前短信中的回复。');
  effect(s,option);let note=option.reply;
  if(id!=='skip'&&kind==='manager')s.managerHandled=true;
  if(kind==='harassment'&&id==='protect'&&before.affection<40&&s.phase!=='ending'){effect(s,{sanity:-10});note='“别烦我。”屏幕上只有这三个字。';}
  if(kind==='harassment'&&id==='fight')s.retaliationTurn=s.turn+1;
  s.daily.sms=true;log(s,before,option.title,note);advance(s);
}
function smsReply(s,sender,id) {
  if(slot(s)!==2||s.daily.sms)throw new Error('今晚的短信已结束。');
  if(!smsStories.contacts.includes(sender))throw new Error('请选择当前短信联系人。');
  const replies=s.daily.smsReplies||(s.daily.smsReplies={});
  if(replies[sender])throw new Error('今晚已经处理过这位联系人的短信。');
  const option=id==='skip'?{title:'暂不回复',reply:'你把这条消息留在了今晚，没有回复。',tone:0}:smsStories.option(sender,id,day(s));
  if(!option)throw new Error('请选择这位联系人的回复。');
  const message=smsStories.threads(s,day(s)).find(t=>t.id===sender).text;
  const before=clone(s),memory=s.smsMemory||(s.smsMemory={manager:0,teammate:0,unknown:0});
  effect(s,option);
  const delta={exposure:Math.round((s.exposure-before.exposure)*100)/100,affection:Math.round((s.affection-before.affection)*100)/100,sanity:Math.round((s.sanity-before.sanity)*100)/100};
  const signed=n=>(n>0?'+':'')+n;
  replies[sender]={id,message,title:option.title,reply:option.reply,silent:id==='skip'||sender==='unknown'&&id==='block',replyAsNote:id==='skip'||sender==='unknown'&&id!=='help',effect:'暴露 '+signed(delta.exposure)+'% · 精神 '+signed(delta.sanity)+' · 好感 '+signed(delta.affection)};
  memory[sender]=Math.max(-5,Math.min(5,memory[sender]+option.tone));
  log(s,before,smsStories.stories[sender].name+' · '+option.title,option.reply);
  if(s.phase==='playing'&&smsStories.contacts.every(k=>replies[k])){s.daily.sms=true;advance(s);}
}
function talkFor(s) { return content.dailyTalks[day(s)-1][s.affection<30?'cold':s.affection>80?'sweet':'normal']; }
function dispatch(state,action) {
  const s=clone(state);active(s);
  if(action.turn!==undefined&&action.turn!==s.turn)throw new Error('已进入下一个时段，请使用当前选项。');
  if(action.type==='verify')verify(s,action.success,action.skipped&&s.captchaEnabled===false);
  else if(action.type==='captchaPreference'){
    if(typeof action.enabled!=='boolean')throw new Error('请选择是否开启安全验证小游戏。');
    s.captchaEnabled=action.enabled;
  }
  else if(action.type==='post')post(s,action.index);
  else if(action.type==='date')date(s,action.id);
  else if(action.type==='sms')sms(s,action.id);
  else if(action.type==='smsReply')smsReply(s,action.sender,action.id);
  else if(action.type==='talk') {
    if(s.daily.talked)throw new Error('今天的微聊已经聊过了，明天再来。');
    const choice=talkFor(s).options.find(o=>o.id===action.id);if(!choice)throw new Error('请选择一条回复。');
    s.daily.talkMessage=talkFor(s).message;s.daily.talked=true;s.daily.talkChoice=choice.title;s.daily.talkReply=choice.reply;
  } else if(action.type==='like') {
    if(typeof action.id!=='string'||!/^((idol|fan|passer|anti|support|market|bot)-[1-5]|my-[1-5])$/.test(action.id))throw new Error('动态不存在。');
    const i=s.daily.likes.indexOf(action.id);if(i>=0)s.daily.likes.splice(i,1);else s.daily.likes.push(action.id);
  } else throw new Error('这个操作不存在。');
  return s;
}
function restore(raw) {
  let s;try{s=typeof raw==='string'?JSON.parse(raw):clone(raw);}catch(_){return null;}
  if(!s||s.version!==VERSION||!['playing','ending'].includes(s.phase))return null;
  if(s.captchaEnabled===undefined)s.captchaEnabled=null;
  if(s.captchaEnabled!==null&&typeof s.captchaEnabled!=='boolean')return null;
  if(!Number.isInteger(s.turn)||s.turn<0||s.turn>15||!Number.isInteger(s.seed)||s.seed<0||s.seed>4294967295)return null;
  if(!['exposure','sanity','affection'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=100))return null;
  if(!Number.isInteger(s.postCount)||s.postCount<0||s.postCount>5||typeof s.managerHandled!=='boolean')return null;
  if(!Number.isInteger(s.retaliationTurn)||s.retaliationTurn< -1||s.retaliationTurn>15)return null;
  if(!content.chats.some(c=>c.id===s.chatId))return null;
  const d=s.daily;
  if(d&&d.smsReplies===undefined)d.smsReplies={};
  if(s.smsMemory===undefined)s.smsMemory={manager:0,teammate:0,unknown:0};
  if(!s.smsMemory||!smsStories.contacts.every(k=>Number.isInteger(s.smsMemory[k])&&Math.abs(s.smsMemory[k])<=5))return null;
  if(!d||!d.smsReplies||Array.isArray(d.smsReplies)||typeof d.smsReplies!=='object'||!Object.keys(d.smsReplies).every(k=>smsStories.contacts.includes(k)))return null;
  if(!Object.entries(d.smsReplies).every(([k,r])=>r&&typeof r.title==='string'&&typeof r.reply==='string'&&(r.id==='skip'||smsStories.option(k,r.id))))return null;
  if(s.phase==='playing'&&slot(s)!==2&&Object.keys(d.smsReplies).length)return null;
  if(s.phase==='playing'&&smsStories.contacts.every(k=>d.smsReplies[k]))return null;
  if(!d||!['verified','post','date','sms','talked'].every(k=>typeof d[k]==='boolean')||typeof d.talkMessage!=='string'||typeof d.talkChoice!=='string'||typeof d.talkReply!=='string')return null;
  if(!Array.isArray(d.cards)||d.cards.length!==3||new Set(d.cards).size!==3||!d.cards.every(id=>content.posts.some(p=>p.id===id)))return null;
  if(!Array.isArray(d.likes)||d.likes.length>30||!d.likes.every(x=>typeof x==='string'))return null;
  if(!Array.isArray(s.history)||s.history.length>75||!s.history.every(x=>x&&typeof x.title==='string'&&typeof x.note==='string'&&['exposure','affection','sanity'].every(k=>Number.isFinite(x[k]))))return null;
  if(!Array.isArray(s.feed)||s.feed.length!==s.postCount||!s.feed.every(x=>x&&typeof x.caption==='string'&&typeof x.title==='string'&&content.posts.some(p=>p.id===x.postId)))return null;
  if(s.phase==='playing') {
    if(s.turn>=15||s.sanity<=0||s.ending!==null)return null;
    if(slot(s)===0&&(d.post||d.date||d.sms))return null;
    if(slot(s)===1&&(!d.post||d.date||d.sms))return null;
    if(slot(s)===2&&(!d.post||!d.date||d.sms))return null;
  } else if(!content.endings[s.ending]||endingFor(s,s.turn>=15)!==s.ending)return null;
  return s;
}
module.exports={create,dispatch,restore,endingFor,day,slot,smsKind,talkFor,content};




},
"game/layout": function(require,module,exports){
// Use the widget window, not the physical screen, including half-screen containers.
function layout(info, size) {
  info=info||{};size=size||{};
  const width=Number(size.windowWidth||info.windowWidth)||375;
  const height=Number(size.windowHeight||info.windowHeight)||667;
  const safe=info.safeArea||{};
  const screenHeight=Number(info.screenHeight)||height;
  const bottom=Math.min(48,Math.max(0,screenHeight-(Number(safe.bottom)||screenHeight)));
  // Native host navigation occupies its own area; do not add its top inset again.
  const inset=bottom+12;
  // Top background bleeds into the safe area; hearts and content stay below it.
  // Prefer the larger native / CSS inset without counting it twice.
  const lockTop=Math.max(0,Number(safe.top)||0,Number(info.statusBarHeight)||0);
  const lockBottom=Math.max(bottom,screenHeight-(Number(safe.bottom)||screenHeight));
  const trimHeight=70, trimSpace=trimHeight+18, lockBottomSpace=18;
  const lockTopPadding='padding-top:'+(lockTop+trimSpace)+'px;padding-top:calc('+trimSpace+'px + max('+lockTop+'px, env(safe-area-inset-top)));';
  const lockBottomPadding='padding-bottom:'+(lockBottom+lockBottomSpace)+'px;padding-bottom:calc('+lockBottomSpace+'px + max('+lockBottom+'px, env(safe-area-inset-bottom)));';
  const lace=22, homeSpace=lace+10;
  const homePadding=(edge,value)=>'padding-'+edge+':'+(value+homeSpace)+'px;padding-'+edge+':calc('+homeSpace+'px + max('+value+'px, env(safe-area-inset-'+edge+')));';
  const laceStyle=(edge,value)=>edge+':0;height:'+(lace+value)+'px;height:calc('+lace+'px + max('+value+'px, env(safe-area-inset-'+edge+')));padding-'+edge+':'+value+'px;padding-'+edge+':max('+value+'px, env(safe-area-inset-'+edge+'));';
  return {height,width,bottom,compact:height<600,
    challengeGridStyle:'width:'+Math.min(346,width-52,Math.max(150,height-bottom-360))+'px;margin-left:auto;margin-right:auto;',
    moleGridStyle:'width:'+Math.min(270,width-52,Math.max(150,height-bottom-415))+'px;margin-left:auto;margin-right:auto;',
    rootStyle:'height:'+height+'px;padding-bottom:'+inset+'px;',
    lockRootStyle:'height:'+height+'px;'+lockTopPadding+lockBottomPadding,
    lockTopStyle:'top:0;height:'+(trimHeight+lockTop)+'px;height:calc('+trimHeight+'px + max('+lockTop+'px, env(safe-area-inset-top)));padding-top:'+lockTop+'px;padding-top:max('+lockTop+'px, env(safe-area-inset-top));',
    homeRootStyle:'height:'+height+'px;'+homePadding('top',lockTop)+homePadding('bottom',lockBottom),
    homeTopStyle:laceStyle('top',lockTop),
    homeBottomStyle:laceStyle('bottom',lockBottom),
    introStyle:'height:'+Math.max(1,height-lockTop-lockBottom-trimSpace-lockBottomSpace)+'px;',
    lockGapStyle:'height:'+Math.round(Math.min(110,Math.max(38,height*.105)))+'px;',
    sheetStyle:'max-height:'+Math.max(100,height-inset-130)+'px;'};
}
function read(api,size) {
  let info={};
  try {if(api&&typeof api.getSystemInfoSync==='function')info=api.getSystemInfoSync()||{};}catch(_){}
  return layout(info,size);
}
module.exports={layout,read};

},
"game/presentation": function(require,module,exports){
const engine=require('./engine');
const smsStories=require('./sms-stories');
function signed(n){return (n>0?'+':'')+(Math.round(n*100)/100);}
function view(s){
  const day=engine.day(s),slot=engine.slot(s),ended=s.phase==='ending';
  // Ending has its own view model: no old feed, choices, history or chat payload.
  if(ended)return {day,ended:true,ending:engine.content.endings[s.ending],exposure:s.exposure,sanity:s.sanity,affection:s.affection,postCount:s.postCount,feed:[],history:[],hiddenCards:[],steps:[]};
  const kind=engine.smsKind(s),invite=engine.content.chats.find(c=>c.id===s.chatId),talk=engine.talkFor(s);
  const goal=['打开微光，选择今日行动','查看星野的午间邀约','处理三位联系人的短信，也可以跳过'][slot];
  const risk=s.exposure>70?'high':s.exposure>40?'medium':'low';
  const entries=require('./feed').feedFor(s,day);
  entries.forEach(p=>{p.liked=s.daily.likes.indexOf(p.id)>=0;p.likeLabel=String(p.likes+(p.liked?1:0)).replace(/\B(?=(\d{3})+(?!\d))/g,',');});
  let smsTitle, smsText, smsOptions;
  if(kind==='manager'){smsTitle='经纪人 · 陈姐';smsText='网上的讨论已经影响到工作了。我们需要你配合保密、减少公开动态。这是认真的，请给我一个答复。';smsOptions=engine.content.manager;}
  else if(kind==='harassment'){smsTitle='未知号码';smsText='同款、照片、时间线……你以为没人看得出来吗？别再发了。';smsOptions=engine.content.harassment;}
  else {smsTitle='经纪人 · 陈姐';smsText='近期行程比较密集，请注意保护私人生活，不要发布未公开的工作物料。辛苦配合。';smsOptions=engine.content.ordinarySms;}
  return {
    day,slot,turn:s.turn,slotName:['晨间','午间','晚间'][slot],time:['09:41','13:14','22:07'][slot],ended,
    exposure:s.exposure,sanity:s.sanity,affection:s.affection,postCount:s.postCount,captchaEnabled:s.captchaEnabled,
    exposureLabel:risk==='high'?'正在热搜':risk==='medium'?'有人怀疑':'暂时安全',
    sanityLabel:s.sanity<30?'濒临崩溃':s.sanity<60?'有些疲惫':'状态良好',
    affectionLabel:s.affection<30?'渐渐疏远':s.affection>80?'偏爱满格':'心照不宣',
    goal,goalShort:['进行微光行动','查看午间邀约','处理晚间短信'][slot],
    steps:[{id:0,title:'微光',time:'晨间',done:s.daily.post,active:slot===0},{id:1,title:'邀约',time:'午间',done:s.daily.date,active:slot===1},{id:2,title:'短信',time:'晚间',done:s.daily.sms,active:slot===2}],
    postDone:s.daily.post,dateDone:s.daily.date,talkDone:s.daily.talked,verified:s.daily.verified,
    hiddenCards:[{id:0,label:'行动一',mark:'01'},{id:1,label:'行动二',mark:'02'},{id:2,label:'行动三',mark:'03'}],
    feed:entries,hotTopic:risk==='high'?'星野疑似恋情曝光':risk==='medium'?'星野同款 时间线':'星野 今日舞台直拍',
    talk:{message:s.daily.talkMessage||talk.message,options:talk.options.map(o=>({id:o.id,title:o.title})),choice:s.daily.talkChoice,reply:s.daily.talkReply},
    date:{title:invite.title,message:invite.message,options:invite.options.map(o=>({id:o.id,title:o.title,disabled:!!(o.intimate&&s.affection<30)}))},
    smsThreads:smsStories.threads(s,day),smsDoneCount:Object.keys(s.daily.smsReplies||{}).length,
    sms:{title:smsTitle,text:smsText,kind,options:smsOptions.map(o=>({id:o.id,title:o.title}))},
    history:s.history.slice().reverse().map(x=>Object.assign({},x,{effect:'暴露 '+signed(x.exposure)+'%  ·  精神 '+signed(x.sanity)+'  ·  好感 '+signed(x.affection)})),
    ending:s.ending?engine.content.endings[s.ending]:null
  };
}
module.exports={view,signed};



},
"game/sound": function(require,module,exports){
// Short, original local effects. Audio errors must never interrupt the story.
const KEY='secret-star.sound.v1';
const LENGTH={send:180,message:480,invite:600,sms:540,tile:110,mole:150,success:440,failure:300,page:250};
function create(api,now,onError){
  now=now||Date.now;let enabled=true,contexts={},last=-Infinity,priorityUntil=0,disposed=false;
  try{enabled=api.getStorageSync(KEY)!==false;}catch(_){}
  function report(error){
    const detail=error&&(error.errMsg||error.message)||'播放器无法加载音频';
    if(typeof console!=='undefined'&&console.warn)console.warn('[游戏音效]',detail);
    if(onError)onError(detail);
  }
  function nativeContext(){
    const root=typeof globalThis==='object'?globalThis:null;
    const simulated=root&&root.XHS_MP_SIMULATOR;
    try{
      // 3.152.1 forces simulator/remote-debug calls through Web Audio, but its
      // isolated service has no global Audio. Let the host create the context.
      if(simulated)root.XHS_MP_SIMULATOR=false;
      return api.createInnerAudioContext();
    }finally{if(simulated)root.XHS_MP_SIMULATOR=simulated;}
  }
  function createContext(){
    // Platform names are unreliable in remote debugging. Always ask the host
    // player first so the isolated service never depends on renderer Audio.
    try{return nativeContext();}
    catch(primaryError){
      try{return api.createInnerAudioContext({useRenderAudioPlayer:true});}
      catch(_){throw primaryError;}
    }
  }
  function store(value){
    try{
      if(typeof api.setStorage==='function'){
        const result=api.setStorage({key:KEY,data:value});
        if(result&&typeof result.catch==='function')result.catch(()=>{});
      }else api.setStorageSync(KEY,value);
    }catch(_){}
  }
  function stop(){Object.keys(contexts).forEach(name=>{try{contexts[name].stop();}catch(_){}});priorityUntil=0;last=-Infinity;}
  function play(name){
    if(!enabled||disposed||!LENGTH[name])return false;
    if(!api||typeof api.createInnerAudioContext!=='function'){report({message:'当前基础库未提供音频接口'});return false;}
    const time=now(),priority=['message','invite','sms','success','failure'].indexOf(name)>=0;
    if(time-last<80||(!priority&&time<priorityUntil))return false;
    try{
      let context=contexts[name];
      if(!context){
        context=createContext();
        context.autoplay=false;context.loop=false;context.obeyMuteSwitch=true;context.volume=.65;if(context.onError)context.onError(report);
        context.src='assets/audio/'+name+'.wav';contexts[name]=context;
      }
      // Keep audio package-relative so the XHS resolver does not rewrite the path.
      context.stop();context.play();last=time;
      priorityUntil=priority?time+LENGTH[name]:0;return true;
    }catch(error){report(error);return false;}
  }
  return {play,stop,enabled:()=>enabled,setEnabled(value){enabled=!!value;if(!enabled)stop();store(enabled);return enabled;},destroy(){stop();disposed=true;Object.keys(contexts).forEach(name=>{try{contexts[name].destroy();}catch(_){}});contexts={};}};
}
module.exports={create,KEY,LENGTH};

},
"game/storage": function(require,module,exports){
const engine = require('./engine');
const KEY = 'secret-star.save.v2';
const COLLECTION = 'secret-star.endings.v1';
function write(api, key, data) {
  try {
    if (typeof api.setStorage === 'function') {
      const result = api.setStorage({ key, data });
      if (result && typeof result.catch === 'function') result.catch(() => {});
    } else api.setStorageSync(key, data);
    return true;
  } catch (_) { return false; }
}
function read(api) {
  try {
    const raw = api.getStorageSync(KEY);
    const state = raw ? engine.restore(raw) : null;
    return { state, error: !!raw && !state ? '旧存档无法读取，可以重新开始。' : '' };
  } catch (_) { return { state: null, error: '暂时无法读取存档，本次仍可正常游玩。' }; }
}
function save(api, state) {
  return write(api, KEY, state) ? '' : '存档未成功写入，请保持当前页面，稍后再试。';
}
function collection(api) {
  try { const raw = api.getStorageSync(COLLECTION); return Array.isArray(raw) ? raw.filter(id => !!engine.content.endings[id]) : []; }
  catch (_) { return []; }
}
function unlock(api, id) {
  const ids = collection(api);
  if (ids.indexOf(id) === -1) ids.push(id);
  return write(api, COLLECTION, ids);
}
module.exports = { read, save, collection, unlock, write, KEY };

}
});
