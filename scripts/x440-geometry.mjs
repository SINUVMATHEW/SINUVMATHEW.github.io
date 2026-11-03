// Original, reference-informed surface model. Metres, +Y up, +X forward.
// Named assemblies intentionally survive export for picking and exploded views.
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const PI=Math.PI, V=(a)=>new T.Vector3(...a);
export function createAsset({engineOnly=false,detail=1}={}){
 const radial=detail===2?64:32, curve=detail===2?64:32;
 const root=new T.Group();root.name=engineOnly?'X440_ENGINE':'X440_MOTORCYCLE';
 root.userData={units:'metres',forward:'+X',up:'+Y',source:'Original surface reconstruction from supplied photographs; not manufacturer CAD',revision:1};
 const mats={};
 function mat(name,color,metalness,roughness,extra={}){const m=new T.MeshStandardMaterial({color,metalness,roughness,...extra});m.name=name;mats[name]=m;return m}
 const paint=mat('Charcoal satin paint','#292c30',.55,.32),black=mat('Black powder coat','#141719',.55,.38),cast=mat('Cast aluminium - dark','#313436',.65,.48),rubber=mat('Tyre rubber','#101214',.02,.87),tread=mat('Tread recess','#070909',0,.95),steel=mat('Machined steel','#9aa2a6',.9,.25),edge=mat('Polished fin edge','#b6bfc2',.88,.23),bronze=mat('Warm engine medallion','#9c896b',.8,.32),exhaustMat=mat('Heat-stained stainless steel','#8c8173',.86,.32),seatMat=mat('Seat leather','#17191c',.02,.76),seam=mat('Seat stitching','#6c7071',.12,.8),mirror=mat('Mirror glass','#bac5cc',1,.06);
 const lens=mat('Headlamp dark lens','#363e41',.35,.16),led=mat('LED pearl strip','#f3ecd5',.1,.22,{emissive:'#e5dfcf',emissiveIntensity:.4}),amber=mat('Amber reflector','#b54c0c',.2,.3),red=mat('Tail lamp red','#b01d18',.3,.25,{emissive:'#840c08',emissiveIntensity:.15});
 const decal=mat('Tank graphics','#ffffff',0,.52),panelDecal=mat('Side panel graphics','#ffffff',0,.55),emblem=mat('Engine emblem','#ffffff',.3,.42),tyreText=mat('Tyre lettering','#ffffff',0,.85);
 const moving={};
 function group(name,parent=root,pos=[0,0,0],explode=[0,0,0]){const g=new T.Group();g.name=name;g.position.fromArray(pos);g.userData={component:name,assembled:pos,explode};parent.add(g);return g}
 function mesh(g,geo,m,p=[0,0,0],rot=[0,0,0]){if(geo.type==='PlaneGeometry'){const uv=geo.getAttribute('uv');for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i))}const o=new T.Mesh(geo,m);o.position.fromArray(p);o.rotation.set(...rot);o.castShadow=o.receiveShadow=true;g.add(o);return o}
 function box(g,size,p,m,rot=[0,0,0]){return mesh(g,new T.BoxGeometry(...size),m,p,rot)}
 function cyl(g,r,h,p,m,axis='y',r2=r,n=radial){return mesh(g,new T.CylinderGeometry(r,r2,h,n),m,p,axis==='z'?[PI/2,0,0]:axis==='x'?[0,0,PI/2]:[0,0,0])}
 function ellipsoid(g,size,p,m){const o=mesh(g,new T.SphereGeometry(1,radial,radial/2),m,p);o.scale.fromArray(size);return o}
 function beam(g,a,b,r,m,n=12){const d=V(b).sub(V(a)),o=cyl(g,r,d.length(),V(a).add(V(b)).multiplyScalar(.5).toArray(),m,'y',r,n);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o}
 function tube(g,pts,r,m,n=curve,sides=8){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(V)),n,r,sides,false),m)}
 function torus(g,r,t,p,m,axis='z',arc=2*PI){return mesh(g,new T.TorusGeometry(r,t,detail===2?12:8,radial,arc),m,p,axis==='y'?[PI/2,0,0]:axis==='x'?[0,PI/2,0]:[0,0,0])}
 function contour(points){const s=new T.Shape(),last=points.at(-1);s.moveTo((last[0]+points[0][0])/2,(last[1]+points[0][1])/2);for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length];s.quadraticCurveTo(...p,(p[0]+q[0])/2,(p[1]+q[1])/2)}s.closePath();return s}
 function plate(g,pts,depth,p,m,bevel=.004){const geo=new T.ExtrudeGeometry(contour(pts),{depth,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:detail===2?4:2,curveSegments:detail===2?10:5,steps:1});geo.translate(0,0,-depth/2);return mesh(g,geo,m,p)}
 function bolt(g,p,size=.005,axis='z'){cyl(g,size*1.25,.0018,p,steel,axis,size*1.25,16);const v=[...p],idx=axis==='z'?2:axis==='x'?0:1;v[idx]+=.002;const o=cyl(g,size,.004,v,steel,axis,size,6);const v2=[...v];v2[idx]+=.0025;cyl(g,size*.42,.0004,v2,black,axis,size*.42,6);return o}
 function band(g,x,y,r,width,start,end,m){const pts=[],uv=[],idx=[];const n=detail===2?80:40,s=10;for(let i=0;i<=n;i++){const a=start+(end-start)*i/n;for(let j=0;j<=s;j++){const z=(j/s-.5)*width,rr=r+.008*Math.cos((j/s-.5)*PI);pts.push(x+Math.cos(a)*rr,y+Math.sin(a)*rr,z);uv.push(i/n,j/s)}}for(let i=0;i<n;i++)for(let j=0;j<s;j++){const a=i*(s+1)+j,b=a+s+1;idx.push(a,b,a+1,a+1,b,b+1)}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pts,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const material=m.clone();material.side=T.DoubleSide;return mesh(g,geo,material)}
 // Engine: external covers follow the actual close-up, not the artistic exploded plate.
 function engine(parent,offset=[0,0,0],full=true){
  const e=group('engine',parent,offset,[0,.12,.48]);
  const core=group('crankcase',e,[0,0,0],[0,-.12,0]);
  const outline=[[-.285,.075],[-.235,.14],[-.11,.145],[.095,.075],[.13,-.045],[.07,-.105],[-.16,-.14],[-.27,-.09]];
  plate(core,outline,.152,[0,0,0],cast,.008);
  for(const z of [-1,1]){
   const cover=group(z===1?'clutch-cover':'alternator-cover',e,[0,0,z*.087],[0,0,z*.18]);
   plate(cover,outline.map(([x,y])=>[x*.97,y*.96]),.022,[0,0,0],black,.007);
   cyl(cover,.098,.032,[-.145,.025,z*.024],cast,'z');torus(cover,.084,.003,[-.145,.025,z*.044],black);
   cyl(cover,.059,.007,[-.145,.025,z*.045],black,'z');cyl(cover,.038,.004,[-.145,.025,z*.051],bronze,'z');
   const badge=mesh(cover,new T.PlaneGeometry(.045,.041),emblem,[-.145,.025,z*.054]);if(z<0)badge.rotation.y=PI;
   cyl(cover,.036,.015,[.045,-.074,z*.024],cast,'z');cyl(cover,.028,.004,[.045,-.074,z*.034],bronze,'z');
   const positions=[[-.265,.04],[-.238,.105],[-.16,.137],[-.07,.113],[.036,.077],[.104,.018],[.095,-.063],[.004,-.11],[-.11,-.13],[-.225,-.107],[-.27,-.045]];
   for(const [x,y] of positions){cyl(cover,.008,.008,[x,y,z*.017],cast,'z');bolt(cover,[x,y,z*.024],.0045);}
   const gasket=outline.map(([x,y])=>[x*.985,y*.985,z*.007]);gasket.push(gasket[0]);tube(cover,gasket,.0012,cast,48,5);
   cyl(cover,.016,.014,[-.19,.13,z*.018],black,'z',.018);box(cover,[.006,.024,.012],[-.19,.13,z*.031],black,[0,0,-.35]);
  }
  const cylRoot=group('cylinder-assembly',e,[0,0,0],[0,.14,0]);cylRoot.rotation.z=-.13;
  const barrel=group('cylinder-barrel',cylRoot,[0,.143,0],[0,.18,0]);
  cyl(barrel,.044,.142,[0,0,0],cast);
  const finShape=contour([[-.088,-.068],[-.098,-.046],[-.096,.049],[-.07,.073],[.07,.073],[.095,.045],[.092,-.045],[.068,-.07]]);
  const hole=new T.Path();hole.absarc(0,0,.0402,0,2*PI,true);finShape.holes.push(hole);
  for(let i=0;i<12;i++){const geo=new T.ExtrudeGeometry(finShape,{depth:.0034,bevelEnabled:true,bevelThickness:.0005,bevelSize:.0006,bevelSegments:1,curveSegments:detail===2?12:6});geo.rotateX(-PI/2);mesh(barrel,geo,black,[0,-.066+i*.012,0]);
   const outlinePoints=finShape.getPoints(detail===2?10:5).map(p=>[p.x,-.064+i*.012,-p.y]);tube(barrel,outlinePoints,.0008,edge,detail===2?64:32,4);
  }
  for(const x of [-.061,.061])for(const z of [-.052,.052]){beam(cylRoot,[x,.067,z],[x,.31,z],.004,steel);bolt(cylRoot,[x,.314,z],.006,'y')}
  const head=group('cylinder-head',cylRoot,[0,.248,0],[0,.31,0]);
  plate(head,[[-.092,-.036],[-.097,.035],[-.055,.06],[.065,.058],[.096,.022],[.085,-.04]],.145,[0,0,0],cast,.006);
  for(let i=0;i<3;i++)box(head,[.19,.003,.157],[0,-.034+i*.012,0],edge);
  const rocker=group('rocker-cover',cylRoot,[0,.312,0],[0,.43,0]);plate(rocker,[[-.09,-.02],[-.09,.018],[-.05,.033],[.066,.03],[.09,.008],[.075,-.023]],.139,[0,0,0],black,.005);
  for(const x of [-.06,.06])for(const z of [-.047,.047]){cyl(rocker,.011,.018,[x,.032,z],cast);bolt(rocker,[x,.044,z],.005,'y');}
  for(const x of [-.038,.038])ellipsoid(rocker,[.035,.020,.055],[x,.027,0],black);
  for(const z of [-.079,.079])for(const x of [-.071,.071]){cyl(head,.010,.013,[x,.017,z],cast,'z');bolt(head,[x,.017,z*1.1],.005)}
  for(const z of [-.076,.076])tube(head,[[-.075,.04,z],[-.04,.047,z],[.04,.047,z],[.075,.032,z]],.0014,steel);
  cyl(head,.009,.027,[-.062,.071,0],steel);cyl(head,.007,.022,[-.062,.09,0],mat('Spark plug ceramic','#d6d1c8',0,.4));cyl(head,.011,.037,[-.062,.113,0],mat('Spark plug boot','#831f17',.05,.65));
  tube(e,[[-.015,.37,0],[-.045,.405,0],[-.14,.41,-.015],[-.20,.34,-.06]],.0045,rubber);
  for(const z of [-.08,.08])for(const [x,y] of [[-.27,.13],[.095,.065]]){cyl(core,.019,.03,[x,y,z],cast,'z');cyl(core,.008,.032,[x,y,z],black,'z');torus(core,.012,.002,[x,y,z+Math.sign(z)*.017],steel)}
  // Cooling plumbing, throttle body and visible fastening details.
  const plumbing=group('oil-lines-and-intake',e);
  tube(plumbing,[[-.1,-.11,-.085],[.07,-.08,-.095],[.12,.12,-.09],[.08,.25,-.07]],.0055,black);
  for(const x of [-.1,.07])cyl(plumbing,.009,.014,[x,-.1,-.085],steel,'x');
  cyl(plumbing,.026,.09,[-.13,.293,0],cast,'x');torus(plumbing,.028,.003,[-.17,.293,0],steel,'x');
  tube(plumbing,[[-.18,.293,0],[-.23,.29,0],[-.265,.32,0]],.027,rubber);
  tube(plumbing,[[-.24,.13,.095],[-.19,.23,.105],[-.20,.33,.10]],.0035,black);
  if(full){
   const crank=group('crankshaft',e);moving.crank=crank;
   for(const z of [-.034,.034]){cyl(crank,.056,.018,[0,0,z],steel,'z');cyl(crank,.023,.020,[0,-.023,z],cast,'z')}
   cyl(crank,.014,.17,[0,0,0],steel,'z');cyl(crank,.011,.064,[0,.0442,0],steel,'z');
   for(const z of [-.07,.07])torus(crank,.023,.004,[0,0,z],steel);
   const rod=group('connecting-rod',e,[0,.0442,0],[0,.055,0]);moving.rod=rod;
   plate(rod,[[-.011,.013],[-.007,.112],[-.012,.136],[.012,.136],[.007,.112],[.011,.013]],.009,[0,0,0],steel,.001);
   torus(rod,.014,.005,[0,0,0],steel);torus(rod,.008,.003,[0,.145,0],steel);
   const piston=group('piston',e,[0,.1892,0],[0,.10,0]);piston.rotation.z=-.13;moving.piston=piston;
   cyl(piston,.0396,.038,[0,0,0],steel);for(const y of [.006,.011,.016])torus(piston,.0395,.0008,[0,y,0],black,'y');
   cyl(piston,.007,.081,[0,-.006,0],cast,'z');
   for(const [name,x] of [['intake-valve',-.023],['exhaust-valve',.023]]){const valve=group(name,cylRoot,[x,.231,0],[x*2,.39,0]);moving[name]=valve;cyl(valve,.0028,.056,[0,.018,0],steel);cyl(valve,.0155,.004,[0,-.012,0],steel,'y',.013);const pts=[];for(let i=0;i<=120;i++){const a=i/120*PI*14;pts.push([Math.cos(a)*.007,.026+i/120*.025,Math.sin(a)*.007])}tube(valve,pts,.0012,steel,detail===2?180:90,5)}
   const cam=group('camshaft',cylRoot,[0,.326,0],[0,.41,0]);cyl(cam,.008,.105,[0,0,0],steel,'x');for(const x of [-.024,.024])ellipsoid(cam,[.008,.016,.012],[x,.003,0],steel);
   const gears=group('transmission-gears',e,[-.16,-.015,0],[0,0,-.27]);
   for(const z of [-.045,-.015,.015,.045]){cyl(gears,.039,.014,[0,0,z],steel,'z');for(let i=0;i<24;i++){const a=i/24*2*PI;box(gears,[.008,.005,.013],[Math.cos(a)*.041,Math.sin(a)*.041,z],steel,[0,0,a])}}cyl(gears,.011,.15,[0,0,0],steel,'z');
  }
  const header=group('exhaust-header',e,[0,0,0],[.22,0,.16]);tube(header,[[.077,.29,.016],[.15,.27,.03],[.22,.16,.05],[.245,-.04,.08],[.19,-.13,.12],[-.07,-.14,.16]],.021,exhaustMat,curve*2,detail===2?20:12);cyl(header,.033,.016,[.083,.29,.016],steel,'x');
  const guard=group('header-heat-shield',e);plate(guard,[[-.035,-.105],[-.05,.075],[-.025,.12],[.027,.11],[.044,-.095]],.012,[.21,.10,.09],black,.006);for(const y of [.03,.17])bolt(guard,[.21,y,.103],.004);
  return e;
 }
 if(engineOnly)engine(root,[.07,.14,0],true);
 else {
  const chassis=group('frame',root,[0,0,0],[0,.05,-.33]);
  for(const z of [-.12,.12]){tube(chassis,[[-.72,.78,z],[-.4,.73,z],[.38,.86,z],[.47,.94,z]],.018,black);tube(chassis,[[.47,.94,z],[.38,.66,z],[.22,.26,z],[-.28,.25,z],[-.40,.46,z]],.018,black);beam(chassis,[-.4,.73,z],[-.25,.30,z],.017,black);beam(chassis,[-.67,.77,z],[-.4,.49,z],.017,black);beam(chassis,[-.4,.49,z],[.37,.84,z],.014,black)}
  for(const x of [-.6,-.35,.3])beam(chassis,[x,.65,-.12],[x,.65,.12],.016,black);
  const swing=group('swingarm',root,[0,0,0],[0,-.14,-.14]);for(const z of [-.105,.105]){beam(swing,[-.27,.33,z],[-.709,.324,z],.025,black);bolt(swing,[-.27,.33,z*1.2],.015)}
  function wheel(name,x,r,w,rimRadius){const g=group(name,root,[x,r,0],[Math.sign(x)*.40,0,0]);
   const profile=[[rimRadius+.004,-w*.43],[rimRadius+.025,-w*.50],[r-.025,-w*.51],[r-.006,-w*.32],[r,0],[r-.006,w*.32],[r-.025,w*.51],[rimRadius+.025,w*.5],[rimRadius+.004,w*.43],[rimRadius+.004,-w*.43]].map(p=>new T.Vector2(...p));
   const tyreCurve=new T.CatmullRomCurve3(profile.map(p=>new T.Vector3(p.x,p.y,0)),false,'centripetal');const tyreProfile=tyreCurve.getPoints(detail===2?60:32).map(p=>new T.Vector2(p.x,p.y));const tyreGeo=new T.LatheGeometry(tyreProfile,detail===2?128:80);tyreGeo.rotateX(PI/2);mesh(g,tyreGeo,rubber);
   for(const z of [-w*.45,w*.45]){torus(g,rimRadius,.007,[0,0,z],black);torus(g,rimRadius+.004,.0015,[0,0,z],steel);torus(g,r-.03,.0007,[0,0,z*.98],tread)}
   cyl(g,.047,w+.025,[0,0,0],black,'z');cyl(g,.013,w+.08,[0,0,0],steel,'z');
   for(let i=0;i<10;i++){const a=i/10*2*PI;for(const z of [-1,1]){const p=plate(g,[[.043,-.013],[rimRadius-.011,-.009],[rimRadius-.003,.004],[.13,.004],[.065,.013]],.013,[0,0,z*w*.32],black,.002);p.rotation.z=a;beam(g,[Math.cos(a)*.09,Math.sin(a)*.09,z*(w*.32+.008)],[Math.cos(a)*(rimRadius-.012),Math.sin(a)*(rimRadius-.012),z*(w*.32+.008)],.0023,steel,6)}}
   for(let i=0;i<52;i++){const a=i/52*2*PI;for(const side of [-1,1]){const pts=[];for(let j=0;j<=6;j++){const t=j/6,z=side*(.008+t*w*.40),aa=a+.065*Math.sin(t*PI*.8),rr=r-.012*t*t+.00015;pts.push([Math.cos(aa)*rr,Math.sin(aa)*rr,z])}tube(g,pts,.0012,tread,8,4)}}
   // Raised sidewall rings and valve stem.
   beam(g,[0,-rimRadius,w*.44],[0,-rimRadius+.019,w*.44],.0025,black);return g;
  }
  wheel('front-wheel',.709,.332,.103,.237);wheel('rear-wheel',-.709,.324,.145,.224);
  const brakes=group('brakes',root,[0,0,0],[0,0,.36]);
  for(const [x,y,r,z] of [[.709,.332,.16,.072],[-.709,.324,.12,.087]]){
   const shape=new T.Shape();shape.absarc(0,0,r,0,2*PI,false);const center=new T.Path();center.absarc(0,0,r*.65,0,2*PI,true);shape.holes.push(center);for(let i=0;i<36;i++){const a=i/36*2*PI,h=new T.Path();h.absarc(Math.cos(a)*r*.84,Math.sin(a)*r*.84,.003,0,2*PI,true);shape.holes.push(h)}mesh(brakes,new T.ExtrudeGeometry(shape,{depth:.003,bevelEnabled:false,curveSegments:detail===2?8:5}),steel,[x,y,z]);
   for(let i=0;i<6;i++){const a=i/6*2*PI;beam(brakes,[x+Math.cos(a)*.035,y+Math.sin(a)*.035,z],[x+Math.cos(a+.16)*r*.70,y+Math.sin(a+.16)*r*.70,z],.008,black);bolt(brakes,[x+Math.cos(a)*r*.65,y+Math.sin(a)*r*.65,z+.003],.003)}
   plate(brakes,[[-.03,-.045],[-.03,.04],[.019,.047],[.03,-.04]],.035,[x-.115,y+.04,z+.015],cast,.003);bolt(brakes,[x-.12,y+.065,z+.036],.005);bolt(brakes,[x-.12,y+.012,z+.036],.005);
  }
  const fork=group('front-fork',root,[0,0,0],[.4,.18,0]);
  for(const z of [-.105,.105]){beam(fork,[.709,.332,z],[.575,.73,z],.019,steel);beam(fork,[.575,.73,z],[.495,.99,z],.025,black);beam(fork,[.704,.35,z],[.65,.51,z],.028,cast);bolt(fork,[.709,.332,z*1.23],.012);cyl(fork,.026,.012,[.495,.997,z],steel);box(fork,[.025,.087,.012],[.588,.674,z*1.24],amber,[0,0,-.30]);}
  for(const [x,y] of [[.52,.91],[.495,.99]])beam(fork,[x,y,-.138],[x,y,.138],.022,black);
  const fender=group('front-fender',root,[0,0,0],[.18,.22,0]);band(fender,.709,.332,.352,.132,.33,2.97,paint);for(const z of [-.066,.066]){beam(fender,[.66,.45,z],[.56,.625,z],.009,black);bolt(fender,[.60,.58,z],.004)}
  const rear=group('rear-fender-and-tail',root,[0,0,0],[-.24,.19,0]);band(rear,-.709,.324,.39,.174,.26,2.7,paint);plate(rear,[[-.87,.73],[-1.0,.60],[-1.07,.51],[-1.095,.45],[-1.06,.46],[-.96,.65]],.12,[0,0,0],black,.003);box(rear,[.023,.044,.12],[-.86,.756,0],red,[0,0,.06]);box(rear,[.015,.075,.12],[-1.027,.52,0],black,[0,0,-.4]);
  const shocks=group('rear-suspension',root,[0,0,0],[-.1,.08,.33]);for(const z of [-.163,.163]){const a=V([-.69,.34,z]),b=V([-.485,.735,z]),dir=b.clone().sub(a).normalize(),side=new T.Vector3(dir.y,-dir.x,0);beam(shocks,a.toArray(),b.toArray(),.012,steel);const pts=[];for(let i=0;i<=240;i++){const t=i/240,pt=a.clone().lerp(b,.12+.76*t).addScaledVector(side,.024*Math.cos(t*PI*22));pt.z+=.024*Math.sin(t*PI*22);pts.push(pt.toArray())}tube(shocks,pts,.0037,black,detail===2?240:132,6);for(const t of [.10,.89]){const p=a.clone().lerp(b,t);const o=cyl(shocks,.029,.016,p.toArray(),steel);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir)}bolt(shocks,b.toArray(),.012);}
  // Smooth longitudinal lofts retain a continuous tank highlight.
  const tank=group('fuel-tank',root,[0,0,0],[0,.48,0]);
  const profile=[[-.33,.82,.012,.025],[-.27,.845,.095,.065],[-.16,.875,.175,.105],[.02,.88,.205,.124],[.19,.875,.19,.122],[.29,.85,.12,.10],[.34,.825,.008,.03]];
  const spline=new T.CatmullRomCurve3(profile.map(([x,cy,w])=>new T.Vector3(x,cy,w)),false,'catmullrom',.25),heightSpline=new T.CatmullRomCurve3(profile.map(([x,cy,w,h])=>new T.Vector3(x,h,0)),false,'catmullrom',.25);
  const nx=detail===2?100:60,nt=detail===2?64:40,vs=[],is=[],uv=[];
  for(let i=0;i<=nx;i++){const t=i/nx,p=spline.getPoint(t),h=heightSpline.getPoint(t).y;for(let j=0;j<=nt;j++){const a=j/nt*PI*2;vs.push(p.x,p.y+Math.cos(a)*h,p.z*Math.sin(a));uv.push(t,j/nt)}}for(let i=0;i<nx;i++)for(let j=0;j<nt;j++){const a=i*(nt+1)+j,b=a+nt+1;is.push(a,a+1,b,b,a+1,b+1)}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vs,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(is);geo.computeVertexNormals();mesh(tank,geo,paint);
  cyl(tank,.036,.008,[.05,1.005,0],steel);cyl(tank,.029,.006,[.05,1.012,0],black);bolt(tank,[.05,1.016,0],.005,'y');
  for(const side of [-1,1]){const v=[],u=[],indices=[],n=32,k=12;for(let i=0;i<=n;i++){const t=.25+i/n*.49,p=spline.getPoint(t),h=heightSpline.getPoint(t).y;for(let j=0;j<=k;j++){const yy=-.66+j/k*1.28;v.push(p.x,p.y+h*yy,side*(p.z*Math.sqrt(1-yy*yy)+.0007));u.push(side===1?i/n:1-i/n,1-j/k)}}for(let i=0;i<n;i++)for(let j=0;j<k;j++){const a=i*(k+1)+j,b=a+k+1;indices.push(a,b,a+1,b,b+1,a+1)}const d=new T.BufferGeometry();d.setAttribute('position',new T.Float32BufferAttribute(v,3));d.setAttribute('uv',new T.Float32BufferAttribute(u,2));d.setIndex(indices);d.computeVertexNormals();mesh(tank,d,decal)}
  const seat=group('stepped-seat',root,[0,0,0],[-.12,.35,0]);
  // Cushion loft: narrow at the tank, widened and raised for the pillion.
  const sections=[[-.86,.793,.06,.014],[-.81,.823,.135,.032],[-.65,.828,.155,.038],[-.53,.815,.15,.036],[-.44,.774,.138,.035],[-.30,.769,.12,.029],[-.23,.789,.078,.02],[-.21,.793,.025,.009]];
  const sc=new T.CatmullRomCurve3(sections.map(([x,y,w])=>new T.Vector3(x,y,w)),false,'catmullrom',.15),sh=new T.CatmullRomCurve3(sections.map(([x,y,w,h])=>new T.Vector3(x,h,0)),false,'catmullrom',.15),sp=[],si=[];
  for(let i=0;i<=64;i++){const p=sc.getPoint(i/64),h=sh.getPoint(i/64).y;for(let j=0;j<=32;j++){const a=j/32*2*PI;sp.push(p.x,p.y+h*Math.cos(a),p.z*Math.sin(a))}}for(let i=0;i<64;i++)for(let j=0;j<32;j++){const a=i*33+j,b=a+33;si.push(a,a+1,b,b,a+1,b+1)}const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));sg.setIndex(si);sg.computeVertexNormals();mesh(seat,sg,seatMat);
  for(const z of [-1,1]){const path=sections.slice(1,-1).map(([x,y,w,h])=>[x,y+h*.45,z*w*.89]);tube(seat,path,.0008,seam);tube(seat,[[-.80,.76,z*.173],[-.70,.78,z*.185],[-.55,.765,z*.18],[-.45,.71,z*.15]],.012,black)}
  const seamX=-.535;for(const x of [seamX-.004,seamX+.004])tube(seat,[[x,.804,-.134],[x,.84,-.09],[x,.849,0],[x,.84,.09],[x,.804,.134]],.0007,seam);
  const panels=group('side-panels',root,[0,0,0],[0,.02,.43]);for(const side of [-1,1]){plate(panels,[[-.53,.71],[-.22,.725],[-.18,.686],[-.39,.505],[-.48,.55]],.017,[0,0,side*.141],paint,.006);const d=mesh(panels,new T.PlaneGeometry(.31,.173),panelDecal,[-.365,.624,side*.158]);if(side<0)d.rotation.y=PI;bolt(panels,[-.39,.516,side*.158],.004)}
  const e=engine(root,[.035,.37,0],false);
  const exhaust=group('silencer',root,[0,0,0],[-.2,0,.45]);const muffler=cyl(exhaust,.052,.57,[-.52,.325,.222],black,'x',.066);muffler.rotation.z=PI/2-.09;cyl(exhaust,.049,.025,[-.809,.351,.222],cast,'x');cyl(exhaust,.031,.028,[-.823,.351,.222],black,'x');torus(exhaust,.031,.003,[-.84,.351,.222],cast,'x');tube(exhaust,[[-.035,.23,.16],[-.19,.245,.20],[-.245,.296,.222]],.026,exhaustMat);beam(exhaust,[-.54,.38,.20],[-.51,.49,.17],.016,black);bolt(exhaust,[-.51,.49,.18],.007);
  const bars=group('handlebars-and-instruments',root,[0,0,0],[.08,.45,0]);tube(bars,[[.44,1.04,-.38],[.40,1.07,-.25],[.45,1.04,-.12],[.48,1.02,0],[.45,1.04,.12],[.40,1.07,.25],[.44,1.04,.38]],.011,black);
  for(const side of [-1,1]){beam(bars,[.418,1.052,side*.29],[.44,1.04,side*.40],.017,rubber);for(let j=0;j<12;j++)torus(bars,.0175,.0006,[.422+j*.0015,1.05-j*.0008,side*(.30+j*.008)],black);box(bars,[.045,.037,.037],[.417,1.06,side*.265],black);tube(bars,[[.445,1.065,side*.265],[.48,1.06,side*.29],[.48,1.045,side*.39]],.005,steel);beam(bars,[.415,1.08,side*.265],[.43,1.22,side*.31],.005,black);beam(bars,[.43,1.22,side*.31],[.46,1.28,side*.36],.005,black);const mirrorGroup=group('mirror-'+side,bars,[.46,1.28,side*.36]);cyl(mirrorGroup,.044,.017,[0,0,0],black,'x');cyl(mirrorGroup,.038,.001,[-.009,0,0],mirror,'x');}
  const speedo=group('instrument',bars,[.51,1.025,0]);speedo.rotation.z=.34;cyl(speedo,.045,.038,[0,0,0],black);cyl(speedo,.039,.002,[0,.020,0],lens);torus(speedo,.040,.002,[0,.022,0],cast,'y');
  const lamp=group('headlamp',root,[.65,.90,0],[.45,.22,0]);cyl(lamp,.084,.105,[0,0,0],black,'x',.075);torus(lamp,.082,.005,[.055,0,0],steel,'x');cyl(lamp,.075,.004,[.058,0,0],lens,'x');torus(lamp,.067,.002,[.061,0,0],led,'x');box(lamp,[.004,.009,.13],[.063,0,0],led);for(const y of [-.036,.032])box(lamp,[.004,.013,.072],[.064,y,0],cast);
  const acc=group('controls-and-fittings',root,[0,0,0],[0,0,-.40]);
  for(const z of [-1,1]){beam(acc,[.62,.80,z*.10],[.62,.80,z*.18],.006,black);cyl(acc,.016,.021,[.63,.80,z*.19],cast,'x');cyl(acc,.011,.002,[.642,.80,z*.19],led,'x');beam(acc,[-.94,.65,z*.08],[-.94,.65,z*.17],.006,black);cyl(acc,.016,.02,[-.95,.65,z*.18],cast,'x');cyl(acc,.011,.002,[-.962,.65,z*.18],amber,'x');
   beam(acc,[-.19,.29,z*.15],[-.19,.29,z*.26],.012,cast);beam(acc,[-.19,.29,z*.20],[-.19,.29,z*.29],.016,rubber);for(let i=0;i<6;i++)box(acc,[.036,.002,.003],[-.19,.307,z*(.21+i*.013)],black);
   tube(acc,[[.40,.70,z*.13],[.43,.62,z*.255],[.24,.39,z*.255],[.10,.28,z*.14]],.015,black);
   tube(acc,[[.42,1.05,z*.25],[.39,.94,z*.20],[.49,.79,z*.125],[.61,.38,z*.125]],.003,rubber);
  }
  const cooler=group('oil-cooler',root,[.29,.49,0]);box(cooler,[.035,.128,.135],[0,0,0],black);for(let i=0;i<12;i++)box(cooler,[.037,.002,.129],[.002,-.057+i*.01,0],cast);
  const chain=group('chain-and-sprocket',root,[0,0,0],[0,0,-.35]);torus(chain,.104,.006,[-.709,.324,-.10],steel);for(let i=0;i<6;i++){const a=i/6*2*PI;beam(chain,[-.709,.324,-.1],[-.709+Math.cos(a)*.10,.324+Math.sin(a)*.10,-.1],.008,black)}const chainPath=new T.CatmullRomCurve3([[-.709,.429,-.112],[-.255,.385,-.112],[-.225,.34,-.112],[-.255,.295,-.112],[-.709,.219,-.112],[-.815,.324,-.112]].map(V),true,'centripetal');for(let i=0;i<100;i++){const p=chainPath.getPoint(i/100);box(chain,[.009,.006,.009],p.toArray(),steel,[0,0,Math.atan2(chainPath.getTangent(i/100).y,chainPath.getTangent(i/100).x)])}
  beam(acc,[-.23,.30,-.125],[-.33,.025,-.26],.011,black);box(acc,[.05,.008,.03],[-.33,.025,-.26],black);
 }
 // Material batching happens inside named groups only: articulation is retained.
 root.traverse(g=>{if(!g.isGroup)return;const buckets=new Map();for(const o of [...g.children])if(o.isMesh){if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material).push(o)}for(const [material,list] of buckets){if(list.length<2)continue;const geos=list.map(o=>{o.updateMatrix();let geo=o.geometry.clone().applyMatrix4(o.matrix);if(!geo.getAttribute('uv'))geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.getAttribute('position').count*2),2));if(!geo.index){const arr=Array.from({length:geo.getAttribute('position').count},(_,i)=>i);geo.setIndex(arr)}return geo});const merged=mergeGeometries(geos);if(merged){list.forEach(o=>{g.remove(o);o.geometry.dispose()});const m=mesh(g,merged,material);m.name=g.name+'__'+material.name.replaceAll(' ','_')}geos.forEach(x=>x.dispose())}});
 root.updateMatrixWorld(true);
 const clips=[];
 if(engineOnly){
  const times=[],pistonPos=[],rodPos=[],rodQ=[],crankQ=[],intakePos=[],exhaustPos=[];
  const axis=new T.Vector3(Math.sin(.13),Math.cos(.13),0);
  for(let i=0;i<=96;i++){
   const angle=i/96*4*PI,r=.0442,l=.145,pin=new T.Vector3(r*Math.sin(angle),r*Math.cos(angle),0);
   const projection=pin.dot(axis),perpendicularSq=pin.lengthSq()-projection*projection;
   const end=axis.clone().multiplyScalar(projection+Math.sqrt(l*l-perpendicularSq));
   const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),end.clone().sub(pin).normalize());
   times.push(i/96*4);pistonPos.push(...end.toArray());rodPos.push(...pin.toArray());rodQ.push(...q.toArray());
   crankQ.push(...new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),-angle).toArray());
   const deg=i/96*720;intakePos.push(-.023,.231-(deg<180?.009*Math.sin(deg/180*PI):0),0);exhaustPos.push(.023,.231-(deg>540?.009*Math.sin((deg-540)/180*PI):0),0);
  }
  moving.piston.position.fromArray(pistonPos);moving.rod.position.fromArray(rodPos);moving.rod.quaternion.fromArray(rodQ);
  clips.push(new T.AnimationClip('Four-stroke study - 30 rpm',4,[new T.VectorKeyframeTrack(moving.piston.uuid+'.position',times,pistonPos),new T.VectorKeyframeTrack(moving.rod.uuid+'.position',times,rodPos),new T.QuaternionKeyframeTrack(moving.rod.uuid+'.quaternion',times,rodQ),new T.QuaternionKeyframeTrack(moving.crank.uuid+'.quaternion',times,crankQ),new T.VectorKeyframeTrack(moving['intake-valve'].uuid+'.position',times,intakePos),new T.VectorKeyframeTrack(moving['exhaust-valve'].uuid+'.position',times,exhaustPos)]));
 }
 return {root,clips};
}
