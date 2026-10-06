(function () {
"use strict";

var STORE={server:"vistivotv_server",token:"vistivotv_token",user:"vistivotv_user",columns:"vistivotv_columns",slideshow:"vistivotv_slideshow",profiles:"vistivotv_profiles",activeProfile:"vistivotv_active_profile",schema:"vistivotv_storage_schema"};
var STORAGE_SCHEMA=3;
var S={server:norm(localStorage.getItem(STORE.server)||""),token:localStorage.getItem(STORE.token)||"",user:null,columns:num(localStorage.getItem(STORE.columns),4,8,6),slide:num(localStorage.getItem(STORE.slideshow),3,15,5),profiles:[],activeProfileId:localStorage.getItem(STORE.activeProfile)||"",profileIndex:0,addingProfile:false,loginFromProfiles:false,previousProfileId:"",profileCanReturn:false,screen:"boot",zone:"grid",topIndex:1,selected:0,buckets:[],bucket:0,rail:0,assets:[],galleryRun:0,viewerRun:0,viewerUrl:null,viewer:false,viewerType:"",slideTimer:null,loading:false,settingsIndex:0,retry:false,insecureApprovedFor:"",networkBlocked:false,exitOpen:false,exitChoice:0,accountConfirmOpen:false,accountConfirmChoice:0,accountConfirmAction:"",videoControl:1};
try{S.user=JSON.parse(localStorage.getItem(STORE.user)||"null");}catch(ignore){}

function id(value){return document.getElementById(value);}
var E={login:id("loginScreen"),profileScreen:id("profileScreen"),profileList:id("profileList"),galleryScreen:id("galleryScreen"),viewerScreen:id("viewerScreen"),settings:id("settingsScreen"),server:id("serverInput"),email:id("emailInput"),password:id("passwordInput"),loginButton:id("loginButton"),loginStatus:id("loginStatus"),securityNotice:id("securityNotice"),gallery:id("gallery"),galleryContainer:id("galleryContainer"),loading:id("loadingMore"),userName:id("userName"),settingsUser:id("settingsUser"),settingsButton:id("settingsButton"),settingsClose:id("settingsClose"),switchProfile:id("switchProfileButton"),logout:id("logoutButton"),removeProfile:id("removeProfileButton"),interval:id("slideshowInterval"),rail:id("dateRailItems"),viewerImage:id("viewerImage"),viewerVideo:id("viewerVideo"),viewerLoading:id("viewerLoading"),viewerDate:id("viewerDate"),viewerCounter:id("viewerCounter"),viewerSlide:id("viewerSlideshow"),videoControls:id("videoControls"),videoProgress:id("videoProgressFill"),videoCurrent:id("videoCurrentTime"),videoDuration:id("videoDuration"),networkOverlay:id("networkOverlay"),networkRetry:id("networkRetryButton"),exitOverlay:id("exitOverlay"),exitNo:id("exitNoButton"),exitYes:id("exitYesButton"),accountConfirmOverlay:id("accountConfirmOverlay"),accountConfirmTitle:id("accountConfirmTitle"),accountConfirmText:id("accountConfirmText"),accountConfirmNo:id("accountConfirmNoButton"),accountConfirmYes:id("accountConfirmYesButton"),error:id("errorBox")};
var loginControls=[E.server,E.email,E.password,E.loginButton],observer=null,thumbQueue=[],thumbActive=0,errorTimer=null;
var mediaKeys={MediaPlayPause:10252,MediaPlay:415,MediaPause:19,MediaStop:413,MediaRewind:412,MediaFastForward:417};

function num(value,min,max,fallback){var n=parseInt(value,10);return isFinite(n)&&n>=min&&n<=max?n:fallback;}
function norm(value){return(value||"").trim().replace(/\/+$/,"");}
function serverUrl(value){
 var raw=norm(value),link=document.createElement("a");
 if(!raw){throw new Error("Enter the Immich server address.");}
 link.href=raw;
 if((link.protocol!=="http:"&&link.protocol!=="https:")||!link.hostname){throw new Error("Use a full Immich address beginning with http:// or https://.");}
 if(link.username||link.password||link.search||link.hash){throw new Error("The server address must not contain credentials, a query, or a fragment.");}
 return norm(link.protocol+"//"+link.host+link.pathname);
}
function friendlyError(e){
 if(e&&e.status===401){return"The email, password, or saved session is not valid.";}
 if(e&&e.status===403){return"This account is not allowed to perform that action.";}
 if(e&&e.status===404){return"This does not appear to be a compatible Immich server.";}
 if(e&&e.status>=500){return"The Immich server reported a temporary error. Try again later.";}
 if(e&&e.temporary){return e.message||"Unable to reach the Immich server. Check the address and network.";}
 return(e&&e.message)||"An unexpected error occurred.";
}
function error(message){console.error(message);E.error.textContent=message;E.error.classList.remove("hidden");clearTimeout(errorTimer);errorTimer=setTimeout(function(){E.error.classList.add("hidden");},6000);}
function setScreenSaver(enabled){try{if(window.webapis&&webapis.appcommon){var states=webapis.appcommon.AppCommonScreenSaverState;webapis.appcommon.setScreenSaver(enabled?states.SCREEN_SAVER_ON:states.SCREEN_SAVER_OFF,function(){},function(e){console.log("Screensaver",e);});}}catch(e){console.log("Screensaver",e);}}
function connected(){try{if(window.webapis&&webapis.network&&typeof webapis.network.isConnectedToGateway==="function"){return webapis.network.isConnectedToGateway();}}catch(ignore){}return navigator.onLine!==false;}
function networkFocus(){E.networkRetry.classList.add("remoteFocused");E.networkRetry.focus();}
function showOffline(){if(S.networkBlocked){return;}S.networkBlocked=true;stopSlideshow();if(S.viewer&&S.viewerType==="VIDEO"){closeViewer();}setScreenSaver(true);E.networkOverlay.classList.remove("hidden");networkFocus();}
function hideOffline(){S.networkBlocked=false;E.networkOverlay.classList.add("hidden");E.networkRetry.classList.remove("remoteFocused");}
function checkNetwork(){if(!connected()){showOffline();return false;}hideOffline();return true;}
function exitFocus(){E.exitNo.classList.toggle("remoteFocused",S.exitChoice===0);E.exitYes.classList.toggle("remoteFocused",S.exitChoice===1);(S.exitChoice===0?E.exitNo:E.exitYes).focus();}
function confirmExit(){S.exitOpen=true;S.exitChoice=0;E.exitOverlay.classList.remove("hidden");exitFocus();}
function cancelExit(){S.exitOpen=false;E.exitOverlay.classList.add("hidden");E.exitNo.classList.remove("remoteFocused");E.exitYes.classList.remove("remoteFocused");if(S.networkBlocked){networkFocus();}}
function accountConfirmFocus(){E.accountConfirmNo.classList.toggle("remoteFocused",S.accountConfirmChoice===0);E.accountConfirmYes.classList.toggle("remoteFocused",S.accountConfirmChoice===1);(S.accountConfirmChoice===0?E.accountConfirmNo:E.accountConfirmYes).focus();}
function confirmAccount(action){S.accountConfirmOpen=true;S.accountConfirmAction=action;S.accountConfirmChoice=0;E.accountConfirmTitle.textContent=action==="logout"?"Sign out?":"Remove this profile?";E.accountConfirmText.textContent=action==="logout"?"You will need to sign in again to use this profile.":"This profile and its saved session will be removed from this TV.";E.accountConfirmOverlay.classList.remove("hidden");accountConfirmFocus();}
function cancelAccountConfirm(){S.accountConfirmOpen=false;S.accountConfirmAction="";E.accountConfirmOverlay.classList.add("hidden");E.accountConfirmNo.classList.remove("remoteFocused");E.accountConfirmYes.classList.remove("remoteFocused");focusSetting();}
function acceptAccountConfirm(){var action=S.accountConfirmAction;S.accountConfirmOpen=false;S.accountConfirmAction="";E.accountConfirmOverlay.classList.add("hidden");if(action==="logout"){performLogout();}else if(action==="remove"){performRemoveProfile();}}
function registerRemoteKeys(){
 try{if(!window.tizen||!tizen.tvinputdevice){return;}var names=[];for(var name in mediaKeys){if(mediaKeys.hasOwnProperty(name)){names.push(name);}}
  for(var i=0;i<names.length;i++){try{tizen.tvinputdevice.registerKey(names[i]);var key=tizen.tvinputdevice.getKey(names[i]);if(key){mediaKeys[names[i]]=key.code;}}catch(e){console.log("Remote key",names[i],e);}}
 }catch(e){console.log("Remote keys",e);}
}
function mediaAction(key){for(var name in mediaKeys){if(mediaKeys.hasOwnProperty(name)&&mediaKeys[name]===key){return name;}}return"";}
function screen(name){S.screen=name;E.login.classList.add("hidden");E.profileScreen.classList.add("hidden");E.galleryScreen.classList.add("hidden");E.viewerScreen.classList.add("hidden");if(name==="login"){E.login.classList.remove("hidden");}else if(name==="profiles"){E.profileScreen.classList.remove("hidden");}else if(name==="gallery"){E.galleryScreen.classList.remove("hidden");}else if(name==="viewer"){E.viewerScreen.classList.remove("hidden");}}

function loadProfiles(){
 try{S.profiles=JSON.parse(localStorage.getItem(STORE.profiles)||"[]");}catch(ignore){S.profiles=[];}
 if(!Array.isArray(S.profiles)){S.profiles=[];}
 if(!S.profiles.length&&S.token){
  var legacyId="legacy-"+Date.now();
  S.profiles.push({id:legacyId,server:S.server,token:S.token,user:S.user,email:S.user&&S.user.email?S.user.email:E.email.value,columns:S.columns,slide:S.slide});
  S.activeProfileId=legacyId;saveProfiles();
 }
 var valid=[];
 for(var i=0;i<S.profiles.length;i++){
  var profile=S.profiles[i];
  if(!profile||typeof profile!=="object"||typeof profile.id!=="string"||!profile.id){continue;}
  profile.server=norm(profile.server||"");profile.token=typeof profile.token==="string"?profile.token:"";profile.email=typeof profile.email==="string"?profile.email:"";valid.push(profile);
 }
 S.profiles=valid;if(S.activeProfileId&&!activeProfile()){S.activeProfileId=S.profiles.length?S.profiles[0].id:"";}
 localStorage.setItem(STORE.schema,String(STORAGE_SCHEMA));
 localStorage.removeItem(STORE.token);localStorage.removeItem(STORE.user);
 saveProfiles();
}
function saveProfiles(){localStorage.setItem(STORE.profiles,JSON.stringify(S.profiles));if(S.activeProfileId){localStorage.setItem(STORE.activeProfile,S.activeProfileId);}else{localStorage.removeItem(STORE.activeProfile);}}
function activeProfile(){for(var i=0;i<S.profiles.length;i++){if(S.profiles[i].id===S.activeProfileId){return S.profiles[i];}}return null;}
function applyProfile(profile){if(!profile){return;}S.activeProfileId=profile.id;S.server=profile.server;S.token=profile.token||"";S.user=profile.user||null;S.columns=num(profile.columns,4,8,6);S.slide=num(profile.slide,3,15,5);localStorage.setItem(STORE.server,S.server);localStorage.setItem(STORE.columns,String(S.columns));localStorage.setItem(STORE.slideshow,String(S.slide));saveProfiles();}
function saveActiveProfile(email){var profile=activeProfile(),profileId=S.server+"|"+(S.user&&S.user.id?S.user.id:email);if(!profile||S.addingProfile){profile=null;for(var i=0;i<S.profiles.length;i++){if(S.profiles[i].id===profileId){profile=S.profiles[i];break;}}if(!profile){profile={id:profileId};S.profiles.push(profile);}S.activeProfileId=profile.id;}profile.server=S.server;profile.token=S.token;profile.user=S.user;profile.email=email||(S.user&&S.user.email)||"";profile.columns=S.columns;profile.slide=S.slide;S.addingProfile=false;saveProfiles();}
function updateActiveProfile(){var profile=activeProfile();if(!profile){return;}profile.token=S.token;profile.user=S.user;profile.columns=S.columns;profile.slide=S.slide;saveProfiles();}
function profileInitial(profile){var text=(profile.user&&(profile.user.name||profile.user.email))||profile.email||"?";return text.charAt(0).toUpperCase();}
function renderProfiles(){E.profileList.innerHTML="";for(var i=0;i<S.profiles.length;i++){var profile=S.profiles[i],card=document.createElement("div"),avatar=document.createElement("div"),name=document.createElement("div"),email=document.createElement("div");card.className="profileCard";avatar.className="profileAvatar";avatar.textContent=profileInitial(profile);name.className="profileName";name.textContent=(profile.user&&profile.user.name)||profile.email||"Immich user";email.className="profileEmail";email.textContent=profile.email||(profile.user&&profile.user.email)||profile.server;card.appendChild(avatar);card.appendChild(name);card.appendChild(email);E.profileList.appendChild(card);}var add=document.createElement("div"),addAvatar=document.createElement("div"),addName=document.createElement("div");add.className="profileCard";addAvatar.className="profileAvatar";addAvatar.textContent="+";addName.className="profileName";addName.textContent="Add profile";add.appendChild(addAvatar);add.appendChild(addName);E.profileList.appendChild(add);profileFocus();}
function profileFocus(){var cards=E.profileList.querySelectorAll(".profileCard");for(var i=0;i<cards.length;i++){cards[i].classList.toggle("focused",i===S.profileIndex);}}
function showProfiles(canReturn){stopSlideshow();S.profileCanReturn=canReturn===true;S.loginFromProfiles=false;closeSettings(false);clearGallery();screen("profiles");S.zone="profiles";S.profileIndex=Math.max(0,Math.min(S.profileIndex,S.profiles.length));renderProfiles();}
function selectProfile(){S.loginFromProfiles=true;if(S.profileIndex===S.profiles.length){S.addingProfile=true;S.previousProfileId=S.activeProfileId;S.activeProfileId="";S.token="";S.user=null;E.email.value="";E.password.value="";showLogin();return;}var profile=S.profiles[S.profileIndex];applyProfile(profile);if(!S.token){E.email.value=profile.email||"";showLogin("Sign in to this profile.");return;}validate().then(function(){updateActiveProfile();return startGallery();}).catch(function(e){if(e.status===401){S.token="";profile.token="";saveProfiles();E.email.value=profile.email||"";showLogin("This profile session expired.");}else{showLogin("Immich is temporarily unavailable. This profile was kept.",true);}});}

function request(method,path,body,auth,blob){
 var controller=typeof AbortController!=="undefined"?new AbortController():null;
 var timer=setTimeout(function(){if(controller){controller.abort();}},15000),headers={};
 if(auth!==false&&S.token){headers["x-immich-session-token"]=S.token;}
 if(body!==undefined){headers["Content-Type"]="application/json";}
 return fetch(S.server+path,{method:method,headers:headers,body:body===undefined?undefined:JSON.stringify(body),signal:controller?controller.signal:undefined}).then(function(response){
  if(!response.ok){return response.text().then(function(text){var data=null;try{data=JSON.parse(text);}catch(ignore){}var e=new Error(data&&data.message?data.message:"HTTP "+response.status);e.status=response.status;throw e;});}
  return blob?response.blob():response.text().then(function(text){return text?JSON.parse(text):null;});
 }).catch(function(e){if(e.name==="AbortError"){e=new Error("Request timed out. Check the server connection.");e.temporary=true;}else if(!e.status){e.temporary=true;}if(!connected()){showOffline();}throw e;}).then(function(value){clearTimeout(timer);return value;},function(e){clearTimeout(timer);throw e;});
}
function api(method,path,body,auth){return request(method,path,body,auth,false);}
function image(idValue,size){return request("GET","/api/assets/"+encodeURIComponent(idValue)+"/thumbnail?size="+size,undefined,true,true);}
function clearSession(){var profile=activeProfile();S.token="";localStorage.removeItem(STORE.token);localStorage.removeItem(STORE.user);if(profile){profile.token="";profile.user=null;saveProfiles();}S.user=null;}
function authError(e){if(e&&e.status===401){var profile=activeProfile();clearSession();if(profile){E.email.value=profile.email||(profile.user&&profile.user.email)||"";}showLogin("Your Immich session expired. Please sign in again.");return true;}return false;}
function validate(){return api("POST","/api/auth/validateToken",{},true).then(function(value){if(!value||value.authStatus!==true){var e=new Error("Invalid session");e.status=401;throw e;}return api("GET","/api/users/me",undefined,true);}).then(function(user){S.user=user;updateActiveProfile();return user;});}

function login(){
 if(S.retry&&S.token){E.loginStatus.textContent="Connecting...";E.loginButton.disabled=true;validate().then(startGallery).catch(function(e){E.loginStatus.textContent=e.status===401?"Your saved session expired.":e.message;E.loginButton.disabled=false;if(e.status===401){clearSession();S.retry=false;E.loginButton.textContent="SIGN IN";}});return;}
 var server,email=E.email.value.trim(),password=E.password.value;
 try{server=serverUrl(E.server.value);}catch(e){E.loginStatus.textContent=e.message;E.server.focus();return;}
 if(!email||!password){E.loginStatus.textContent="Enter email and password.";return;}
 if(server.indexOf("http:")===0&&S.insecureApprovedFor!==server){S.insecureApprovedFor=server;E.securityNotice.textContent="Warning: HTTP does not encrypt your email, password, or session token. Press Sign In again only if this is a trusted local network.";E.securityNotice.classList.remove("hidden");E.loginButton.textContent="SIGN IN OVER HTTP";return;}
 S.server=server;E.loginStatus.textContent="Signing in...";E.loginButton.disabled=true;
 E.securityNotice.classList.add("hidden");
 api("POST","/api/auth/login",{email:email,password:password},false).then(function(value){if(!value||!value.accessToken){throw new Error("Server did not return a session token.");}S.token=value.accessToken;return validate();}).then(function(){localStorage.setItem(STORE.server,S.server);saveActiveProfile(email);E.password.value="";E.loginStatus.textContent="";return startGallery();}).catch(function(e){clearSession();E.password.value="";E.loginStatus.textContent=friendlyError(e);E.loginButton.disabled=false;E.loginButton.textContent=server.indexOf("http:")===0?"SIGN IN OVER HTTP":"SIGN IN";E.password.focus();});
}
function performLogout(){E.logout.disabled=true;api("POST","/api/auth/logout",{},true).catch(function(){error("The server could not confirm sign-out. The saved session was removed from this TV.");}).then(function(){clearSession();closeSettings(false);clearGallery();E.logout.disabled=false;showProfiles(false);});}
function performRemoveProfile(){
 var profile=activeProfile();if(!profile){return;}var removedId=profile.id;if(S.token){api("POST","/api/auth/logout",{},true).catch(function(){});}
 S.profiles=S.profiles.filter(function(item){return item.id!==removedId;});S.token="";S.user=null;S.activeProfileId=S.profiles.length?S.profiles[0].id:"";saveProfiles();localStorage.removeItem(STORE.token);localStorage.removeItem(STORE.user);closeSettings(false);clearGallery();E.removeProfile.textContent="Remove profile from this TV";if(S.profiles.length){applyProfile(S.profiles[0]);showProfiles(false);}else{S.server="";localStorage.removeItem(STORE.server);E.server.value="";E.email.value="";E.password.value="";showLogin("Profile removed from this TV.");}
}
function showLogin(message,preserveSession){stopSlideshow();screen("login");S.zone="login";S.retry=!!preserveSession&&!!S.token;S.insecureApprovedFor="";E.server.value=S.server;E.securityNotice.classList.add("hidden");E.loginButton.disabled=false;E.loginButton.textContent=S.retry?"RETRY":"SIGN IN";E.loginStatus.textContent=message||"";setTimeout(function(){(S.retry?E.loginButton:E.email).focus();},100);}

function query(extra){return"visibility=timeline&withStacked=true&order=desc&orderBy=takenAt"+(extra?"&"+extra:"");}
function startGallery(){
 S.loginFromProfiles=false;
 screen("gallery");S.zone="grid";E.userName.textContent=S.user?(S.user.name||S.user.email||""):"";E.userName.classList.toggle("profileSwitchAvailable",S.profiles.length>=2);E.userName.disabled=S.profiles.length<2;E.settingsUser.textContent=S.user?[S.user.name,S.user.email].filter(Boolean).join("  •  "):"";applyColumns();settingsUI();E.loading.textContent="Loading timeline...";
 return api("GET","/api/timeline/buckets?"+query(),undefined,true).then(function(value){S.buckets=Array.isArray(value)?value:[];S.bucket=0;S.rail=0;buildRail();if(!S.buckets.length){clearGallery();E.loading.textContent="Your timeline is empty.";focus();return;}return loadBucket(0,0);}).catch(function(e){if(!authError(e)){E.loading.textContent="Unable to load the timeline.";error(e.message);}});
}
function compact(value){var out=[];if(!value||!Array.isArray(value.id)){return out;}for(var i=0;i<value.id.length;i++){out.push({id:value.id[i],type:value.isImage&&value.isImage[i]?"IMAGE":"VIDEO",fileCreatedAt:value.fileCreatedAt&&value.fileCreatedAt[i],localOffsetHours:value.localOffsetHours&&value.localOffsetHours[i],ratio:value.ratio&&value.ratio[i]});}return out;}
function loadBucket(index,preferred){
 if(S.loading||index<0||index>=S.buckets.length){return Promise.resolve(false);}S.loading=true;var run=++S.galleryRun,b=S.buckets[index];E.loading.textContent="Loading "+bucketLabel(b.timeBucket)+"...";
 return api("GET","/api/timeline/bucket?"+query("timeBucket="+encodeURIComponent(b.timeBucket)),undefined,true).then(function(value){if(run!==S.galleryRun){return false;}S.bucket=index;S.rail=index;S.assets=compact(value);S.selected=Math.max(0,Math.min(preferred||0,S.assets.length-1));renderGallery();railFocus();return true;}).catch(function(e){if(!authError(e)){error("Timeline: "+e.message);}return false;}).then(function(ok){if(run===S.galleryRun){S.loading=false;E.loading.textContent=S.assets.length?"":"No assets in this month.";}return ok;});
}
function clearGallery(bump){if(bump!==false){S.galleryRun++;}S.assets=[];S.selected=0;thumbQueue=[];if(observer){observer.disconnect();}var images=E.gallery.querySelectorAll("img[data-object-url]");for(var i=0;i<images.length;i++){URL.revokeObjectURL(images[i].getAttribute("data-object-url"));}E.gallery.innerHTML="";}
function renderGallery(){
 var assets=S.assets.slice();clearGallery(false);S.assets=assets;var run=S.galleryRun,fragment=document.createDocumentFragment();for(var i=0;i<S.assets.length;i++){fragment.appendChild(tile(S.assets[i],i,run));}E.gallery.appendChild(fragment);E.galleryContainer.scrollTop=0;lazy();focus();
}
function tile(asset,index,run){var box=document.createElement("div"),img=document.createElement("img"),date=document.createElement("div");box.className="asset";box.setAttribute("data-index",index);img.alt="";img.setAttribute("data-asset-id",asset.id);img.setAttribute("data-generation",run);date.className="assetDate";date.textContent=formatDate(asset);box.appendChild(img);box.appendChild(date);if(asset.type==="VIDEO"){var badge=document.createElement("div");badge.className="videoBadge";badge.textContent="▶";box.appendChild(badge);}return box;}
function lazy(){var images=E.gallery.querySelectorAll("img[data-asset-id]");if(typeof IntersectionObserver==="undefined"){for(var i=0;i<images.length;i++){queueThumb(images[i]);}return;}observer=new IntersectionObserver(function(entries){for(var j=0;j<entries.length;j++){if(entries[j].isIntersecting){observer.unobserve(entries[j].target);queueThumb(entries[j].target);}}},{root:E.galleryContainer,rootMargin:"500px 0px"});for(var k=0;k<images.length;k++){observer.observe(images[k]);}}
function queueThumb(img){if(img.getAttribute("data-queued")){return;}img.setAttribute("data-queued","1");thumbQueue.push(img);drain();}
function drain(){while(thumbActive<6&&thumbQueue.length){loadThumb(thumbQueue.shift());}}
function loadThumb(img){thumbActive++;var assetId=img.getAttribute("data-asset-id"),run=parseInt(img.getAttribute("data-generation"),10);image(assetId,"thumbnail").then(function(blob){if(run!==S.galleryRun||!document.body.contains(img)){return;}var url=URL.createObjectURL(blob);img.setAttribute("data-object-url",url);img.onload=img.onerror=function(){URL.revokeObjectURL(url);img.removeAttribute("data-object-url");};img.src=url;}).catch(function(e){if(e.status!==404){console.error("Thumbnail",assetId,e);}}).then(function(){thumbActive--;drain();});}

function assetDate(asset){var d=new Date(asset.fileCreatedAt);if(isNaN(d.getTime())){return null;}if(typeof asset.localOffsetHours==="number"){d=new Date(d.getTime()+asset.localOffsetHours*3600000);}return d;}
function formatDate(asset){var d=assetDate(asset);return d?d.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}):"";}
function bucketLabel(value){var p=String(value||"").slice(0,10).split("-");if(p.length<2){return value||"";}return new Date(parseInt(p[0],10),parseInt(p[1],10)-1,1).toLocaleDateString(undefined,{year:"numeric",month:"long"});}
function buildRail(){E.rail.innerHTML="";var last="";for(var i=0;i<S.buckets.length;i++){var p=S.buckets[i].timeBucket.slice(0,10).split("-"),yearText=p[0];if(yearText!==last){var year=document.createElement("div");year.className="railYear";year.textContent=yearText;E.rail.appendChild(year);last=yearText;}var month=document.createElement("div"),count=document.createElement("span");month.className="railMonth";month.textContent=bucketLabel(S.buckets[i].timeBucket).replace(yearText,"").trim().toUpperCase();count.textContent=S.buckets[i].count;month.appendChild(count);E.rail.appendChild(month);}}
function railFocus(){var months=E.rail.querySelectorAll(".railMonth");for(var i=0;i<months.length;i++){months[i].classList.toggle("current",i===S.bucket);months[i].classList.toggle("focused",i===S.rail&&S.zone==="rail");}var index=S.zone==="rail"?S.rail:S.bucket;if(months[index]){months[index].scrollIntoView({block:"nearest"});}}

