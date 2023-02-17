#define SHADER_NAME GLOW_FS

precision mediump float;

uniform sampler2D uMainSampler;

varying vec2 outTexCoord;

uniform float distance;
uniform float outerStrength;
uniform float innerStrength;
uniform vec2 resolution;
uniform vec4 glowColor;
uniform bool knockout;

const float PI = 3.14159265358979323846264;
const float MAX_DIST = 128.0;
const float SIZE = 0.15;

void main ()
{
    vec2 px = vec2(1.0 / resolution.x, 1.0 / resolution.y);

    float totalAlpha = 0.0;

    vec2 direction;
    vec2 displaced;

    for (float angle = 0.0; angle < PI * 2.0; angle += SIZE)
    {
        direction = vec2(cos(angle), sin(angle)) * px;

        for (float curDistance = 0.0; curDistance < MAX_DIST; curDistance++)
        {
            if (curDistance >= distance)
            {
                break;
            }

            displaced = outTexCoord + direction * (curDistance + 1.0);

            totalAlpha += (distance - curDistance) * texture2D(uMainSampler, displaced).a;
        }
    }

    vec4 curColor = texture2D(uMainSampler, outTexCoord);

    float maxAlpha = 42.0 * distance * (distance + 1.0) / 2.0;
    float alphaRatio = (totalAlpha / maxAlpha);

    float innerGlowAlpha = (1.0 - alphaRatio) * innerStrength * curColor.a;
    float innerGlowStrength = min(1.0, innerGlowAlpha);

    vec4 innerColor = mix(curColor, glowColor, innerGlowStrength);

    float outerGlowAlpha = alphaRatio * outerStrength * (1.0 - curColor.a);
    float outerGlowStrength = min(1.0 - innerColor.a, outerGlowAlpha);

    vec4 outerGlowColor = outerGlowStrength * glowColor.rgba;

    if (knockout)
    {
        float resultAlpha = outerGlowAlpha + innerGlowAlpha;

        gl_FragColor = vec4(glowColor.rgb * resultAlpha, resultAlpha);
    }
    else
    {
        gl_FragColor = innerColor + outerGlowColor;
    }
}