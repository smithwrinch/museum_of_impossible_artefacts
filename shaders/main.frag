// defining Blending functions
#define Blend(base, blend, funcf) 		vec3(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b), funcf(base.a, blend.a))
#define BlendAddthird(base, blend) 		min(base + (blend*0.3), vec3(1.0))
#define BlendAddtenth(base, blend) 		min(base + (blend*0.06), vec3(1.0))

precision mediump float;
uniform vec2 resolution;
uniform vec2 mouse;
uniform highp float time;
uniform vec3 player_pos;
uniform float level;
float rand(vec2 pos) {
        return sin(sin(dot(pos,vec2(time, time*10000.0)))* time * 10000000.);
}
vec3 addSand()
{

    vec3 sandcolor = vec3(0.9606, 0.6601, 0.1445);
    vec3 sandtexture = vec3(rand(gl_FragCoord.xy), gl_FragCoord.xy  / resolution.xy);
    vec3 sandspecular = vec3(rand(gl_FragCoord.xy), gl_FragCoord.xy  / resolution.xy);
    sandspecular.xyz = sandspecular.xxx*vec3(2,2,2);
    float d = abs(gl_FragCoord.y - ((1.3 + sin(time))*200.0));
    d = d*0.003;
    d = pow(d,0.6);
    d = min(d,1.0);
    vec3 sandbase = BlendAddtenth(sandcolor,sandtexture);
    vec3 darkensand = mix(sandtexture,vec3(0,0,0), d);
    vec3 gradientgen = mix(sandspecular, darkensand, d);
    vec3 finalmix = BlendAddthird(sandbase, gradientgen);
    return finalmix;
}
void main(){
  if(level == 0.){
    vec2 pos = gl_FragCoord.xy/resolution;
    vec2 intPart = vec2(0.);
    vec2 floatPart = vec2(0.);
    floatPart=fract(pos);
    vec3 colour = vec3(rand(floatPart));
    gl_FragColor = vec4(colour,1.0);
  }
  if(level == 2.){
    gl_FragColor = vec4(addSand(), 1.);
  }
}
