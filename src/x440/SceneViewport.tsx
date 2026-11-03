import {useLayoutEffect} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {AdaptiveDpr} from '@react-three/drei';
import {LabScene} from './scene';
import type {Telemetry} from './state';
interface Props{host:HTMLElement|null;onCreated:(scene:LabScene)=>void;onSelect:(id:string)=>void;onTelemetry:(t:Telemetry)=>void;onError:(message:string)=>void}
function SceneBridge(props:Props){const {gl,performance}=useThree();useLayoutEffect(()=>{if(!props.host)return;let scene:LabScene|undefined;try{scene=new LabScene(props.host,props.onSelect,props.onTelemetry,props.onError,gl);scene.controls.addEventListener('start',performance.regress);props.onCreated(scene)}catch(error){props.onError('The 3D context could not start. Use the portfolio and engineering notes, or reload the lab.');console.error(error)}return()=>scene?.dispose()},[gl,props.host]);return <AdaptiveDpr/>}
export default function SceneViewport(props:Props){return <Canvas className="xl-fiber-canvas" frameloop="never" dpr={[1,1.5]} performance={{min:.65}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}><SceneBridge {...props}/></Canvas>}
