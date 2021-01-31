
precision highp float;
uniform float time;
uniform vec2 mouse;
// uniform vec2 displaceCenter;
varying vec3 vUv;
varying vec3 myNormal;
float rand(vec2 pos) {
				return sin(sin(dot(pos,vec2(time, position.x)))* time);
}
void main() {
	// myNormal = normal;
  vec3 transformed = vec3(position);


	float dx = position.x + rand(vec2(time, time))*0.05 + sin(time);
	float dy = position.y + rand(vec2(time, time))*0.05 + cos(time);
	//noise to add some realism
	float freq = sqrt(dx*dx + dy*dy);
	float amp = 0.1;
	float angle = -time*10.0+freq*6.0/2.;
	transformed.z += sin(angle)*amp;// *rand(mouse);
	transformed.z += sin(angle+0.2)*amp;// *rand(mouse);
	transformed.z += sin(angle+0.1) * amp;// *rand(mouse);
	myNormal = normalize(transformed);



	vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;

}
