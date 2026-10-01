/* 页面交互控制器
 * 此文件由源码自动生成；永久修改请编辑 miniprogram/ 中对应文件后重新构建。
 */
window.__gameModules=Object.assign(window.__gameModules||{}, {
"pages/index/index": function(require,module,exports){
const engine=require('../../game/engine');
const present=require('../../game/presentation');
const storage=require('../../game/storage');
const layout=require('../../game/layout');
const challenges=require('../../game/captcha');
const sound=require('../../game/sound');
const dateReactions=require('../../game/date-reactions');
const SOUND_SEEN='secret-star.sound-seen.v1';
const names={home:'',social:'微光',chat:'微聊',messages:'信息',journal:'回忆'};
Page({
  data:{soundOn:true,audioNotice:'',mode:'intro',started:false,hasSave:false,screen:'home',screenName:'',smsContact:'',smsThread:null,panel:'',hasPanel:false,notice:'',saveError:'',layout:layout.layout(),vm:present.view(engine.create(1)),captcha:null,captchaBusy:false,captchaError:'',resultRows:[],resultTitle:'',resultNext:'',dateReaction:null,collectionCount:0},
  onLoad(){
    this._api=xhs;this._locked=false;const saved=storage.read(this._api);
    this._sound=sound.create(this._api,null,()=>{if(!this._hidden)this.setData({notice:'音效加载失败，请关闭后重新开启音效；仍失败可在控制台查看“游戏音效”提示。'});});this._hidden=false;this._soundSeen={};
    try{const seen=this._api.getStorageSync(SOUND_SEEN);if(saved.state&&seen&&typeof seen==='object')this._soundSeen=seen;}catch(_){}
    this.setData({soundOn:this._sound.enabled(),dateReaction:null});
    this._state=saved.state||engine.create();this._screen='home';this._panel='';this._started=false;
    this._render({layout:layout.read(this._api),hasSave:!!saved.state,saveError:saved.error,collectionCount:storage.collection(this._api).length});
  },
  onShow(){this._hidden=false;if(this._state){this._locked=false;this._render({layout:layout.read(this._api)});}},
  onResize(event){if(this._state)this._render({layout:layout.read(this._api,event&&event.size||event)});},
  onHide(){this._hidden=true;this._cancelAudio();if(this._panel==='captcha')this._resetCaptcha('挑战已暂停并重置，请重新开始。');else this._clearCaptchaTimers();if(this._started)this._save();},
  onUnload(){this._hidden=true;this._cancelAudio();if(this._sound)this._sound.destroy();this._clearCaptchaTimers();if(this._started)this._save();},
  _render(extra){
    const ended=this._state.phase==='ending';
    if(!ended&&!(this._screen in names))this._screen='home';
    if(['captcha-choice','captcha','cards','result','restart'].indexOf(this._panel)<0)this._panel='';
    if(ended){this._cancelAudio();this._clearCaptchaTimers();this._screen='';this._panel=this._panel==='restart'?'restart':'';this._captcha=null;this._resultAction='';}
    const next=Object.assign({vm:present.view(this._state),screen:this._screen,screenName:names[this._screen],panel:this._panel,started:this._started},extra||{});
    next.smsContact=this._smsContact||'';next.smsThread=next.vm.smsThreads?next.vm.smsThreads.find(t=>t.id===next.smsContact)||null:null;
    if(ended){next.smsContact='';next.smsThread=null;this._smsContact='';}
    next.mode=ended?'ending':this._started?'game':'intro';
    next.hasPanel=!!this._panel;next.captchaBusy=!!this._captchaBusy;
    if(ended)Object.assign(next,{screen:'',screenName:'',panel:this._panel,captcha:null,resultRows:[],resultTitle:'',resultNext:'',notice:'',dateReaction:null});
    // One synchronous transaction produces one setData. Navigation never depends on a render callback.
    this.setData(next);
  },
  _save(){const error=storage.save(this._api,this._state);this._saveError=error;return error;},
  start(){this._hidden=false;this._started=true;this._screen='home';this._panel='';this._render({saveError:this._save(),notice:''});this._announceAvailable();},
  _dispatch(action,after){
    if(this._locked||!this._started||this._state.phase==='ending')return false;
    this._locked=true;
    try{
      const before=this._state,count=this._state.history.length;
      this._state=engine.dispatch(this._state,action);
      this._cancelAudio();
      const error=this._save();
      if(this._state.ending)storage.unlock(this._api,this._state.ending);
      const rows=present.view(this._state).history.filter(x=>x.id>count).reverse();
      this._panel='';
      if(after==='cards'&&this._state.phase==='playing')this._panel='cards';
      if((after==='result'||action.type==='smsReply'&&this._state.turn!==before.turn)&&this._state.phase==='playing')this._panel='result';
      this._resultAction=action.type;
      if(action.type==='sms'||(action.type==='smsReply'&&this._state.turn!==before.turn))this._screen='home';
      const next=action.type==='post'?'看看大家发了什么':action.type==='date'?(this._state.daily.talked?'返回微聊，查看对话':'返回微聊，继续对话'):action.type==='smsReply'&&this._state.turn===before.turn?'继续处理今晚的短信':'开始第 '+engine.day(this._state)+' 天';
      const reaction=action.type==='date' ? dateReactions.forChoice(before.chatId,action.id) : null;
      this._render({notice:'',saveError:error, captcha:null,dateReaction:reaction,resultRows:rows,resultTitle:rows[0]?rows[0].title:'',resultNext:next,collectionCount:storage.collection(this._api).length});
      if(this._state.phase!=='ending'){
        if(action.type==='talk'&&!before.daily.talked&&this._state.daily.talked){this._play('send');this._announce('reply','message','微聊 · 星野回复了你');}
        else if(action.type==='sms'||action.type==='smsReply')this._play('page');
      }
      return true;
    }catch(error){this._render({notice:error.message});return false;}
    finally{this._locked=false;}
  },
  navigate(event){
    if(this._panel||this._state.phase==='ending')return;
    const screen=event.currentTarget.dataset.screen;
    if(!(screen in names))return;
    if(screen==='messages'&&engine.slot(this._state)!==2){this._render({notice:'晚间才能处理短信。先完成当前行动。'});return;}
    this._open(screen);
  },
  _open(screen){
    if(this._state.phase==='ending')return;
    this._cancelAudio();this._screen=screen;this._panel='';if(screen==='messages')this._smsContact='';
    if(screen==='social'&&engine.slot(this._state)===0&&!this._state.daily.post){
      if(!this._state.daily.verified){
        if(this._state.captchaEnabled===null){this._panel='captcha-choice';this._render({notice:''});return;}
        if(this._state.captchaEnabled===false){this._dispatch({type:'verify',success:true,skipped:true},'cards');return;}
        this._openCaptcha();return;
      }
      this._panel='cards';
    }
    this._render({notice:''});
  },
  primary(){if(this._panel||this._state.phase==='ending')return;this._open(['social','chat','messages'][engine.slot(this._state)]);},
  captchaSettings(){if(this._state.phase==='ending'||this._panel)return;this._panel='captcha-choice';this._render({notice:''});},
  captchaChoice(event){
    if(this._panel!=='captcha-choice')return;
    const enabled=event.currentTarget.dataset.enabled===true||event.currentTarget.dataset.enabled==='true';
    if(!this._dispatch({type:'captchaPreference',enabled}))return;
    if(this._screen==='social'&&engine.slot(this._state)===0&&!this._state.daily.verified){
      if(enabled)this._openCaptcha();
      else this._dispatch({type:'verify',success:true,skipped:true},'cards');
    }else this._render({notice:enabled?'五关小游戏已开启。':'五关小游戏已关闭。'});
  },
  home(){if(this._state.phase==='ending')return;this._cancelAudio();this._clearCaptchaTimers();this._screen='home';this._panel='';this._captcha=null;this._resultAction='';this._locked=false;this._render({notice:'',captcha:null,resultRows:[],resultTitle:'',resultNext:''});},
  _clearCaptchaTimers(){
    if(this._verifyTimer)clearTimeout(this._verifyTimer);
    if(this._moleTimer)clearTimeout(this._moleTimer);
    this._verifyTimer=null;this._moleTimer=null;this._captchaBusy=false;
    this._captchaToken=(this._captchaToken||0)+1;
  },
  _resetCaptcha(error){
    this._clearCaptchaTimers();this._captchaAttempt=(this._captchaAttempt||0)+1;
    this._captcha=challenges.create(engine.day(this._state),(this._state.seed+Math.imul(this._captchaAttempt,2654435761))>>>0);
    this._render({captcha:this._captcha,captchaError:error||'',notice:''});
  },
  _openCaptcha(){
    if(this._state.phase==='ending')return;
    this._panel='captcha';this._resetCaptcha('');
  },
  captchaRefresh(){if(this._panel==='captcha'&&!this._captchaBusy)this._resetCaptcha('');},
  _scheduleMole(delay,spawn){
    const c=this._captcha,token=this._captchaToken;
    this._moleTimer=setTimeout(()=>{
      this._moleTimer=null;
      if(token!==this._captchaToken||this._panel!=='captcha'||this._captcha!==c||this._captchaBusy)return;
      if(spawn){challenges.nextMole(c);this._scheduleMole(1300,false);}
      else challenges.expire(c);
      this._render({captcha:c});
    },delay);
  },
  captchaStart(){
    if(this._panel!=='captcha'||this._captchaBusy||!this._captcha)return;
    if(challenges.start(this._captcha)){this._render({captcha:this._captcha,captchaError:''});this._scheduleMole(1300,false);}
  },
  captchaTap(event){
    if(this._panel!=='captcha'||!this._captcha||this._captchaBusy)return;
    const c=this._captcha;
    // During the brief gap between moles, input is disabled rather than penalized.
    if(c.kind==='mole'&&c.running&&c.active<0)return;
    const status=challenges.select(c,Number(event.currentTarget.dataset.id));
    if(status!=='ignored'&&c.kind==='numberlink')this._play('tile');
    if(status!=='ignored'&&c.kind==='mole')this._play('mole');
    if(c.kind==='mole'&&status!=='ignored'){
      if(this._moleTimer)clearTimeout(this._moleTimer);this._moleTimer=null;
      if(c.running)this._scheduleMole(280,true);
    }
    this._render({captcha:c,captchaError:'',notice:''});
  },
  captchaSubmit(){
    if(this._panel!=='captcha'||!this._captcha||this._captchaBusy)return;
    const c=this._captcha,success=challenges.complete(c),token=this._captchaToken;
    if(this._moleTimer)clearTimeout(this._moleTimer);this._moleTimer=null;
    this._captchaBusy=true;this._render({captchaError:''});
    this._verifyTimer=setTimeout(()=>{
      this._verifyTimer=null;
      if(token!==this._captchaToken||this._panel!=='captcha'||this._captcha!==c||this._state.phase==='ending')return;
      this._captchaBusy=false;
      if(success){this._captcha=null;this._dispatch({type:'verify',success:true},'cards');this._play('success');}
      else {this._play('failure');this._resetCaptcha('验证失败，请重试');}
    },1500);
  },
  chooseCard(event){if(this._panel==='cards')this._dispatch({type:'post',index:Number(event.currentTarget.dataset.id),turn:Number(event.currentTarget.dataset.turn)},'result');},
  chooseDate(event){if(!this._panel)this._dispatch({type:'date',id:event.currentTarget.dataset.id,turn:Number(event.currentTarget.dataset.turn)},'result');},
  chooseSms(event){if(!this._panel)this._dispatch({type:'sms',id:event.currentTarget.dataset.id,turn:Number(event.currentTarget.dataset.turn)},'result');},
  openSms(event){if(this._panel||this._state.phase==='ending'||engine.slot(this._state)!==2)return;const id=event.currentTarget.dataset.id;if(!present.view(this._state).smsThreads.some(t=>t.id===id))return;this._smsContact=id;this._render({notice:''});},
  smsInbox(){if(this._panel||this._state.phase==='ending')return;this._smsContact='';this._render({notice:''});},
  replySms(event){if(!this._panel&&this._smsContact===event.currentTarget.dataset.sender)this._dispatch({type:'smsReply',sender:event.currentTarget.dataset.sender,id:event.currentTarget.dataset.id,turn:Number(event.currentTarget.dataset.turn)});},
  skipEvening(){if(!this._panel&&engine.slot(this._state)===2)this._dispatch({type:'sms',id:'skip',turn:this._state.turn},'result');},
  chooseTalk(event){if(!this._panel)this._dispatch({type:'talk',id:event.currentTarget.dataset.id});},
  like(event){if(!this._panel)this._dispatch({type:'like',id:event.currentTarget.dataset.id});},
  closePanel(){
    this._cancelAudio();this._clearCaptchaTimers();this._captcha=null;
    const panel=this._panel;this._panel='';
    if(this._state.phase==='ending'){this._render();return;}
    if(panel==='captcha-choice'||panel==='captcha'||panel==='cards'){this._screen='home';this._render({notice:'',captcha:null});return;}
    if(panel==='result'){
      if(this._resultAction==='post')this._screen='social';
      else if(this._resultAction==='date')this._screen='chat';
      else if(this._resultAction==='smsReply'&&engine.slot(this._state)===2)this._screen='messages';
      else this._screen='home';
    }
    this._render({notice:'',captcha:null,dateReaction:null});this._announceAvailable();
  },
  dismissNotice(){this._render({notice:''});},
  requestRestart(){this._cancelAudio();this._clearCaptchaTimers();this._panel='restart';this._render({notice:''});},
  restart(){
    if(this._panel!=='restart')return;
    this._cancelAudio();this._soundSeen={};storage.write(this._api,SOUND_SEEN,{});
    this._clearCaptchaTimers();
    // A new story is a new choice. Keep the preference only while resuming the same run.
    this._state=engine.create();this._started=true;this._screen='home';this._panel='';this._captcha=null;this._resultAction='';
    this._render({notice:'',saveError:this._save(),captcha:null,resultRows:[]});this._announceAvailable();
  },
  _play(name){if(!this._hidden&&this._sound)this._sound.play(name);},
  toggleSound(){
    if(!this._sound)return;
    const on=this._sound.setEnabled(!this._sound.enabled());this.setData({soundOn:on});
  },
  _cancelAudio(){
    if(this._audioTimer)clearTimeout(this._audioTimer);if(this._noticeTimer)clearTimeout(this._noticeTimer);
    this._audioTimer=null;this._noticeTimer=null;if(this._sound)this._sound.stop();
    this.setData({audioNotice:''});
  },
  _announce(kind,effect,text){
    const key=engine.day(this._state)+':'+kind;
    if(this._hidden||this._state.phase==='ending'||this._soundSeen[key])return;
    if(this._audioTimer)clearTimeout(this._audioTimer);
    this._audioTimer=setTimeout(()=>{
      this._audioTimer=null;if(this._hidden||this._state.phase==='ending')return;
      this._soundSeen[key]=true;storage.write(this._api,SOUND_SEEN,this._soundSeen);
      this._play(effect);this.setData({audioNotice:text});
      if(this._noticeTimer)clearTimeout(this._noticeTimer);
      this._noticeTimer=setTimeout(()=>{this._noticeTimer=null;this.setData({audioNotice:''});},2600);
    },350);
  },
  _announceAvailable(){
    if(this._panel||this._state.phase==='ending')return;
    const slot=engine.slot(this._state);
    if(slot===1)this._announce('invite','invite','微聊 · 星野发来一份午间邀约');
    else if(slot===2)this._announce('sms','sms','信息 · 三位联系人发来了晚间短信');
    else if(!this._state.daily.talked)this._announce('chat','message','微聊 · 星野给你发来消息');
  },
  retrySave(){this._render({saveError:this._save()});}
});



}
});
window.__loadGameModule("pages/index/index");
