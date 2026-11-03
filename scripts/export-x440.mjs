import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,weld,prune,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import validator from 'gltf-validator';
import {createAsset} from './x440-geometry.mjs';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(repo,'public/models/x440');
await fs.mkdir(output,{recursive:true});
if(process.platform==='win32'&&!process.env.FONTCONFIG_FILE){const cache=path.join(repo,'.cache/fontconfig');await fs.mkdir(cache,{recursive:true});const config=path.join(cache,'fonts.conf');await fs.writeFile(config,`<?xml version="1.0"?><fontconfig><dir>${(process.env.WINDIR||'C:/Windows').replaceAll('\\','/')}/Fonts</dir><cachedir>${cache.replaceAll('\\','/')}</cachedir></fontconfig>`);process.env.FONTCONFIG_FILE=config;}
const {default:sharp}=await import('sharp');
// Browser-independent binary export; no GPU or external image services needed.
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})}readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result='data:'+blob.type+';base64,'+Buffer.from(result).toString('base64');this.onloadend?.()})}};
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const svg=(body,w=1024,h=512)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const textures={
 'Tank graphics':await sharp(svg(`<path d="M45 451 L150 75 Q160 50 205 50 H902 Q970 50 954 120 L873 395 Q866 428 825 430 Z" fill="#34383d" stroke="#a17853" stroke-width="5"/><path d="M110 442 L225 57 M162 438 L277 57" stroke="#73777b" stroke-width="27" opacity=".75"/><g transform="translate(425,183) skewX(-12)"><text font-family="Arial" font-style="italic" font-weight="bold" font-size="62" fill="#dddcd6">HARLEY-</text><text y="61" font-family="Arial" font-style="italic" font-weight="bold" font-size="62" fill="#dddcd6">DAVIDSON</text><text x="343" y="38" font-family="Arial" font-weight="bold" font-size="119" fill="#b65f29" stroke="#c8aa82" stroke-width="2">X</text><text x="351" y="88" font-family="Arial" font-weight="bold" font-size="41" fill="#ceae83">440</text></g>`)).png().toBuffer(),
 'Side panel graphics':await sharp(svg(`<path d="M75 62 L944 84 Q985 89 952 130 L517 451 Q490 475 464 454 Z" fill="#303438" stroke="#956f4f" stroke-width="5"/><path d="M165 88 L385 358 M263 88 L435 301 M352 88 L484 254" stroke="#666b70" stroke-width="33" opacity=".6"/>`)).png().toBuffer(),
 'Engine emblem':await sharp(svg(`<g fill="none" stroke="#d9d3c7" stroke-width="12"><path d="M160 195 H350 V300 H160 Z"/><path d="M193 195 V151 Q256 177 319 151 V195 M193 300 Q256 376 319 300"/></g><text x="255" y="265" text-anchor="middle" fill="#ddd6c7" font-family="Arial" font-weight="bold" font-size="31">MOTOR</text>`,512,512)).png().toBuffer()
};
const reports=[];
for(const engineOnly of [false,true])for(const detail of [2,1]){
 const kind=engineOnly?'engine':'bike',variant=detail===2?'master':'web',name=`x440-${kind}-${variant}.glb`;
 const {root,clips}=createAsset({engineOnly,detail});
 const bytes=await new GLTFExporter().parseAsync(root,{binary:true,animations:clips,onlyVisible:true,trs:true});
 const doc=await io.readBinary(new Uint8Array(bytes));
 for(const material of doc.getRoot().listMaterials())if(textures[material.getName()]){const texture=doc.createTexture(material.getName()).setImage(textures[material.getName()]).setMimeType('image/png');material.setBaseColorTexture(texture).setAlphaMode('MASK').setAlphaCutoff(.35).setDoubleSided(true);}
 for(const mesh of doc.getRoot().listMeshes())for(const primitive of mesh.listPrimitives())if(!primitive.getMaterial()?.getBaseColorTexture())primitive.setAttribute('TEXCOORD_0',null);
 await doc.transform(dedup(),weld(),prune({keepAttributes:true,keepLeaves:true}));
 if(variant==='web')await doc.transform(meshopt({encoder:MeshoptEncoder,level:'high'}));
 const encoded=await io.writeBinary(doc);await fs.writeFile(path.join(output,name),encoded);
 const validation=await validator.validateBytes(encoded,{uri:name,maxIssues:100});
 await fs.writeFile(path.join(output,name.replace('.glb','.validation.json')),JSON.stringify(validation,null,2));
 let triangles=0,primitives=0;for(const mesh of doc.getRoot().listMeshes())for(const p of mesh.listPrimitives()){primitives++;triangles+=(p.getIndices()?.getCount()??p.getAttribute('POSITION')?.getCount()??0)/3}
 const report={file:name,bytes:encoded.byteLength,triangles,primitives,nodes:doc.getRoot().listNodes().length,materials:doc.getRoot().listMaterials().length,textures:doc.getRoot().listTextures().length,animations:doc.getRoot().listAnimations().map(a=>a.getName()),errors:validation.issues.numErrors,warnings:validation.issues.numWarnings,extensions:doc.getRoot().listExtensionsUsed().map(e=>e.extensionName)};
 reports.push(report);console.log(JSON.stringify(report));
 root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});
 if(report.errors)throw new Error(`${name}: ${report.errors} glTF validation errors`);
}
await fs.writeFile(path.join(output,'manifest.json'),JSON.stringify({created:'2026-11-03',units:'metres',orientation:{up:'+Y',forward:'+X'},assets:reports,disclosure:'Reference-informed artistic reconstruction, not manufacturer CAD. Hidden engine geometry and valve motion are illustrative. Bike master includes the exterior engine; separate engine includes internals.'},null,2));
