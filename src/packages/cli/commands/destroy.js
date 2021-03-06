import { red } from 'chalk';
import { pluralize } from 'inflection';

import fs from '../../fs';

import rmrf from '../utils/rmrf';

const { env: { PWD } } = process;

export async function destroyType(type, name) {
  let path;

  type = type.toLowerCase();

  switch (type) {
    case 'model':
      path = `app/${pluralize(type)}/${name}.js`;
      break;

    case 'migration':
      const migrations = await fs.readdirAsync(`${PWD}/db/migrate`);

      name = migrations.find(file => `${name}.js` === file.substr(17));
      path = `db/migrate/${name}`;
      break;

    case 'controller':
    case 'serializer':
      name = pluralize(name);
      path = `app/${pluralize(type)}/${name}.js`;
      break;
  }

  await rmrf(`${PWD}/${path}`);
  console.log(`${red('remove')} ${path}`);
}

export default async function destroy(type, name) {
  if (type === 'resource') {
    const routes = (await fs.readFileAsync(`${PWD}/app/routes.js`, 'utf8'))
      .split('\n')
      .reduce((lines, line) => {
        const pattern = new RegExp(
          `\s*resource\\(('|"|\`)${pluralize(name)}('|"|\`)\\);?`
        );

        return pattern.test(line) ? lines : [...lines, line];
      }, '')
      .join('\n');

    await Promise.all([
      destroyType('model', name),
      destroyType('migration', `create-${pluralize(name)}`),
      destroyType('serializer', name),
      destroyType('controller', name),
      fs.writeFileAsync(`${PWD}/app/routes.js`, routes, 'utf8')
    ]);
  } else if (type === 'model') {
    await Promise.all([
      destroyType(type, name),
      destroyType('migration', `create-${pluralize(name)}`)
    ]);
  } else {
    await destroyType(type, name);
  }
}
