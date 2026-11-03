import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { partInfo } from './data';
import { cycleAt } from './kinematics';
export type Part={id:string;group:T.Group;base:T.Vector3;exploded:T.Vector3;engineDelta:T.Vector3;engine:boolean;materials:T.MeshStandardMaterial[];};
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
export function createMotorcycle(){
 const root=new T.Group();root.name='X440-procedural-approximation';
 const parts=new Map<string,Part>();
 const mat=(color:string,metalness=.7,roughness=.36)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const metal=mat('#9a9c9d',.85,.28),dark=mat('#24282b',.7,.4),black=mat('#121416',.45,.42),rubber=mat('#17191a',.04,.86),chrome=mat('#d9dddd',.95,.19),bronze=mat('#88765b',.75,.38),gold=mat('#c5a16c',.72,.3),seatMat=mat('#222225',.08,.85);
 const paint=new T.MeshPhysicalMaterial({color:'#b64a23',metalness:.68,roughness:.26,clearcoat:1,clearcoatRoughness:.16});paint.userData.paint=true;
 const light=new T.MeshStandardMaterial({color:'#fcf7de',emissive:'#fff1ce',emissiveIntensity:3});light.userData.headlamp=true;
 const amber=new T.MeshStandardMaterial({color:'#e38727',emissive:'#ff6800',emissiveIntensity:.6});
 const glass=new T.MeshPhysicalMaterial({color:'#bed8d8',metalness:.4,roughness:.12,transparent:true,opacity:.45});
 function part(id:string,pos:number[],offset:number[],parent:T.Object3D=root,engine=false,engineDelta=[0,0,0]){const g=new T.Group();g.name=id;g.position.fromArray(pos);g.userData.component=id;parent.add(g);parts.set(id,{id,group:g,base:g.position.clone(),exploded:new T.Vector3().fromArray(offset),engineDelta:new T.Vector3().fromArray(engineDelta),engine,materials:[]});return g;}
 function mesh(g:T.Object3D,geo:T.BufferGeometry,m:T.Material,pos=[0,0,0],rot=[0,0,0]){const o=new T.Mesh(geo,m);o.position.fromArray(pos);o.rotation.set(...rot as [number,number,number]);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 const box=(g:T.Object3D,s:number[],p:number[],m:T.Material,rot=[0,0,0])=>mesh(g,new T.BoxGeometry(...s as [number,number,number]),m,p,rot);
 const ball=(g:T.Object3D,s:number[],p:number[],m:T.Material)=>{const o=mesh(g,new T.SphereGeometry(1,24,16),m,p);o.scale.fromArray(s);return o};
 const cyl=(g:T.Object3D,r:number,h:number,p:number[],m:T.Material,rot=[0,0,0],r2=r)=>mesh(g,new T.CylinderGeometry(r,r2,h,32),m,p,rot);
 function beam(g:T.Object3D,a:number[],b:number[],r:number,m:T.Material){const av=new T.Vector3().fromArray(a),bv=new T.Vector3().fromArray(b),d=bv.clone().sub(av);const o=cyl(g,r,d.length(),av.clone().add(bv).multiplyScalar(.5).toArray(),m);o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return o;}
 function tube(g:T.Object3D,points:number[][],r:number,m:T.Material){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3().fromArray(p))),40,r,10,false),m);}
 function torus(g:T.Object3D,r:number,t:number,p:number[],m:T.Material,rot=[0,0,0]){return mesh(g,new T.TorusGeometry(r,t,10,64),m,p,rot)}
 function badge(text:string,w:number,h:number){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const ctx=canvas.getContext('2d')!;ctx.clearRect(0,0,512,160);ctx.fillStyle='#e6ded0';ctx.font='700 42px Arial';ctx.textAlign='center';ctx.fillText(text,256,67);ctx.font='500 27px Arial';ctx.letterSpacing='7px';ctx.fillText('X 4 4 0',256,117);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide}));}
 const frame=part('frame',[0,0,0],[0,0,-.3]);
 for(const z of [-.13,.13]){const nodes=[[-.45,.65,z],[.41,.72,z],[.30,.29,z],[-.30,.26,z],[-.45,.65,z]];for(let i=0;i<nodes.length-1;i++)beam(frame,nodes[i],nodes[i+1],.018,dark);beam(frame,[-.45,.65,z],[.3,.29,z],.015,dark);beam(frame,[-.38,.38,z],[-.76,.79,z],.017,dark);beam(frame,[-.76,.79,z],[-.45,.65,z],.017,dark);beam(frame,[-.2,.37,z],[-.688,.32,z],.025,dark);beam(frame,[.41,.72,z],[.52,.97,z],.018,dark);}
 for(const x of [-.45,.3])beam(frame,[x,.55,-.13],[x,.55,.13],.018,dark);
 const tank=part('tank',[.06,.79,0],[0,.55,0]);
 const rings=[[-.33,.035,.025,-.02],[-.29,.12,.095,0],[-.19,.19,.14,.02],[.03,.225,.16,.03],[.21,.17,.145,.035],[.30,.075,.09,.02],[.32,.006,.015,0]];
 const verts:number[]=[],inds:number[]=[];const segments=48;
 rings.forEach(([x,w,h,cy])=>{for(let j=0;j<=segments;j++){const t=j/segments*Math.PI*2;verts.push(x,cy+Math.cos(t)*h,Math.sin(t)*w*(Math.cos(t)<0?.82:1));}});
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<segments;j++){const a=i*(segments+1)+j,b=a+segments+1;inds.push(a,a+1,b,b,a+1,b+1)}
 const tankGeo=new T.BufferGeometry();tankGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));tankGeo.setIndex(inds);tankGeo.computeVertexNormals();mesh(tank,tankGeo,paint);
 cyl(tank,.039,.009,[.04,.194,0],chrome);cyl(tank,.024,.012,[.04,.2,0],dark);
 for(const z of [-1,1]){const label=badge('HARLEY-DAVIDSON',.27,.084);label.position.set(0,.055,z*.218);if(z<0)label.rotation.y=Math.PI;tank.add(label);}
 const seat=part('seat',[-.48,.79,0],[-.3,.32,0]);ball(seat,[.29,.057,.155],[0,0,0],seatMat);ball(seat,[.13,.058,.15],[-.19,.032,0],seatMat);for(let i=0;i<12;i++)tube(seat,[[-.29+i*.038,.037,-.13],[-.29+i*.038,.055,0],[-.29+i*.038,.037,.13]],.0015,metal);
 const panels=part('panels',[-.39,.63,0],[0,.06,.43]);for(const z of [-1,1]){const panel=box(panels,[.25,.14,.025],[0,0,z*.145],black,[0,0,-.1]);const label=badge('440',.12,.041);label.position.set(.005,.01,z*.16);if(z<0)label.rotation.y=Math.PI;panels.add(label)}
 const wheelGroups:T.Group[]=[];
 function wheel(id:string,x:number,r:number,w:number,explode:number[]){const g=part(id,[x,r,0],explode);wheelGroups.push(g);torus(g,r-.045,.045,[0,0,0],rubber);cyl(g,r-.082,w,[0,0,0],black,[Math.PI/2,0,0]);for(const z of [-w/2,w/2]){torus(g,r-.073,.009,[0,0,z],metal);torus(g,r-.085,.007,[0,0,z],black);}cyl(g,.049,w+.04,[0,0,0],chrome,[Math.PI/2,0,0]);
 // The open alloy spokes sit between the rim and hub.
 const rimSolid=g.children.find(o=>(o as T.Mesh).geometry?.type==='CylinderGeometry');if(rimSolid){g.remove(rimSolid);(rimSolid as T.Mesh).geometry.dispose()}
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;for(const z of [-1,1])beam(g,[Math.cos(a)*.052,Math.sin(a)*.052,z*.018],[Math.cos(a+.12)*(r-.079),Math.sin(a+.12)*(r-.079),z*w*.40],.012,metal);}
 for(let i=0;i<42;i++){const a=i/42*Math.PI*2;const rr=r-.003;tube(g,[[Math.cos(a-.03)*rr,Math.sin(a-.03)*rr,-w*.35],[Math.cos(a)*r,Math.sin(a)*r,0],[Math.cos(a+.03)*rr,Math.sin(a+.03)*rr,w*.35]],.0019,black)}
 return g;}
 wheel('front-wheel',.73,.319,.09,[.5,-.04,.22]);wheel('rear-wheel',-.688,.314,.13,[-.5,-.04,-.15]);
 const brakes=part('brakes',[0,0,0],[0,0,.55]);for(const [x,r] of [[.73,.16],[-.688,.12]]){mesh(brakes,new T.RingGeometry(r*.56,r,64),chrome,[x,.319,.079]);mesh(brakes,new T.RingGeometry(r*.56,r,64),chrome,[x,.319,.079],[0,Math.PI,0]);for(let j=0;j<8;j++){let a=j/8*Math.PI*2;beam(brakes,[x+Math.cos(a)*.045,.319+Math.sin(a)*.045,.078],[x+Math.cos(a)*r*.65,.319+Math.sin(a)*r*.65,.078],.007,dark)}for(let j=0;j<30;j++){let a=j/30*Math.PI*2;cyl(brakes,.0035,.002,[x+Math.cos(a)*r*.82,.319+Math.sin(a)*r*.82,.081],black,[Math.PI/2,0,0])}box(brakes,[.055,.09,.035],[x-.12,.37,.10],bronze,[0,0,-.25]);}
 const fork=part('fork',[0,0,0],[.4,.08,0]);for(const z of [-.105,.105]){beam(fork,[.73,.319,z],[.61,.70,z],.017,chrome);beam(fork,[.61,.70,z],[.52,1.0,z],.024,dark);cyl(fork,.027,.016,[.52,1.01,z],chrome);beam(fork,[.73,.319,z-.025],[.73,.319,z+.025],.018,dark);}beam(fork,[.55,.89,-.13],[.55,.89,.13],.025,dark);beam(fork,[.53,.97,-.14],[.53,.97,.14],.025,dark);
 const shocks=part('shocks',[0,0,0],[-.15,.16,.36]);for(const z of [-.165,.165]){const a=V(-.68,.34,z),b=V(-.52,.74,z);beam(shocks,a.toArray(),b.toArray(),.013,chrome);const points=[];for(let i=0;i<=180;i++){const t=i/180,p=a.clone().lerp(b,t);p.x+=Math.cos(t*Math.PI*22)*.025;p.z+=Math.sin(t*Math.PI*22)*.025;points.push(p.toArray())}tube(shocks,points,.004,black);cyl(shocks,.029,.09,[-.53,.69,z+.025],bronze);}
 const bars=part('handlebars',[.50,1.025,0],[.12,.52,0]);tube(bars,[[0,0,-.37],[-.02,.035,-.26],[.025,.035,-.12],[.04,0,0],[.025,.035,.12],[-.02,.035,.26],[0,0,.37]],.012,dark);for(const z of [-1,1]){beam(bars,[0,0,z*.28],[0,0,z*.4],.019,rubber);box(bars,[.04,.045,.045],[.005,.015,z*.25],black);beam(bars,[.02,.025,z*.26],[.07,.025,z*.38],.006,chrome);beam(bars,[0,.03,z*.25],[.025,.18,z*.32],.006,dark);ball(bars,[.045,.027,.015],[.025,.18,z*.32],black);}
 cyl(bars,.047,.032,[.04,.005,0],black,[-.25,0,0]);cyl(bars,.039,.004,[.04,.025,.006],glass,[-.25,0,0]);
 const headlamp=part('headlamp',[.68,.87,0],[.52,.27,0]);cyl(headlamp,.092,.095,[0,0,0],dark,[0,0,Math.PI/2]);torus(headlamp,.085,.006,[.052,0,0],chrome,[0,Math.PI/2,0]);cyl(headlamp,.077,.006,[.053,0,0],glass,[0,0,Math.PI/2]);torus(headlamp,.071,.0028,[.058,0,0],light,[0,Math.PI/2,0]);box(headlamp,[.009,.011,.128],[.062,0,0],light);
 const engine=part('engine',[-.06,.39,0],[0,.03,.15],root,true);
 const caseLeft=part('case-left',[0,-.02,-.051],[0,0,0],engine,true,[0,0,-.16]);const caseRight=part('case-right',[0,-.02,.051],[0,0,0],engine,true,[0,0,.16]);
 for(const [caseG,z] of [[caseLeft,-1],[caseRight,1]] as const){cyl(caseG,.111,.075,[0,0,z*.02],bronze,[Math.PI/2,0,0]);cyl(caseG,.078,.014,[0,0,z*.065],dark,[Math.PI/2,0,0]);for(let i=0;i<8;i++){let a=i/8*Math.PI*2;cyl(caseG,.006,.007,[Math.cos(a)*.094,Math.sin(a)*.094,z*.06],chrome,[Math.PI/2,0,0]);}}
 const barrel=part('barrel',[0,.16,0],[0,.10,0],engine,true,[0,.18,0]);cyl(barrel,.048,.13,[0,0,0],metal);for(let i=0;i<12;i++){const fin=box(barrel,[.177,.005,.16],[0,-.061+i*.0105,0],dark);for(const z of [-.081,.081])box(barrel,[.167,.0015,.002],[0,-.059+i*.0105,z],metal);}
 const head=part('head',[0,.264,0],[0,.27,0],engine,true,[0,.34,0]);box(head,[.17,.075,.16],[0,0,0],dark);for(let i=0;i<4;i++)box(head,[.184,.004,.172],[0,-.032+i*.015,0],metal);ball(head,[.083,.028,.073],[0,.05,0],black);cyl(head,.009,.045,[.01,.075,0],chrome,[0,0,-.15]);cyl(head,.007,.035,[.015,.105,0],new T.MeshStandardMaterial({color:'#efebe2'}));
 const piston=part('piston',[0,0,0],[0,0,0],engine,true);cyl(piston,.038,.035,[0,0,0],chrome);for(const y of [-.009,.002,.011])torus(piston,.037,.0015,[0,y,0],dark,[Math.PI/2,0,0]);
 const rod=part('rod',[0,0,0],[0,0,0],engine,true);const rodMesh=beam(rod,[0,0,0],[0,.145,0],.008,gold);const crank=part('crank',[0,0,0],[0,0,0],engine,true);for(const z of [-.037,.037])cyl(crank,.057,.015,[0,0,z],metal,[Math.PI/2,0,0]);cyl(crank,.015,.12,[0,0,0],chrome,[Math.PI/2,0,0]);beam(crank,[0,0,0],[0,.0442,0],.014,bronze);cyl(crank,.011,.065,[0,.0442,0],gold,[Math.PI/2,0,0]);
 const valves:T.Group[]=[];for(const [id,x] of [['intake-valve',-.027],['exhaust-valve',.027]] as const){const g=part(id,[x,.24,0],[0,0,0],engine,true,[x*2,.35,0]);valves.push(g);cyl(g,.0025,.055,[0,.022,0],chrome);cyl(g,.015,.004,[0,-.008,0],chrome);const pts=[];for(let i=0;i<80;i++){let t=i/79;pts.push([Math.cos(t*Math.PI*12)*.007,.015+t*.028,Math.sin(t*Math.PI*12)*.007])}tube(g,pts,.001,bronze);}
 const internals= new T.Group();internals.name='camshaft-timing';internals.userData.component='head';engine.add(internals);beam(internals,[-.055,.31,0],[.055,.31,0],.008,chrome);for(const x of [-.027,.027])ball(internals,[.014,.011,.014],[x,.31,0],gold);tube(internals,[[-.065,.01,-.04],[-.075,.30,-.04],[-.055,.315,-.04]],.004,dark);
 const chamber=mesh(engine,new T.SphereGeometry(1,20,12),new T.MeshBasicMaterial({color:'#f4a64f',transparent:true,opacity:.0,depthWrite:false}));chamber.position.set(0,.209,0);chamber.scale.set(.037,.016,.037);
 const flows:{mesh:T.Mesh;kind:string;index:number}[]=[];
 const blue=new T.MeshBasicMaterial({color:'#78cceb',transparent:true,opacity:.8}),orange=new T.MeshBasicMaterial({color:'#ff9757',transparent:true,opacity:.8}),oilMat=new T.MeshBasicMaterial({color:'#c9c36c',transparent:true,opacity:.8});
 tube(internals,[[-.035,.225,0],[-.095,.255,0],[-.17,.245,0]],.018,dark);tube(internals,[[.03,.225,0],[.11,.255,0],[.16,.21,0]],.018,dark);
 for(const kind of ['intake','exhaust','oil'])for(let i=0;i<12;i++){const dot=mesh(engine,new T.SphereGeometry(.003,6,5),kind==='intake'?blue:kind==='exhaust'?orange:oilMat);flows.push({mesh:dot,kind,index:i});}
 const gearbox=part('gearbox',[-.235,.36,0],[-.25,-.05,-.35]);for(const z of [-.07,.07]){cyl(gearbox,.09,.035,[0,0,z],dark,[Math.PI/2,0,0]);cyl(gearbox,.065,.006,[0,0,z*1.3],bronze,[Math.PI/2,0,0])}
 const header=part('header',[0,0,0],[.06,0,.5]);tube(header,[[.04,.62,.05],[.18,.58,.1],[.23,.35,.14],[.10,.23,.20],[-.22,.22,.24]],.022,bronze);
 const silencer=part('silencer',[-.39,.28,.26],[-.25,.03,.5]);cyl(silencer,.058,.61,[0,0,0],dark,[0,0,Math.PI/2],.041);cyl(silencer,.043,.022,[-.315,0,0],chrome,[0,0,Math.PI/2]);cyl(silencer,.029,.025,[-.33,0,0],black,[0,0,Math.PI/2]);box(silencer,[.42,.012,.04],[0,.047,.023],metal,[.25,0,0]);
 const drivetrain=part('drivetrain',[0,0,0],[-.13,0,-.42]);for(const [x,r] of [[-.688,.103],[-.22,.043]]){torus(drivetrain,r,.006,[x,.314,-.095],metal);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;beam(drivetrain,[x,.314,-.095],[x+Math.cos(a)*r,.314+Math.sin(a)*r,-.095],.005,dark)}}tube(drivetrain,[[-.688,.417,-.095],[-.22,.357,-.095],[-.178,.314,-.095],[-.22,.271,-.095],[-.688,.211,-.095],[-.79,.314,-.095],[-.688,.417,-.095]],.007,dark);
 const acc=part('accessories',[0,0,0],[0,-.05,-.55]);
 // Fenders follow the tires, with a small clearance above the tread.
 for(const [x,r,start,len] of [[.73,.337,.15,2.84],[-.688,.333,.1,2.5]]){mesh(acc,new T.TorusGeometry(r,.003,4,48,len),black,[x,.319,0],[0,0,start]);for(const z of [-.06,.06])tube(acc,[[x-.2,.55,z],[x-.13,.65,z],[x+.13,.65,z],[x+.2,.55,z]],.006,dark);}
 for(const z of [-1,1]){beam(acc,[-.12,.28,z*.16],[-.12,.28,z*.26],.012,dark);beam(acc,[-.12,.28,z*.24],[-.22,.28,z*.24],.01,rubber);beam(acc,[.57,.82,z*.1],[.57,.82,z*.19],.006,dark);ball(acc,[.024,.012,.015],[.57,.82,z*.20],amber);ball(acc,[.024,.012,.015],[-.81,.73,z*.17],amber);tube(acc,[[.51,1.02,z*.15],[.45,.85,z*.12],[.5,.58,z*.09],[.67,.37,z*.1]],.003,black)}
 box(acc,[.025,.06,.12],[-.85,.73,0],new T.MeshStandardMaterial({color:'#a52c21',emissive:'#a52c21',emissiveIntensity:.3}));box(acc,[.045,.14,.14],[.26,.47,0],black);for(let i=0;i<7;i++)box(acc,[.05,.003,.142],[.26,.41+i*.019,0],metal);
 tube(acc,[[.48,.79,0],[.2,.78,0],[-.2,.7,.1],[-.5,.71,.1]],.004,rubber);
 // Merge stationary geometry by material within each assembly to keep draw calls bounded.
 const dynamic=new Set(['piston','rod','crank','intake-valve','exhaust-valve']);
 for(const p of parts.values()){
   if(!dynamic.has(p.id)){
    const buckets=new Map<T.Material,T.Mesh[]>();for(const child of [...p.group.children])if(child instanceof T.Mesh&&!child.material.transparent&&!child.userData.dynamic){const key=child.material as T.Material;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key)!.push(child)}
    for(const [material,meshes] of buckets){if(meshes.length<2)continue;const geos=meshes.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix)});const merged=mergeGeometries(geos,false);if(merged){for(const o of meshes){p.group.remove(o);o.geometry.dispose()}mesh(p.group,merged,material)}geos.forEach(g=>g.dispose());}
   }
   const cloneMap=new Map<T.Material,T.Material>();for(const obj of p.group.children)if(obj instanceof T.Mesh){const old=obj.material as T.Material;if(!cloneMap.has(old)){const copy=old.clone();copy.userData={...copy.userData,baseOpacity:old.opacity,baseTransparent:old.transparent,originalColor:(old as T.MeshStandardMaterial).color?.clone()};cloneMap.set(old,copy);}obj.material=cloneMap.get(old)!;obj.userData.component=p.id;obj.userData.baseOpacity=(obj.material as T.MeshStandardMaterial).opacity;}
   p.group.traverse(o=>{if(!o.userData.component)o.userData.component=p.id});
   p.materials=[...cloneMap.values()] as T.MeshStandardMaterial[];p.group.userData.originalTransform=p.base.toArray();p.group.userData.explodedTransform=p.base.clone().add(p.exploded).toArray();p.group.userData.info=partInfo.find(x=>x.id===p.id);
 }
 const updateEngine=(degrees:number,ex:number,show:{intake:boolean;exhaust:boolean;combustion:boolean;oil:boolean},time:number)=>{
  const c=cycleAt(degrees);piston.position.y=c.height/1000;piston.position.x=0;
  const a=V(c.pinX/1000,c.pinY/1000,0),end=V(0,c.height/1000,0);rodMesh.position.copy(a.clone().add(end).multiplyScalar(.5));rodMesh.quaternion.setFromUnitVectors(V(0,1,0),end.sub(a).normalize());crank.rotation.z=-degrees*Math.PI/180;
  valves[0].position.y=.24-c.intake*.009+ex*.35;valves[1].position.y=.24-c.exhaust*.009+ex*.35;
  chamber.visible=show.combustion;const glow=degrees%720>330&&degrees%720<490?Math.max(0,1-Math.abs((degrees%720)-375)/115):0;(chamber.material as T.MeshBasicMaterial).opacity=glow*.65;
  for(const f of flows){const t=(time*.45+f.index/12)%1;f.mesh.visible=f.kind==='oil'?show.oil:f.kind==='intake'?show.intake&&c.intake>.05:show.exhaust&&c.exhaust>.05;if(f.kind==='intake')f.mesh.position.set(-.17+t*.15,.245-Math.sin(t*Math.PI)*.02,(f.index%3-1)*.008);else if(f.kind==='exhaust')f.mesh.position.set(.02+t*.15,.235-Math.sin(t*Math.PI)*.015,(f.index%3-1)*.008);else f.mesh.position.set(-.058+Math.sin(t*Math.PI)*.012,-.07+t*.34,.025);}
 };
 const dispose=()=>{const materials=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m)}});materials.forEach(m=>{Object.values(m).forEach(v=>{if(v instanceof T.Texture)v.dispose()});m.dispose()})};
 return {root,parts,wheelGroups,updateEngine,dispose};
}
