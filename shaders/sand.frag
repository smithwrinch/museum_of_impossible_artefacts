// defining Blending functions
#define Blend(base, blend, funcf) 		vec4(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b), funcf(base.a, blend.a))
#define BlendAddthird(base, blend) 		min(base + (blend*0.3), vec4(1.0))
#define BlendAddtenth(base, blend) 		min(base + (blend*0.06), vec4(1.0))


// distance calculation between two points on the Y-plane
float dist(vec2 p0, vec2 pf){
     return sqrt((pf.y-p0.y)*(pf.y-p0.y));
}

////////////////////////////////////////////////////////////////////////////////////////////////////
precision mediump float;
uniform vec2 resolution;
uniform vec2 mouse;
uniform highp float time;
uniform vec3 player_pos;
uniform float level;

// FRAGMENT SHADER

void addSand()
{


    vec4 sandcolor = vec4(0.9606, 0.6601, 0.1445, 1.0);

    vec4 sandtexture = texture(rand(gl_FragCoord), gl_FragCoord  / resolution.xy);

    vec4 sandspecular = texture(rand(gl_FragCoord), gl_FragCoord  / iResolution.xy);

	  sandspecular.xyz = sandspecular.xxx*sandspecular3.yyy*sandspecular2.zzz*vec3(2,2,2);

    float d = abs(gl_FragCoord.y - ((1.3 + sin(time))*200.0));

    d = d*0.003;

    d = pow(d,0.6);

    d = min(d,1.0);

    vec4 sandbase = BlendAddtenth(sandcolor,sandtexture);

  	vec4 darkensand = mix(sandtexture,vec4(0,0,0,0), d);

    vec4 gradientgen = mix(sandspecular, darkensand, d);

    vec4 finalmix = BlendAddthird(sandbase, gradientgen);

    color = finalmix;

}
precision mediump float;
uniform vec2 resolution;
uniform vec2 mouse;
uniform highp float time;
uniform vec3 player_pos;
uniform float level;
float rand(vec2 pos) {
        return sin(sin(dot(pos,vec2(time, time*10000.0)))* time * 10000000.);
}
void main(){
  if(level == 0.){
    vec2 pos = gl_gl_FragCoord.xy/resolution;
    vec2 intPart = vec2(0.);
    vec2 floatPart = vec2(0.);
    floatPart=fract(pos);
    vec3 colour = vec3(rand(floatPart));
    gl_FragColor = vec4(colour,1.0);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
