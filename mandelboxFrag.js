export default `
precision highp float;
// COPYRIGHT INFO MOVED TO THE END OF THE FILE AFTER SOURCE!
// Moved for the sake of editing convenience here:
// - http://www.kinostudios.com/mandelbulb.html

#define HALFPI 1.570796
#define PI 3.141592653

#define MIN_EPSILON 6e-7
#define MIN_NORM 1.5e-7

#define MAX_ITERATIONS 4
#define minRange 6e-5

// 10 a 200  "The maximum number of steps a ray should take."
#define STEP_LIMIT 200

// viewMatrix and cameraPosition are automatically included by THREE.js
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform float time;
varying vec3 rayDir;

const float width=600.0;//=512;
const float height=600.0;//=512;
const float pixelSize=1.0;//width/height;//1.0;
const int   antialiasing=0;//"Super sampling quality. Number of samples squared per pixel.";
const bool  phong=true;
const float shadows=0.0;
const float ambientOcclusion=0.9; //0.9
const float ambientOcclusionEmphasis=.98; //0.98"Emphasise the structure edges based on the number of steps it takes to reach a point in the fractal.";
const float bounding=4.; //1->16 "Sets the bounding sphere radius to help accelerate the raytracing.";
const float bailout=.7; //0.5->12 //"Sets the bailout value for the fractal calculation. Lower values give smoother less detailed results.";
//bailout orig 5
const float power=4.;//=8.0;//-20->20 // Power of fractal

const vec3  light=vec3(38.0, -42.0, 38.0);
const vec4  backgroundColor=vec4(0.0, 0.0, 0.0,1.0);
const vec4  diffuseColor=vec4(0.5, 0.5, 0.5,1.0);
const vec4  ambientColor=vec4(0.5, 0.5, 0.5,1.);
const vec4  lightColor=vec4(1., 1., 1.,0.0);
const float colorSpread=0.;//=0.2; // 0 -> // varier les couleurs
const float rimLight=0.0;
const float specularity=0.66; //0.66
const float specularExponent=.5; //15

const float epsilonScale=1.0; // 0 a 1  "Scale the epsilon step distance. Smaller values are slower but will generate smoother results for thin areas.";

const float phasex = 0.;
const float phasey = 0.;

const vec2 size = vec2(width, height);
const float aspectRatio = size.x / size.y;
// vec3 eye = (modelMatrix * vec4(cameraPosition, 1)).xyz;

// Super sampling
const float sampleStep = 1.0 / float(antialiasing + 1);
const float sampleContribution = 1.0 / pow(float(antialiasing + 1), 2.0);
const float pixel_scale = 1.0 / max(size.x, size.y);

// FROM: http://www.fractalforums.com/index.php?topic=16793.msg64299#msg64299

//THIS CREATES THE FRACTAL
/*

J. C. Hart, D. J. Sandin, and L. H. Kauffman. 1989.
Ray tracing deterministic 3-D fractals
DOI:https://doi.org/10.1145/74334.74363
ORIGINAL PAPER ------^

*/

float DE(vec3 pos, inout float min_dist){
	float DEfactor = 5.;
	float scale = .1;

	float fixedRadius = 4.0;
	float fR2 = fixedRadius * fixedRadius;
	float minRadius = 0.5;
	float mR2 = minRadius * minRadius;
	float x = pos.x;
	float y = pos.y;
	float z = pos.z;

	vec3 c = vec3(0.,0.,0.);

	for (int n = 0; n < MAX_ITERATIONS; n++) {


		if (x > 1.0)
		x = 2.0 - x;
		else if (x < -1.0) x = -2.0 - x;
		if (y > 1.0)
		y = 2.0 - y;
		else if (y < -1.0) y = -2.0 - y;
		if (z > 1.0)
		z = 2.0 - z;
		else if (z < -1.0) z = -2.0 - z;

		float r2 = x*x + y*y + z*z;

		if (r2 < mR2)
		{
			 x = x * fR2 / mR2;
			 y = y * fR2 / mR2;
			 z = z * fR2 / mR2;
			 DEfactor = DEfactor * fR2 / mR2;
		}
		else if (r2 < fR2)
		{
			 x = x * fR2 / r2;
			 y = y * fR2 / r2;
			 z = z * fR2 / r2;
			 DEfactor *= fR2 / r2;
		}

		x = x * scale + c.x;
		y = y * scale + c.y;
		z = z * scale + c.z;
		DEfactor *= scale;


	}
	float distance = sqrt(x*x+y*y+z*z)/abs(DEfactor);
	min_dist = min(min_dist, distance); //minimum distance (to be used later)
	return distance;
}

//if the camera hits the sphere that surrounds the fractal
bool intersectBoundingSphere(vec3 origin,
    vec3 direction,
    out float tmin,
    out float tmax)
{
    bool hit = false;

    float b = dot(origin, direction);
    float c = dot(origin, origin) - bounding*bounding;
    float disc = b*b - c;         // discriminant
    tmin = tmax = 0.0;

    if (disc > 0.0) {
        // Real root of disc, so there is anintersection
        float sdisc = sqrt(disc);

        tmin=max(0.,-b - sdisc);//DE(origin + max(0.,t0) * direction, min_dist);//
        tmax=max(0.,-b + sdisc);//max(0.,t0)+t1;
        hit = true;
    }

    return hit;
}

// Calculate the gradient in each dimension from the intersection point
vec3 estimate_normal(vec3 z, float e)
{
    float min_dst;   // Not actually used in this particular case
    vec3 z1 = z + vec3(e, 0, 0);
    vec3 z2 = z - vec3(e, 0, 0);
    vec3 z3 = z + vec3(0, e, 0);
    vec3 z4 = z - vec3(0, e, 0);
    vec3 z5 = z + vec3(0, 0, e);
    vec3 z6 = z - vec3(0, 0, e);

    float dx = DE(z1, min_dst) - DE(z2, min_dst);
    float dy = DE(z3, min_dst) - DE(z4, min_dst);
    float dz = DE(z5, min_dst) - DE(z6, min_dst);

    return normalize(vec3(dx, dy, dz) / (2.0*e));
}


// Computes the direct illumination for point pt with normal N due to
// a point light at light and a viewer at eye.
vec3 Phong(vec3 pt, vec3 N, out float specular)
{
    vec3 diffuse   = vec3(0);         // Diffuse contribution
    vec3 color   = vec3(0);
    specular = 0.0;

    // vec3 L = normalize(light * objRotation - pt); // find the vector to the light
    vec3 L = normalize((modelMatrix * vec4(light,1)).xyz - pt);
    float  NdotL = dot(N, L);         // find the cosine of the angle between light and normal

    if (NdotL > 0.0) {
        // Diffuse shading
        diffuse = diffuseColor.rgb + abs(N) * colorSpread;
        diffuse *= lightColor.rgb * NdotL;

        // Phong highlight
        vec3 E = normalize(cameraPosition - pt);      // find the vector to the eye
        vec3 R = L - 2.0 * NdotL * N;      // find the reflected vector
        float  RdE = dot(R,E);

        if (RdE <= 0.0) {
            specular = specularity * pow(abs(RdE), specularExponent);
        }
    } else {
        diffuse = diffuseColor.rgb * abs(NdotL) * rimLight;
    }

    return (ambientColor.rgb * ambientColor.a) + diffuse;
}

// Define the ray direction from the pixel coordinates
vec3 rayDirection(vec2 p)
{
    vec3 direction = vec3( 2.0 * aspectRatio * p.x / float(size.x) - aspectRatio,
        -2.0 * p.y / float(size.y) + 1.0,
        // -2.0 * exp(cameraZoom)
        0.0);
    // return normalize(direction * viewRotation * objRotation);
    return normalize((modelViewMatrix * vec4(direction,1)).xyz);
    // return normalize((viewMatrix * vec4(direction,1)).xyz);
}

// Calculate the output colour for each input pixel
vec4 renderPixel(vec3 ray_direction)
{
    float tmin, tmax; //thresholds for intersection
    vec4 pixel_color = backgroundColor;

		//if the light ray intersects bounding sphere
    if (intersectBoundingSphere(cameraPosition, ray_direction, tmin, tmax)) {
        vec3 ray = cameraPosition + tmin * ray_direction;

        float dist, ao;
        float min_dist = 2.0;
        float ray_length = tmin;
        float eps = MIN_EPSILON;

        // number of raymarching steps scales inversely with factor
        int max_steps = int(float(STEP_LIMIT) / epsilonScale);
        int i; //number of steps (used for ambient occlusion)
        float f;

				//this marches the way forward STEP_LIMIT times
        for (int l = 0; l < STEP_LIMIT; ++l) {
            dist = DE(ray, min_dist);

            f = epsilonScale * dist;
            ray += f * ray_direction;
            ray_length += f * dist;

            // Are we within the intersection threshold or completely missed the fractal
						//if so, stop marching
            if (dist < eps || ray_length > tmax) {
                break;
            }

            // Set the intersection threshold as a function of the ray length away from the camera
            //	eps = max(max(MIN_EPSILON, eps_start), pixel_scale * pow(ray_length, epsilonScale));
            eps = max(MIN_EPSILON, pixel_scale * ray_length);
            i++;
        }


        // Found intersection? ie: is the "distance" within the threshold
        if (dist < eps) {
            ao   = 1.0 - clamp(1.0 - min_dist * min_dist, 0.0, 1.0) * ambientOcclusion;

            if (phong) {
                vec3 normal = estimate_normal(ray, eps/2.0);
                float specular = 0.0;
                pixel_color.rgb = Phong(ray, normal, specular);

                if (shadows > 0.0) {
                    // The shadow ray will start at the intersection point and go
                    // towards the point light. We initially move the ray origin
                    // a little bit along this direction so that we don't mistakenly
                    // find an intersection with the same point again.
                    // vec3 light_direction = normalize((light - ray) * objRotation);
                    vec3 light_direction = normalize(modelMatrix * vec4(light - ray, 1)).xyz;
                    ray += normal * eps * 2.0;

                    float min_dist2;
                    dist = 4.0;

                    for (int j = 0; j < STEP_LIMIT; ++j) {
                        dist = DE(ray, min_dist2);

                        // March ray forward
                        f = epsilonScale * dist;
                        ray += f * light_direction;

                        // Are we within the intersection threshold or completely missed the fractal
                        if (dist < eps || dot(ray, ray) > bounding * bounding)
                            break;
                    }

                    // Again, if our estimate of the distance to the set is small, we say
                    // that there was a hit and so the source point must be in shadow.
                    if (dist < eps) {
                        pixel_color.rgb *= 1.0 - shadows;
                    } else {
                        // Only add specular component when there is no shadow
                        pixel_color.rgb += specular;
                    }
                } else {
                    pixel_color.rgb += specular;
                }
            } else {
                // Just use the base colour, ie: no PHONG
                pixel_color.rgb = diffuseColor.rgb;
            }

            ao *= 1.0 - (float(i) / float(max_steps)) * ambientOcclusionEmphasis * 2.0;
            pixel_color.rgb *= ao;
            pixel_color.rgb *= 3.;
            // if (length(pixel_color.rgb) >= 0.98)
            //     pixel_color.r = 0.0;
            pixel_color.a = 1.0;
        }
// THIS IS USED TO DEBUG THE COLOURS
//         else
//         {
//             // some debugging to show the difference
//             vec3 ray2 = eye + tmin * ray_direction;
//             pixel_color.r = DE_blog    (ray2, tmin) / bailout;
//             pixel_color.g = DE_original(ray2, tmin) / bailout;
//             pixel_color.b = DE         (ray2, tmin) / bailout;
//         }
// #endif
}
    else //if pixel does not intersect bounding sphere (ie background image)
    {
        pixel_color = vec4(0,0,0,1);
    }

    return pixel_color;
}

void main() {
    gl_FragColor = renderPixel(normalize(rayDir));
}
`