function applyColumns(){S.columns=num(S.columns,4,8,6);E.gallery.style.gridTemplateColumns="repeat("+S.columns+", 1fr)";localStorage.setItem(STORE.columns,String(S.columns));updateActiveProfile();}
function settingsUI(){var buttons=document.querySelectorAll("#columnOptions button");for(var i=0;i<buttons.length;i++){buttons[i].classList.toggle("selected",parseInt(buttons[i].getAttribute("data-columns"),10)===S.columns);}E.interval.value=String(S.slide);}
function focus(){var tiles=E.gallery.querySelectorAll(".asset");for(var i=0;i<tiles.length;i++){tiles[i].classList.toggle("focused",S.zone==="grid"&&i===S.selected);}E.userName.classList.toggle("remoteFocused",S.zone==="top"&&S.topIndex===0&&S.profiles.length>=2);E.settingsButton.classList.toggle("remoteFocused",S.zone==="top"&&S.topIndex===1);railFocus();if(S.zone==="grid"&&tiles[S.selected]){visible(tiles[S.selected]);}}
function visible(tile){var top=tile.offsetTop,bottom=top+tile.offsetHeight,viewTop=E.galleryContainer.scrollTop,viewBottom=viewTop+E.galleryContainer.clientHeight;if(top<viewTop+15){E.galleryContainer.scrollTop=Math.max(0,top-15);}else if(bottom>viewBottom-15){E.galleryContainer.scrollTop=bottom-E.galleryContainer.clientHeight+15;}}
function moveGrid(dx,dy){if(!S.assets.length||S.loading){return;}var row=Math.floor(S.selected/S.columns),col=S.selected%S.columns;if(dy<0&&row===0){S.zone="top";focus();return;}if(dy>0&&S.selected+S.columns>=S.assets.length){loadBucket(S.bucket+1,col).then(function(ok){if(ok){S.zone="grid";focus();}});return;}if(dx>0&&(col===S.columns-1||S.selected===S.assets.length-1)){S.zone="rail";focus();return;}var next=S.selected+dx+dy*S.columns;if(next>=0&&next<S.assets.length){S.selected=next;focus();}}
function moveRail(delta){S.rail=Math.max(0,Math.min(S.rail+delta,S.buckets.length-1));railFocus();}
function jumpRail(){var index=S.rail;S.zone="grid";loadBucket(index,0);}

