import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const manifest=JSON.parse(await fs.readFile('public/models/x440/manifest.json','utf8'));
for(const asset of manifest.assets){
 const bytes=await fs.readFile('public/models/x440/'+asset.file),doc=await io.readBinary(bytes),root=doc.getRoot();
 assert.equal(bytes.length,asset.bytes);assert.equal(asset.errors,0);assert.equal(asset.warnings,0);
 for(const a of root.listAccessors()){assert.ok(a.getArray().every(Number.isFinite),asset.file+': finite accessors');}
 for(const t of root.listTextures())assert.ok(t.getImage()?.length,asset.file+': embedded images');
 const names=new Set(root.listNodes().map(n=>n.getName()));
 for(const name of asset.file.includes('bike')?['fuel-tank','front-wheel','rear-wheel','engine','side-panels']:['engine','piston','connecting-rod','crankshaft','cylinder-head','clutch-cover','intake-valve','exhaust-valve'])assert.ok(names.has(name),asset.file+': named '+name);
 if(asset.file.includes('engine')){
  assert.equal(root.listAnimations().length,1);const clip=root.listAnimations()[0];assert.equal(clip.listChannels().length,6);
  for(const channel of clip.listChannels()){const sampler=channel.getSampler(),input=sampler.getInput().getArray(),output=sampler.getOutput(),arr=output.getArray(),size=output.getElementSize();assert.equal(input[0],0);assert.equal(input.at(-1),4);for(let j=0;j<size;j++)assert.ok(Math.abs(arr[j]-arr[arr.length-size+j])<.001,'Seamless animation loop');}
 }
 console.log('PASS '+asset.file+': embedded assets, finite geometry, named parts'+(asset.file.includes('engine')?', six-channel loop':''));
}
for(const kind of ['bike','engine']){const master=manifest.assets.find(a=>a.file===`x440-${kind}-master.glb`),web=manifest.assets.find(a=>a.file===`x440-${kind}-web.glb`);assert.ok(web.bytes<master.bytes*.3);assert.ok(web.triangles<master.triangles*.6);console.log(`PASS ${kind}: ${(100*(1-web.bytes/master.bytes)).toFixed(1)}% smaller; ${(100*(1-web.triangles/master.triangles)).toFixed(1)}% fewer triangles`)}
