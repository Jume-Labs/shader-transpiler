// Partly ported from:
// https://github.com/visgl/luma.gl/blob/master/modules/shadertools/src/lib/shader-transpiler/transpile-glsl-shader.ts

type GLSLReplacement = {
  regex: RegExp;
  replacement: string;
};

type Qualifier = 'in' | 'out';

type ShaderExtension = 'vert' | 'frag';

const ES100_REPLACEMENTS: GLSLReplacement[] = [
  {
    regex: /^#version[ \t]+300[ \t]+es/,
    replacement: '#version 100',
  },
  {
    // In GLSL 1 ES these functions are provided by an extension.
    regex: /\btexture(2D|2DProj|Cube)Lod\(/g,
    replacement: 'texture$1LodEXT(',
  },
  // Overloads in GLSL 3.00 map to individual functions. Note that we cannot
  // differentiate between 2D, 2DProj, Cube without type analysis so we choose the most common variant.
  {
    regex: /\btexture\(/g,
    replacement: 'texture2D(',
  },
  {
    regex: /\btextureLod\(/g,
    replacement: 'texture2DLodEXT(',
  },
];

const ES100_VERT_REPLACEMENTS: GLSLReplacement[] = [
  ...ES100_REPLACEMENTS,
  {
    // Replace `in` with `attribute`.
    regex: makeVariableTextRegex('in'),
    replacement: 'attribute $1',
  },
  {
    // Replace `out` with `varying`.
    regex: makeVariableTextRegex('out'),
    replacement: 'varying $1',
  },
];

const ES100_FRAGMENT_REPLACEMENTS: GLSLReplacement[] = [
  ...ES100_REPLACEMENTS,
  {
    // Replace `in` with `varying`.
    regex: makeVariableTextRegex('in'),
    replacement: 'varying $1',
  },
];

const ES100_FRAGMENT_OUTPUT_NAME = 'gl_FragColor';

// The fragment out variable that needs to be replaced with 'gl_FragColor'.
const ES300_FRAGMENT_OUTPUT_REGEX = /\bout[ \t]+vec4[ \t]+(\w+)[ \t]*;\n?/;
const VERSION_REGEX = /^#version[ \t]+(\d+)/m;

export function transpileShader(source: string, type: ShaderExtension): string {
  const match = source.match(VERSION_REGEX);
  if (match) {
    const version = Number(match[1]);
    if (version !== 300) {
      const message = `Found GLSL version ${version}, but need version 300.`;
      process.stdout.write(`${message}\n`);

      return message;
    }
  } else {
    const message = `No GLSL version found. Need version 300.`;
    process.stdout.write(`${message}\n`);

    return message;
  }

  switch (type) {
    case 'vert':
      source = convertShader(source, ES100_VERT_REPLACEMENTS);
      break;

    case 'frag':
      source = convertShader(source, ES100_FRAGMENT_REPLACEMENTS);
      source = convertFragmentShader(source);
  }

  return source;
}

function convertShader(source: string, replacements: GLSLReplacement[]): string {
  for (const { regex, replacement } of replacements) {
    source = source.replace(regex, replacement);
  }

  return source;
}

function convertFragmentShader(source: string): string {
  source = convertShader(source, ES100_FRAGMENT_REPLACEMENTS);

  const match = source.match(ES300_FRAGMENT_OUTPUT_REGEX);
  if (match) {
    const outputName = match[1];
    source = source.replace(ES300_FRAGMENT_OUTPUT_REGEX, '');
    source = source.replace(new RegExp(`\\b${outputName}\\b`, 'g'), ES100_FRAGMENT_OUTPUT_NAME);
  }

  return source;
}

function makeVariableTextRegex(qualifier: Qualifier): RegExp {
  return new RegExp(`\\b${qualifier}[ \\t]+(\\w+[ \\t]+\\w+(\\[\\w+\\])?;)`, 'g');
}