function openViewer(index){var asset=S.assets[index];if(!asset){return;}S.selected=index;S.viewer=true;S.viewerType=asset.type;S.zone="viewer";screen("viewer");releaseViewer();E.viewerImage.style.display="none";E.viewerVideo.style.display="none";E.viewerLoading.style.display="block";E.viewerDate.textContent=formatDate(asset);E.viewerCounter.textContent=(index+1)+" / "+S.assets.length;var run=++S.viewerRun;if(asset.type==="VIDEO"){openVideo(asset,run);return;}E.videoControls.classList.add("hidden");E.viewerSlide.textContent="Press Enter for slideshow";image(asset.id,"preview").then(function(blob){if(run!==S.viewerRun||!S.viewer){return;}S.viewerUrl=URL.createObjectURL(blob);E.viewerImage.onload=function(){if(run===S.viewerRun){E.viewerLoading.style.display="none";E.viewerImage.style.display="block";}};E.viewerImage.src=S.viewerUrl;}).catch(function(e){if(run===S.viewerRun){E.viewerLoading.style.display="none";if(!authError(e)){error(e.message);}}});}
function videoTime(value){if(!isFinite(value)||value<0){value=0;}value=Math.floor(value);return Math.floor(value/60)+":"+(value%60<10?"0":"")+(value%60);}
function videoButtons(){return E.videoControls.querySelectorAll("button[data-video-action]");}
function videoFocus(){var buttons=videoButtons();for(var i=0;i<buttons.length;i++){buttons[i].classList.toggle("remoteFocused",i===S.videoControl);}}
function updateVideoUI(){var current=E.viewerVideo.currentTime||0,duration=E.viewerVideo.duration||0;E.videoCurrent.textContent=videoTime(current);E.videoDuration.textContent=videoTime(duration);E.videoProgress.style.width=(isFinite(duration)&&duration>0?Math.min(100,current/duration*100):0)+"%";var buttons=videoButtons();if(buttons[1]){buttons[1].setAttribute("data-playing",E.viewerVideo.paused?"false":"true");buttons[1].setAttribute("aria-label",E.viewerVideo.paused?"Play":"Pause");}}
function runVideoControl(){var buttons=videoButtons(),action=buttons[S.videoControl]&&buttons[S.videoControl].getAttribute("data-video-action");if(action==="rewind"){seekVideo(-10);}else if(action==="toggle"){toggleVideo();}else if(action==="forward"){seekVideo(10);}else if(action==="stop"){closeViewer();}}
function openVideo(asset,run){S.videoControl=1;E.viewerSlide.textContent="Up/Down: Previous/Next";E.videoControls.classList.remove("hidden");videoFocus();updateVideoUI();E.viewerVideo.oncanplay=function(){if(run===S.viewerRun){E.viewerVideo.oncanplay=null;E.viewerLoading.style.display="none";E.viewerVideo.style.display="block";var play=E.viewerVideo.play();if(play&&play.catch){play.catch(function(){error("Unable to start video playback.");});}}};E.viewerVideo.onplaying=function(){if(run===S.viewerRun){E.viewerLoading.style.display="none";setScreenSaver(false);updateVideoUI();}};E.viewerVideo.onwaiting=function(){if(run===S.viewerRun){E.viewerLoading.style.display="block";}};E.viewerVideo.onpause=function(){setScreenSaver(true);updateVideoUI();};E.viewerVideo.ontimeupdate=updateVideoUI;E.viewerVideo.ondurationchange=updateVideoUI;E.viewerVideo.onerror=function(){if(run===S.viewerRun){setScreenSaver(true);E.viewerLoading.style.display="none";error("Video cannot be played on this TV or codec is unsupported.");}};E.viewerVideo.onended=function(){setScreenSaver(true);viewerMove(1,false);};E.viewerVideo.src=S.server+"/api/assets/"+encodeURIComponent(asset.id)+"/video/playback?sessionKey="+encodeURIComponent(S.token);E.viewerVideo.load();}
function releaseViewer(){if(!S.slideTimer){setScreenSaver(true);}if(S.viewerUrl){URL.revokeObjectURL(S.viewerUrl);S.viewerUrl=null;}E.viewerImage.removeAttribute("src");E.videoControls.classList.add("hidden");E.viewerVideo.oncanplay=null;E.viewerVideo.onplaying=null;E.viewerVideo.onwaiting=null;E.viewerVideo.onpause=null;E.viewerVideo.ontimeupdate=null;E.viewerVideo.ondurationchange=null;E.viewerVideo.onerror=null;E.viewerVideo.onended=null;E.viewerVideo.pause();E.viewerVideo.removeAttribute("src");E.viewerVideo.load();}
function closeViewer(){stopSlideshow();S.viewerRun++;S.viewer=false;releaseViewer();screen("gallery");S.zone="grid";focus();}
function viewerMove(direction,automatic){var index=S.selected+direction;if(automatic){while(index>=0&&index<S.assets.length&&S.assets[index].type!=="IMAGE"){index+=direction;}}if(index>=0&&index<S.assets.length){openViewer(index);return;}var adjacent=S.bucket+direction;if(adjacent<0||adjacent>=S.buckets.length||S.loading){if(automatic){stopSlideshow();}return;}loadBucket(adjacent,direction>0?0:999999).then(function(ok){if(!ok){return;}var start=direction>0?0:S.assets.length-1;if(automatic){while(start>=0&&start<S.assets.length&&S.assets[start].type!=="IMAGE"){start-=direction;}}if(start>=0&&start<S.assets.length){openViewer(start);}});}
function toggleVideo(){if(E.viewerVideo.paused){var play=E.viewerVideo.play();if(play&&play.catch){play.catch(function(){setScreenSaver(true);error("Unable to start video playback.");});}}else{E.viewerVideo.pause();}updateVideoUI();}
function seekVideo(seconds){if(!isFinite(E.viewerVideo.duration)){return;}E.viewerVideo.currentTime=Math.max(0,Math.min(E.viewerVideo.currentTime+seconds,E.viewerVideo.duration));}
function toggleSlideshow(){if(S.slideTimer){stopSlideshow();return;}E.viewerSlide.textContent="Slideshow • Playing";setScreenSaver(false);S.slideTimer=setInterval(function(){viewerMove(1,true);},S.slide*1000);}
function stopSlideshow(){clearInterval(S.slideTimer);S.slideTimer=null;setScreenSaver(true);if(E.viewerSlide){E.viewerSlide.textContent="Press Enter for slideshow";}}

