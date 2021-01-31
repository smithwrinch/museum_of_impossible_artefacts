precision highp float;
uniform vec2 resolution;
uniform vec2 mouse;
uniform highp float time;
uniform vec3 camera;
uniform float level;
varying vec3 vUv;
varying vec3 myNormal;
float rand(vec2 pos) {
        return sin(sin(dot(pos,vec2(time, time*10000.0)))* time * 10000000.);
}
void main(){
  // light from the top
 vec3 light = vec3(0.,0.,10.);
 vec3 lightColor = vec3(1.,1.,1.);
 vec3 objectColor = vec3(0., 0.3, 1.);

 //ambience
 float ambientStrength = 0.8;
 vec3 ambient = ambientStrength * lightColor;




 // Get the normal/direction of the light
 light = normalize(light - vUv);

 //specular
 float specularStrength = 0.4;
 vec3 viewDir = normalize(camera - vUv);
 //reflect
 vec3 reflectDir = reflect(-light, myNormal);
 float spec = pow(max(dot(viewDir, reflectDir), 0.0), 2.);
 vec3 specular = specularStrength * spec * lightColor;
 float diff = max(dot(myNormal, light), 0.0);
 vec3 diffuse = diff * lightColor;
 vec3 result = (ambient + diffuse + specular ) * objectColor;
 // float prod = dot(myNormal,light) + ambience;
       // This calculates angle and magnitude of light w.r.t normal.
 gl_FragColor = vec4(result, 0.8);
}
