import { Command } from 'commander';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import Path from 'path';

import { transpileShader } from './transpiler.js';

function transpile(inputFolder: string, outputFolder: string): void {
  const fullInputPath = Path.join(process.cwd(), inputFolder);
  if (!existsSync(fullInputPath) || !lstatSync(fullInputPath).isDirectory()) {
    process.stdout.write(`folder: ${fullInputPath} does not exist\n`);
    return;
  }

  const fullOutputPath = Path.join(process.cwd(), outputFolder);
  if (!existsSync(fullOutputPath)) {
    console.log('creating folder', fullOutputPath);
    mkdirSync(fullOutputPath, { recursive: true });
  }
  console.log(existsSync(fullOutputPath));

  for (const file of readdirSync(fullInputPath)) {
    const fullPath = Path.join(fullInputPath, file);
    if (lstatSync(fullPath).isFile()) {
      const info = Path.parse(fullPath);
      const extension = info.ext.substring(1);
      if (extension === 'vert' || extension === 'frag') {
        const source = readFileSync(fullPath, 'utf8').toString();
        writeFileSync(Path.join(fullOutputPath, file), source);

        const gl1Source = transpileShader(source, extension);
        const gl1Name = `${info.name}.gl1${info.ext}`;
        writeFileSync(Path.join(fullOutputPath, gl1Name), gl1Source);
      }
    }
  }

  console.log(inputFolder);
  console.log(outputFolder);
}

const program = new Command();
program.name('Shaders').description('WebGL 2 to WebGL Shader transpiler').version('1.0.0');

program
  .command('transpile')
  .description('Transpile shaders in a folder from WebGL 2 to WebGL')
  .argument('<string>', 'shader source folder')
  .argument('<string>', 'shader output folder')
  .action(transpile);

program.parse();