function settingControls(){var controls=[E.settingsClose],buttons=document.querySelectorAll("#columnOptions button");for(var i=0;i<buttons.length;i++){controls.push(buttons[i]);}controls.push(E.interval);controls.push(E.switchProfile);controls.push(E.logout);controls.push(E.removeProfile);return controls;}
function openSettings(){S.zone="settings";S.settingsIndex=S.columns-3;E.settings.classList.remove("hidden");settingsUI();focusSetting();}
function closeSettings(restore){E.settings.classList.add("hidden");if(restore!==false&&S.screen==="gallery"){S.zone="top";focus();}}
function focusSetting(){var controls=settingControls();S.settingsIndex=Math.max(0,Math.min(S.settingsIndex,controls.length-1));controls[S.settingsIndex].focus();}
function moveSettings(key){if(S.settingsIndex===6&&(key===37||key===39)){var options=E.interval.options,current=E.interval.selectedIndex+(key===39?1:-1);current=Math.max(0,Math.min(current,options.length-1));E.interval.selectedIndex=current;E.interval.onchange();}else if(key===37&&S.settingsIndex>=1&&S.settingsIndex<=5){S.settingsIndex--;}else if(key===39&&S.settingsIndex>=1&&S.settingsIndex<5){S.settingsIndex++;}else if(key===37&&S.settingsIndex>=8&&S.settingsIndex<=9){S.settingsIndex--;}else if(key===39&&S.settingsIndex>=7&&S.settingsIndex<9){S.settingsIndex++;}else if(key===38){if(S.settingsIndex>=7&&S.settingsIndex<=9){S.settingsIndex=6;}else if(S.settingsIndex===6){S.settingsIndex=S.columns-3;}else{S.settingsIndex=0;}}else if(key===40){if(S.settingsIndex===0){S.settingsIndex=S.columns-3;}else if(S.settingsIndex>=1&&S.settingsIndex<=5){S.settingsIndex=6;}else if(S.settingsIndex===6){S.settingsIndex=7;}}focusSetting();}
function moveLogin(delta){var index=loginControls.indexOf(document.activeElement);if(index<0){index=0;}loginControls[Math.max(0,Math.min(index+delta,loginControls.length-1))].focus();}

