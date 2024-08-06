import { describe, expect, it } from 'vitest';

import { transpileShader } from './transpiler.js';

const SHAPE_VERT = [
  '#version 300 es',
  'in vec3 vertexPosition;',
  'in vec4 vertexColor;',
  'uniform mat4 projectionMatrix;',
  'out vec4 fragmentColor;',
  'void main() {',
  ' gl_Position = projectionMatrix * vec4(vertexPosition, 1.0);',
  ' fragmentColor = vertexColor;',
  '}',
].join('\n');

const SHAPE_FRAG = [
  '#version 300 es',
  'precision mediump float;',
  'in vec4 fragmentColor;',
  'out vec4 FragColor;',
  'void main() {',
  ' FragColor = fragmentColor;',
  '}',
].join('\n');

const SHAPE_VERT_GL1 = [
  '#version 100',
  'attribute vec3 vertexPosition;',
  'attribute vec4 vertexColor;',
  'uniform mat4 projectionMatrix;',
  'varying vec4 fragmentColor;',
  'void main() {',
  ' gl_Position = projectionMatrix * vec4(vertexPosition, 1.0);',
  ' fragmentColor = vertexColor;',
  '}',
].join('\n');

const SHAPE_FRAG_GL1 = [
  '#version 100',
  'precision mediump float;',
  'varying vec4 fragmentColor;',
  'void main() {',
  ' gl_FragColor = fragmentColor;',
  '}',
].join('\n');

const IMAGE_VERT = [
  '#version 300 es',
  'in vec3 vertexPosition;',
  'in vec4 vertexColor;',
  'in vec2 vertexUV;',
  'uniform mat4 projectionMatrix;',
  'out vec2 fragUV;',
  'out vec4 fragColor;',
  'void main() {',
  ' gl_Position = projectionMatrix * vec4(vertexPosition, 1.0);',
  ' fragUV = vertexUV;',
  ' fragColor = vertexColor;',
  '}',
].join('\n');

const IMAGE_FRAG = [
  '#version 300 es',
  'precision mediump float;',
  'uniform sampler2D tex;',
  'in vec2 fragUV;',
  'in vec4 fragColor;',
  'out vec4 FragColor;',
  'void main() {',
  ' vec4 texColor = texture(tex, fragUV) * fragColor;',
  ' texColor.rgb *= fragColor.a;',
  ' FragColor = texColor;',
  '}',
].join('\n');

const IMAGE_VERT_GL1 = [
  '#version 100',
  'attribute vec3 vertexPosition;',
  'attribute vec4 vertexColor;',
  'attribute vec2 vertexUV;',
  'uniform mat4 projectionMatrix;',
  'varying vec2 fragUV;',
  'varying vec4 fragColor;',
  'void main() {',
  ' gl_Position = projectionMatrix * vec4(vertexPosition, 1.0);',
  ' fragUV = vertexUV;',
  ' fragColor = vertexColor;',
  '}',
].join('\n');

const IMAGE_FRAG_GL1 = [
  '#version 100',
  'precision mediump float;',
  'uniform sampler2D tex;',
  'varying vec2 fragUV;',
  'varying vec4 fragColor;',
  'void main() {',
  ' vec4 texColor = texture2D(tex, fragUV) * fragColor;',
  ' texColor.rgb *= fragColor.a;',
  ' gl_FragColor = texColor;',
  '}',
].join('\n');

describe('transpiler', () => {
  it('should not convert if the version is not 300', () => {
    const actual = transpileShader(SHAPE_VERT_GL1, 'vert');
    expect(actual).toBe('Found GLSL version 100, but need version 300.');
  });

  it('should convert the shape shaders', () => {
    let actual = transpileShader(SHAPE_VERT, 'vert');
    expect(actual).toBe(SHAPE_VERT_GL1);

    actual = transpileShader(SHAPE_FRAG, 'frag');
    expect(actual).toBe(SHAPE_FRAG_GL1);
  });

  it('should convert the image shaders', () => {
    let actual = transpileShader(IMAGE_VERT, 'vert');
    expect(actual).toBe(IMAGE_VERT_GL1);

    actual = transpileShader(IMAGE_FRAG, 'frag');
    expect(actual).toBe(IMAGE_FRAG_GL1);
  });
});
