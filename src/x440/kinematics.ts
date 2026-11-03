export const TAU = Math.PI * 2;
export const ENGINE = { bore:79.6, stroke:88.4, rod:145, displacement:440 };
export const wrap = (n:number, max:number) => ((n % max) + max) % max;
export const clamp = (n:number,a:number,b:number) => Math.max(a,Math.min(b,n));
export function cycleAt(degrees:number) {
  const angle=wrap(degrees,720), theta=angle*Math.PI/180;
  const r=ENGINE.stroke/2, l=ENGINE.rod;
  const height=r*Math.cos(theta)+Math.sqrt(l*l-r*r*Math.sin(theta)**2);
  const strokeIndex=Math.floor(angle/180);
  const lift=Math.sin((angle%180)/180*Math.PI);
  return {angle,height,displacement:r+l-height,pinX:r*Math.sin(theta),pinY:r*Math.cos(theta),strokeIndex,stroke:['Intake','Compression','Power','Exhaust'][strokeIndex],intake:strokeIndex===0?lift:0,exhaust:strokeIndex===3?lift:0,progress:angle/720};
}
export function advanceAngle(angle:number,rpm:number,dt:number,slow:boolean) {return wrap(angle+rpm*6*dt*(slow?.1:1),720)}
export function rideStep(speed:number,throttle:number,brake:number,dt:number) {return clamp(speed+(throttle*22-brake*42-(throttle?1.8:5))*dt,0,110)}