E.loginButton.onclick=login;E.userName.onclick=function(){if(S.profiles.length>=2){showProfiles(true);}};E.settingsButton.onclick=openSettings;E.settingsClose.onclick=function(){closeSettings(true);};E.switchProfile.onclick=function(){showProfiles(true);};E.logout.onclick=function(){confirmAccount("logout");};E.removeProfile.onclick=function(){confirmAccount("remove");};
function useNewCredentials(){S.retry=false;S.insecureApprovedFor="";E.securityNotice.classList.add("hidden");E.loginButton.textContent="SIGN IN";}
E.server.oninput=useNewCredentials;E.email.oninput=useNewCredentials;E.password.oninput=useNewCredentials;
var columnButtons=document.querySelectorAll("#columnOptions button");for(var c=0;c<columnButtons.length;c++){columnButtons[c].onclick=function(){S.columns=num(this.getAttribute("data-columns"),4,8,6);applyColumns();settingsUI();focus();this.focus();};}
E.interval.onchange=function(){S.slide=num(this.value,3,15,5);localStorage.setItem(STORE.slideshow,String(S.slide));updateActiveProfile();};
var videoControlButtons=videoButtons();for(var vb=0;vb<videoControlButtons.length;vb++){videoControlButtons[vb].onclick=function(){var buttons=videoButtons();for(var i=0;i<buttons.length;i++){if(buttons[i]===this){S.videoControl=i;break;}}videoFocus();runVideoControl();};}
E.networkRetry.onclick=function(){if(checkNetwork()&&S.token){validate().then(function(){if(S.screen==="gallery"){startGallery();}}).catch(function(e){if(!authError(e)){error(friendlyError(e));}});}};
E.exitNo.onclick=cancelExit;E.exitYes.onclick=exit;
E.accountConfirmNo.onclick=cancelAccountConfirm;E.accountConfirmYes.onclick=acceptAccountConfirm;
window.addEventListener("offline",showOffline);
window.addEventListener("online",checkNetwork);
document.addEventListener("visibilitychange",function(){if(document.hidden){stopSlideshow();if(S.viewer&&S.viewerType==="VIDEO"){closeViewer();}setScreenSaver(true);return;}if(checkNetwork()&&S.token){validate().catch(function(e){if(!authError(e)){error("Unable to verify the saved session after resume.");}});}});

document.addEventListener("keydown",function(event){
 var key=event.keyCode,media=mediaAction(key);if([37,38,39,40,13,10009].indexOf(key)>=0||media){event.preventDefault();}
 if(S.exitOpen){if(key===37||key===39){S.exitChoice=key===39?1:0;exitFocus();}else if(key===13){if(S.exitChoice===1){exit();}else{cancelExit();}}else if(key===10009){cancelExit();}return;}
 if(S.accountConfirmOpen){if(key===37||key===39){S.accountConfirmChoice=key===39?1:0;accountConfirmFocus();}else if(key===13){if(S.accountConfirmChoice===1){acceptAccountConfirm();}else{cancelAccountConfirm();}}else if(key===10009){cancelAccountConfirm();}return;}
 if(S.networkBlocked){if(key===13){E.networkRetry.click();}else if(key===10009){confirmExit();}return;}
 if(S.screen==="profiles"){if(key===37){S.profileIndex=Math.max(0,S.profileIndex-1);profileFocus();}else if(key===39){S.profileIndex=Math.min(S.profiles.length,S.profileIndex+1);profileFocus();}else if(key===13){selectProfile();}else if(key===10009){if(S.profileCanReturn&&activeProfile()&&S.token){startGallery();}else{confirmExit();}}return;}
 if(S.screen==="login"){if(key===38){moveLogin(-1);}else if(key===40){moveLogin(1);}else if(key===13&&document.activeElement===E.loginButton){login();}else if(key===10009){if(S.addingProfile){S.addingProfile=false;S.activeProfileId=S.previousProfileId;var previous=activeProfile();if(previous){applyProfile(previous);}showProfiles(S.profileCanReturn);}else if(S.loginFromProfiles){showProfiles(S.profileCanReturn);}else{confirmExit();}}return;}
 if(S.viewer){if(S.viewerType==="VIDEO"){if(media==="MediaPlayPause"){toggleVideo();}else if(media==="MediaPlay"){if(E.viewerVideo.paused){toggleVideo();}}else if(media==="MediaPause"){if(!E.viewerVideo.paused){toggleVideo();}}else if(media==="MediaStop"){closeViewer();}else if(media==="MediaRewind"){seekVideo(-10);}else if(media==="MediaFastForward"){seekVideo(10);}else if(key===37||key===39){S.videoControl=Math.max(0,Math.min(S.videoControl+(key===39?1:-1),videoButtons().length-1));videoFocus();}else if(key===13){runVideoControl();}else if(key===38){viewerMove(-1,false);}else if(key===40){viewerMove(1,false);}else if(key===10009){closeViewer();}}else{if(key===37){viewerMove(-1,false);}else if(key===39){viewerMove(1,false);}else if(key===13){toggleSlideshow();}else if(key===10009){closeViewer();}}return;}
 if(!E.settings.classList.contains("hidden")){if([37,38,39,40].indexOf(key)>=0){moveSettings(key);}else if(key===13){var control=settingControls()[S.settingsIndex];if(control&&control!==E.interval){control.click();}}else if(key===10009){closeSettings(true);}return;}
 if(S.screen!=="gallery"){return;}
 if(S.zone==="top"){if(key===37&&S.profiles.length>=2){S.topIndex=0;focus();}else if(key===39){S.topIndex=1;focus();}else if(key===13){if(S.topIndex===0&&S.profiles.length>=2){showProfiles(true);}else{openSettings();}}else if(key===40){S.zone="grid";focus();}else if(key===10009){confirmExit();}return;}
 if(S.zone==="rail"){if(key===38){moveRail(-1);}else if(key===40){moveRail(1);}else if(key===37||key===10009){S.rail=S.bucket;S.zone="grid";focus();}else if(key===13){jumpRail();}return;}
 if(key===37){moveGrid(-1,0);}else if(key===39){moveGrid(1,0);}else if(key===38){moveGrid(0,-1);}else if(key===40){moveGrid(0,1);}else if(key===13){openViewer(S.selected);}else if(key===10009){confirmExit();}
});
function exit(){setScreenSaver(true);try{tizen.application.getCurrentApplication().exit();}catch(e){console.log(e);}}
function start(){E.server.value=S.server;loadProfiles();if(S.profiles.length){var profile=activeProfile()||S.profiles[0];applyProfile(profile);applyColumns();settingsUI();if(S.profiles.length>1){showProfiles(false);return;}}else{applyColumns();settingsUI();}if(!S.token){showLogin();return;}validate().then(startGallery).catch(function(e){if(e.status===401){clearSession();E.email.value=(activeProfile()&&activeProfile().email)||E.email.value;showLogin("Your saved session expired.");}else{showLogin("Immich is temporarily unavailable. Your saved session was kept.",true);}});}
registerRemoteKeys();start();checkNetwork();
})();
